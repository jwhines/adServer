/**
 * Seed Analytics Data Script
 *
 * Creates sample analytics data in DynamoDB tables for testing the investor dashboard
 * Run with: node scripts/seed-analytics-data.js
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Stack ID from sandbox deployment
const STACK_ID = 'pihfldm7hzbt5mgtbe3j3dpphm';

const tables = {
  appMetrics: `AppMetrics-${STACK_ID}-NONE`,
  platformAnalytics: `PlatformAnalytics-${STACK_ID}-NONE`,
  userEngagement: `UserEngagement-${STACK_ID}-NONE`,
  impression: `Impression-${STACK_ID}-NONE`,
};

console.log('📊 Seeding analytics data...\n');

// Generate dates for the last 30 days
function getLast30Days() {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Seed AppMetrics table
async function seedAppMetrics() {
  console.log('📈 Seeding AppMetrics table...');
  const dates = getLast30Days();

  for (const date of dates) {
    const daysAgo = dates.indexOf(date);
    const growthFactor = 1 + (daysAgo * 0.02); // 2% growth per day

    const record = {
      date,
      totalDailyActiveUsers: Math.floor(150 * growthFactor),
      totalMonthlyActiveUsers: Math.floor(500 * growthFactor),
      totalNewUsers: Math.floor(10 * growthFactor),
      totalSessions: Math.floor(300 * growthFactor),
      totalRedemptions: Math.floor(25 * growthFactor),
      totalRevenue: Math.floor(500 * growthFactor),
      totalBusinesses: 15,
      activeBusinesses: 12,
      totalRewards: 45,
      activeRewards: 38,
      userGrowthRate: 2.5,
      revenueGrowthRate: 3.2,
      averageRevenuePerUser: 3.33,
      avgSessionsPerUser: 2.0,
      avgSessionDuration: 240, // 4 minutes in seconds
      redemptionRate: 8.3,
      day1Retention: 65.0,
      day7Retention: 42.0,
      day30Retention: 28.0,
      platformBreakdown: {
        IOS: 45,
        TVOS: 35,
        ANDROID_TV: 20
      }
    };

    await ddbDocClient.send(new PutCommand({
      TableName: tables.appMetrics,
      Item: record,
    }));

    console.log(`  ✓ Added AppMetrics for ${date}`);
  }
}

// Seed PlatformAnalytics table
async function seedPlatformAnalytics() {
  console.log('\n📱 Seeding PlatformAnalytics table...');
  const dates = getLast30Days();
  const platforms = ['IOS', 'TVOS', 'ANDROID_TV'];

  for (const date of dates) {
    for (const platform of platforms) {
      const daysAgo = dates.indexOf(date);
      const growthFactor = 1 + (daysAgo * 0.02);

      const baseUsers = platform === 'IOS' ? 70 : platform === 'TVOS' ? 55 : 30;

      const record = {
        platform,
        date,
        dailyActiveUsers: Math.floor(baseUsers * growthFactor),
        monthlyActiveUsers: Math.floor(baseUsers * 3 * growthFactor),
        newUsers: Math.floor(5 * growthFactor),
        sessions: Math.floor(baseUsers * 2 * growthFactor),
        avgSessionDuration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
        impressions: Math.floor(baseUsers * 10 * growthFactor),
        clicks: Math.floor(baseUsers * 2 * growthFactor),
        redemptions: Math.floor(baseUsers * 0.3 * growthFactor),
        retentionRate: 40 + Math.floor(Math.random() * 20), // 40-60%
      };

      await ddbDocClient.send(new PutCommand({
        TableName: tables.platformAnalytics,
        Item: record,
      }));

      console.log(`  ✓ Added PlatformAnalytics for ${platform} on ${date}`);
    }
  }
}

// Seed UserEngagement table
async function seedUserEngagement() {
  console.log('\n👥 Seeding UserEngagement table...');
  const today = new Date().toISOString().split('T')[0];
  const platforms = ['IOS', 'TVOS', 'ANDROID_TV'];

  // Create 50 sample sessions
  for (let i = 0; i < 50; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const sessionStart = new Date();
    sessionStart.setHours(sessionStart.getHours() - Math.floor(Math.random() * 24));

    const sessionEnd = new Date(sessionStart);
    sessionEnd.setMinutes(sessionEnd.getMinutes() + 3 + Math.floor(Math.random() * 7)); // 3-10 minutes

    const record = {
      userId: `user-${Math.floor(Math.random() * 100)}`,
      familyId: `family-${Math.floor(Math.random() * 50)}`,
      sessionId: `session-${Date.now()}-${i}`,
      platform,
      deviceModel: platform === 'IOS' ? 'iPhone 15' : platform === 'TVOS' ? 'Apple TV 4K' : 'Fire TV',
      osVersion: platform === 'IOS' ? '17.0' : '17.0',
      appVersion: '1.0.0',
      sessionStart: sessionStart.toISOString(),
      sessionEnd: sessionEnd.toISOString(),
      duration: Math.floor((sessionEnd - sessionStart) / 1000), // seconds
      screensViewed: ['home', 'rewards', 'profile'],
      rewardsViewed: [`reward-${Math.floor(Math.random() * 10)}`],
      rewardsClicked: Math.random() > 0.5 ? [`reward-${Math.floor(Math.random() * 10)}`] : [],
      searchesPerformed: Math.floor(Math.random() * 3),
      engagementScore: 60 + Math.floor(Math.random() * 40), // 60-100
      metadata: {},
    };

    await ddbDocClient.send(new PutCommand({
      TableName: tables.userEngagement,
      Item: record,
    }));

    if (i % 10 === 0) {
      console.log(`  ✓ Added ${i + 1} UserEngagement records...`);
    }
  }
  console.log(`  ✓ Completed: Added 50 UserEngagement records`);
}

// Main execution
async function main() {
  try {
    await seedAppMetrics();
    await seedPlatformAnalytics();
    await seedUserEngagement();

    console.log('\n✅ Analytics data seeding completed successfully!');
    console.log('\n📊 You can now view the investor dashboard at:');
    console.log('   http://localhost:5173/investor\n');
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
