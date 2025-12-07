<script setup lang="ts">
/**
 * AdminDashboard
 *
 * Platform-wide overview for platform administrators using real data from:
 * - Business table (for business counts and statuses)
 * - Investor metrics API (for platform-wide analytics)
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify-config';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import MetricCard from '@/components/analytics/MetricCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EnvironmentBadge from '@/components/EnvironmentBadge.vue';

const router = useRouter();
const client = generateClient<Schema>();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const businesses = ref<any[]>([]);
const investorMetrics = ref<any>(null);

// Computed metrics
const platformMetrics = ref({
  totalBusinesses: 0,
  pendingApprovals: 0,
  approvedBusinesses: 0,
  rejectedBusinesses: 0,
  activeRewards: 0,
  totalRedemptions: 0,
  platformRevenue: 0,
  monthlyGrowth: 0,
});

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  loading.value = true;
  error.value = null;

  try {
    // Fetch all businesses
    const businessResult = await client.models.Business.list();

    if (businessResult.data) {
      businesses.value = businessResult.data;

      // Calculate metrics from business data
      platformMetrics.value.totalBusinesses = businesses.value.length;
      platformMetrics.value.pendingApprovals = businesses.value.filter(
        b => b.verificationStatus === 'PENDING'
      ).length;
      platformMetrics.value.approvedBusinesses = businesses.value.filter(
        b => b.verificationStatus === 'APPROVED'
      ).length;
      platformMetrics.value.rejectedBusinesses = businesses.value.filter(
        b => b.verificationStatus === 'REJECTED'
      ).length;
    }

    // Fetch investor metrics for platform-wide data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const metricsResult = await client.queries.getInvestorMetrics({
      startDate,
      endDate,
    });

    if (metricsResult.data) {
      let parsedData = metricsResult.data;
      if (typeof metricsResult.data === 'string') {
        parsedData = JSON.parse(metricsResult.data);
      }

      investorMetrics.value = parsedData;

      // Update metrics from investor data
      if (parsedData.marketplace) {
        platformMetrics.value.activeRewards = parsedData.marketplace.activeRewards || 0;
      }
      if (parsedData.revenue) {
        platformMetrics.value.totalRedemptions = parsedData.revenue.totalRedemptions || 0;
        platformMetrics.value.platformRevenue = parsedData.revenue.totalRevenue || 0;
      }
      if (parsedData.growth) {
        platformMetrics.value.monthlyGrowth = parsedData.growth.revenueGrowthRate || 0;
      }
    }
  } catch (err) {
    console.error('Error fetching admin data:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load admin data';
  } finally {
    loading.value = false;
  }
}

// Get recent businesses sorted by creation date
const recentSignups = ref<any[]>([]);
onMounted(() => {
  if (businesses.value.length > 0) {
    recentSignups.value = [...businesses.value]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }
});

function goToBusinessApprovals() {
  router.push('/admin/business-approvals');
}

function goToInvestorDashboard() {
  router.push('/');
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
  <div class="admin-dashboard">
    <div class="header">
      <div>
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Platform-wide overview and management</p>
      </div>
      <EnvironmentBadge />
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchData" class="retry-btn">Retry</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Platform Metrics -->
      <div class="metrics-section">
        <h2>Platform Overview</h2>
        <div class="metric-cards">
          <MetricCard
            title="Total Businesses"
            :value="platformMetrics.totalBusinesses.toString()"
            icon="🏪"
          />
          <MetricCard
            title="Pending Approvals"
            :value="platformMetrics.pendingApprovals.toString()"
            icon="⏳"
            @click="goToBusinessApprovals"
            class="clickable"
          />
          <MetricCard
            title="Active Rewards"
            :value="platformMetrics.activeRewards.toString()"
            icon="🎁"
          />
          <MetricCard
            title="Total Redemptions"
            :value="platformMetrics.totalRedemptions.toLocaleString()"
            icon="✅"
          />
          <MetricCard
            title="Platform Revenue"
            :value="`$${platformMetrics.platformRevenue.toLocaleString()}`"
            :change="platformMetrics.monthlyGrowth"
            icon="💰"
          />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-cards">
          <Card class="action-card" @click="goToBusinessApprovals">
            <div class="action-content">
              <div class="action-icon">✅</div>
              <div>
                <h3>Review Business Approvals</h3>
                <p>{{ platformMetrics.pendingApprovals }} pending</p>
              </div>
            </div>
          </Card>

          <Card class="action-card" @click="goToInvestorDashboard">
            <div class="action-content">
              <div class="action-icon">📊</div>
              <div>
                <h3>View Analytics</h3>
                <p>Platform-wide metrics</p>
              </div>
            </div>
          </Card>

          <Card class="action-card" @click="router.push('/admin/reward-approvals')">
            <div class="action-content">
              <div class="action-icon">🎁</div>
              <div>
                <h3>Review Reward Approvals</h3>
                <p>Moderate content</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Recent Business Signups -->
      <div class="recent-section">
        <h2>Recent Business Signups</h2>
        <Card v-if="businesses.length === 0" class="empty-card">
          <p>No businesses registered yet.</p>
        </Card>
        <Card v-else>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Email</th>
                  <th>Signup Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="business in businesses.slice(0, 10)" :key="business.id">
                  <td class="business-name">{{ business.name }}</td>
                  <td>{{ business.email }}</td>
                  <td>{{ formatDate(business.createdAt) }}</td>
                  <td>
                    <Badge :variant="getStatusColor(business.verificationStatus || 'PENDING')">
                      {{ business.verificationStatus || 'PENDING' }}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      @click="router.push(`/admin/business-approvals`)"
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1600px;
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

.dashboard-content {
  display: grid;
  gap: 2rem;
}

.metrics-section h2,
.quick-actions h2,
.recent-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable:hover {
  transform: translateY(-2px);
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-icon {
  font-size: 2rem;
}

.action-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.action-content p {
  font-size: 0.875rem;
  color: #6b7280;
}

.empty-card {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #374151;
}

.business-name {
  font-weight: 500;
  color: #1f2937;
}

tbody tr:hover {
  background: #f9fafb;
}
</style>
