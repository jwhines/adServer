<script setup lang="ts">
/**
 * Badge Component
 *
 * Status badge with color variants
 *
 * Usage:
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 */

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  dot: false,
});

const variantClasses = {
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
};

const dotColors = {
  primary: 'bg-primary-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  gray: 'bg-gray-600',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <!-- Optional Dot Indicator -->
    <span
      v-if="dot"
      :class="['h-2 w-2 rounded-full', dotColors[variant]]"
    ></span>

    <!-- Badge Content -->
    <slot />
  </span>
</template>
