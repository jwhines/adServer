import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { uploadRewardImage } from './functions/upload-reward-image/resource';
import { trackEngagement } from './functions/track-engagement/resource';
import { trackAdEvent } from './functions/track-ad-event/resource';
import { getInvestorMetrics } from './functions/get-investor-metrics/resource';

/**
 * Family Rewards Ad Platform - AWS Amplify Gen 2 Backend
 *
 * This backend powers a direct-sold local advertising platform where:
 * - Durham, NC businesses create reward offers
 * - Families redeem rewards with earned points
 * - Platform admin curates and approves all content
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  uploadRewardImage,
  trackEngagement,
  trackAdEvent,
  getInvestorMetrics,
});

// Grant storage access to upload function
backend.storage.resources.bucket.grantReadWrite(
  backend.uploadRewardImage.resources.lambda
);

// Grant DynamoDB table access to analytics functions
const userEngagementTable = backend.data.resources.tables['UserEngagement'];
const appMetricsTable = backend.data.resources.tables['AppMetrics'];
const platformAnalyticsTable = backend.data.resources.tables['PlatformAnalytics'];
const impressionTable = backend.data.resources.tables['Impression'];
const businessAnalyticsTable = backend.data.resources.tables['BusinessAnalytics'];
const rewardTable = backend.data.resources.tables['Reward'];
const businessTable = backend.data.resources.tables['Business'];

// Grant trackEngagement function access to its tables
userEngagementTable.grantReadWriteData(backend.trackEngagement.resources.lambda);
appMetricsTable.grantReadWriteData(backend.trackEngagement.resources.lambda);
platformAnalyticsTable.grantReadWriteData(backend.trackEngagement.resources.lambda);

// Grant trackAdEvent function access to its tables
rewardTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
businessAnalyticsTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
impressionTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
platformAnalyticsTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);

// Set table names as environment variables for trackEngagement
backend.trackEngagement.addEnvironment('USER_ENGAGEMENT_TABLE', userEngagementTable.tableName);
backend.trackEngagement.addEnvironment('APP_METRICS_TABLE', appMetricsTable.tableName);
backend.trackEngagement.addEnvironment('PLATFORM_ANALYTICS_TABLE', platformAnalyticsTable.tableName);

// Set table names as environment variables for trackAdEvent
backend.trackAdEvent.addEnvironment('REWARD_TABLE', rewardTable.tableName);
backend.trackAdEvent.addEnvironment('BUSINESS_ANALYTICS_TABLE', businessAnalyticsTable.tableName);
backend.trackAdEvent.addEnvironment('IMPRESSION_TABLE', impressionTable.tableName);
backend.trackAdEvent.addEnvironment('PLATFORM_ANALYTICS_TABLE', platformAnalyticsTable.tableName);

// Grant getInvestorMetrics function access to its tables
appMetricsTable.grantReadData(backend.getInvestorMetrics.resources.lambda);
platformAnalyticsTable.grantReadData(backend.getInvestorMetrics.resources.lambda);
businessTable.grantReadData(backend.getInvestorMetrics.resources.lambda);
rewardTable.grantReadData(backend.getInvestorMetrics.resources.lambda);
userEngagementTable.grantReadData(backend.getInvestorMetrics.resources.lambda);

// Set table names as environment variables for getInvestorMetrics
backend.getInvestorMetrics.addEnvironment('APP_METRICS_TABLE', appMetricsTable.tableName);
backend.getInvestorMetrics.addEnvironment('PLATFORM_ANALYTICS_TABLE', platformAnalyticsTable.tableName);
backend.getInvestorMetrics.addEnvironment('BUSINESS_TABLE', businessTable.tableName);
backend.getInvestorMetrics.addEnvironment('REWARD_TABLE', rewardTable.tableName);
backend.getInvestorMetrics.addEnvironment('USER_ENGAGEMENT_TABLE', userEngagementTable.tableName);
