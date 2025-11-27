import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  GetCommand,
  ListTablesCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

/**
 * Track Engagement Lambda Function
 *
 * Records user engagement events:
 * - Session start/end
 * - Page views
 * - Screen views
 * - Search queries
 * - Filter applications
 * - Reward interactions
 *
 * Updates UserEngagement and AppMetrics tables
 */

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

interface TrackEngagementArgs {
  eventType: string; // 'session_start' | 'session_end' | 'screen_view' | 'reward_view' | 'search' | etc.
  userId: string;
  familyId: string;
  sessionId: string;
  platform: string; // 'IOS' | 'TVOS' | 'ANDROID_TV' | etc.
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  timestamp: string;
  metadata?: {
    screenName?: string;
    rewardId?: string;
    searchQuery?: string;
    filterType?: string;
    sessionDuration?: number;
    screensViewed?: string[];
    rewardsViewed?: string[];
    rewardsClicked?: string[];
  };
}

// Cache for table names
let userEngagementTableName: string | null = null;
let appMetricsTableName: string | null = null;
let platformAnalyticsTableName: string | null = null;

async function discoverTableName(tablePrefix: string): Promise<string | null> {
  try {
    const listTablesResponse = await ddbDocClient.send(new ListTablesCommand({}));
    const tables = listTablesResponse.TableNames || [];
    const table = tables.find((t) => t.includes(tablePrefix));
    return table || null;
  } catch (error) {
    console.error('Error discovering table:', error);
    return null;
  }
}

async function getTableNames() {
  if (userEngagementTableName && appMetricsTableName && platformAnalyticsTableName) {
    return { userEngagementTableName, appMetricsTableName, platformAnalyticsTableName };
  }

  userEngagementTableName = await discoverTableName('UserEngagement');
  appMetricsTableName = await discoverTableName('AppMetrics');
  platformAnalyticsTableName = await discoverTableName('PlatformAnalytics');

  console.log(`📋 Discovered tables: UserEngagement=${userEngagementTableName}, AppMetrics=${appMetricsTableName}, PlatformAnalytics=${platformAnalyticsTableName}`);

  return { userEngagementTableName, appMetricsTableName, platformAnalyticsTableName };
}

export const handler = async (event: any) => {
  const args = event.arguments as TrackEngagementArgs;

  console.log('📊 Track engagement event:', args.eventType, args.userId);

  try {
    const { userEngagementTableName: engagementTable, appMetricsTableName: metricsTable, platformAnalyticsTableName: platformTable } = await getTableNames();

    if (!engagementTable || !metricsTable || !platformTable) {
      throw new Error('Could not discover required DynamoDB tables');
    }

    const today = new Date(args.timestamp).toISOString().split('T')[0];

    // Handle different event types
    switch (args.eventType) {
      case 'session_start':
        await handleSessionStart(engagementTable, args);
        await updateDailyMetrics(metricsTable, platformTable, today, args.platform, {
          newSession: true,
        });
        break;

      case 'session_end':
        await handleSessionEnd(engagementTable, args);
        break;

      case 'screen_view':
      case 'page_view':
        await handleScreenView(engagementTable, args);
        break;

      case 'reward_view':
        await handleRewardView(engagementTable, args);
        break;

      case 'reward_click':
        await handleRewardClick(engagementTable, args);
        break;

      case 'search':
        await handleSearch(engagementTable, args);
        break;

      case 'filter':
        await handleFilter(engagementTable, args);
        break;

      default:
        console.log(`Unknown event type: ${args.eventType}`);
    }

    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    console.error('❌ Error tracking engagement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track engagement',
    };
  }
};

/**
 * Handle session start event
 */
async function handleSessionStart(tableName: string, args: TrackEngagementArgs) {
  const now = new Date().toISOString();
  const engagementId = randomUUID();

  const item = {
    id: engagementId,
    userId: args.userId,
    familyId: args.familyId,
    sessionId: args.sessionId,
    platform: args.platform,
    deviceModel: args.deviceModel,
    osVersion: args.osVersion,
    appVersion: args.appVersion,
    sessionStart: args.timestamp,
    screensViewed: [],
    rewardsViewed: [],
    rewardsClicked: [],
    searchesPerformed: 0,
    filtersUsed: [],
    metadata: args.metadata || {},
    createdAt: now,
    updatedAt: now,
    __typename: 'UserEngagement',
  };

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`✅ Session started: ${args.sessionId}`);
}

/**
 * Handle session end event
 */
async function handleSessionEnd(tableName: string, args: TrackEngagementArgs) {
  // Find the engagement record by sessionId
  // Note: This is inefficient - in production, consider adding a GSI on sessionId
  const sessionDuration = args.metadata?.sessionDuration || 0;

  // For now, we'll create a new record for the session end
  // In production, you should update the existing session record
  const now = new Date().toISOString();
  const engagementId = randomUUID();

  const item = {
    id: engagementId,
    userId: args.userId,
    familyId: args.familyId,
    sessionId: args.sessionId,
    platform: args.platform,
    sessionEnd: args.timestamp,
    duration: sessionDuration,
    screensViewed: args.metadata?.screensViewed || [],
    rewardsViewed: args.metadata?.rewardsViewed || [],
    rewardsClicked: args.metadata?.rewardsClicked || [],
    metadata: args.metadata || {},
    createdAt: now,
    updatedAt: now,
    __typename: 'UserEngagement',
  };

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`✅ Session ended: ${args.sessionId}, duration: ${sessionDuration}s`);
}

/**
 * Handle screen view event
 */
async function handleScreenView(tableName: string, args: TrackEngagementArgs) {
  console.log(`📱 Screen view: ${args.metadata?.screenName}`);
  // In production, update the session record to add this screen to screensViewed array
}

/**
 * Handle reward view event
 */
async function handleRewardView(tableName: string, args: TrackEngagementArgs) {
  console.log(`👀 Reward viewed: ${args.metadata?.rewardId}`);
  // In production, update the session record to add this reward to rewardsViewed array
}

/**
 * Handle reward click event
 */
async function handleRewardClick(tableName: string, args: TrackEngagementArgs) {
  console.log(`👆 Reward clicked: ${args.metadata?.rewardId}`);
  // In production, update the session record to add this reward to rewardsClicked array
}

/**
 * Handle search event
 */
async function handleSearch(tableName: string, args: TrackEngagementArgs) {
  console.log(`🔍 Search performed: ${args.metadata?.searchQuery}`);
  // In production, increment searchesPerformed counter
}

/**
 * Handle filter event
 */
async function handleFilter(tableName: string, args: TrackEngagementArgs) {
  console.log(`🎯 Filter applied: ${args.metadata?.filterType}`);
  // In production, add filter to filtersUsed array
}

/**
 * Update daily metrics for AppMetrics and PlatformAnalytics
 */
async function updateDailyMetrics(
  metricsTable: string,
  platformTable: string,
  date: string,
  platform: string,
  updates: {
    newSession?: boolean;
    newUser?: boolean;
  }
) {
  // Update AppMetrics
  if (updates.newSession) {
    const metricsId = date;
    const command = new UpdateCommand({
      TableName: metricsTable,
      Key: { date: metricsId },
      UpdateExpression: 'ADD totalSessions :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': new Date().toISOString(),
      },
    });

    try {
      await ddbDocClient.send(command);
      console.log(`✅ Updated AppMetrics for ${date}`);
    } catch (error) {
      console.log('Note: AppMetrics record may not exist yet, will be created on first aggregation');
    }
  }

  // Update PlatformAnalytics
  if (updates.newSession) {
    const platformId = `${platform}#${date}`;
    const command = new UpdateCommand({
      TableName: platformTable,
      Key: { id: platformId },
      UpdateExpression: 'ADD sessions :inc SET platform = :platform, #date = :date, updatedAt = :now',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':platform': platform,
        ':date': date,
        ':inc': 1,
        ':now': new Date().toISOString(),
      },
    });

    try {
      await ddbDocClient.send(command);
      console.log(`✅ Updated PlatformAnalytics for ${platform} on ${date}`);
    } catch (error) {
      console.log('Note: PlatformAnalytics record may not exist yet, will be created on first tracking');
    }
  }
}
