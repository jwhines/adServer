import type { Schema } from '../../data/resource';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * Get Business Analytics Lambda Function
 *
 * Aggregates analytics data for business dashboard:
 * - Summary metrics (impressions, redemptions, revenue, ROI)
 * - Timeline data (by day/week/month)
 * - Top performing rewards
 * - Demographic insights
 */

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

interface GetAnalyticsArgs {
  businessId: string;
  startDate: string;
  endDate: string;
  groupBy?: string;
}

interface TimelineEntry {
  date: string;
  impressions: number;
  redemptions: number;
  revenue: number;
}

interface TopReward {
  rewardId: string;
  title: string;
  redemptions: number;
}

interface BusinessAnalyticsRecord {
  id: string;
  businessId: string;
  date: string;
  impressions: number;
  clicks: number;
  redemptions: number;
  revenue: number;
  spend: number;
  avgChildAge?: number;
  topRewardId?: string;
}

/**
 * Discover table name dynamically
 */
async function discoverTableName(tablePrefix: string): Promise<string | null> {
  try {
    const listTablesResponse = await client.send(new ListTablesCommand({}));
    const tables = listTablesResponse.TableNames || [];
    const table = tables.find((t: string) => t.includes(tablePrefix));
    return table || null;
  } catch (error) {
    console.error('Error discovering table:', error);
    return null;
  }
}

/**
 * Group timeline data by week or month
 */
function groupTimelineData(
  records: BusinessAnalyticsRecord[],
  groupBy: string
): TimelineEntry[] {
  if (groupBy === 'day') {
    return records.map((r) => ({
      date: r.date,
      impressions: r.impressions || 0,
      redemptions: r.redemptions || 0,
      revenue: r.revenue || 0,
    }));
  }

  const grouped: { [key: string]: TimelineEntry } = {};

  records.forEach((record) => {
    const date = new Date(record.date);
    let key: string;

    if (groupBy === 'week') {
      // Get ISO week number
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      // Get year-month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      key = record.date;
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        impressions: 0,
        redemptions: 0,
        revenue: 0,
      };
    }

    grouped[key].impressions += record.impressions || 0;
    grouped[key].redemptions += record.redemptions || 0;
    grouped[key].revenue += record.revenue || 0;
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

export const handler: Schema['getBusinessDashboardAnalytics']['functionHandler'] = async (
  event,
  context
) => {
  const args = event.arguments as GetAnalyticsArgs;

  console.log('Get business analytics:', args);

  try {
    const groupBy = args.groupBy || 'day';

    // 1. Discover table names
    const analyticsTableName = await discoverTableName('BusinessAnalytics');
    const rewardTableName = await discoverTableName('Reward');
    const redemptionTableName = await discoverTableName('RewardRedemption');

    if (!analyticsTableName || !rewardTableName || !redemptionTableName) {
      throw new Error('Could not discover required DynamoDB tables');
    }

    // 2. Query BusinessAnalytics table for date range
    const analyticsRecords: BusinessAnalyticsRecord[] = [];
    const scanCommand = new ScanCommand({
      TableName: analyticsTableName,
      FilterExpression:
        'businessId = :businessId AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':businessId': args.businessId,
        ':startDate': args.startDate,
        ':endDate': args.endDate,
      },
    });

    const analyticsResponse = await ddbDocClient.send(scanCommand);
    if (analyticsResponse.Items) {
      analyticsRecords.push(...(analyticsResponse.Items as BusinessAnalyticsRecord[]));
    }

    // 3. Aggregate summary metrics
    const summary = {
      totalImpressions: 0,
      totalRedemptions: 0,
      totalRevenue: 0,
      totalSpend: 0,
      roi: 0,
    };

    for (const record of analyticsRecords) {
      summary.totalImpressions += record.impressions || 0;
      summary.totalRedemptions += record.redemptions || 0;
      summary.totalRevenue += record.revenue || 0;
      summary.totalSpend += record.spend || 0;
    }

    summary.roi =
      summary.totalSpend > 0
        ? ((summary.totalRevenue - summary.totalSpend) / summary.totalSpend) * 100
        : 0;

    // 4. Group timeline data by day/week/month
    const timeline = groupTimelineData(analyticsRecords, groupBy);

    // 5. Get top performing rewards by scanning Reward table and counting redemptions
    const rewardScanCommand = new ScanCommand({
      TableName: rewardTableName,
      FilterExpression: 'businessId = :businessId',
      ExpressionAttributeValues: {
        ':businessId': args.businessId,
      },
    });

    const rewardResponse = await ddbDocClient.send(rewardScanCommand);
    const rewards = rewardResponse.Items || [];

    // Sort by redemptions and get top 5
    const topRewards: TopReward[] = rewards
      .map((reward: any) => ({
        rewardId: reward.id,
        title: reward.title,
        redemptions: reward.redemptions || 0,
      }))
      .sort((a: TopReward, b: TopReward) => b.redemptions - a.redemptions)
      .slice(0, 5);

    return {
      summary,
      timeline,
      topRewards,
    };
  } catch (error) {
    console.error('Error getting business analytics:', error);
    throw error;
  }
};
