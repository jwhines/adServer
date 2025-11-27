<template>
  <div class="investor-dashboard">
    <div class="page-header">
      <h1>Investor Dashboard</h1>
      <p class="subtitle">Growth metrics and platform performance</p>

      <div class="actions">
        <DateRangePicker
          v-model:startDate="dateRange.startDate"
          v-model:endDate="dateRange.endDate"
          @update="fetchMetrics"
        />
        <button @click="exportToPDF" class="btn btn-secondary">
          Export PDF
        </button>
        <button @click="exportToCSV" class="btn btn-secondary">
          Export CSV
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="metrics" class="metrics-container">
      <!-- Overview Cards -->
      <div class="metrics-section">
        <h2>Overview</h2>
        <div class="metric-cards">
          <MetricCard
            title="Daily Active Users"
            :value="metrics.overview.currentDAU.toLocaleString()"
            :change="metrics.overview.dauGrowthRate"
            icon="👥"
          />
          <MetricCard
            title="Monthly Active Users"
            :value="metrics.overview.currentMAU.toLocaleString()"
            :change="metrics.overview.mauGrowthRate"
            icon="📊"
          />
          <MetricCard
            title="Total Revenue"
            :value="`$${metrics.revenue.totalRevenue.toLocaleString()}`"
            :change="metrics.growth.revenueGrowthRate"
            icon="💰"
          />
          <MetricCard
            title="Active Businesses"
            :value="metrics.marketplace.activeBusinesses.toLocaleString()"
            :subtitle="`${metrics.marketplace.totalBusinesses} total`"
            icon="🏪"
          />
        </div>
      </div>

      <!-- Growth Metrics -->
      <div class="metrics-section">
        <h2>Growth Metrics</h2>
        <div class="metric-cards">
          <MetricCard
            title="New Users"
            :value="metrics.growth.newUsersInPeriod.toLocaleString()"
            :change="metrics.growth.userGrowthRate"
            icon="🌟"
          />
          <MetricCard
            title="User Growth Rate"
            :value="`${metrics.growth.userGrowthRate.toFixed(1)}%`"
            icon="📈"
          />
          <MetricCard
            title="Revenue Growth"
            :value="`${metrics.growth.revenueGrowthRate.toFixed(1)}%`"
            icon="💹"
          />
        </div>
      </div>

      <!-- Engagement Metrics -->
      <div class="metrics-section">
        <h2>Engagement</h2>
        <div class="metric-cards">
          <MetricCard
            title="Total Sessions"
            :value="metrics.engagement.totalSessions.toLocaleString()"
            icon="🎯"
          />
          <MetricCard
            title="Avg Session Duration"
            :value="`${Math.floor(metrics.engagement.avgSessionDuration / 60)}m ${metrics.engagement.avgSessionDuration % 60}s`"
            icon="⏱️"
          />
          <MetricCard
            title="Click-Through Rate"
            :value="`${metrics.engagement.clickThroughRate.toFixed(1)}%`"
            icon="👆"
          />
          <MetricCard
            title="Total Impressions"
            :value="metrics.engagement.totalImpressions.toLocaleString()"
            icon="👁️"
          />
        </div>
      </div>

      <!-- Retention Metrics -->
      <div class="metrics-section">
        <h2>Retention</h2>
        <div class="metric-cards">
          <MetricCard
            title="Day 1 Retention"
            :value="`${metrics.retention.day1Retention.toFixed(1)}%`"
            icon="📅"
          />
          <MetricCard
            title="Day 7 Retention"
            :value="`${metrics.retention.day7Retention.toFixed(1)}%`"
            icon="📆"
          />
          <MetricCard
            title="Day 30 Retention"
            :value="`${metrics.retention.day30Retention.toFixed(1)}%`"
            icon="🗓️"
          />
        </div>
      </div>

      <!-- Platform Breakdown -->
      <div class="metrics-section full-width">
        <h2>Platform Distribution</h2>
        <div class="platform-breakdown">
          <div class="platform-list">
            <div
              v-for="(data, platform) in metrics.platforms"
              :key="platform"
              class="platform-item"
            >
              <div class="platform-info">
                <span class="platform-name">{{ formatPlatformName(platform) }}</span>
                <span class="platform-users">{{ data.users.toLocaleString() }} users</span>
              </div>
              <div class="platform-percentage">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${data.percentage}%` }"
                  ></div>
                </div>
                <span class="percentage-label">{{ data.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- Platform Chart -->
          <div class="platform-chart">
            <canvas ref="platformChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Timeline Charts -->
      <div class="metrics-section full-width">
        <h2>Growth Timeline</h2>
        <div class="chart-container">
          <canvas ref="timelineChart"></canvas>
        </div>
      </div>

      <!-- Platform Comparison Chart -->
      <div class="metrics-section full-width">
        <h2>Platform Comparison</h2>
        <div class="chart-container">
          <canvas ref="platformComparisonChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify-config';
import MetricCard from '../../components/analytics/MetricCard.vue';
import DateRangePicker from '../../components/analytics/DateRangePicker.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const client = generateClient<Schema>();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const metrics = ref<any | null>(null);

const dateRange = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});

// Chart refs
const platformChart = ref<HTMLCanvasElement | null>(null);
const timelineChart = ref<HTMLCanvasElement | null>(null);
const platformComparisonChart = ref<HTMLCanvasElement | null>(null);

let platformChartInstance: Chart | null = null;
let timelineChartInstance: Chart | null = null;
let platformComparisonChartInstance: Chart | null = null;

// Fetch investor metrics
async function fetchMetrics() {
  loading.value = true;
  error.value = null;

  try {
    const result = await client.queries.getInvestorMetrics({
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate,
    });

    if (result.data) {
      metrics.value = result.data;
      await nextTick();
      renderCharts();
    } else if (result.errors) {
      error.value = result.errors.map(e => e.message).join(', ');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch metrics';
    console.error('Error fetching investor metrics:', err);
  } finally {
    loading.value = false;
  }
}

// Render all charts
function renderCharts() {
  if (!metrics.value) return;

  renderPlatformChart();
  renderTimelineChart();
  renderPlatformComparisonChart();
}

// Render platform pie chart
function renderPlatformChart() {
  if (!platformChart.value || !metrics.value) return;

  // Destroy existing chart
  if (platformChartInstance) {
    platformChartInstance.destroy();
  }

  const platforms = Object.keys(metrics.value.platforms);
  const percentages = platforms.map(p => metrics.value.platforms[p].percentage);

  platformChartInstance = new Chart(platformChart.value, {
    type: 'pie',
    data: {
      labels: platforms.map(formatPlatformName),
      datasets: [{
        data: percentages,
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#14B8A6', // Teal
          '#F97316', // Orange
          '#6366F1', // Indigo
          '#84CC16', // Lime
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Platform Distribution',
        },
      },
    },
  });
}

// Render timeline chart
function renderTimelineChart() {
  if (!timelineChart.value || !metrics.value) return;

  if (timelineChartInstance) {
    timelineChartInstance.destroy();
  }

  const timeline = metrics.value.timeline || [];

  timelineChartInstance = new Chart(timelineChart.value, {
    type: 'line',
    data: {
      labels: timeline.map((t: any) => t.date),
      datasets: [
        {
          label: 'DAU',
          data: timeline.map((t: any) => t.dau),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'New Users',
          data: timeline.map((t: any) => t.newUsers),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Revenue',
          data: timeline.map((t: any) => t.revenue),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          yAxisID: 'revenue',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Users',
          },
        },
        revenue: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Revenue ($)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });
}

// Render platform comparison chart
function renderPlatformComparisonChart() {
  if (!platformComparisonChart.value || !metrics.value) return;

  if (platformComparisonChartInstance) {
    platformComparisonChartInstance.destroy();
  }

  const platformTimeline = metrics.value.platformTimeline || {};
  const platforms = Object.keys(platformTimeline);

  // Get all unique dates
  const allDates = new Set<string>();
  platforms.forEach(platform => {
    platformTimeline[platform].forEach((entry: any) => {
      allDates.add(entry.date);
    });
  });
  const dates = Array.from(allDates).sort();

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  ];

  const datasets = platforms.map((platform, index) => {
    const platformData = platformTimeline[platform];
    const dataMap = new Map(platformData.map((entry: any) => [entry.date, entry.dau]));

    return {
      label: formatPlatformName(platform),
      data: dates.map(date => dataMap.get(date) || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`,
      tension: 0.4,
    };
  });

  platformComparisonChartInstance = new Chart(platformComparisonChart.value, {
    type: 'line',
    data: {
      labels: dates,
      datasets,
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Daily Active Users by Platform',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Daily Active Users',
          },
        },
      },
    },
  });
}

// Format platform name
function formatPlatformName(platform: string): string {
  const names: Record<string, string> = {
    IOS: 'iOS',
    TVOS: 'tvOS',
    ANDROID: 'Android',
    ANDROID_TV: 'Android TV',
    SAMSUNG_TV: 'Samsung TV',
    LG_TV: 'LG TV',
    COMCAST_TV: 'Comcast TV',
    FIRE_TV: 'Fire TV',
    ROKU: 'Roku',
    WEB: 'Web',
  };
  return names[platform] || platform;
}

// Export functions
function exportToPDF() {
  // TODO: Implement PDF export
  alert('PDF export coming soon!');
}

function exportToCSV() {
  if (!metrics.value) return;

  // Create CSV content
  const csv: string[] = [];

  // Overview section
  csv.push('Overview Metrics');
  csv.push('Metric,Value,Growth Rate');
  csv.push(`Daily Active Users,${metrics.value.overview.currentDAU},${metrics.value.overview.dauGrowthRate}%`);
  csv.push(`Monthly Active Users,${metrics.value.overview.currentMAU},${metrics.value.overview.mauGrowthRate}%`);
  csv.push(`Total Revenue,$${metrics.value.revenue.totalRevenue},${metrics.value.growth.revenueGrowthRate}%`);
  csv.push('');

  // Platform breakdown
  csv.push('Platform Distribution');
  csv.push('Platform,Users,Percentage');
  Object.entries(metrics.value.platforms).forEach(([platform, data]: [string, any]) => {
    csv.push(`${formatPlatformName(platform)},${data.users},${data.percentage}%`);
  });
  csv.push('');

  // Timeline data
  csv.push('Timeline');
  csv.push('Date,DAU,MAU,New Users,Revenue,Redemptions');
  metrics.value.timeline.forEach((entry: any) => {
    csv.push(`${entry.date},${entry.dau},${entry.mau},${entry.newUsers},${entry.revenue},${entry.redemptions}`);
  });

  // Download CSV
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `investor-metrics-${dateRange.value.startDate}-${dateRange.value.endDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Lifecycle
onMounted(() => {
  fetchMetrics();
});

watch(dateRange, () => {
  fetchMetrics();
}, { deep: true });
</script>

<style scoped>
.investor-dashboard {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.error-message {
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
}

.metrics-container {
  display: grid;
  gap: 2rem;
}

.metrics-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metrics-section.full-width {
  grid-column: 1 / -1;
}

.metrics-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.platform-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.platform-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.platform-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.platform-name {
  font-weight: 600;
  color: #374151;
}

.platform-users {
  color: #6b7280;
  font-size: 0.875rem;
}

.platform-percentage {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s;
}

.percentage-label {
  font-weight: 600;
  color: #374151;
  min-width: 3rem;
  text-align: right;
}

.platform-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  padding: 1rem;
  height: 400px;
}

canvas {
  max-height: 400px;
}

@media (max-width: 768px) {
  .platform-breakdown {
    grid-template-columns: 1fr;
  }

  .metric-cards {
    grid-template-columns: 1fr;
  }
}
</style>
