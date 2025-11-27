<script setup lang="ts">
/**
 * Card Component
 *
 * Reusable card container with optional header and footer
 *
 * Usage:
 * <Card title="Dashboard" subtitle="Welcome back">
 *   <p>Card content here</p>
 *   <template #footer>
 *     <Button>Action</Button>
 *   </template>
 * </Card>
 */

interface Props {
  title?: string;
  subtitle?: string;
  padding?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  shadow: 'md',
});

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg border border-gray-200',
      shadowClasses[shadow],
    ]"
  >
    <!-- Header -->
    <div
      v-if="title || $slots.header"
      class="px-6 py-4 border-b border-gray-200"
    >
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-600">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Body -->
    <div :class="padding ? 'px-6 py-4' : ''">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-gray-200 bg-gray-50"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
