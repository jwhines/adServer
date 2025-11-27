import { defineStore } from 'pinia';
import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import type { Business } from '@/types';

const client = generateClient<Schema>();

/**
 * Business Store
 *
 * Manages business profile data:
 * - Fetch and update business profile
 * - Upload business logo
 * - Manage business settings
 */

export const useBusinessStore = defineStore('business', () => {
  // State
  const business = ref<Business | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function fetchBusiness(businessId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Business.get({ id: businessId });

      if (errors) {
        throw new Error(errors[0].message);
      }

      business.value = data as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch business';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createBusiness(businessData: Partial<Business>): Promise<Business> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Business.create(businessData as any);

      if (errors) {
        throw new Error(errors[0].message);
      }

      business.value = data as any;
      return data as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to create business';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateBusiness(
    businessId: string,
    updates: Partial<Business>
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, errors } = await client.models.Business.update({
        id: businessId,
        ...updates,
      } as any);

      if (errors) {
        throw new Error(errors[0].message);
      }

      business.value = data as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to update business';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadLogo(file: File): Promise<string> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement S3 upload via Amplify Storage
      // const result = await uploadData({
      //   key: `businesses/${business.value?.id}/logo.${file.type.split('/')[1]}`,
      //   data: file,
      // }).result;
      //
      // return result.key;

      return 'mock-logo-url';
    } catch (err: any) {
      error.value = err.message || 'Failed to upload logo';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    business,
    loading,
    error,

    // Actions
    fetchBusiness,
    createBusiness,
    updateBusiness,
    uploadLogo,
  };
});
