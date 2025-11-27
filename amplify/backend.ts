import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { uploadRewardImage } from './functions/upload-reward-image/resource';

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
});

// Grant storage access to upload function
backend.storage.resources.bucket.grantReadWrite(
  backend.uploadRewardImage.resources.lambda
);
