import { defineStore } from 'pinia';
import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import type { Reward, RewardRedemption } from '@/types';

const client = generateClient<Schema>();

/**
 * Rewards Store
 *
 * Manages reward campaigns:
 * - CRUD operations for rewards
 * - Image upload
 * - Redemption tracking
 * - Analytics queries
 */

export const useRewardsStore = defineStore('rewards', () => {
  // State
  const rewards = ref<Reward[]>([]);
  const currentReward = ref<Reward | null>(null);
  const redemptions = ref<RewardRedemption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function fetchRewards(businessId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Reward.list({
        filter: { businessId: { eq: businessId } },
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      rewards.value = data as any[];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch rewards';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReward(rewardId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Reward.get({ id: rewardId });

      if (errors) {
        throw new Error(errors[0].message);
      }

      currentReward.value = data as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch reward';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createReward(rewardData: Partial<Reward>): Promise<Reward> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Reward.create(rewardData as any);

      if (errors) {
        throw new Error(errors[0].message);
      }

      rewards.value.unshift(data as any);
      return data as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to create reward';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateReward(rewardId: string, updates: Partial<Reward>): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Reward.update({
        id: rewardId,
        ...updates,
      } as any);

      if (errors) {
        throw new Error(errors[0].message);
      }

      // Update in list
      const index = rewards.value.findIndex((r) => r.id === rewardId);
      if (index !== -1) {
        rewards.value[index] = data as any;
      }

      // Update current reward
      if (currentReward.value?.id === rewardId) {
        currentReward.value = data as any;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update reward';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteReward(rewardId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { errors } = await client.models.Reward.delete({ id: rewardId });

      if (errors) {
        throw new Error(errors[0].message);
      }

      // Remove from list
      rewards.value = rewards.value.filter((r) => r.id !== rewardId);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete reward';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadRewardImage(rewardId: string, imageFile: File): Promise<string> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement image upload when Lambda function is properly connected
      // For now, just return a placeholder
      console.warn('Image upload not yet implemented - skipping');

      // In the future, this will call the Lambda function directly:
      // import { uploadRewardImage as uploadRewardImageFn } from '../../../amplify/functions/upload-reward-image/resource';
      // const result = await uploadRewardImageFn(...);

      return '';
    } catch (err: any) {
      error.value = err.message || 'Failed to upload image';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRedemptions(businessId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.RewardRedemption.list({
        filter: { businessId: { eq: businessId } },
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      redemptions.value = data as any[];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch redemptions';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Helper function
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  return {
    // State
    rewards,
    currentReward,
    redemptions,
    loading,
    error,

    // Actions
    fetchRewards,
    fetchReward,
    createReward,
    updateReward,
    deleteReward,
    uploadRewardImage,
    fetchRedemptions,
  };
});
