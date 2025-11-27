<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * LoginView
 *
 * Business owner login page with:
 * - Email/password authentication
 * - Remember me option
 * - Links to register and password reset
 * - Error handling and loading states
 */

const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Sign out any existing user first
    try {
      await authStore.logout();
    } catch {
      // Ignore logout errors - user might not be logged in
    }

    // Now sign in
    await authStore.login(email.value, password.value);

    // Redirect to dashboard or intended route
    const redirect = router.currentRoute.value.query.redirect as string;
    router.push(redirect || '/');
  } catch (err: any) {
    error.value = err.message || 'Failed to login. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // If user is already logged in, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-900 mb-2">
          Family Rewards
        </h1>
        <p class="text-gray-600">Business Portal</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          Sign In
        </h2>

        <!-- Error Alert -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-danger-light border border-danger rounded-lg text-danger-dark"
        >
          {{ error }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="input"
              placeholder="you@business.com"
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                :disabled="loading"
              />
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <router-link
              to="/reset-password"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center"
            :disabled="loading"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link
              to="/register"
              class="text-primary-600 hover:text-primary-700 font-medium"
            >
              Register your business
            </router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-600">
        <p>&copy; 2025 Family Rewards. All rights reserved.</p>
        <div class="mt-2 space-x-4">
          <a href="#" class="hover:text-primary-600">Terms</a>
          <a href="#" class="hover:text-primary-600">Privacy</a>
          <a href="#" class="hover:text-primary-600">Support</a>
        </div>
      </div>
    </div>
  </div>
</template>
