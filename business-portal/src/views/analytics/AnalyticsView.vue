<script setup lang="ts">
/**
 * AnalyticsView
 *
 * Comprehensive analytics dashboard with:
 * - Date range picker
 * - Metric cards (impressions, clicks, redemptions, ROI)
 * - Charts (line, bar, pie)
 * - Per-reward breakdown table
 * - CSV export
 */

import { ref, computed, onMounted } from 'vue';
import { Line, Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  type ChartOptions,
} from 'chart.js';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';
import MetricCard from '@/components/analytics/MetricCard.vue';
import DateRangePicker from '@/components/analytics/DateRangePicker.vue';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement
);

const authStore = useAuthStore();

// State
const loading = ref(false);
const startDate = ref(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
const endDate = ref(dayjs().format('YYYY-MM-DD'));

// Mock Analytics Data
const metrics = ref({
  impressions: 12450,
  clicks: 1823,
  redemptions: 234,
  revenue: 2340.0,
  spend: 1872.0,
  ctr: 14.6,
  roi: 25.0,
});

// Timeline data for line chart
const timelineData = computed(() => {
  const days = dayjs(endDate.value).diff(dayjs(startDate.value), 'day');
  const labels = [];
  const impressions = [];
  const clicks = [];
  const redemptions = [];

  for (let i = 0; i <= days; i++) {
    const date = dayjs(startDate.value).add(i, 'day');
    labels.push(date.format('MMM D'));
    impressions.push(Math.floor(Math.random() * 500) + 200);
    clicks.push(Math.floor(Math.random() * 80) + 20);
    redemptions.push(Math.floor(Math.random() * 15) + 2);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Impressions',
        data: impressions,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Clicks',
        data: clicks,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Redemptions',
        data: redemptions,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
      },
    ],
  };
});

// Reward performance data for bar chart
const rewardPerformanceData = computed(() => ({
  labels: ['Free Ice Cream', 'Mini Golf Pass', 'Pizza Slice', 'Movie Ticket', 'Art Class'],
  datasets: [
    {
      label: 'Redemptions',
      data: [45, 38, 32, 28, 21],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    },
  ],
}));

// Category distribution for pie chart
const categoryDistributionData = computed(() => ({
  labels: ['Food', 'Entertainment', 'Education', 'Sports', 'Arts & Crafts'],
  datasets: [
    {
      data: [35, 28, 18, 12, 7],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    },
  ],
}));

// Chart options
const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Performance Over Time',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Top Rewards by Redemptions',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const pieChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Redemptions by Category',
    },
  },
};

// Per-reward breakdown table data
const rewardBreakdown = ref([
  {
    id: '1',
    title: 'Free Ice Cream Cone',
    impressions: 2450,
    clicks: 412,
    redemptions: 45,
    ctr: 16.8,
    conversionRate: 10.9,
  },
  {
    id: '2',
    title: 'Mini Golf Pass',
    impressions: 1980,
    clicks: 298,
    redemptions: 38,
    ctr: 15.1,
    conversionRate: 12.8,
  },
  {
    id: '3',
    title: 'Pizza Slice',
    impressions: 3120,
    clicks: 456,
    redemptions: 32,
    ctr: 14.6,
    conversionRate: 7.0,
  },
  {
    id: '4',
    title: 'Movie Ticket',
    impressions: 1650,
    clicks: 234,
    redemptions: 28,
    ctr: 14.2,
    conversionRate: 12.0,
  },
  {
    id: '5',
    title: 'Art Class Session',
    impressions: 1250,
    clicks: 189,
    redemptions: 21,
    ctr: 15.1,
    conversionRate: 11.1,
  },
]);

// Export to CSV
const exportToCSV = () => {
  const headers = ['Reward', 'Impressions', 'Clicks', 'Redemptions', 'CTR (%)', 'Conversion (%)'];
  const rows = rewardBreakdown.value.map((r) => [
    r.title,
    r.impressions,
    r.clicks,
    r.redemptions,
    r.ctr.toFixed(1),
    r.conversionRate.toFixed(1),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${startDate.value}-to-${endDate.value}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Fetch analytics data
const fetchAnalytics = async () => {
  loading.value = true;
  try {
    // TODO: Call getBusinessAnalytics Lambda function
    // const response = await client.queries.getBusinessAnalytics({
    //   businessId: authStore.user?.id,
    //   startDate: startDate.value,
    //   endDate: endDate.value,
    // });
    // metrics.value = response.data;

    // For now, using mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error fetching analytics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
      <p class="mt-2 text-gray-600">
        Track your reward performance and campaign metrics
      </p>
    </div>

    <!-- Date Range Picker -->
    <div class="mb-6">
      <Card padding>
        <DateRangePicker
          v-model:start="startDate"
          v-model:end="endDate"
          @update:start="fetchAnalytics"
          @update:end="fetchAnalytics"
        />
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading analytics..." />
    </div>

    <!-- Analytics Content -->
    <div v-else>
      <!-- Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Impressions"
          :value="metrics.impressions.toLocaleString()"
          change="+12.5%"
          trend="up"
          icon="👀"
        />
        <MetricCard
          title="Total Clicks"
          :value="metrics.clicks.toLocaleString()"
          change="+8.3%"
          trend="up"
          icon="🖱️"
        />
        <MetricCard
          title="Total Redemptions"
          :value="metrics.redemptions.toLocaleString()"
          change="+15.7%"
          trend="up"
          icon="🎁"
        />
        <MetricCard
          title="ROI"
          :value="`${metrics.roi.toFixed(1)}%`"
          change="+3.2%"
          trend="up"
          icon="📈"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Line Chart -->
        <Card title="Performance Timeline" padding>
          <div class="h-80">
            <Line :data="timelineData" :options="lineChartOptions" />
          </div>
        </Card>

        <!-- Bar Chart -->
        <Card title="Top Performing Rewards" padding>
          <div class="h-80">
            <Bar :data="rewardPerformanceData" :options="barChartOptions" />
          </div>
        </Card>
      </div>

      <!-- Pie Chart and Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Category Distribution" padding>
          <div class="h-64">
            <Doughnut :data="categoryDistributionData" :options="pieChartOptions" />
          </div>
        </Card>

        <div class="lg:col-span-2">
          <Card title="Quick Stats" padding>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Click-Through Rate</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ metrics.ctr }}%</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Total Revenue</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">${{ metrics.revenue.toLocaleString() }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Total Spend</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">${{ metrics.spend.toLocaleString() }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Net Profit</p>
                <p class="text-2xl font-bold text-green-600 mt-1">
                  ${{ (metrics.revenue - metrics.spend).toLocaleString() }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Per-Reward Breakdown Table -->
      <Card title="Reward Performance Breakdown">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Reward Performance Breakdown</h3>
              <p class="text-sm text-gray-600 mt-1">Detailed metrics for each reward</p>
            </div>
            <Button variant="secondary" @click="exportToCSV">
              Export CSV
            </Button>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemptions
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="reward in rewardBreakdown" :key="reward.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ reward.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ reward.impressions.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ reward.clicks.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ reward.redemptions.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ reward.ctr.toFixed(1) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ reward.conversionRate.toFixed(1) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
</template>
