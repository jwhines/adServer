<script setup lang="ts">
/**
 * Select Component
 *
 * Reusable dropdown select with label and error handling
 *
 * Usage:
 * <Select v-model="category" label="Category" :options="categoryOptions" />
 */

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number;
  options: Option[];
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option...',
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const selectId = props.id || `select-${Math.random().toString(36).substring(7)}`;
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <!-- Select Field -->
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'block w-full rounded-lg border px-4 py-2',
        'text-gray-900',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer',
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <!-- Placeholder Option -->
      <option value="" disabled>{{ placeholder }}</option>

      <!-- Options -->
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-sm text-danger">
      {{ error }}
    </p>
  </div>
</template>
