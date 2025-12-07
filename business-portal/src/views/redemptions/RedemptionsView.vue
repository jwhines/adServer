<script setup lang="ts">
/**
 * RedemptionsView
 *
 * Manage reward redemptions using real RewardRedemption table data:
 * - Query redemptions from DynamoDB
 * - Filter by status, date, search
 * - Update redemption status
 * - Display QR codes for verification
 */

import { ref, computed, onMounted } from 'vue';
import QRCode from 'qrcode';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify-config';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import Modal from '@/components/common/Modal.vue';
import Input from '@/components/common/Input.vue';
import Select from '@/components/common/Select.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EnvironmentBadge from '@/components/EnvironmentBadge.vue';

const client = generateClient<Schema>();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const startDate = ref('');
const endDate = ref('');
const selectedRedemption = ref<any>(null);
const showDetailsModal = ref(false);
const qrCodeUrl = ref('');
const processingAction = ref(false);

// Status options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Redeemed', value: 'REDEEMED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

// Real redemptions data from DynamoDB
const redemptions = ref<any[]>([]);
const rewards = ref<Map<string, any>>(new Map());

// Filtered redemptions
const filteredRedemptions = computed(() => {
  return redemptions.value.filter((redemption) => {
    // Status filter
    if (statusFilter.value && redemption.redemptionStatus !== statusFilter.value) {
      return false;
    }

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const rewardTitle = getRewardTitle(redemption.rewardId);
      return (
        redemption.redemptionCode.toLowerCase().includes(query) ||
        rewardTitle.toLowerCase().includes(query) ||
        redemption.familyId.toLowerCase().includes(query)
      );
    }

    return true;
  });
});

// Helper to get reward title from cache
function getRewardTitle(rewardId: string): string {
  const reward = rewards.value.get(rewardId);
  return reward?.title || 'Unknown Reward';
}

// Badge variant based on status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'info';
    case 'REDEEMED':
      return 'success';
    case 'EXPIRED':
      return 'gray';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'gray';
  }
};

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

// Generate QR code
const generateQRCode = async (code: string) => {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(code, {
      width: 300,
      margin: 2,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
};

// View redemption details
const viewDetails = async (redemption: any) => {
  selectedRedemption.value = redemption;
  await generateQRCode(redemption.redemptionCode);
  showDetailsModal.value = true;
};

// Fetch redemptions from DynamoDB
async function fetchRedemptions() {
  loading.value = true;
  error.value = null;

  try {
    // Fetch all redemptions
    const redemptionResult = await client.models.RewardRedemption.list();

    if (redemptionResult.data) {
      redemptions.value = redemptionResult.data;

      // Fetch associated rewards for display
      const rewardIds = [...new Set(redemptions.value.map(r => r.rewardId))];
      for (const rewardId of rewardIds) {
        try {
          const rewardResult = await client.models.Reward.get({ id: rewardId });
          if (rewardResult.data) {
            rewards.value.set(rewardId, rewardResult.data);
          }
        } catch (err) {
          console.error(`Error fetching reward ${rewardId}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching redemptions:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load redemptions';
  } finally {
    loading.value = false;
  }
}

// Mark as redeemed
async function markAsRedeemed() {
  if (!selectedRedemption.value) return;

  processingAction.value = true;
  try {
    await client.models.RewardRedemption.update({
      id: selectedRedemption.value.id,
      redemptionStatus: 'REDEEMED',
      fulfilledAt: new Date().toISOString(),
    });

    await fetchRedemptions();
    showDetailsModal.value = false;
    selectedRedemption.value = null;
  } catch (err) {
    console.error('Error marking as redeemed:', err);
    alert('Failed to mark as redeemed. Please try again.');
  } finally {
    processingAction.value = false;
  }
}

onMounted(async () => {
  await fetchRedemptions();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Redemptions</h1>
        <p class="mt-2 text-gray-600">
          Manage and track reward redemptions from families
        </p>
      </div>
      <EnvironmentBadge />
    </div>

    <!-- Filters -->
    <Card class="mb-6" padding>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search by code, reward, or family ID..."
          />
        </div>

        <!-- Status Filter -->
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by status"
        />

        <!-- Date Filter (placeholder) -->
        <Button variant="secondary" @click="() => {}">
          Date Range
        </Button>
      </div>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading redemptions..." />
    </div>

    <!-- Error State -->
    <Card v-else-if="error" class="mb-6 p-6 bg-red-50 border-red-200">
      <div class="text-center">
        <p class="text-red-800 mb-4">{{ error }}</p>
        <Button variant="danger" @click="fetchRedemptions">Retry</Button>
      </div>
    </Card>

    <!-- Redemptions Table -->
    <Card v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Child Age
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredRedemptions.length === 0">
              <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                No redemptions found
              </td>
            </tr>
            <tr
              v-for="redemption in filteredRedemptions"
              :key="redemption.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-mono text-sm font-medium text-gray-900">
                  {{ redemption.redemptionCode }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getRewardTitle(redemption.rewardId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getStatusVariant(redemption.redemptionStatus)">
                  {{ redemption.redemptionStatus }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(redemption.redemptionDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ redemption.childAge }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ redemption.redemptionCity }}, {{ redemption.redemptionZip }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ redemption.pointsSpent }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  @click="viewDetails(redemption)"
                >
                  Details
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Redemption Details Modal -->
    <Modal
      :show="showDetailsModal"
      title="Redemption Details"
      size="lg"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedRedemption" class="space-y-6">
        <!-- QR Code -->
        <div class="flex justify-center">
          <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
            <img
              v-if="qrCodeUrl"
              :src="qrCodeUrl"
              alt="QR Code"
              class="w-64 h-64"
            />
          </div>
        </div>

        <!-- Redemption Code -->
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Redemption Code</p>
          <p class="text-3xl font-bold font-mono text-gray-900">
            {{ selectedRedemption.redemptionCode }}
          </p>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Reward</p>
            <p class="font-medium text-gray-900">{{ getRewardTitle(selectedRedemption.rewardId) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Status</p>
            <Badge :variant="getStatusVariant(selectedRedemption.redemptionStatus)">
              {{ selectedRedemption.redemptionStatus }}
            </Badge>
          </div>
          <div>
            <p class="text-sm text-gray-600">Points Spent</p>
            <p class="font-medium text-gray-900">{{ selectedRedemption.pointsSpent }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Child Age</p>
            <p class="font-medium text-gray-900">{{ selectedRedemption.childAge }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Redeemed Date</p>
            <p class="font-medium text-gray-900">{{ formatDate(selectedRedemption.redemptionDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Expires</p>
            <p class="font-medium text-gray-900">{{ formatDate(selectedRedemption.expiresAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Location</p>
            <p class="font-medium text-gray-900">
              {{ selectedRedemption.redemptionCity }}, {{ selectedRedemption.redemptionZip }}
            </p>
          </div>
          <div v-if="selectedRedemption.fulfilledAt">
            <p class="text-sm text-gray-600">Fulfilled At</p>
            <p class="font-medium text-gray-900">{{ formatDate(selectedRedemption.fulfilledAt) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showDetailsModal = false" :disabled="processingAction">
          Close
        </Button>
        <Button
          v-if="selectedRedemption?.redemptionStatus === 'PENDING'"
          variant="success"
          @click="markAsRedeemed"
          :disabled="processingAction"
        >
          {{ processingAction ? 'Processing...' : 'Mark as Redeemed' }}
        </Button>
      </template>
    </Modal>
  </div>
</template>
