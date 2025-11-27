<script setup lang="ts">
/**
 * AdminDashboard
 *
 * Platform-wide overview for platform administrators:
 * - Total businesses (pending, approved, rejected)
 * - Total active rewards
 * - Platform revenue
 * - Top businesses by redemptions
 * - Recent signups
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Badge from '@/components/common/Badge.vue';
import MetricCard from '@/components/analytics/MetricCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const router = useRouter();

// State
const loading = ref(false);

// Mock platform metrics
const platformMetrics = ref({
  totalBusinesses: 247,
  pendingApprovals: 12,
  approvedBusinesses: 218,
  rejectedBusinesses: 17,
  activeRewards: 1456,
  totalRedemptions: 12834,
  platformRevenue: 45678.50,
  monthlyGrowth: 15.3,
});

// Top businesses
const topBusinesses = ref([
  {
    id: '1',
    name: 'Durham Ice Cream Co',
    redemptions: 456,
    revenue: 3420.00,
    status: 'APPROVED',
  },
  {
    id: '2',
    name: 'Mini Golf Paradise',
    redemptions: 389,
    revenue: 2918.50,
    status: 'APPROVED',
  },
  {
    id: '3',
    name: 'Pizza Palace',
    redemptions: 324,
    revenue: 2430.00,
    status: 'APPROVED',
  },
  {
    id: '4',
    name: 'Family Fun Center',
    redemptions: 287,
    revenue: 2152.50,
    status: 'APPROVED',
  },
  {
    id: '5',
    name: 'Art & Craft Studio',
    redemptions: 234,
    revenue: 1755.00,
    status: 'APPROVED',
  },
]);

// Recent signups
const recentSignups = ref([
  {
    id: '1',
    name: 'Durham Bowling Alley',
    email: 'info@durhambowling.com',
    signupDate: '2024-10-07T09:30:00Z',
    status: 'PENDING',
  },
  {
    id: '2',
    name: 'Kids Science Museum',
    email: 'admin@kidsscience.org',
    signupDate: '2024-10-06T14:20:00Z',
    status: 'PENDING',
  },
  {
    id: '3',
    name: 'Trampoline Park',
    email: 'contact@trampolinepark.com',
    signupDate: '2024-10-05T11:15:00Z',
    status: 'APPROVED',
  },
  {
    id: '4',
    name: 'Book Cafe',
    email: 'hello@bookcafe.com',
    signupDate: '2024-10-04T16:45:00Z',
    status: 'APPROVED',
  },
]);

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Navigate to approvals
const goToBusinessApprovals = () => {
  router.push({ name: 'BusinessApprovals' });
};

const goToRewardApprovals = () => {
  router.push({ name: 'RewardApprovals' });
};

// Fetch platform metrics
const fetchMetrics = async () => {
  loading.value = true;
  try {
    // TODO: Fetch from backend
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error fetching metrics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMetrics();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Platform Administration</h1>
      <p class="mt-2 text-gray-600">
        Manage businesses, rewards, and platform-wide analytics
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading platform data..." />
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Businesses"
          :value="platformMetrics.totalBusinesses"
          change="+8.2%"
          trend="up"
          icon="🏢"
        />
        <MetricCard
          title="Pending Approvals"
          :value="platformMetrics.pendingApprovals"
          icon="⏳"
        />
        <MetricCard
          title="Active Rewards"
          :value="platformMetrics.activeRewards.toLocaleString()"
          change="+12.5%"
          trend="up"
          icon="🎁"
        />
        <MetricCard
          title="Platform Revenue"
          :value="`$${platformMetrics.platformRevenue.toLocaleString()}`"
          change="+15.3%"
          trend="up"
          icon="💰"
        />
      </div>

      <!-- Quick Actions -->
      <Card class="mb-8" title="Quick Actions" padding>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Business Approvals Card -->
          <div class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Business Approvals</h3>
                <p class="text-sm text-gray-600 mt-1">Review and approve new businesses</p>
              </div>
              <span class="text-3xl">✅</span>
            </div>
            <div class="mb-4">
              <span class="text-3xl font-bold text-blue-600">{{ platformMetrics.pendingApprovals }}</span>
              <span class="text-sm text-gray-600 ml-2">pending</span>
            </div>
            <Button variant="primary" fullWidth @click="goToBusinessApprovals">
              Review Business Approvals
            </Button>
          </div>

          <!-- Reward Approvals Card -->
          <div class="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Reward Approvals</h3>
                <p class="text-sm text-gray-600 mt-1">Approve rewards created by businesses</p>
              </div>
              <span class="text-3xl">🎯</span>
            </div>
            <div class="mb-4">
              <span class="text-3xl font-bold text-purple-600">--</span>
              <span class="text-sm text-gray-600 ml-2">pending</span>
            </div>
            <Button variant="primary" fullWidth @click="goToRewardApprovals">
              Review Reward Approvals
            </Button>
          </div>
        </div>
      </Card>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Businesses -->
        <Card title="Top Performing Businesses">
          <div class="space-y-4">
            <div
              v-for="business in topBusinesses"
              :key="business.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ business.name }}</p>
                <div class="mt-1 flex items-center gap-4 text-sm text-gray-600">
                  <span>{{ business.redemptions }} redemptions</span>
                  <span>${{ business.revenue.toLocaleString() }}</span>
                </div>
              </div>
              <Badge variant="success">{{ business.status }}</Badge>
            </div>
          </div>
        </Card>

        <!-- Recent Signups -->
        <Card title="Recent Business Signups">
          <div class="space-y-4">
            <div
              v-for="signup in recentSignups"
              :key="signup.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ signup.name }}</p>
                <p class="mt-1 text-sm text-gray-600">{{ signup.email }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ formatDate(signup.signupDate) }}</p>
              </div>
              <Badge
                :variant="signup.status === 'PENDING' ? 'warning' : 'success'"
              >
                {{ signup.status }}
              </Badge>
            </div>
          </div>

          <template #footer>
            <Button variant="secondary" fullWidth @click="goToBusinessApprovals">
              View All Pending Approvals
            </Button>
          </template>
        </Card>
      </div>

      <!-- Platform Stats -->
      <Card class="mt-6" title="Platform Statistics" padding>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Approved Businesses</p>
            <p class="text-4xl font-bold text-blue-600">{{ platformMetrics.approvedBusinesses }}</p>
            <p class="text-sm text-gray-600 mt-2">
              {{ ((platformMetrics.approvedBusinesses / platformMetrics.totalBusinesses) * 100).toFixed(1) }}% of total
            </p>
          </div>

          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Total Redemptions</p>
            <p class="text-4xl font-bold text-green-600">{{ platformMetrics.totalRedemptions.toLocaleString() }}</p>
            <p class="text-sm text-gray-600 mt-2">
              Across all businesses
            </p>
          </div>

          <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Monthly Growth</p>
            <p class="text-4xl font-bold text-purple-600">{{ platformMetrics.monthlyGrowth }}%</p>
            <p class="text-sm text-gray-600 mt-2">
              Compared to last month
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
