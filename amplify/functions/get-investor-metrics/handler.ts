import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * Get Investor Metrics Lambda Function
 *
 * Aggregates comprehensive metrics for investor presentations:
 * - Overall growth (DAU/MAU, user acquisition)
 * - Platform breakdown (iOS vs tvOS vs AndroidTV usage)
 * - Revenue metrics (total revenue, ARPU, growth rate)
 * - Engagement metrics (session duration, retention rates)
 * - Business metrics (total businesses, active rewards)
 */

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

interface GetInvestorMetricsArgs {
  startDate: string;
  endDate: string;
}

interface PlatformAnalyticsRecord {
  platform: string;
  date: string;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsers: number;
  sessions: number;
  avgSessionDuration: number;
  impressions: number;
  clicks: number;
  redemptions: number;
  retentionRate?: number;
}

interface AppMetricsRecord {
  date: string;
  totalDailyActiveUsers: number;
  totalMonthlyActiveUsers: number;
  totalNewUsers: number;
  totalSessions: number;
  totalRedemptions: number;
  totalRevenue: number;
  totalBusinesses: number;
  activeBusinesses: number;
  totalRewards: number;
  activeRewards: number;
  userGrowthRate?: number;
  revenueGrowthRate?: number;
  averageRevenuePerUser?: number;
  avgSessionsPerUser?: number;
  avgSessionDuration?: number;
  redemptionRate?: number;
  day1Retention?: number;
  day7Retention?: number;
  day30Retention?: number;
  platformBreakdown?: Record<string, number>;
}

interface UserEngagementRecord {
  eventType?: string;
  sessionStart?: string;
  screenName?: string;
  rewardId?: string;
  screensViewed?: string[];
  rewardsViewed?: string[];
  rewardsClicked?: string[];
}

/**
 * Get table names from environment variables
 */
function getTableNames() {
  const appMetricsTableName = process.env.APP_METRICS_TABLE;
  const platformAnalyticsTableName = process.env.PLATFORM_ANALYTICS_TABLE;
  const businessTableName = process.env.BUSINESS_TABLE;
  const rewardTableName = process.env.REWARD_TABLE;
  const userEngagementTableName = process.env.USER_ENGAGEMENT_TABLE;

  console.log(`📋 Using tables: AppMetrics=${appMetricsTableName}, PlatformAnalytics=${platformAnalyticsTableName}, Business=${businessTableName}, Reward=${rewardTableName}, UserEngagement=${userEngagementTableName}`);

  return { appMetricsTableName, platformAnalyticsTableName, businessTableName, rewardTableName, userEngagementTableName };
}

/**
 * Calculate percentage change between two numbers
 */
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get date N days ago
 */
function getDaysAgo(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export const handler: Schema['getInvestorMetrics']['functionHandler'] = async (
  event,
  context
) => {
  const args = event.arguments as GetInvestorMetricsArgs;

  console.log('Get investor metrics:', args);

  try {
    // Get table names from environment variables
    const { appMetricsTableName, platformAnalyticsTableName, businessTableName, rewardTableName, userEngagementTableName } = getTableNames();

    if (!appMetricsTableName || !platformAnalyticsTableName || !businessTableName || !rewardTableName) {
      throw new Error('Required DynamoDB table names not found in environment variables');
    }

    // Query AppMetrics for date range
    const appMetricsRecords: AppMetricsRecord[] = [];
    const appMetricsScan = new ScanCommand({
      TableName: appMetricsTableName,
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':startDate': args.startDate,
        ':endDate': args.endDate,
      },
    });

    const appMetricsResponse = await ddbDocClient.send(appMetricsScan);
    if (appMetricsResponse.Items) {
      appMetricsRecords.push(...(appMetricsResponse.Items as AppMetricsRecord[]));
    }

    // Query PlatformAnalytics for date range
    const platformAnalyticsRecords: PlatformAnalyticsRecord[] = [];
    const platformScan = new ScanCommand({
      TableName: platformAnalyticsTableName,
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':startDate': args.startDate,
        ':endDate': args.endDate,
      },
    });

    const platformResponse = await ddbDocClient.send(platformScan);
    if (platformResponse.Items) {
      platformAnalyticsRecords.push(...(platformResponse.Items as PlatformAnalyticsRecord[]));
    }

    // Query UserEngagement for date range (to power detailed breakdowns)
    const userEngagementRecords: UserEngagementRecord[] = [];
    if (userEngagementTableName) {
      const startDateTime = `${args.startDate}T00:00:00.000Z`;
      const endDateTime = `${args.endDate}T23:59:59.999Z`;

      let lastEvaluatedKey: Record<string, any> | undefined;
      do {
        const engagementScan = new ScanCommand({
          TableName: userEngagementTableName,
          FilterExpression: '#sessionStart BETWEEN :startDate AND :endDate',
          ExpressionAttributeNames: {
            '#sessionStart': 'sessionStart',
          },
          ExpressionAttributeValues: {
            ':startDate': startDateTime,
            ':endDate': endDateTime,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const engagementResponse = await ddbDocClient.send(engagementScan);
        if (engagementResponse.Items) {
          userEngagementRecords.push(...(engagementResponse.Items as UserEngagementRecord[]));
        }
        lastEvaluatedKey = engagementResponse.LastEvaluatedKey;
      } while (lastEvaluatedKey);
    }

    // Get total businesses and rewards
    const businessScan = new ScanCommand({ TableName: businessTableName });
    const businessResponse = await ddbDocClient.send(businessScan);
    const totalBusinesses = businessResponse.Items?.length || 0;
    const activeBusinesses = businessResponse.Items?.filter((b: any) => b.isActive)?.length || 0;

    const rewardScan = new ScanCommand({ TableName: rewardTableName });
    const rewardResponse = await ddbDocClient.send(rewardScan);
    const totalRewards = rewardResponse.Items?.length || 0;
    const activeRewards = rewardResponse.Items?.filter((r: any) => r.isActive)?.length || 0;

    // Sort records by date
    appMetricsRecords.sort((a, b) => a.date.localeCompare(b.date));
    platformAnalyticsRecords.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate overall metrics
    const latestMetrics = appMetricsRecords[appMetricsRecords.length - 1] || {
      totalDailyActiveUsers: 0,
      totalMonthlyActiveUsers: 0,
      totalNewUsers: 0,
      totalSessions: 0,
      totalRedemptions: 0,
      totalRevenue: 0,
    };

    const previousMetrics = appMetricsRecords.length > 1
      ? appMetricsRecords[appMetricsRecords.length - 2]
      : latestMetrics;

    // Count total engagement records in date range
    const totalEngagements = userEngagementRecords.length;

    // Aggregate totals across date range
    const totals = {
      totalUsers: 0,
      totalSessions: 0,
      totalRedemptions: 0,
      totalRevenue: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalEngagements,
    };

    appMetricsRecords.forEach((record) => {
      totals.totalUsers += record.totalNewUsers || 0;
      totals.totalSessions += record.totalSessions || 0;
      totals.totalRedemptions += record.totalRedemptions || 0;
      totals.totalRevenue += record.totalRevenue || 0;
    });

    platformAnalyticsRecords.forEach((record) => {
      totals.totalImpressions += record.impressions || 0;
      totals.totalClicks += record.clicks || 0;
    });

    // Calculate growth rates
    const dauGrowthRate = calculateGrowthRate(
      latestMetrics.totalDailyActiveUsers || 0,
      previousMetrics.totalDailyActiveUsers || 0
    );

    const mauGrowthRate = calculateGrowthRate(
      latestMetrics.totalMonthlyActiveUsers || 0,
      previousMetrics.totalMonthlyActiveUsers || 0
    );

    const revenueGrowthRate = calculateGrowthRate(
      latestMetrics.totalRevenue || 0,
      previousMetrics.totalRevenue || 0
    );

    // Calculate platform breakdown
    const platformBreakdown: Record<string, any> = {};
    const platformTotals: Record<string, number> = {};

    platformAnalyticsRecords.forEach((record) => {
      if (!platformTotals[record.platform]) {
        platformTotals[record.platform] = 0;
      }
      platformTotals[record.platform] += record.dailyActiveUsers || 0;
    });

    const totalPlatformUsers = Object.values(platformTotals).reduce((a, b) => a + b, 0);

    Object.entries(platformTotals).forEach(([platform, users]) => {
      const percentage = totalPlatformUsers > 0 ? (users / totalPlatformUsers) * 100 : 0;
      platformBreakdown[platform] = {
        users,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    // Calculate average session duration across all platforms
    let totalSessionDuration = 0;
    let platformCount = 0;
    platformAnalyticsRecords.forEach((record) => {
      if (record.avgSessionDuration) {
        totalSessionDuration += record.avgSessionDuration;
        platformCount++;
      }
    });
    const avgSessionDuration = platformCount > 0 ? totalSessionDuration / platformCount : 0;

    // Engagement breakdown (screen views and reward interactions)
    const screenViewCounts: Record<string, number> = {};
    const rewardInteractionCounts: Record<
      string,
      {
        views: number;
        clicks: number;
      }
    > = {};

    userEngagementRecords.forEach((record) => {
      const type = record.eventType || (record as any)?.metadata?.eventType;
      const screenName = record.screenName || record.screensViewed?.[0] || (record as any)?.metadata?.screenName;
      const rewardId = record.rewardId || record.rewardsViewed?.[0] || record.rewardsClicked?.[0] || (record as any)?.metadata?.rewardId;

      if (type === 'screen_view' || type === 'page_view') {
        const key = screenName || 'Unknown';
        screenViewCounts[key] = (screenViewCounts[key] || 0) + 1;
      }

      if (type === 'reward_view') {
        const key = rewardId || 'Unknown';
        if (!rewardInteractionCounts[key]) {
          rewardInteractionCounts[key] = { views: 0, clicks: 0 };
        }
        rewardInteractionCounts[key].views += 1;
      }

      if (type === 'reward_click') {
        const key = rewardId || 'Unknown';
        if (!rewardInteractionCounts[key]) {
          rewardInteractionCounts[key] = { views: 0, clicks: 0 };
        }
        rewardInteractionCounts[key].clicks += 1;
      }
    });

    const screenViewBreakdown = Object.entries(screenViewCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([screen, views]) => ({ screen, views }));

    const rewardInteractionBreakdown = Object.entries(rewardInteractionCounts)
      .sort((a, b) => (b[1].views + b[1].clicks) - (a[1].views + a[1].clicks))
      .map(([rewardId, data]) => ({ rewardId, views: data.views, clicks: data.clicks }));

    // Build investor metrics response
    const investorMetrics = {
      // Overview Metrics
      overview: {
        currentDAU: latestMetrics.totalDailyActiveUsers || 0,
        currentMAU: latestMetrics.totalMonthlyActiveUsers || 0,
        totalUsers: totals.totalUsers,
        dauGrowthRate: Math.round(dauGrowthRate * 10) / 10,
        mauGrowthRate: Math.round(mauGrowthRate * 10) / 10,
      },

      // Growth Metrics
      growth: {
        newUsersInPeriod: totals.totalUsers,
        userGrowthRate: latestMetrics.userGrowthRate || 0,
        revenueGrowthRate: Math.round(revenueGrowthRate * 10) / 10,
      },

      // Engagement Metrics
      engagement: {
        totalSessions: totals.totalSessions,
        totalEngagements: totals.totalEngagements,
        avgSessionDuration: Math.round(avgSessionDuration),
        avgSessionsPerUser: latestMetrics.avgSessionsPerUser || 0,
        totalImpressions: totals.totalImpressions,
        totalClicks: totals.totalClicks,
        clickThroughRate: totals.totalImpressions > 0
          ? Math.round((totals.totalClicks / totals.totalImpressions) * 1000) / 10
          : 0,
        screenViews: screenViewBreakdown,
        rewardInteractions: rewardInteractionBreakdown,
      },

      // Revenue Metrics
      revenue: {
        totalRevenue: totals.totalRevenue,
        currentRevenue: latestMetrics.totalRevenue || 0,
        averageRevenuePerUser: latestMetrics.averageRevenuePerUser || 0,
        totalRedemptions: totals.totalRedemptions,
        redemptionRate: latestMetrics.redemptionRate || 0,
      },

      // Retention Metrics
      retention: {
        day1Retention: latestMetrics.day1Retention || 0,
        day7Retention: latestMetrics.day7Retention || 0,
        day30Retention: latestMetrics.day30Retention || 0,
      },

      // Platform Breakdown
      platforms: platformBreakdown,

      // Business Metrics
      marketplace: {
        totalBusinesses,
        activeBusinesses,
        totalRewards,
        activeRewards,
        businessActivationRate: totalBusinesses > 0
          ? Math.round((activeBusinesses / totalBusinesses) * 1000) / 10
          : 0,
        rewardActivationRate: totalRewards > 0
          ? Math.round((activeRewards / totalRewards) * 1000) / 10
          : 0,
      },

      // Timeline Data (for charts)
      timeline: appMetricsRecords.map((record) => ({
        date: record.date,
        dau: record.totalDailyActiveUsers || 0,
        mau: record.totalMonthlyActiveUsers || 0,
        newUsers: record.totalNewUsers || 0,
        revenue: record.totalRevenue || 0,
        redemptions: record.totalRedemptions || 0,
      })),

      // Platform Timeline (for platform comparison charts)
      platformTimeline: platformAnalyticsRecords.reduce((acc: any, record) => {
        if (!acc[record.platform]) {
          acc[record.platform] = [];
        }
        acc[record.platform].push({
          date: record.date,
          dau: record.dailyActiveUsers || 0,
          sessions: record.sessions || 0,
          impressions: record.impressions || 0,
          redemptions: record.redemptions || 0,
        });
        return acc;
      }, {}),
    };

    return investorMetrics;
  } catch (error) {
    console.error('Error getting investor metrics:', error);
    throw error;
  }
};
