import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Track Affiliate Click Lambda Function
 *
 * When a user clicks an affiliate reward:
 * 1. Generates a unique tracking ID
 * 2. Creates personalized affiliate link with sub-ID for attribution
 * 3. Records click in AffiliateClick table
 * 4. Updates Reward's affiliate click counter
 * 5. Returns tracking URL to client
 */

interface TrackAffiliateClickArgs {
  rewardId: string;
  familyId: string;
  childId?: string;
  platform: 'IOS' | 'TVOS';
  timestamp: string;
  metadata?: {
    deviceType?: string;
    deviceModel?: string;
    osVersion?: string;
    sessionId?: string;
    userAgent?: string;
    ipCity?: string;
  };
}

// Cache for table names
let rewardTableName: string | null = null;
let affiliateClickTableName: string | null = null;
let pointsTransactionTableName: string | null = null;
let redemptionTableName: string | null = null;

async function getTableNames() {
  if (rewardTableName && affiliateClickTableName && pointsTransactionTableName && redemptionTableName) {
    return { rewardTableName, affiliateClickTableName, pointsTransactionTableName, redemptionTableName };
  }

  const { DynamoDBClient, ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
  const dynamodb = new DynamoDBClient({});

  const result = await dynamodb.send(new ListTablesCommand({}));
  const tables = result.TableNames || [];

  rewardTableName = tables.find(t => t.startsWith('Reward-') && t.endsWith('-NONE')) || 'Reward';
  affiliateClickTableName = tables.find(t => t.startsWith('AffiliateClick-') && t.endsWith('-NONE')) || 'AffiliateClick';
  pointsTransactionTableName = tables.find(t => t.startsWith('PointsTransaction-') && t.endsWith('-NONE')) || 'PointsTransaction';
  redemptionTableName = tables.find(t => t.startsWith('RewardRedemption-') && t.endsWith('-NONE')) || 'RewardRedemption';

  console.log(`📋 Discovered tables: Reward=${rewardTableName}, AffiliateClick=${affiliateClickTableName}, PointsTransaction=${pointsTransactionTableName}, RewardRedemption=${redemptionTableName}`);

  return { rewardTableName, affiliateClickTableName, pointsTransactionTableName, redemptionTableName };
}

/**
 * Build personalized affiliate tracking URL
 * Adds sub-ID parameter to affiliate link for attribution
 */
function buildTrackingUrl(baseUrl: string, clickId: string, affiliateNetwork: string): string {
  try {
    const url = new URL(baseUrl);

    // Add tracking sub-ID based on network
    // Different networks use different parameter names
    switch (affiliateNetwork) {
      case 'AMAZON':
        url.searchParams.set('tag', url.searchParams.get('tag') || 'your-amazon-tag');
        url.searchParams.set('linkId', clickId); // Amazon's tracking parameter
        break;
      case 'TARGET':
        url.searchParams.set('afid', clickId);
        break;
      case 'WALMART':
        url.searchParams.set('sourceid', clickId);
        break;
      case 'RAKUTEN':
        url.searchParams.set('ranSiteID', clickId);
        break;
      case 'SHAREASALE':
        url.searchParams.set('afftrack', clickId);
        break;
      case 'CJ':
        url.searchParams.set('sid', clickId);
        break;
      default:
        url.searchParams.set('tracking_id', clickId);
    }

    return url.toString();
  } catch (error) {
    console.error('Error building tracking URL:', error);
    // Return base URL if parsing fails
    return `${baseUrl}?tracking_id=${clickId}`;
  }
}

export const handler = async (event: any) => {
  const args = event.arguments as TrackAffiliateClickArgs;

  console.log('🔗 Track affiliate click:', args);

  try {
    const {
      rewardTableName: rewardTable,
      affiliateClickTableName: clickTable,
      pointsTransactionTableName: pointsTable,
      redemptionTableName: redemptionTable
    } = await getTableNames();

    // 1. Get reward details to retrieve affiliate link
    const getRewardCommand = new GetCommand({
      TableName: rewardTable,
      Key: { id: args.rewardId },
    });

    const rewardResult = await docClient.send(getRewardCommand);
    const reward = rewardResult.Item;

    if (!reward) {
      throw new Error(`Reward ${args.rewardId} not found`);
    }

    if (reward.rewardSource !== 'AFFILIATE_LINK') {
      throw new Error(`Reward ${args.rewardId} is not an affiliate reward`);
    }

    if (!reward.affiliateLink) {
      throw new Error(`Reward ${args.rewardId} has no affiliate link`);
    }

    // 2. Generate unique tracking ID
    const clickId = randomUUID();
    const trackingUrl = buildTrackingUrl(
      reward.affiliateLink,
      clickId,
      reward.affiliateNetwork || 'CUSTOM'
    );

    // 3. Create AffiliateClick record
    const now = new Date().toISOString();
    const clickRecord: Record<string, any> = {
      id: randomUUID(),
      clickId,
      rewardId: args.rewardId,
      familyId: args.familyId,
      trackingUrl,
      affiliateNetwork: reward.affiliateNetwork || 'CUSTOM',
      platform: args.platform,
      clickedAt: args.timestamp,
      converted: false,
      attributionWindow: 30, // 30 days default
      createdAt: now,
      updatedAt: now,
      __typename: 'AffiliateClick',
    };

    // Add optional fields
    if (args.childId) clickRecord.childId = args.childId;
    if (args.metadata?.userAgent) clickRecord.userAgent = args.metadata.userAgent;
    if (args.metadata?.ipCity) clickRecord.ipCity = args.metadata.ipCity;
    if (args.metadata) clickRecord.metadata = args.metadata;

    const putCommand = new PutCommand({
      TableName: clickTable,
      Item: clickRecord,
    });

    await docClient.send(putCommand);
    console.log(`✅ Created affiliate click record: ${clickId}`);

    // 4. Increment reward's affiliate click counter
    const updateRewardCommand = new UpdateCommand({
      TableName: rewardTable,
      Key: { id: args.rewardId },
      UpdateExpression: 'ADD affiliateClickCount :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': now,
      },
    });

    await docClient.send(updateRewardCommand);
    console.log(`✅ Incremented affiliate click count for reward ${args.rewardId}`);

    // 5. Check if user has enough points
    const pointsToSpend = reward.pointCost || 0;
    const userId = args.childId || args.familyId;

    // Query all transactions for this user to calculate available balance
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    // Use Scan with filter (simpler for now, can optimize with GSI later)
    const scanTransactionsCommand = new ScanCommand({
      TableName: pointsTable,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    let availablePoints = 0;
    try {
      const transactionsResult = await docClient.send(scanTransactionsCommand);
      const transactions = transactionsResult.Items || [];

      // Sum all transactions (EARNED are positive, SPENT are negative)
      availablePoints = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      console.log(`💰 User ${userId} has ${availablePoints} points available`);
    } catch (error) {
      console.warn('⚠️ Could not query user transactions, proceeding without validation:', error);
      // Continue anyway - better to allow the redemption than block it due to query issues
    }

    // Verify user has enough points
    if (availablePoints < pointsToSpend) {
      throw new Error(`Insufficient points. You have ${availablePoints} points but need ${pointsToSpend} points.`);
    }

    // 6. Deduct points - Create SPENT transaction
    const spentTransactionId = randomUUID();
    const spentTransaction: Record<string, any> = {
      id: spentTransactionId,
      userId: args.childId || args.familyId, // Use childId if available, otherwise familyId
      familyId: args.familyId,
      type: 'SPENT',
      amount: -pointsToSpend, // Negative for spent
      sourceType: 'AFFILIATE_REDEMPTION',
      sourceId: clickRecord.id,
      sourceDescription: `Affiliate link: ${reward.title}`,
      isUsedForRedemption: true,
      description: `Spent ${pointsToSpend} points on affiliate reward: ${reward.title}`,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      __typename: 'PointsTransaction',
    };

    const createSpentTransactionCommand = new PutCommand({
      TableName: pointsTable,
      Item: spentTransaction,
    });
    await docClient.send(createSpentTransactionCommand);
    console.log(`✅ Created SPENT transaction: ${spentTransactionId} for ${pointsToSpend} points`);

    // 6. Create RewardRedemption record for tracking
    const redemptionId = randomUUID();
    const redemptionRecord: Record<string, any> = {
      id: redemptionId,
      rewardId: args.rewardId,
      businessId: reward.businessId || 'AFFILIATE',
      userId: args.childId || args.familyId,
      userName: 'Family Member',
      familyId: args.familyId,
      childAge: undefined,
      pointsSpent: pointsToSpend,
      jobsUsed: [],
      pointTransactionIds: [spentTransactionId],
      qrCodeData: '', // Not applicable for affiliate links
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'PENDING', // Pending until conversion is confirmed
      redemptionType: 'AFFILIATE_CLICK',
      redemptionCity: args.metadata?.ipCity,
      redemptionZip: '',
      affiliateClickId: clickRecord.id, // Link to affiliate click
      notes: `Affiliate redemption via ${args.platform}`,
      createdAt: now,
      updatedAt: now,
      __typename: 'RewardRedemption',
    };

    const createRedemptionCommand = new PutCommand({
      TableName: redemptionTable,
      Item: redemptionRecord,
    });
    await docClient.send(createRedemptionCommand);
    console.log(`✅ Created redemption record: ${redemptionId}`);

    return {
      success: true,
      clickId,
      trackingUrl,
      redemptionId,
      pointsSpent: pointsToSpend,
      error: undefined,
    };
  } catch (error) {
    console.error('❌ Error tracking affiliate click:', error);
    return {
      success: false,
      clickId: undefined,
      trackingUrl: undefined,
      error: error instanceof Error ? error.message : 'Failed to track affiliate click',
    };
  }
};
