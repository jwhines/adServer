import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 Storage configuration for reward images and business logos
 *
 * Bucket Structure:
 * - public/rewards/{rewardId}/original.*
 * - public/rewards/{rewardId}/thumbnail.*
 * - public/rewards/{rewardId}/mobile.*
 * - public/businesses/{businessId}/logo.*
 *
 * Access: Public read, authenticated write
 */
export const storage = defineStorage({
  name: 'familyRewardsStorage',
});
