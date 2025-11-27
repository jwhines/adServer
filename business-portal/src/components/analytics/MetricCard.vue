<script setup lang="ts">
/**
 * MetricCard Component
 *
 * Displays a single metric with icon, value, and change indicator
 *
 * Usage:
 * <MetricCard
 *   title="Total Impressions"
 *   value="12,450"
 *   change="+12.5%"
 *   trend="up"
 * />
 */

interface Props {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  loading: false,
});

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
};

const trendBgColors = {
  up: 'bg-green-100',
  down: 'bg-red-100',
  neutral: 'bg-gray-100',
};
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Title -->
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>

        <!-- Value -->
        <div v-if="!loading" class="mt-2">
          <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
        </div>
        <div v-else class="mt-2">
          <div class="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <!-- Change Indicator -->
        <div v-if="change && !loading" class="mt-2 flex items-center gap-1">
          <span
            :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trendBgColors[trend],
              trendColors[trend],
            ]"
          >
            <!-- Up Arrow -->
            <svg
              v-if="trend === 'up'"
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <!-- Down Arrow -->
            <svg
              v-else-if="trend === 'down'"
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            {{ change }}
          </span>
        </div>
      </div>

      <!-- Icon (Optional) -->
      <div v-if="icon" class="ml-4">
        <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
