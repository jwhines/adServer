<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';
import { useRewardsStore } from '@/stores/rewards';
import { useAuthStore } from '@/stores/auth';
import type { Reward } from '@/types';

const client = generateClient<Schema>();

/**
 * RewardListView
 *
 * Displays all rewards for the business with:
 * - Filter by status and search
 * - Grid/table view toggle
 * - Reward cards with stats
 * - Actions (edit, pause, delete)
 */

const router = useRouter();
const rewardsStore = useRewardsStore();
const authStore = useAuthStore();

// View state
const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const statusFilter = ref<string>('all');

// Loading state
const loading = ref(false);
const error = ref<string | null>(null);

// Load rewards
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch all rewards - GraphQL authorization will filter by owner
    const { data, errors } = await client.models.Reward.list();

    if (errors) {
      throw new Error(errors[0].message);
    }

    rewardsStore.rewards = data as any[];
  } catch (err: any) {
    error.value = err.message || 'Failed to load rewards';
  } finally {
    loading.value = false;
  }
});

// Filtered rewards
const filteredRewards = computed(() => {
  let results = rewardsStore.rewards;

  // Filter by status
  if (statusFilter.value !== 'all') {
    results = results.filter(r => r.status === statusFilter.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }

  return results;
});

// Navigate to create reward
const createReward = () => {
  router.push('/rewards/create');
};

// Navigate to edit reward
const editReward = (rewardId: string) => {
  router.push(`/rewards/edit/${rewardId}`);
};

// Delete reward
const deleteReward = async (rewardId: string) => {
  if (!confirm('Are you sure you want to delete this reward?')) {
    return;
  }

  try {
    await rewardsStore.deleteReward(rewardId);
  } catch (err: any) {
    error.value = err.message || 'Failed to delete reward';
  }
};

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'PAUSED':
      return 'bg-yellow-100 text-yellow-800';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800';
    case 'PENDING_APPROVAL':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Rewards</h1>
          <p class="mt-2 text-gray-600">
            Manage your rewards and track their performance
          </p>
        </div>
        <button
          @click="createReward"
          class="btn-primary flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Reward
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
      >
        {{ error }}
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search rewards..."
              class="input w-full"
            />
          </div>

          <!-- Status Filter -->
          <div class="w-full sm:w-48">
            <select v-model="statusFilter" class="input w-full">
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="flex gap-2">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-4 py-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading rewards...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredRewards.length === 0"
        class="bg-white rounded-lg shadow p-12 text-center"
      >
        <div class="text-6xl mb-4">🎁</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {{ searchQuery || statusFilter !== 'all' ? 'No rewards found' : 'No rewards yet' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first reward to get started' }}
        </p>
        <button v-if="!searchQuery && statusFilter === 'all'" @click="createReward" class="btn-primary">
          Create Your First Reward
        </button>
      </div>

      <!-- Grid View -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <!-- Image -->
          <div class="aspect-video bg-gray-200 relative">
            <img
              v-if="reward.imageUrl"
              :src="reward.imageUrl"
              :alt="reward.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-2 right-2">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(reward.status)]">
                {{ reward.status }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ reward.title }}
            </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ reward.description }}
            </p>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span class="text-gray-500">Points:</span>
                <span class="font-semibold text-gray-900 ml-1">{{ reward.pointCost }}</span>
              </div>
              <div>
                <span class="text-gray-500">Value:</span>
                <span class="font-semibold text-gray-900 ml-1">{{ formatCurrency(reward.retailValue || 0) }}</span>
              </div>
              <div>
                <span class="text-gray-500">Impressions:</span>
                <span class="font-semibold text-gray-900 ml-1">{{ reward.impressions || 0 }}</span>
              </div>
              <div>
                <span class="text-gray-500">Redeemed:</span>
                <span class="font-semibold text-gray-900 ml-1">{{ reward.redemptions || 0 }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="editReward(reward.id)"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button
                @click="deleteReward(reward.id)"
                class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="reward in filteredRewards" :key="reward.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-200 overflow-hidden">
                    <img
                      v-if="reward.imageUrl"
                      :src="reward.imageUrl"
                      :alt="reward.title"
                      class="h-12 w-12 object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ reward.title }}</div>
                    <div class="text-sm text-gray-500 line-clamp-1">{{ reward.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(reward.status)]">
                  {{ reward.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ reward.pointCost }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ reward.impressions || 0 }} views / {{ reward.redemptions || 0 }} redeemed
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editReward(reward.id)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Edit
                </button>
                <button
                  @click="deleteReward(reward.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
