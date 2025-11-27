<script setup lang="ts">
/**
 * BusinessApprovalsView
 *
 * Manage business approval workflow:
 * - Pending approvals queue
 * - Business details review
 * - Approve/Reject actions with reason
 * - Approved businesses list
 * - Revoke approval option
 */

import { ref, computed, onMounted } from 'vue';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import Modal from '@/components/common/Modal.vue';
import Input from '@/components/common/Input.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// State
const loading = ref(false);
const selectedBusiness = ref<any>(null);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const rejectionReason = ref('');
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending');

// Mock businesses data
const businesses = ref([
  {
    id: '1',
    name: 'Durham Bowling Alley',
    email: 'info@durhambowling.com',
    phone: '(919) 555-0123',
    address: '123 Main St',
    city: 'Durham',
    state: 'NC',
    zipCode: '27701',
    businessType: 'ENTERTAINMENT',
    description: 'Family-friendly bowling alley with arcade and food service',
    website: 'https://durhambowling.com',
    verificationStatus: 'PENDING',
    createdAt: '2024-10-07T09:30:00Z',
  },
  {
    id: '2',
    name: 'Kids Science Museum',
    email: 'admin@kidsscience.org',
    phone: '(919) 555-0124',
    address: '456 Science Dr',
    city: 'Durham',
    state: 'NC',
    zipCode: '27705',
    businessType: 'EDUCATION',
    description: 'Interactive science museum for children ages 5-15',
    website: 'https://kidsscience.org',
    verificationStatus: 'PENDING',
    createdAt: '2024-10-06T14:20:00Z',
  },
  {
    id: '3',
    name: 'Trampoline Park',
    email: 'contact@trampolinepark.com',
    phone: '(919) 555-0125',
    address: '789 Jump Ln',
    city: 'Durham',
    state: 'NC',
    zipCode: '27713',
    businessType: 'SPORTS_RECREATION',
    description: 'Indoor trampoline park with dodgeball and foam pits',
    website: 'https://trampolinepark.com',
    verificationStatus: 'APPROVED',
    createdAt: '2024-10-05T11:15:00Z',
  },
  {
    id: '4',
    name: 'Book Cafe',
    email: 'hello@bookcafe.com',
    phone: '(919) 555-0126',
    address: '321 Reading Rd',
    city: 'Durham',
    state: 'NC',
    zipCode: '27707',
    businessType: 'RETAIL',
    description: 'Bookstore with cafe and reading areas',
    website: 'https://bookcafe.com',
    verificationStatus: 'APPROVED',
    createdAt: '2024-10-04T16:45:00Z',
  },
  {
    id: '5',
    name: 'Fake Business Inc',
    email: 'spam@fake.com',
    phone: '(000) 000-0000',
    address: '000 Fake St',
    city: 'Durham',
    state: 'NC',
    zipCode: '00000',
    businessType: 'OTHER',
    description: 'Suspicious business',
    verificationStatus: 'REJECTED',
    rejectionReason: 'Incomplete information and suspicious details',
    createdAt: '2024-10-03T10:00:00Z',
  },
]);

// Filtered businesses
const filteredBusinesses = computed(() => {
  return businesses.value.filter((b) => b.verificationStatus === activeTab.value.toUpperCase());
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

// View business details
const viewDetails = (business: any) => {
  selectedBusiness.value = business;
  if (business.verificationStatus === 'PENDING') {
    showApproveModal.value = true;
  }
};

// Approve business
const approveBusiness = async () => {
  if (!selectedBusiness.value) return;

  try {
    // TODO: Update business in DynamoDB
    // await client.models.Business.update({
    //   id: selectedBusiness.value.id,
    //   verificationStatus: 'APPROVED',
    //   isVerified: true,
    // });

    // Update local state
    const index = businesses.value.findIndex((b) => b.id === selectedBusiness.value.id);
    if (index !== -1) {
      businesses.value[index].verificationStatus = 'APPROVED';
    }

    showApproveModal.value = false;
    selectedBusiness.value = null;
  } catch (error) {
    console.error('Error approving business:', error);
  }
};

// Reject business
const rejectBusiness = async () => {
  if (!selectedBusiness.value || !rejectionReason.value) return;

  try {
    // TODO: Update business in DynamoDB
    // await client.models.Business.update({
    //   id: selectedBusiness.value.id,
    //   verificationStatus: 'REJECTED',
    //   isVerified: false,
    //   rejectionReason: rejectionReason.value,
    // });

    // Update local state
    const index = businesses.value.findIndex((b) => b.id === selectedBusiness.value.id);
    if (index !== -1) {
      businesses.value[index].verificationStatus = 'REJECTED';
      businesses.value[index].rejectionReason = rejectionReason.value;
    }

    showRejectModal.value = false;
    showApproveModal.value = false;
    selectedBusiness.value = null;
    rejectionReason.value = '';
  } catch (error) {
    console.error('Error rejecting business:', error);
  }
};

// Open reject modal
const openRejectModal = () => {
  showApproveModal.value = false;
  showRejectModal.value = true;
};

// Fetch businesses
const fetchBusinesses = async () => {
  loading.value = true;
  try {
    // TODO: Fetch from DynamoDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error fetching businesses:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBusinesses();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Business Approvals</h1>
      <p class="mt-2 text-gray-600">
        Review and approve new business registrations
      </p>
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
            Pending
            <Badge variant="warning" class="ml-2">
              {{ businesses.filter((b) => b.verificationStatus === 'PENDING').length }}
            </Badge>
          </button>
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'approved'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="activeTab = 'approved'"
          >
            Approved
            <Badge variant="success" class="ml-2">
              {{ businesses.filter((b) => b.verificationStatus === 'APPROVED').length }}
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
            Rejected
            <Badge variant="danger" class="ml-2">
              {{ businesses.filter((b) => b.verificationStatus === 'REJECTED').length }}
            </Badge>
          </button>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading businesses..." />
    </div>

    <!-- Businesses List -->
    <div v-else class="space-y-4">
      <Card
        v-for="business in filteredBusinesses"
        :key="business.id"
        padding
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Business Name & Badge -->
            <div class="flex items-center gap-3 mb-3">
              <h3 class="text-xl font-semibold text-gray-900">{{ business.name }}</h3>
              <Badge
                :variant="
                  business.verificationStatus === 'PENDING'
                    ? 'warning'
                    : business.verificationStatus === 'APPROVED'
                    ? 'success'
                    : 'danger'
                "
              >
                {{ business.verificationStatus }}
              </Badge>
            </div>

            <!-- Business Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Email</p>
                <p class="font-medium text-gray-900">{{ business.email }}</p>
              </div>
              <div>
                <p class="text-gray-600">Phone</p>
                <p class="font-medium text-gray-900">{{ business.phone }}</p>
              </div>
              <div>
                <p class="text-gray-600">Address</p>
                <p class="font-medium text-gray-900">
                  {{ business.address }}, {{ business.city }}, {{ business.state }} {{ business.zipCode }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Type</p>
                <p class="font-medium text-gray-900">{{ business.businessType }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-gray-600">Description</p>
                <p class="font-medium text-gray-900">{{ business.description }}</p>
              </div>
              <div v-if="business.website">
                <p class="text-gray-600">Website</p>
                <a
                  :href="business.website"
                  target="_blank"
                  class="font-medium text-primary-600 hover:underline"
                >
                  {{ business.website }}
                </a>
              </div>
              <div>
                <p class="text-gray-600">Submitted</p>
                <p class="font-medium text-gray-900">{{ formatDate(business.createdAt) }}</p>
              </div>
              <div v-if="business.rejectionReason" class="md:col-span-2">
                <p class="text-gray-600">Rejection Reason</p>
                <p class="font-medium text-red-600">{{ business.rejectionReason }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="business.verificationStatus === 'PENDING'" class="ml-6">
            <Button variant="primary" @click="viewDetails(business)">
              Review
            </Button>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <div v-if="filteredBusinesses.length === 0" class="text-center py-12">
        <p class="text-gray-500">No {{ activeTab }} businesses</p>
      </div>
    </div>

    <!-- Approve/Review Modal -->
    <Modal
      :show="showApproveModal"
      title="Review Business"
      size="xl"
      @close="showApproveModal = false"
    >
      <div v-if="selectedBusiness" class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">{{ selectedBusiness.name }}</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-600">Email:</span>
              <span class="ml-2 font-medium">{{ selectedBusiness.email }}</span>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <span class="ml-2 font-medium">{{ selectedBusiness.phone }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-600">Address:</span>
              <span class="ml-2 font-medium">
                {{ selectedBusiness.address }}, {{ selectedBusiness.city }}, {{ selectedBusiness.state }}
                {{ selectedBusiness.zipCode }}
              </span>
            </div>
            <div>
              <span class="text-gray-600">Type:</span>
              <span class="ml-2 font-medium">{{ selectedBusiness.businessType }}</span>
            </div>
            <div v-if="selectedBusiness.website">
              <span class="text-gray-600">Website:</span>
              <a
                :href="selectedBusiness.website"
                target="_blank"
                class="ml-2 font-medium text-primary-600 hover:underline"
              >
                Visit
              </a>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Description</p>
          <p class="mt-1 text-gray-900">{{ selectedBusiness.description }}</p>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showApproveModal = false">
          Cancel
        </Button>
        <Button variant="danger" @click="openRejectModal">
          Reject
        </Button>
        <Button variant="success" @click="approveBusiness">
          Approve Business
        </Button>
      </template>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      :show="showRejectModal"
      title="Reject Business"
      size="md"
      @close="showRejectModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          Please provide a reason for rejecting
          <strong>{{ selectedBusiness?.name }}</strong>:
        </p>

        <Input
          v-model="rejectionReason"
          label="Rejection Reason"
          type="text"
          placeholder="e.g., Incomplete information, unable to verify..."
          required
        />
      </div>

      <template #footer>
        <Button variant="secondary" @click="showRejectModal = false">
          Cancel
        </Button>
        <Button
          variant="danger"
          :disabled="!rejectionReason"
          @click="rejectBusiness"
        >
          Confirm Rejection
        </Button>
      </template>
    </Modal>
  </div>
</template>
