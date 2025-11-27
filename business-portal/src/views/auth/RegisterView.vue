<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * RegisterView
 *
 * Business registration page with:
 * - Business information
 * - Owner details
 * - Email/password creation
 * - Email verification flow
 */

const router = useRouter();
const authStore = useAuthStore();

// Form state
const formData = ref({
  businessName: '',
  givenName: '',
  familyName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeToTerms: false,
});

const loading = ref(false);
const error = ref<string | null>(null);

const handleRegister = async () => {
  error.value = null;

  // Validation
  if (!formData.value.businessName) {
    error.value = 'Business name is required';
    return;
  }
  if (!formData.value.givenName || !formData.value.familyName) {
    error.value = 'Your name is required';
    return;
  }
  if (!formData.value.email) {
    error.value = 'Email is required';
    return;
  }
  if (formData.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }
  if (!formData.value.agreeToTerms) {
    error.value = 'You must agree to the terms and conditions';
    return;
  }

  loading.value = true;

  try {
    await authStore.register(
      formData.value.email,
      formData.value.password,
      formData.value.givenName,
      formData.value.familyName,
      formData.value.phone || undefined
    );

    // Registration successful - redirect to confirm page
    router.push({
      name: 'Confirm',
      query: { email: formData.value.email },
    });
  } catch (err: any) {
    error.value = err.message || 'Failed to register. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-900 mb-2">
          Family Rewards
        </h1>
        <p class="text-gray-600">Register Your Business</p>
      </div>

      <!-- Registration Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Create Business Account
        </h2>
        <p class="text-gray-600 mb-6">
          Join Durham's local advertising platform for family rewards
        </p>

        <!-- Error Alert -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-danger-light border border-danger rounded-lg text-danger-dark"
        >
          {{ error }}
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Business Name -->
          <div>
            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span class="text-danger">*</span>
            </label>
            <input
              id="businessName"
              v-model="formData.businessName"
              type="text"
              required
              class="input"
              placeholder="Durham Pizza Co."
              :disabled="loading"
            />
          </div>

          <!-- Owner Name (Side by Side) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="givenName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name <span class="text-danger">*</span>
              </label>
              <input
                id="givenName"
                v-model="formData.givenName"
                type="text"
                required
                class="input"
                placeholder="John"
                :disabled="loading"
              />
            </div>
            <div>
              <label for="familyName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span class="text-danger">*</span>
              </label>
              <input
                id="familyName"
                v-model="formData.familyName"
                type="text"
                required
                class="input"
                placeholder="Smith"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span class="text-danger">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              autocomplete="email"
              class="input"
              placeholder="you@business.com"
              :disabled="loading"
            />
          </div>

          <!-- Phone (Optional) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="input"
              placeholder="+1 (919) 555-0123"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password <span class="text-danger">*</span>
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              autocomplete="new-password"
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span class="text-danger">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start">
            <input
              id="agreeToTerms"
              v-model="formData.agreeToTerms"
              type="checkbox"
              class="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              :disabled="loading"
            />
            <label for="agreeToTerms" class="ml-2 text-sm text-gray-600">
              I agree to the
              <a href="#" class="text-primary-600 hover:text-primary-700">Terms & Conditions</a>
              and
              <a href="#" class="text-primary-600 hover:text-primary-700">Privacy Policy</a>
            </label>
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
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link
              to="/login"
              class="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-600">
        <p>&copy; 2025 Family Rewards. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
