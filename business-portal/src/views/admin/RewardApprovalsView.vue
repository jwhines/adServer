<script setup lang="ts">
/**
 * RewardApprovalsView
 *
 * Manage reward approval workflow:
 * - Pending reward approvals queue
 * - Reward details review
 * - Approve/Reject actions with reason
 * - Approved and rejected rewards list
 */

import { ref, computed, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import Modal from '@/components/common/Modal.vue';
import Input from '@/components/common/Input.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Reward } from '@/types';

const client = generateClient<Schema>();

// State
const loading = ref(false);
const selectedReward = ref<any>(null);
const showReviewModal = ref(false);
const showRejectModal = ref(false);
const rejectionReason = ref('');
const activeTab = ref<'pending' | 'approved' | 'rejected' | 'active'>('pending');
const rewards = ref<Reward[]>([]);
const error = ref<string | null>(null);

// Filtered rewards
const filteredRewards = computed(() => {
  if (activeTab.value === 'pending') {
    return rewards.value.filter((r) => r.status === 'PENDING_APPROVAL');
  } else if (activeTab.value === 'approved') {
    return rewards.value.filter((r) => r.status === 'APPROVED');
  } else if (activeTab.value === 'active') {
    return rewards.value.filter((r) => r.status === 'ACTIVE');
  } else if (activeTab.value === 'rejected') {
    return rewards.value.filter((r) => r.status === 'DRAFT'); // Using DRAFT as rejected for now
  }
  return [];
});

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// View reward details
const viewDetails = (reward: Reward) => {
  selectedReward.value = reward;
  showReviewModal.value = true;
};

// Approve reward
const approveReward = async () => {
  if (!selectedReward.value) return;

  try {
    loading.value = true;
    error.value = null;

    const { data, errors } = await client.models.Reward.update({
      id: selectedReward.value.id,
      status: 'ACTIVE',
      isActive: true,
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    // Update local state
    const index = rewards.value.findIndex((r) => r.id === selectedReward.value.id);
    if (index !== -1) {
      rewards.value[index] = data as any;
    }

    showReviewModal.value = false;
    selectedReward.value = null;
  } catch (err: any) {
    error.value = err.message || 'Failed to approve reward';
    console.error('Error approving reward:', err);
  } finally {
    loading.value = false;
  }
};

// Reject reward
const rejectReward = async () => {
  if (!selectedReward.value || !rejectionReason.value) return;

  try {
    loading.value = true;
    error.value = null;

    const { data, errors } = await client.models.Reward.update({
      id: selectedReward.value.id,
      status: 'DRAFT', // Using DRAFT status for rejected rewards
      isActive: false,
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    // Update local state
    const index = rewards.value.findIndex((r) => r.id === selectedReward.value.id);
    if (index !== -1) {
      rewards.value[index] = data as any;
    }

    showRejectModal.value = false;
    showReviewModal.value = false;
    selectedReward.value = null;
    rejectionReason.value = '';
  } catch (err: any) {
    error.value = err.message || 'Failed to reject reward';
    console.error('Error rejecting reward:', err);
  } finally {
    loading.value = false;
  }
};

// Open reject modal
const openRejectModal = () => {
  showReviewModal.value = false;
  showRejectModal.value = true;
};

// Fetch rewards
const fetchRewards = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, errors } = await client.models.Reward.list();

    if (errors) {
      throw new Error(errors[0].message);
    }

    rewards.value = data as any[];
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch rewards';
    console.error('Error fetching rewards:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRewards();
});

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'APPROVED':
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'danger';
    default:
      return 'default';
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Reward Approvals</h1>
      <p class="mt-2 text-gray-600">
        Review and approve rewards created by businesses
      </p>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
    >
      {{ error }}
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'pending'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="activeTab = 'pending'"
          >
            Pending Approval
            <Badge variant="warning" class="ml-2">
              {{ rewards.filter((r) => r.status === 'PENDING_APPROVAL').length }}
            </Badge>
          </button>
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'active'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="activeTab = 'active'"
          >
            Active
            <Badge variant="success" class="ml-2">
              {{ rewards.filter((r) => r.status === 'ACTIVE').length }}
            </Badge>
          </button>
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'rejected'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="activeTab = 'rejected'"
          >
            Rejected/Draft
            <Badge variant="danger" class="ml-2">
              {{ rewards.filter((r) => r.status === 'DRAFT').length }}
            </Badge>
          </button>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && rewards.length === 0" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading rewards..." />
    </div>

    <!-- Rewards List -->
    <div v-else class="space-y-4">
      <Card
        v-for="reward in filteredRewards"
        :key="reward.id"
        padding
      >
        <div class="flex items-start justify-between">
          <!-- Reward Image -->
          <div v-if="reward.imageUrl" class="flex-shrink-0 mr-4">
            <img
              :src="reward.imageUrl"
              :alt="reward.title"
              class="w-32 h-32 object-cover rounded-lg"
            />
          </div>
          <div v-else class="flex-shrink-0 mr-4">
            <div class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span class="text-gray-400 text-sm">No image</span>
            </div>
          </div>

          <div class="flex-1">
            <!-- Reward Title & Badge -->
            <div class="flex items-center gap-3 mb-3">
              <h3 class="text-xl font-semibold text-gray-900">{{ reward.title }}</h3>
              <Badge :variant="getStatusVariant(reward.status)">
                {{ reward.status }}
              </Badge>
            </div>

            <!-- Reward Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Description</p>
                <p class="font-medium text-gray-900">{{ reward.description }}</p>
              </div>
              <div>
                <p class="text-gray-600">Point Cost</p>
                <p class="font-medium text-gray-900">{{ reward.pointCost }} points</p>
              </div>
              <div>
                <p class="text-gray-600">Retail Value</p>
                <p class="font-medium text-gray-900">${{ reward.retailValue || 0 }}</p>
              </div>
              <div>
                <p class="text-gray-600">Category</p>
                <p class="font-medium text-gray-900">{{ reward.category }}</p>
              </div>
              <div>
                <p class="text-gray-600">Type</p>
                <p class="font-medium text-gray-900">{{ reward.rewardType }}</p>
              </div>
              <div>
                <p class="text-gray-600">Target Ages</p>
                <p class="font-medium text-gray-900">{{ reward.targetAgeRanges?.join(', ') || 'All' }}</p>
              </div>
              <div>
                <p class="text-gray-600">Start Date</p>
                <p class="font-medium text-gray-900">{{ reward.startDate }}</p>
              </div>
              <div>
                <p class="text-gray-600">Redemption Type</p>
                <p class="font-medium text-gray-900">{{ reward.redemptionType }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-gray-600">Redemption Instructions</p>
                <p class="font-medium text-gray-900">{{ reward.redemptionInstructions }}</p>
              </div>
              <div class="md:col-span-2" v-if="reward.termsAndConditions">
                <p class="text-gray-600">Terms & Conditions</p>
                <p class="font-medium text-gray-900">{{ reward.termsAndConditions }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="reward.status === 'PENDING_APPROVAL'" class="ml-6">
            <Button variant="primary" @click="viewDetails(reward)">
              Review
            </Button>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <div v-if="filteredRewards.length === 0" class="text-center py-12">
        <p class="text-gray-500">No {{ activeTab }} rewards</p>
      </div>
    </div>

    <!-- Review Modal -->
    <Modal
      :show="showReviewModal"
      title="Review Reward"
      size="xl"
      @close="showReviewModal = false"
    >
      <div v-if="selectedReward" class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">{{ selectedReward.title }}</h4>

          <!-- Image Preview -->
          <div v-if="selectedReward.imageUrl" class="mb-4">
            <img
              :src="selectedReward.imageUrl"
              :alt="selectedReward.title"
              class="w-full max-w-md rounded-lg"
            />
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-600">Point Cost:</span>
              <span class="ml-2 font-medium">{{ selectedReward.pointCost }}</span>
            </div>
            <div>
              <span class="text-gray-600">Retail Value:</span>
              <span class="ml-2 font-medium">${{ selectedReward.retailValue || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-600">Category:</span>
              <span class="ml-2 font-medium">{{ selectedReward.category }}</span>
            </div>
            <div>
              <span class="text-gray-600">Type:</span>
              <span class="ml-2 font-medium">{{ selectedReward.rewardType }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-600">Target Ages:</span>
              <span class="ml-2 font-medium">{{ selectedReward.targetAgeRanges?.join(', ') || 'All' }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Description</p>
          <p class="mt-1 text-gray-900">{{ selectedReward.description }}</p>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Redemption Instructions</p>
          <p class="mt-1 text-gray-900">{{ selectedReward.redemptionInstructions }}</p>
        </div>

        <div v-if="selectedReward.termsAndConditions" class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Terms & Conditions</p>
          <p class="mt-1 text-gray-900">{{ selectedReward.termsAndConditions }}</p>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showReviewModal = false">
          Cancel
        </Button>
        <Button variant="danger" @click="openRejectModal">
          Reject
        </Button>
        <Button variant="success" @click="approveReward" :disabled="loading">
          <span v-if="loading">Approving...</span>
          <span v-else>Approve Reward</span>
        </Button>
      </template>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      :show="showRejectModal"
      title="Reject Reward"
      size="md"
      @close="showRejectModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          Please provide a reason for rejecting
          <strong>{{ selectedReward?.title }}</strong>:
        </p>

        <Input
          v-model="rejectionReason"
          label="Rejection Reason"
          type="text"
          placeholder="e.g., Inappropriate content, misleading description..."
          required
        />
      </div>

      <template #footer>
        <Button variant="secondary" @click="showRejectModal = false">
          Cancel
        </Button>
        <Button
          variant="danger"
          :disabled="!rejectionReason || loading"
          @click="rejectReward"
        >
          <span v-if="loading">Rejecting...</span>
          <span v-else>Confirm Rejection</span>
        </Button>
      </template>
    </Modal>
  </div>
</template>
