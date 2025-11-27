<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  console.log('Dashboard loaded for user:', authStore.user);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome to Family Rewards Business Portal!</p>
      </div>

      <!-- Success Message -->
      <div class="bg-success-light border border-success rounded-lg p-6 mb-8">
        <h2 class="text-success-dark font-semibold text-lg mb-2">
          🎉 You're logged in!
        </h2>
        <p class="text-success-dark">
          Your backend is deployed and authentication is working perfectly.
        </p>
      </div>

      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
        <div class="space-y-2">
          <p class="text-gray-700">
            <span class="font-medium">Email:</span> {{ authStore.user?.email }}
          </p>
          <p class="text-gray-700">
            <span class="font-medium">Name:</span>
            {{ authStore.user?.givenName }} {{ authStore.user?.familyName }}
          </p>
          <p class="text-gray-700">
            <span class="font-medium">User ID:</span> {{ authStore.user?.id }}
          </p>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div class="space-y-3">
          <div class="flex items-start">
            <span class="text-primary-600 mr-3">✓</span>
            <p class="text-gray-700">
              Backend deployed successfully (DynamoDB, Lambda, S3, Cognito)
            </p>
          </div>
          <div class="flex items-start">
            <span class="text-primary-600 mr-3">✓</span>
            <p class="text-gray-700">
              Authentication working (Register, Verify, Login)
            </p>
          </div>
          <div class="flex items-start">
            <span class="text-gray-400 mr-3">○</span>
            <p class="text-gray-700">
              Build remaining components (see <code class="bg-gray-100 px-2 py-1 rounded">IMPLEMENTATION_GUIDE.md</code>)
            </p>
          </div>
          <div class="flex items-start">
            <span class="text-gray-400 mr-3">○</span>
            <p class="text-gray-700">
              <router-link to="/profile" class="text-primary-600 hover:text-primary-700 font-medium">
                Create Business Profile view
              </router-link>
            </p>
          </div>
          <div class="flex items-start">
            <span class="text-gray-400 mr-3">○</span>
            <p class="text-gray-700">
              Build Reward Management features
            </p>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="mt-8 text-center">
        <button
          @click="authStore.logout"
          class="btn-secondary"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>
