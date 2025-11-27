import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ListTablesCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * Get Rewards for Family Lambda Function
 *
 * Fetches rewards filtered by:
 * - Family location (within service radius)
 * - Child age range
 * - Reward availability (not expired, under redemption limit)
 * - Optional filters (category, max point cost)
 *
 * Returns paginated results sorted by proximity and featured status
 */

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

interface GetRewardsArgs {
  familyId: string;
  childAge?: number;
  latitude: number;
  longitude: number;
  city: string;
  zipCode: string;
  category?: string;
  maxPointCost?: number;
  page?: number;
  limit?: number;
}

interface RewardWithBusiness {
  reward: any;
  business: any;
  distance: number;
  isAvailable: boolean;
}

/**
 * Discover table name dynamically
 */
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

export const handler: Schema['getRewardsForFamily']['functionHandler'] = async (
  event,
  context
) => {
  const args = event.arguments as GetRewardsArgs;

  console.log('Get rewards for family:', args);

  try {
    const page = args.page || 1;
    const limit = args.limit || 20;
    const MAX_SEARCH_RADIUS = 50; // Maximum search radius in miles

    // Calculate distance between two lat/long points (Haversine formula)
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 3959; // Earth radius in miles
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Check if reward is available
    const isRewardAvailable = (reward: any): boolean => {
      const now = new Date();
      const startDate = new Date(reward.startDate);
      const endDate = reward.endDate ? new Date(reward.endDate) : null;

      // Check date range
      if (now < startDate) return false;
      if (endDate && now > endDate) return false;

      // Check inventory
      if (reward.totalAvailable && reward.currentRedemptions >= reward.totalAvailable) {
        return false;
      }

      // Check status
      if (reward.status !== 'ACTIVE') return false;
      if (!reward.isActive) return false;

      return true;
    };

    // Check if child age matches target range
    const matchesAgeRange = (reward: any, childAge?: number): boolean => {
      if (!childAge || !reward.targetAgeRanges || reward.targetAgeRanges.length === 0) {
        return true;
      }

      return reward.targetAgeRanges.some((range: string) => {
        const [min, max] = range.split('-').map(Number);
        return childAge >= min && childAge <= max;
      });
    };

    // 1. Discover table names
    const businessTableName = await discoverTableName('Business');
    const rewardTableName = await discoverTableName('Reward');

    if (!businessTableName || !rewardTableName) {
      throw new Error('Could not discover required DynamoDB tables');
    }

    console.log('Using tables:', { businessTableName, rewardTableName });

    // 2. Scan all active businesses
    const businessScanCommand = new ScanCommand({
      TableName: businessTableName,
      FilterExpression: 'isActive = :isActive AND isVerified = :isVerified',
      ExpressionAttributeValues: {
        ':isActive': true,
        ':isVerified': true,
      },
    });

    const businessResponse = await ddbDocClient.send(businessScanCommand);
    const allBusinesses = businessResponse.Items || [];

    console.log(`Found ${allBusinesses.length} active businesses`);

    // 3. Filter businesses by location proximity
    const nearbyBusinesses = allBusinesses
      .map((business: any) => {
        // Skip businesses without location data
        if (!business.latitude || !business.longitude) {
          return null;
        }

        const distance = calculateDistance(
          args.latitude,
          args.longitude,
          business.latitude,
          business.longitude
        );

        return {
          ...business,
          distance,
        };
      })
      .filter((business: any): business is any => business !== null)
      .filter((business: any) => business.distance <= MAX_SEARCH_RADIUS)
      .sort((a: any, b: any) => a.distance - b.distance);

    console.log(`Found ${nearbyBusinesses.length} businesses within ${MAX_SEARCH_RADIUS} miles`);

    if (nearbyBusinesses.length === 0) {
      return {
        rewards: [],
        totalCount: 0,
        page,
      };
    }

    // 4. Get business IDs for reward query
    const businessIds = nearbyBusinesses.map((b: any) => b.id);

    // 5. Scan rewards and filter by business IDs
    // Note: For better performance, consider using a GSI on businessId
    const rewardScanCommand = new ScanCommand({
      TableName: rewardTableName,
    });

    const rewardResponse = await ddbDocClient.send(rewardScanCommand);
    const allRewards = rewardResponse.Items || [];

    console.log(`Found ${allRewards.length} total rewards in database`);

    // 6. Filter and map rewards
    const filteredRewards: RewardWithBusiness[] = allRewards
      .filter((reward: any) => businessIds.includes(reward.businessId))
      .filter((reward: any) => isRewardAvailable(reward))
      .filter((reward: any) => matchesAgeRange(reward, args.childAge))
      .filter((reward: any) => !args.category || reward.category === args.category)
      .filter((reward: any) => !args.maxPointCost || reward.pointCost <= args.maxPointCost)
      .map((reward: any) => {
        const business = nearbyBusinesses.find((b: any) => b.id === reward.businessId);
        if (!business) return null;

        const distance = business.distance;
        const serviceRadius = business.serviceRadius || 10; // Default 10 miles if not set

        // Check if reward is within service radius
        if (distance > serviceRadius) return null;

        return {
          reward,
          business,
          distance,
          isAvailable: true,
        };
      })
      .filter((item: any): item is RewardWithBusiness => item !== null);

    console.log(`Found ${filteredRewards.length} rewards matching filters`);

    // 7. Sort by distance (closest first)
    filteredRewards.sort((a, b) => a.distance - b.distance);

    // 8. Paginate results
    const totalCount = filteredRewards.length;
    const startIndex = (page - 1) * limit;
    const paginatedRewards = filteredRewards.slice(startIndex, startIndex + limit);

    console.log(`Returning ${paginatedRewards.length} rewards (page ${page}/${Math.ceil(totalCount / limit)})`);

    return {
      rewards: paginatedRewards,
      totalCount,
      page,
    };
  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw error;
  }
};
