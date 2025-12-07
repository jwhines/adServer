import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
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

type EventType =
  | 'session_start'
  | 'session_end'
  | 'screen_view'
  | 'page_view'
  | 'reward_view'
  | 'reward_click'
  | 'search'
  | 'filter';

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

// Get table names from environment variables
function getTableNames() {
  const userEngagementTableName = process.env.USER_ENGAGEMENT_TABLE;
  const appMetricsTableName = process.env.APP_METRICS_TABLE;
  const platformAnalyticsTableName = process.env.PLATFORM_ANALYTICS_TABLE;

  console.log(`📋 Using tables: UserEngagement=${userEngagementTableName}, AppMetrics=${appMetricsTableName}, PlatformAnalytics=${platformAnalyticsTableName}`);

  return { userEngagementTableName, appMetricsTableName, platformAnalyticsTableName };
}

export const handler = async (event: any) => {
  const args = event.arguments as TrackEngagementArgs;

  console.log('📊 Track engagement event:', args.eventType, args.userId);

  try {
    const { userEngagementTableName: engagementTable, appMetricsTableName: metricsTable, platformAnalyticsTableName: platformTable } = getTableNames();

    if (!engagementTable || !metricsTable || !platformTable) {
      throw new Error('Required DynamoDB table names not found in environment variables');
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
 * Build the common shape for engagement records
 */
function buildEngagementItem(
  args: TrackEngagementArgs,
  eventType: EventType,
  extra: Record<string, any> = {}
) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    userId: args.userId,
    familyId: args.familyId,
    sessionId: args.sessionId,
    platform: args.platform,
    deviceModel: args.deviceModel,
    osVersion: args.osVersion,
    appVersion: args.appVersion,
    eventType,
    sessionStart: args.timestamp, // required field; use event timestamp if session start not provided
    createdAt: now,
    updatedAt: now,
    __typename: 'UserEngagement',
    ...extra,
  };
}

/**
 * Handle session start event
 */
async function handleSessionStart(tableName: string, args: TrackEngagementArgs) {
  const now = new Date().toISOString();
  const item = buildEngagementItem(args, 'session_start', {
    sessionStart: args.timestamp,
    screensViewed: [],
    rewardsViewed: [],
    rewardsClicked: [],
    searchesPerformed: 0,
    filtersUsed: [],
    metadata: args.metadata || {},
  });

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
  const item = buildEngagementItem(args, 'session_end', {
    sessionEnd: args.timestamp,
    duration: sessionDuration,
    screensViewed: args.metadata?.screensViewed || [],
    rewardsViewed: args.metadata?.rewardsViewed || [],
    rewardsClicked: args.metadata?.rewardsClicked || [],
    metadata: args.metadata || {},
  });

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
  const screenName = args.metadata?.screenName || 'unknown_screen';
  const item = buildEngagementItem(args, 'screen_view', {
    sessionStart: args.metadata?.sessionStart || args.timestamp,
    screenName,
    screensViewed: [screenName],
    metadata: args.metadata || {},
  });

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`📱 Screen view recorded: ${screenName}`);
}

/**
 * Handle reward view event
 */
async function handleRewardView(tableName: string, args: TrackEngagementArgs) {
  const rewardId = args.metadata?.rewardId || 'unknown_reward';
  const item = buildEngagementItem(args, 'reward_view', {
    sessionStart: args.metadata?.sessionStart || args.timestamp,
    rewardId,
    rewardsViewed: [rewardId],
    metadata: args.metadata || {},
  });

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`👀 Reward viewed: ${rewardId}`);
}

/**
 * Handle reward click event
 */
async function handleRewardClick(tableName: string, args: TrackEngagementArgs) {
  const rewardId = args.metadata?.rewardId || 'unknown_reward';
  const item = buildEngagementItem(args, 'reward_click', {
    sessionStart: args.metadata?.sessionStart || args.timestamp,
    rewardId,
    rewardsClicked: [rewardId],
    metadata: args.metadata || {},
  });

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`👆 Reward clicked: ${rewardId}`);
}

/**
 * Handle search event
 */
async function handleSearch(tableName: string, args: TrackEngagementArgs) {
  const searchQuery = args.metadata?.searchQuery || '';
  const item = buildEngagementItem(args, 'search', {
    sessionStart: args.metadata?.sessionStart || args.timestamp,
    searchesPerformed: 1,
    metadata: {
      ...args.metadata,
      searchQuery,
    },
  });

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`🔍 Search recorded: ${searchQuery}`);
}

/**
 * Handle filter event
 */
async function handleFilter(tableName: string, args: TrackEngagementArgs) {
  const filterType = args.metadata?.filterType || 'unknown_filter';
  const item = buildEngagementItem(args, 'filter', {
    sessionStart: args.metadata?.sessionStart || args.timestamp,
    filtersUsed: [filterType],
    metadata: {
      ...args.metadata,
      filterType,
    },
  });

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await ddbDocClient.send(command);
  console.log(`🎯 Filter applied: ${filterType}`);
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
