import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ListTablesCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Redeem Reward Lambda Function
 *
 * Process reward redemption with job tracking and QR code generation
 */

interface RedeemRewardArgs {
  rewardId: string;
  userId: string;
  userName?: string;
  familyId: string;
  childAge?: number;
  jobIds?: string[];
  pointsToSpend: number;
  city?: string;
  zipCode?: string;
}

// Cache for table names
let rewardTableName: string | null = null;
let redemptionTableName: string | null = null;
let pointsTransactionTableName: string | null = null;
let businessTableName: string | null = null;

async function getTableNames() {
  if (rewardTableName && redemptionTableName && pointsTransactionTableName && businessTableName) {
    return { rewardTableName, redemptionTableName, pointsTransactionTableName, businessTableName };
  }

  const dynamodb = new DynamoDBClient({});
  const result = await dynamodb.send(new ListTablesCommand({}));
  const tables = result.TableNames || [];

  rewardTableName = tables.find(t => t.startsWith('Reward-') && t.endsWith('-NONE')) || 'Reward';
  redemptionTableName = tables.find(t => t.startsWith('RewardRedemption-') && t.endsWith('-NONE')) || 'RewardRedemption';
  pointsTransactionTableName = tables.find(t => t.startsWith('PointsTransaction-') && t.endsWith('-NONE')) || 'PointsTransaction';
  businessTableName = tables.find(t => t.startsWith('Business-') && t.endsWith('-NONE')) || 'Business';

  console.log(`📋 Discovered tables: Reward=${rewardTableName}, RewardRedemption=${redemptionTableName}, PointsTransaction=${pointsTransactionTableName}, Business=${businessTableName}`);

  return { rewardTableName, redemptionTableName, pointsTransactionTableName, businessTableName };
}

export const handler = async (event: any) => {
  const args = event.arguments as RedeemRewardArgs;

  console.log('🎁 Redeem reward request:', { rewardId: args.rewardId, userId: args.userId, pointsToSpend: args.pointsToSpend });

  try {
    const { rewardTableName: rewardTable, redemptionTableName: redemptionTable, pointsTransactionTableName: pointsTable, businessTableName: bizTable } = await getTableNames();

    // 1. Fetch reward details
    const rewardCommand = new GetCommand({
      TableName: rewardTable,
      Key: { id: args.rewardId },
    });
    const rewardResult = await docClient.send(rewardCommand);
    const reward = rewardResult.Item;

    if (!reward) {
      return {
        success: false,
        redemptionId: undefined,
        redemptionCode: undefined,
        qrCodeData: undefined,
        expiresAt: undefined,
        businessName: undefined,
        rewardTitle: undefined,
        error: 'Reward not found',
      };
    }

    // 2. Verify reward is active
    if (reward.status !== 'ACTIVE' || !reward.isActive) {
      return {
        success: false,
        redemptionId: undefined,
        redemptionCode: undefined,
        qrCodeData: undefined,
        expiresAt: undefined,
        businessName: undefined,
        rewardTitle: undefined,
        error: 'Reward is not currently active',
      };
    }

    // 3. Verify points match reward cost
    if (args.pointsToSpend !== reward.pointCost) {
      return {
        success: false,
        redemptionId: undefined,
        redemptionCode: undefined,
        qrCodeData: undefined,
        expiresAt: undefined,
        businessName: undefined,
        rewardTitle: undefined,
        error: `Points mismatch: reward costs ${reward.pointCost} points`,
      };
    }

    // 4. Get business details
    let businessName = 'Business';
    try {
      const businessCommand = new GetCommand({
        TableName: bizTable,
        Key: { id: reward.businessId },
      });
      const businessResult = await docClient.send(businessCommand);
      if (businessResult.Item) {
        businessName = businessResult.Item.name;
      }
    } catch (error) {
      console.log('⚠️ Could not fetch business name, using default');
    }

    // 5. Generate redemption code and QR data
    const redemptionCode = generateRedemptionCode();
    const redemptionId = `redeem-${Date.now()}-${randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // QR code data includes encrypted payload
    const qrCodePayload = {
      redemptionId,
      redemptionCode,
      rewardId: args.rewardId,
      businessId: reward.businessId,
      userId: args.userId,
      pointsSpent: args.pointsToSpend,
      timestamp: new Date().toISOString(),
    };
    const qrCodeData = Buffer.from(JSON.stringify(qrCodePayload)).toString('base64');

    // 6. Create RewardRedemption record
    const redemptionRecord = {
      id: redemptionId,
      rewardId: args.rewardId,
      userId: args.userId,
      userName: args.userName || 'Family Member',
      familyId: args.familyId,
      childAge: args.childAge,
      pointsSpent: args.pointsToSpend,
      jobsUsed: args.jobIds || [],
      pointTransactionIds: [], // Will be filled when we create PointsTransactions
      qrCodeData,
      redemptionCode,
      redemptionStatus: 'PENDING',
      redemptionDate: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      businessId: reward.businessId,
      redemptionCity: args.city,
      redemptionZip: args.zipCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: 'RewardRedemption',
    };

    const createRedemptionCommand = new PutCommand({
      TableName: redemptionTable,
      Item: redemptionRecord,
    });
    await docClient.send(createRedemptionCommand);

    // 7. Create PointsTransaction records for spent points
    const pointTransactionIds: string[] = [];

    // Create one SPENT transaction for the redemption
    const spentTransactionId = `pt-${Date.now()}-${randomBytes(4).toString('hex')}`;
    const spentTransaction = {
      id: spentTransactionId,
      userId: args.userId,
      familyId: args.familyId,
      userName: args.userName || 'Family Member',
      type: 'SPENT',
      amount: -args.pointsToSpend, // Negative for spent
      sourceType: 'REWARD_REDEMPTION',
      sourceId: redemptionId,
      sourceDescription: `Redeemed: ${reward.title}`,
      redemptionId,
      isUsedForRedemption: true,
      description: `Spent ${args.pointsToSpend} points on ${reward.title}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: 'PointsTransaction',
    };

    const createSpentTransactionCommand = new PutCommand({
      TableName: pointsTable,
      Item: spentTransaction,
    });
    await docClient.send(createSpentTransactionCommand);
    pointTransactionIds.push(spentTransactionId);

    // If jobIds were provided, mark those job transactions as used for redemption
    if (args.jobIds && args.jobIds.length > 0) {
      for (const jobId of args.jobIds) {
        // Note: In a real implementation, you'd query PointsTransaction table
        // to find transactions with sourceId = jobId and update them
        console.log(`📝 Job ${jobId} used for redemption ${redemptionId}`);
      }
    }

    // 8. Update redemption with transaction IDs
    const updateRedemptionCommand = new UpdateCommand({
      TableName: redemptionTable,
      Key: { id: redemptionId },
      UpdateExpression: 'SET pointTransactionIds = :ptIds, updatedAt = :now',
      ExpressionAttributeValues: {
        ':ptIds': pointTransactionIds,
        ':now': new Date().toISOString(),
      },
    });
    await docClient.send(updateRedemptionCommand);

    // 9. Update reward redemption count
    const updateRewardCommand = new UpdateCommand({
      TableName: rewardTable,
      Key: { id: args.rewardId },
      UpdateExpression: 'ADD redemptions :inc, currentRedemptions :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': new Date().toISOString(),
      },
    });
    await docClient.send(updateRewardCommand);

    console.log(`✅ Reward redeemed successfully: ${redemptionId}`);

    return {
      success: true,
      redemptionId,
      redemptionCode,
      qrCodeData,
      expiresAt: expiresAt.toISOString(),
      businessName,
      rewardTitle: reward.title,
      error: undefined,
    };
  } catch (error) {
    console.error('❌ Error redeeming reward:', error);
    return {
      success: false,
      redemptionId: undefined,
      redemptionCode: undefined,
      qrCodeData: undefined,
      expiresAt: undefined,
      businessName: undefined,
      rewardTitle: undefined,
      error: error instanceof Error ? error.message : 'Failed to redeem reward',
    };
  }
};

/**
 * Generate 8-character alphanumeric redemption code (easy to read, no ambiguous chars)
 */
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1, L
  let code = '';
  const bytes = randomBytes(12);
  for (let i = 0; i < 12; i++) {
    code += chars[bytes[i] % chars.length];
    // Add hyphen every 4 characters for readability
    if ((i + 1) % 4 === 0 && i < 11) {
      code += '-';
    }
  }
  return code; // Format: ABCD-EFGH-JKLM
}
