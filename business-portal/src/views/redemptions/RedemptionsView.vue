<script setup lang="ts">
/**
 * RedemptionsView
 *
 * Manage reward redemptions with:
 * - Filter by status, date, search
 * - Redemptions table
 * - Details modal with QR code
 * - Mark as redeemed functionality
 */

import { ref, computed, onMounted } from 'vue';
import QRCode from 'qrcode';
import { useRewardsStore } from '@/stores/rewards';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import Modal from '@/components/common/Modal.vue';
import Input from '@/components/common/Input.vue';
import Select from '@/components/common/Select.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const rewardsStore = useRewardsStore();

// State
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const startDate = ref('');
const endDate = ref('');
const selectedRedemption = ref<any>(null);
const showDetailsModal = ref(false);
const qrCodeUrl = ref('');

// Status options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Redeemed', value: 'REDEEMED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

// Mock redemptions data
const redemptions = ref([
  {
    id: '1',
    redemptionCode: 'ABC12345',
    rewardTitle: 'Free Ice Cream Cone',
    familyId: 'family-123',
    childId: 'child-456',
    childAge: 8,
    redemptionStatus: 'PENDING',
    redemptionDate: '2024-10-05T14:30:00Z',
    expiresAt: '2024-10-12T14:30:00Z',
    redemptionCity: 'Durham',
    redemptionZip: '27707',
    pointsSpent: 500,
  },
  {
    id: '2',
    redemptionCode: 'DEF67890',
    rewardTitle: 'Mini Golf Pass',
    familyId: 'family-789',
    childId: 'child-012',
    childAge: 12,
    redemptionStatus: 'REDEEMED',
    redemptionDate: '2024-10-04T10:15:00Z',
    expiresAt: '2024-10-11T10:15:00Z',
    fulfilledAt: '2024-10-05T16:20:00Z',
    redemptionCity: 'Durham',
    redemptionZip: '27701',
    pointsSpent: 750,
  },
  {
    id: '3',
    redemptionCode: 'GHI34567',
    rewardTitle: 'Pizza Slice',
    familyId: 'family-234',
    childId: 'child-567',
    childAge: 10,
    redemptionStatus: 'PENDING',
    redemptionDate: '2024-10-06T18:45:00Z',
    expiresAt: '2024-10-13T18:45:00Z',
    redemptionCity: 'Durham',
    redemptionZip: '27705',
    pointsSpent: 300,
  },
  {
    id: '4',
    redemptionCode: 'JKL89012',
    rewardTitle: 'Movie Ticket',
    familyId: 'family-567',
    childId: 'child-890',
    childAge: 15,
    redemptionStatus: 'EXPIRED',
    redemptionDate: '2024-09-28T12:00:00Z',
    expiresAt: '2024-10-05T12:00:00Z',
    redemptionCity: 'Durham',
    redemptionZip: '27713',
    pointsSpent: 1000,
  },
]);

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
      return (
        redemption.redemptionCode.toLowerCase().includes(query) ||
        redemption.rewardTitle.toLowerCase().includes(query) ||
        redemption.familyId.toLowerCase().includes(query)
      );
    }

    return true;
  });
});

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

// Mark as redeemed
const markAsRedeemed = async () => {
  if (!selectedRedemption.value) return;

  try {
    // TODO: Update redemption status in DynamoDB
    // await client.models.RewardRedemption.update({
    //   id: selectedRedemption.value.id,
    //   redemptionStatus: 'REDEEMED',
    //   fulfilledAt: new Date().toISOString(),
    // });

    // Update local state
    const index = redemptions.value.findIndex((r) => r.id === selectedRedemption.value.id);
    if (index !== -1) {
      redemptions.value[index].redemptionStatus = 'REDEEMED';
      redemptions.value[index].fulfilledAt = new Date().toISOString();
    }

    showDetailsModal.value = false;
  } catch (error) {
    console.error('Error marking as redeemed:', error);
  }
};

// Fetch redemptions
const fetchRedemptions = async () => {
  loading.value = true;
  try {
    await rewardsStore.fetchRedemptions();
    // redemptions.value = rewardsStore.redemptions;
  } catch (error) {
    console.error('Error fetching redemptions:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRedemptions();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Redemptions</h1>
      <p class="mt-2 text-gray-600">
        Manage and track reward redemptions from families
      </p>
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
                {{ redemption.rewardTitle }}
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
            <p class="font-medium text-gray-900">{{ selectedRedemption.rewardTitle }}</p>
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
        <Button variant="secondary" @click="showDetailsModal = false">
          Close
        </Button>
        <Button
          v-if="selectedRedemption?.redemptionStatus === 'PENDING'"
          variant="success"
          @click="markAsRedeemed"
        >
          Mark as Redeemed
        </Button>
      </template>
    </Modal>
  </div>
</template>
