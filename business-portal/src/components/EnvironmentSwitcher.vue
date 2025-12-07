<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type Env = 'sandbox' | 'production';

const currentEnv = ref<Env>('sandbox');

const options: { value: Env; label: string }[] = [
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'production', label: 'Production' },
];

onMounted(() => {
  const stored = window.localStorage.getItem('amplify_env') as Env | null;
  if (stored === 'production' || stored === 'sandbox') {
    currentEnv.value = stored;
  }
});

function switchEnvironment(env: Env) {
  currentEnv.value = env;
  if (typeof (window as any).setAmplifyEnvironment === 'function') {
    (window as any).setAmplifyEnvironment(env);
  } else {
    window.localStorage.setItem('amplify_env', env);
    window.location.reload();
  }
}

const badgeClass = computed(() =>
  currentEnv.value === 'production'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-amber-100 text-amber-800 border-amber-200'
);
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm font-medium text-gray-700">Environment:</label>
    <select
      v-model="currentEnv"
      @change="switchEnvironment(currentEnv)"
      class="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <span
      class="px-2.5 py-1 rounded text-xs font-semibold border inline-flex items-center gap-1 uppercase tracking-wide"
      :class="badgeClass"
    >
      <span
        class="inline-block w-2 h-2 rounded-full"
        :class="currentEnv === 'production' ? 'bg-green-500' : 'bg-amber-500'"
      />
      {{ currentEnv }}
    </span>
  </div>
</template>
