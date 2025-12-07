<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

/**
 * Environment Badge Component
 *
 * Shows which backend environment is currently active
 * Detects environment from Amplify configuration
 */

const apiUrl = ref('');
const stackId = ref('');

onMounted(() => {
  // Get Amplify config from window
  const amplifyConfig = (window as any).amplifyConfig;
  if (amplifyConfig?.data?.url) {
    apiUrl.value = amplifyConfig.data.url;
  }

  // Try to extract stack ID from URL or config
  const match = apiUrl.value.match(/([a-z0-9]{26})/);
  if (match) {
    stackId.value = match[1];
  }
});

const environmentName = computed(() => {
  // Known AppSync API IDs for each environment
  const SANDBOX_APPSYNC_ID = 'ul2mnbr4rrbffklynytp2ma34a';  // Maps to pihfldm7hzbt5mgtbe3j3dpphm tables
  const PRODUCTION_APPSYNC_ID = 'r6coc2egxnftppnanoop7vzeqa';  // Empty/future production

  if (stackId.value === SANDBOX_APPSYNC_ID) {
    return 'Sandbox';
  }

  if (stackId.value === PRODUCTION_APPSYNC_ID) {
    return 'Production';
  }

  if (stackId.value) {
    return 'Unknown Environment';
  }

  return 'Unknown';
});

const badgeClass = computed(() => {
  const base = 'env-badge';
  switch (environmentName.value) {
    case 'Production':
      return `${base} env-production`;
    case 'Sandbox':
      return `${base} env-sandbox`;
    default:
      return `${base} env-unknown`;
  }
});
</script>

<template>
  <div :class="badgeClass" :title="`Stack ID: ${stackId || 'Unknown'}`">
    <span class="indicator"></span>
    {{ environmentName }}
  </div>
</template>

<style scoped>
.env-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: help;
}

.env-sandbox {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #F59E0B;
}

.env-production {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #10B981;
}

.env-unknown {
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #D1D5DB;
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.env-sandbox .indicator {
  background: #F59E0B;
}

.env-production .indicator {
  background: #10B981;
}

.env-unknown .indicator {
  background: #9CA3AF;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
