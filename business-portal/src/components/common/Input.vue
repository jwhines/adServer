<script setup lang="ts">
/**
 * Input Component
 *
 * Reusable input field with label, error handling, and various types
 *
 * Usage:
 * <Input v-model="email" label="Email" type="email" :error="emailError" />
 */

interface Props {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputId = props.id || `input-${Math.random().toString(36).substring(7)}`;
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <!-- Input Field -->
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :class="[
        'block w-full rounded-lg border px-4 py-2',
        'text-gray-900 placeholder-gray-400',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-sm text-danger">
      {{ error }}
    </p>
  </div>
</template>
