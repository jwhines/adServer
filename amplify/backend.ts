import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { getRewardsForFamily } from './functions/get-rewards-for-family/resource';
import { redeemReward } from './functions/redeem-reward/resource';
import { uploadRewardImage } from './functions/upload-reward-image/resource';
import { getBusinessAnalytics } from './functions/get-business-analytics/resource';
import { trackAdEvent } from './functions/track-ad-event/resource';
import { verifyRedemption } from './functions/verify-redemption/resource';
import { trackEngagement } from './functions/track-engagement/resource';
import { getInvestorMetrics } from './functions/get-investor-metrics/resource';
import { trackAffiliateClick } from './functions/track-affiliate-click/resource';

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
  getRewardsForFamily,
  redeemReward,
  uploadRewardImage,
  getBusinessAnalytics,
  trackAdEvent,
  trackAffiliateClick,
  verifyRedemption,
  trackEngagement,
  getInvestorMetrics,
});

// Grant Lambda functions access to data (GraphQL API)
backend.getRewardsForFamily.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.redeemReward.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.uploadRewardImage.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);
backend.uploadRewardImage.resources.lambda.addEnvironment(
  'STORAGE_BUCKET_NAME',
  backend.storage.resources.bucket.bucketName
);

backend.getBusinessAnalytics.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.trackAdEvent.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.trackAffiliateClick.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.verifyRedemption.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.trackEngagement.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

backend.getInvestorMetrics.resources.lambda.addEnvironment(
  'API_ENDPOINT',
  backend.data.resources.graphqlApi.graphqlUrl
);

// Grant storage access to upload function
backend.storage.resources.bucket.grantReadWrite(
  backend.uploadRewardImage.resources.lambda
);

// Grant data access to all functions
[
  backend.getRewardsForFamily.resources.lambda,
  backend.redeemReward.resources.lambda,
  backend.uploadRewardImage.resources.lambda,
  backend.getBusinessAnalytics.resources.lambda,
  backend.trackAdEvent.resources.lambda,
  backend.trackAffiliateClick.resources.lambda,
  backend.verifyRedemption.resources.lambda,
  backend.trackEngagement.resources.lambda,
  backend.getInvestorMetrics.resources.lambda,
].forEach((lambda) => {
  backend.data.resources.tables['Business'].grantReadWriteData(lambda);
  backend.data.resources.tables['Reward'].grantReadWriteData(lambda);
  backend.data.resources.tables['RewardRedemption'].grantReadWriteData(lambda);
  backend.data.resources.tables['BusinessAnalytics'].grantReadWriteData(lambda);
  backend.data.resources.tables['Impression'].grantReadWriteData(lambda);
  backend.data.resources.tables['PointsTransaction'].grantReadWriteData(lambda);
  backend.data.resources.tables['PlatformAnalytics'].grantReadWriteData(lambda);
  backend.data.resources.tables['UserEngagement'].grantReadWriteData(lambda);
  backend.data.resources.tables['AppMetrics'].grantReadWriteData(lambda);
  backend.data.resources.tables['AffiliateClick'].grantReadWriteData(lambda);
});

// Grant ListTables permission to Lambdas that need table name discovery
backend.trackAdEvent.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.redeemReward.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.verifyRedemption.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.getBusinessAnalytics.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.getRewardsForFamily.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.trackEngagement.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.getInvestorMetrics.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);

backend.trackAffiliateClick.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:ListTables'],
    resources: ['*'],
  })
);
