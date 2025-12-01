<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * ResetPasswordView
 *
 * Password reset flow:
 * 1. Request reset - user enters email
 * 2. Confirmation - user enters code from email and new password
 */

const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

// Step tracking (1 = request code, 2 = confirm with code)
const step = ref(1);
const codeSent = ref(false);

const handleRequestReset = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authStore.requestPasswordReset(email.value);
    codeSent.value = true;
    step.value = 2;
    success.value = true;

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset code. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleConfirmReset = async () => {
  if (!email.value || !code.value || !newPassword.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters long';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authStore.confirmPasswordReset(email.value, code.value, newPassword.value);
    success.value = true;

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 2000);
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password. Please check your code and try again.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (step.value === 2) {
    step.value = 1;
    code.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    error.value = null;
  } else {
    router.push({ name: 'Login' });
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-900 mb-2">
          Family Rewards
        </h1>
        <p class="text-gray-600">Reset Your Password</p>
      </div>

      <!-- Reset Password Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Success Message (final) -->
        <div
          v-if="success && step === 2 && !error"
          class="mb-6 p-4 bg-success-light border border-success rounded-lg text-success-dark"
        >
          <p class="font-semibold">✓ Password reset successfully!</p>
          <p class="text-sm mt-1">Redirecting to login...</p>
        </div>

        <!-- Step 1: Request Reset Code -->
        <div v-else-if="step === 1">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p class="text-gray-600 mb-6">
            Enter your email address and we'll send you a code to reset your password.
          </p>

          <!-- Success Message (code sent) -->
          <div
            v-if="codeSent && success"
            class="mb-6 p-4 bg-success-light border border-success rounded-lg text-success-dark"
          >
            <p class="font-semibold">✓ Reset code sent!</p>
            <p class="text-sm mt-1">Check your email for the verification code.</p>
          </div>

          <!-- Error Alert -->
          <div
            v-if="error"
            class="mb-6 p-4 bg-danger-light border border-danger rounded-lg text-danger-dark"
          >
            {{ error }}
          </div>

          <!-- Request Form -->
          <form @submit.prevent="handleRequestReset" class="space-y-6">
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
              <span v-if="loading">Sending code...</span>
              <span v-else>Send Reset Code</span>
            </button>
          </form>
        </div>

        <!-- Step 2: Confirm Reset with Code -->
        <div v-else>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Enter Reset Code
          </h2>
          <p class="text-gray-600 mb-6">
            Enter the code we sent to <strong>{{ email }}</strong> and choose a new password.
          </p>

          <!-- Error Alert -->
          <div
            v-if="error"
            class="mb-6 p-4 bg-danger-light border border-danger rounded-lg text-danger-dark"
          >
            {{ error }}
          </div>

          <!-- Confirm Form -->
          <form @submit.prevent="handleConfirmReset" class="space-y-6">
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

            <!-- New Password -->
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                required
                autocomplete="new-password"
                class="input"
                placeholder="••••••••"
                :disabled="loading"
              />
              <p class="mt-2 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                class="input"
                placeholder="••••••••"
                :disabled="loading"
              />
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
              <span v-if="loading">Resetting password...</span>
              <span v-else>Reset Password</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-6 text-center">
        <button
          @click="goBack"
          class="text-sm text-gray-600 hover:text-gray-900"
          :disabled="loading"
        >
          ← {{ step === 2 ? 'Back' : 'Back to login' }}
        </button>
      </div>
    </div>
  </div>
</template>
