import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchUserAttributes,
  type SignInOutput,
  type SignUpOutput,
} from 'aws-amplify/auth';
import type { User } from '@/types';

/**
 * Auth Store
 *
 * Manages authentication state and operations:
 * - Login/logout
 * - Registration with email verification
 * - Password reset
 * - User session management
 */

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAdmin = computed(() => {
    return user.value?.groups?.includes('PLATFORM_ADMIN') || false;
  });

  const isBusinessOwner = computed(() => {
    return user.value?.groups?.includes('BUSINESS_OWNER') || false;
  });

  // Actions
  async function login(email: string, password: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result: SignInOutput = await signIn({
        username: email,
        password,
      });

      if (result.isSignedIn) {
        await fetchCurrentUser();
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(
    email: string,
    password: string,
    givenName: string,
    familyName: string,
    phoneNumber?: string
  ): Promise<SignUpOutput> {
    loading.value = true;
    error.value = null;

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: givenName,
            family_name: familyName,
            ...(phoneNumber && { phone_number: phoneNumber }),
          },
        },
      });

      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to register';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function confirmRegistration(email: string, code: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
    } catch (err: any) {
      error.value = err.message || 'Failed to confirm registration';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await signOut();
      user.value = null;
      isAuthenticated.value = false;
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function requestPasswordReset(email: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await resetPassword({ username: email });
    } catch (err: any) {
      error.value = err.message || 'Failed to request password reset';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      user.value = {
        id: currentUser.userId,
        email: attributes.email || '',
        givenName: attributes.given_name,
        familyName: attributes.family_name,
        // TODO: Fetch user groups from Cognito properly
        // For development: making all users admins for now
        groups: ['PLATFORM_ADMIN', 'BUSINESS_OWNER'],
      };

      isAuthenticated.value = true;
    } catch (err: any) {
      user.value = null;
      isAuthenticated.value = false;
      // Don't set error for this - it's expected if user is not logged in
    } finally {
      loading.value = false;
    }
  }

  // Initialize auth state on app load
  async function initialize(): Promise<void> {
    await fetchCurrentUser();
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,

    // Getters
    isAdmin,
    isBusinessOwner,

    // Actions
    login,
    register,
    confirmRegistration,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    fetchCurrentUser,
    initialize,
  };
});
