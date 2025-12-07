<script setup lang="ts">
/**
 * BusinessApprovalsView
 *
 * Manage business approval workflow using real Business table data:
 * - Query businesses from DynamoDB
 * - Approve/Reject with mutations
 * - Real-time status updates
 */

import { ref, computed, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify-config';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import Modal from '@/components/common/Modal.vue';
import Input from '@/components/common/Input.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EnvironmentBadge from '@/components/EnvironmentBadge.vue';

const client = generateClient<Schema>();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const businesses = ref<any[]>([]);
const selectedBusiness = ref<any>(null);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const rejectionReason = ref('');
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending');
const processingAction = ref(false);

onMounted(async () => {
  await fetchBusinesses();
});

async function fetchBusinesses() {
  loading.value = true;
  error.value = null;

  try {
    const result = await client.models.Business.list();

    if (result.data) {
      businesses.value = result.data;
    }
  } catch (err) {
    console.error('Error fetching businesses:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load businesses';
  } finally {
    loading.value = false;
  }
}

// Filtered lists
const pendingBusinesses = computed(() =>
  businesses.value.filter(b => b.verificationStatus === 'PENDING')
);

const approvedBusinesses = computed(() =>
  businesses.value.filter(b => b.verificationStatus === 'APPROVED')
);

const rejectedBusinesses = computed(() =>
  businesses.value.filter(b => b.verificationStatus === 'REJECTED')
);

// Actions
function openApproveModal(business: any) {
  selectedBusiness.value = business;
  showApproveModal.value = true;
}

function openRejectModal(business: any) {
  selectedBusiness.value = business;
  rejectionReason.value = '';
  showRejectModal.value = true;
}

async function approveBusiness() {
  if (!selectedBusiness.value) return;

  processingAction.value = true;
  try {
    await client.models.Business.update({
      id: selectedBusiness.value.id,
      verificationStatus: 'APPROVED',
      isVerified: true,
    });

    await fetchBusinesses();
    showApproveModal.value = false;
    selectedBusiness.value = null;
  } catch (err) {
    console.error('Error approving business:', err);
    alert('Failed to approve business. Please try again.');
  } finally {
    processingAction.value = false;
  }
}

async function rejectBusiness() {
  if (!selectedBusiness.value || !rejectionReason.value.trim()) {
    alert('Please provide a rejection reason');
    return;
  }

  processingAction.value = true;
  try {
    await client.models.Business.update({
      id: selectedBusiness.value.id,
      verificationStatus: 'REJECTED',
      isVerified: false,
      rejectionReason: rejectionReason.value.trim(),
    });

    await fetchBusinesses();
    showRejectModal.value = false;
    selectedBusiness.value = null;
    rejectionReason.value = '';
  } catch (err) {
    console.error('Error rejecting business:', err);
    alert('Failed to reject business. Please try again.');
  } finally {
    processingAction.value = false;
  }
}

async function revokeApproval(business: any) {
  if (!confirm(`Are you sure you want to revoke approval for "${business.name}"?`)) {
    return;
  }

  try {
    await client.models.Business.update({
      id: business.id,
      verificationStatus: 'PENDING',
      isVerified: false,
    });

    await fetchBusinesses();
  } catch (err) {
    console.error('Error revoking approval:', err);
    alert('Failed to revoke approval. Please try again.');
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'default';
  }
}
</script>

<template>
  <div class="business-approvals">
    <div class="header">
      <div>
        <h1>Business Approvals</h1>
        <p class="subtitle">Review and manage business applications</p>
      </div>
      <EnvironmentBadge />
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        Pending ({{ pendingBusinesses.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'approved' }]"
        @click="activeTab = 'approved'"
      >
        Approved ({{ approvedBusinesses.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'rejected' }]"
        @click="activeTab = 'rejected'"
      >
        Rejected ({{ rejectedBusinesses.length }})
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchBusinesses" class="retry-btn">Retry</button>
    </div>

    <div v-else class="content">
      <!-- Pending Tab -->
      <div v-if="activeTab === 'pending'">
        <Card v-if="pendingBusinesses.length === 0" class="empty-card">
          <p>✅ No pending business approvals!</p>
        </Card>
        <div v-else class="business-list">
          <Card v-for="business in pendingBusinesses" :key="business.id" class="business-card">
            <div class="business-header">
              <div>
                <h3>{{ business.name }}</h3>
                <Badge :variant="getStatusColor(business.verificationStatus)">
                  {{ business.verificationStatus }}
                </Badge>
              </div>
              <span class="date">{{ formatDate(business.createdAt) }}</span>
            </div>

            <div class="business-details">
              <div class="detail-row">
                <strong>Type:</strong> {{ business.businessType || 'N/A' }}
              </div>
              <div class="detail-row">
                <strong>Email:</strong> {{ business.email }}
              </div>
              <div class="detail-row">
                <strong>Phone:</strong> {{ business.phone || 'N/A' }}
              </div>
              <div class="detail-row">
                <strong>Address:</strong>
                {{ business.address }}, {{ business.city }}, {{ business.state }} {{ business.zipCode }}
              </div>
              <div class="detail-row" v-if="business.description">
                <strong>Description:</strong> {{ business.description }}
              </div>
              <div class="detail-row" v-if="business.website">
                <strong>Website:</strong>
                <a :href="business.website" target="_blank" class="link">{{ business.website }}</a>
              </div>
            </div>

            <div class="actions">
              <Button variant="success" @click="openApproveModal(business)">
                ✅ Approve
              </Button>
              <Button variant="danger" @click="openRejectModal(business)">
                ❌ Reject
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <!-- Approved Tab -->
      <div v-if="activeTab === 'approved'">
        <Card v-if="approvedBusinesses.length === 0" class="empty-card">
          <p>No approved businesses yet.</p>
        </Card>
        <div v-else class="business-list">
          <Card v-for="business in approvedBusinesses" :key="business.id" class="business-card">
            <div class="business-header">
              <div>
                <h3>{{ business.name }}</h3>
                <Badge variant="success">APPROVED</Badge>
              </div>
              <span class="date">Approved {{ formatDate(business.updatedAt || business.createdAt) }}</span>
            </div>

            <div class="business-details">
              <div class="detail-row">
                <strong>Email:</strong> {{ business.email }}
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                {{ business.city }}, {{ business.state }}
              </div>
            </div>

            <div class="actions">
              <Button variant="secondary" @click="revokeApproval(business)">
                Revoke Approval
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <!-- Rejected Tab -->
      <div v-if="activeTab === 'rejected'">
        <Card v-if="rejectedBusinesses.length === 0" class="empty-card">
          <p>No rejected businesses.</p>
        </Card>
        <div v-else class="business-list">
          <Card v-for="business in rejectedBusinesses" :key="business.id" class="business-card">
            <div class="business-header">
              <div>
                <h3>{{ business.name }}</h3>
                <Badge variant="danger">REJECTED</Badge>
              </div>
              <span class="date">{{ formatDate(business.updatedAt || business.createdAt) }}</span>
            </div>

            <div class="business-details">
              <div class="detail-row">
                <strong>Email:</strong> {{ business.email }}
              </div>
              <div class="detail-row rejection-reason" v-if="business.rejectionReason">
                <strong>Rejection Reason:</strong> {{ business.rejectionReason }}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <Modal v-model="showApproveModal" title="Approve Business">
      <div v-if="selectedBusiness" class="modal-content">
        <p>Are you sure you want to approve <strong>{{ selectedBusiness.name }}</strong>?</p>
        <p class="text-sm text-gray-600">This will allow them to create reward campaigns.</p>

        <div class="modal-actions">
          <Button variant="secondary" @click="showApproveModal = false" :disabled="processingAction">
            Cancel
          </Button>
          <Button variant="success" @click="approveBusiness" :disabled="processingAction">
            {{ processingAction ? 'Approving...' : 'Confirm Approval' }}
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Reject Modal -->
    <Modal v-model="showRejectModal" title="Reject Business">
      <div v-if="selectedBusiness" class="modal-content">
        <p>Rejecting <strong>{{ selectedBusiness.name }}</strong></p>

        <div class="form-group">
          <label for="rejection-reason">Reason for Rejection *</label>
          <textarea
            id="rejection-reason"
            v-model="rejectionReason"
            class="textarea"
            rows="4"
            placeholder="Please provide a detailed reason for rejection..."
            :disabled="processingAction"
          ></textarea>
        </div>

        <div class="modal-actions">
          <Button variant="secondary" @click="showRejectModal = false" :disabled="processingAction">
            Cancel
          </Button>
          <Button variant="danger" @click="rejectBusiness" :disabled="processingAction || !rejectionReason.trim()">
            {{ processingAction ? 'Rejecting...' : 'Confirm Rejection' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.business-approvals {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: #1f2937;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.error-message {
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.empty-card {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.125rem;
}

.business-list {
  display: grid;
  gap: 1.5rem;
}

.business-card {
  padding: 1.5rem;
}

.business-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.business-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.business-details {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  font-size: 0.875rem;
  color: #374151;
}

.detail-row strong {
  color: #1f2937;
  font-weight: 600;
  margin-right: 0.5rem;
}

.rejection-reason {
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 0.375rem;
  color: #dc2626;
}

.link {
  color: #3b82f6;
  text-decoration: underline;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.modal-content {
  padding: 1rem 0;
}

.modal-content p {
  margin-bottom: 1rem;
  color: #374151;
}

.form-group {
  margin: 1.5rem 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px solid rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #6b7280;
}
</style>
