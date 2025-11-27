<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * ConfirmView
 *
 * Email verification page after registration
 */

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref((route.query.email as string) || '');
const code = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleConfirm = async () => {
  if (!email.value || !code.value) {
    error.value = 'Please enter your email and verification code';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authStore.confirmRegistration(email.value, code.value);
    success.value = true;

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 2000);
  } catch (err: any) {
    error.value = err.message || 'Failed to verify code. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!email.value) {
    error.value = 'Email not provided. Please enter your email address.';
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
        <p class="text-gray-600">Verify Your Email</p>
      </div>

      <!-- Confirmation Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Success Message -->
        <div
          v-if="success"
          class="mb-6 p-4 bg-success-light border border-success rounded-lg text-success-dark"
        >
          <p class="font-semibold">✓ Email verified successfully!</p>
          <p class="text-sm mt-1">Redirecting to login...</p>
        </div>

        <!-- Main Content -->
        <div v-else>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p class="text-gray-600 mb-6">
            We've sent a verification code to your email address. Enter it below to activate your account.
          </p>

          <!-- Error Alert -->
          <div
            v-if="error"
            class="mb-6 p-4 bg-danger-light border border-danger rounded-lg text-danger-dark"
          >
            {{ error }}
          </div>

          <!-- Confirmation Form -->
          <form @submit.prevent="handleConfirm" class="space-y-6">
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

            <!-- Verification Code -->
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                v-model="code"
                type="text"
                required
                class="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxlength="6"
                :disabled="loading"
              />
              <p class="mt-2 text-xs text-gray-500">
                Check your email for a 6-digit code
              </p>
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
              <span v-if="loading">Verifying...</span>
              <span v-else>Verify Email</span>
            </button>
          </form>

          <!-- Help Text -->
          <div class="mt-6 text-center text-sm text-gray-600">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              class="text-primary-600 hover:text-primary-700 font-medium mt-1"
              :disabled="loading"
            >
              Resend verification code
            </button>
          </div>
        </div>
      </div>

      <!-- Back to Login -->
      <div class="mt-6 text-center">
        <router-link
          to="/login"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to login
        </router-link>
      </div>
    </div>
  </div>
</template>
