<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
});
</script>

<template>
  <RouterView />
</template>
