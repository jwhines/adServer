<script setup lang="ts">
/**
 * DateRangePicker Component
 *
 * Date range selector with preset options
 *
 * Usage:
 * <DateRangePicker v-model:start="startDate" v-model:end="endDate" />
 */

import { ref, computed } from 'vue';
import dayjs from 'dayjs';

interface Props {
  start: string;
  end: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:start': [value: string];
  'update:end': [value: string];
}>();

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
];

const selectedPreset = ref<string | null>(null);

const selectPreset = (preset: { label: string; days: number }) => {
  selectedPreset.value = preset.label;
  const end = dayjs().format('YYYY-MM-DD');
  const start = dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD');
  emit('update:start', start);
  emit('update:end', end);
};

const updateStart = (value: string) => {
  selectedPreset.value = null;
  emit('update:start', value);
};

const updateEnd = (value: string) => {
  selectedPreset.value = null;
  emit('update:end', value);
};
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4">
    <!-- Preset Buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in presets"
        :key="preset.label"
        type="button"
        :class="[
          'px-3 py-2 text-sm rounded-lg border transition-colors',
          selectedPreset === preset.label
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500',
        ]"
        @click="selectPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Custom Date Inputs -->
    <div class="flex items-center gap-2">
      <input
        type="date"
        :value="start"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        @input="updateStart(($event.target as HTMLInputElement).value)"
      />
      <span class="text-gray-500">to</span>
      <input
        type="date"
        :value="end"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        @input="updateEnd(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
