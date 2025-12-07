import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Track Ad Event Lambda Function
 *
 * Records impressions and clicks when families view/interact with rewards
 * Creates Impression records and updates BusinessAnalytics
 */

interface TrackEventArgs {
  eventType: string; // 'impression' | 'click'
  rewardId: string;
  businessId: string;
  familyId?: string;
  childAge?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Get table names from environment variables
function getTableNames() {
  const rewardTableName = process.env.REWARD_TABLE;
  const analyticsTableName = process.env.BUSINESS_ANALYTICS_TABLE;
  const impressionTableName = process.env.IMPRESSION_TABLE;
  const platformAnalyticsTableName = process.env.PLATFORM_ANALYTICS_TABLE;

  console.log(`📋 Using tables: Reward=${rewardTableName}, Analytics=${analyticsTableName}, Impression=${impressionTableName}, Platform=${platformAnalyticsTableName}`);

  return { rewardTableName, analyticsTableName, impressionTableName, platformAnalyticsTableName };
}

/**
 * Map deviceType to platform enum for PlatformAnalytics
 */
function mapDeviceToPlatform(deviceType?: string): string {
  if (!deviceType) return 'OTHER';

  const deviceUpper = deviceType.toUpperCase();

  // Map device types to platform enum
  if (deviceUpper === 'IOS' || deviceUpper.includes('IPHONE') || deviceUpper.includes('IPAD')) return 'IOS';
  if (deviceUpper === 'APPLE_TV' || deviceUpper.includes('APPLETV') || deviceUpper.includes('TVOS')) return 'TVOS';
  if (deviceUpper === 'ANDROID' || deviceUpper.includes('ANDROID')) return 'ANDROID';
  if (deviceUpper === 'ANDROID_TV') return 'ANDROID_TV';
  if (deviceUpper === 'SAMSUNG_TV') return 'SAMSUNG_TV';
  if (deviceUpper === 'LG_TV') return 'LG_TV';
  if (deviceUpper === 'COMCAST_TV' || deviceUpper.includes('COMCAST')) return 'COMCAST_TV';
  if (deviceUpper === 'FIRE_TV' || deviceUpper.includes('FIRE')) return 'FIRE_TV';
  if (deviceUpper === 'ROKU') return 'ROKU';
  if (deviceUpper === 'WEB') return 'WEB';

  return 'OTHER';
}

export const handler = async (event: any) => {
  const args = event.arguments as TrackEventArgs;

  console.log('📊 Track ad event:', args);

  try {
    const today = new Date(args.timestamp).toISOString().split('T')[0];
    const { rewardTableName: tableName, analyticsTableName: analyticsTable, impressionTableName: impressionTable, platformAnalyticsTableName: platformTable } = getTableNames();

    if (!tableName || !analyticsTable || !impressionTable || !platformTable) {
      throw new Error('Required DynamoDB table names not found in environment variables');
    }

    // 1. Create Impression record
    const impressionType = args.eventType === 'impression' ? 'IMPRESSION' : 'CLICK';
    await createImpression(impressionTable, {
      rewardId: args.rewardId,
      businessId: args.businessId,
      impressionType,
      familyId: args.familyId,
      childAge: args.childAge,
      timestamp: args.timestamp,
      deviceType: args.metadata?.deviceType,
      deviceModel: args.metadata?.deviceModel,
      osVersion: args.metadata?.osVersion,
      sessionId: args.metadata?.sessionId,
      metadata: args.metadata,
    });

    // 2. Update reward impressions/clicks count (for quick access)
    if (args.eventType === 'impression') {
      await incrementRewardCounter(tableName, args.rewardId, 'impressions');
    } else if (args.eventType === 'click') {
      await incrementRewardCounter(tableName, args.rewardId, 'clicks');
    }

    // 3. Update or create BusinessAnalytics record for today
    await updateBusinessAnalytics(analyticsTable, args.businessId, today, {
      impressions: args.eventType === 'impression' ? 1 : 0,
      clicks: args.eventType === 'click' ? 1 : 0,
    });

    // 4. Update PlatformAnalytics record for today
    const platform = mapDeviceToPlatform(args.metadata?.deviceType);
    await updatePlatformAnalytics(platformTable, platform, today, {
      impressions: args.eventType === 'impression' ? 1 : 0,
      clicks: args.eventType === 'click' ? 1 : 0,
    });

    console.log(`✅ ${args.eventType} tracked successfully for reward ${args.rewardId} on platform ${platform}`);

    
    
    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    console.error('❌ Error tracking ad event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
    };
  }
};

/**
 * Create an Impression record
 */
async function createImpression(tableName: string, impression: {
  rewardId: string;
  businessId: string;
  impressionType: 'IMPRESSION' | 'CLICK';
  familyId?: string;
  childAge?: number;
  timestamp: string;
  deviceType?: string;
  deviceModel?: string;
  osVersion?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}) {
  const now = new Date().toISOString();
  const impressionId = randomUUID();

  const item: Record<string, any> = {
    id: impressionId,
    rewardId: impression.rewardId,
    businessId: impression.businessId,
    impressionType: impression.impressionType,
    timestamp: impression.timestamp,
    createdAt: now,
    updatedAt: now,
    __typename: 'Impression',
  };

  // Add optional fields if present
  if (impression.familyId) item.familyId = impression.familyId;
  if (impression.childAge) item.childAge = impression.childAge;
  if (impression.deviceType) item.deviceType = impression.deviceType;
  if (impression.deviceModel) item.deviceModel = impression.deviceModel;
  if (impression.osVersion) item.osVersion = impression.osVersion;
  if (impression.sessionId) item.sessionId = impression.sessionId;
  if (impression.metadata) item.metadata = impression.metadata;

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await docClient.send(command);
  console.log(`✅ Created ${impression.impressionType} impression record: ${impressionId}`);
}

/**
 * Increment impression or click counter on a reward
 */
async function incrementRewardCounter(tableName: string, rewardId: string, field: 'impressions' | 'clicks') {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: { id: rewardId },
    UpdateExpression: `ADD #field :inc SET updatedAt = :now`,
    ExpressionAttributeNames: {
      '#field': field,
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':now': new Date().toISOString(),
    },
  });

  await docClient.send(command);
  console.log(`✅ Incremented ${field} for reward ${rewardId}`);
}

/**
 * Update or create BusinessAnalytics record for a specific date
 */
async function updateBusinessAnalytics(
  tableName: string,
  businessId: string,
  date: string,
  metrics: { impressions: number; clicks: number }
) {
  // Create a composite key: businessId#date
  const analyticsId = `${businessId}#${date}`;

  // First, try to get existing record
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: { id: analyticsId },
  });

  let existingRecord;
  try {
    const result = await docClient.send(getCommand);
    existingRecord = result.Item;
  } catch (error) {
    console.log('No existing analytics record, will create new one');
  }

  // Update or create
  const command = new UpdateCommand({
    TableName: tableName,
    Key: { id: analyticsId },
    UpdateExpression: `
      ADD impressions :impressions, clicks :clicks
      SET businessId = :businessId,
          #date = :date,
          updatedAt = :now
      ${!existingRecord ? ', createdAt = :now' : ''}
    `,
    ExpressionAttributeNames: {
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':businessId': businessId,
      ':date': date,
      ':impressions': metrics.impressions,
      ':clicks': metrics.clicks,
      ':now': new Date().toISOString(),
    },
  });

  await docClient.send(command);
  console.log(`✅ Updated BusinessAnalytics for ${businessId} on ${date}`);
}

/**
 * Update or create PlatformAnalytics record for a specific platform and date
 */
async function updatePlatformAnalytics(
  tableName: string,
  platform: string,
  date: string,
  metrics: { impressions: number; clicks: number }
) {
  // Create a composite key: platform#date
  const platformAnalyticsId = `${platform}#${date}`;

  // First, try to get existing record
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: { id: platformAnalyticsId },
  });

  let existingRecord;
  try {
    const result = await docClient.send(getCommand);
    existingRecord = result.Item;
  } catch (error) {
    console.log('No existing platform analytics record, will create new one');
  }

  // Update or create
  const command = new UpdateCommand({
    TableName: tableName,
    Key: { id: platformAnalyticsId },
    UpdateExpression: `
      ADD impressions :impressions, clicks :clicks
      SET platform = :platform,
          #date = :date,
          updatedAt = :now
      ${!existingRecord ? ', createdAt = :now' : ''}
    `,
    ExpressionAttributeNames: {
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':platform': platform,
      ':date': date,
      ':impressions': metrics.impressions,
      ':clicks': metrics.clicks,
      ':now': new Date().toISOString(),
    },
  });

  await docClient.send(command);
  console.log(`✅ Updated PlatformAnalytics for ${platform} on ${date}`);
}
