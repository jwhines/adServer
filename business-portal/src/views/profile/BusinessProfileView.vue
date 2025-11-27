<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBusinessStore } from '@/stores/business';
import { useAuthStore } from '@/stores/auth';
import type { Business } from '@/types';

/**
 * BusinessProfileView
 *
 * Allows business owners to view and edit their business profile:
 * - Business information (name, description, address, service area)
 * - Logo upload
 * - Billing settings (view-only for now)
 * - Account settings
 */

const businessStore = useBusinessStore();
const authStore = useAuthStore();

// Active tab
const activeTab = ref<'info' | 'logo' | 'billing' | 'account'>('info');

// Loading and error states
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Form data
const formData = ref<Partial<Business>>({
  name: '',
  description: '',
  businessType: 'RESTAURANT',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  serviceRadius: 10,
  monthlyBudget: 0,
  billingType: 'MONTHLY_RETAINER',
});

// Logo upload
const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);

// Account settings
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// Load business data
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // Check if user already has a business loaded
    if (businessStore.business) {
      formData.value = { ...businessStore.business };
      if (businessStore.business.logoUrl) {
        logoPreview.value = businessStore.business.logoUrl;
      }
    }
    // If no business exists, user will need to create one by filling the form
  } catch (err: any) {
    error.value = err.message || 'Failed to load business profile';
  } finally {
    loading.value = false;
  }
});

// Handle logo file selection
const handleLogoSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error.value = 'Please upload a JPG, PNG, or WebP image';
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image must be less than 5MB';
      return;
    }

    logoFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Save business info
const saveBusinessInfo = async () => {
  error.value = null;
  success.value = null;

  // Validate required fields
  if (!formData.value.name || !formData.value.address || !formData.value.city ||
      !formData.value.state || !formData.value.zipCode) {
    error.value = 'Please fill in all required fields';
    return;
  }

  saving.value = true;

  try {
    if (formData.value.id) {
      // Update existing business
      await businessStore.updateBusiness(formData.value.id, formData.value);
      success.value = 'Business profile updated successfully!';
    } else {
      // Create new business - add required owner field and email
      const businessData = {
        ...formData.value,
        owner: authStore.user?.id || '',
        email: authStore.user?.email || formData.value.email || '',
      };
      const newBusiness = await businessStore.createBusiness(businessData as Omit<Business, 'id' | 'createdAt' | 'updatedAt'>);
      formData.value = newBusiness;
      success.value = 'Business profile created successfully!';
    }

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'Failed to save business profile';
  } finally {
    saving.value = false;
  }
};

// Upload logo
const uploadLogo = async () => {
  if (!logoFile.value || !formData.value.id) return;

  error.value = null;
  success.value = null;
  saving.value = true;

  try {
    // TODO: Implement logo upload when storage is configured
    // For now, just show success
    success.value = 'Logo upload will be implemented with S3 storage';

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'Failed to upload logo';
  } finally {
    saving.value = false;
  }
};

// Change password
const changePassword = async () => {
  error.value = null;
  success.value = null;

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in all password fields';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'New passwords do not match';
    return;
  }

  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  saving.value = true;

  try {
    // TODO: Implement password change with Cognito
    success.value = 'Password change will be implemented with Cognito API';

    // Clear form
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'Failed to change password';
  } finally {
    saving.value = false;
  }
};

// Computed
const isFormValid = computed(() => {
  return formData.value.name &&
         formData.value.address &&
         formData.value.city &&
         formData.value.state &&
         formData.value.zipCode;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Business Profile</h1>
        <p class="mt-2 text-gray-600">
          Manage your business information, branding, and settings
        </p>
      </div>

      <!-- Alert Messages -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
      </div>

      <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        {{ success }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile...</p>
      </div>

      <!-- Tabs and Content -->
      <div v-else class="bg-white rounded-lg shadow">
        <!-- Tab Headers -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'info'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'info'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Business Info
            </button>
            <button
              @click="activeTab = 'logo'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'logo'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Logo & Media
            </button>
            <button
              @click="activeTab = 'billing'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'billing'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Billing
            </button>
            <button
              @click="activeTab = 'account'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'account'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Account
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-8">
          <!-- Business Info Tab -->
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Business Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="input"
                  placeholder="e.g., Joe's Pizza"
                  :disabled="saving"
                />
              </div>

              <!-- Business Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select v-model="formData.businessType" class="input" :disabled="saving">
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="RETAIL">Retail</option>
                  <option value="SERVICES">Services</option>
                  <option value="EDUCATION">Education</option>
                  <option value="SPORTS_RECREATION">Sports & Recreation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="input"
                  placeholder="(555) 123-4567"
                  :disabled="saving"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  class="input"
                  placeholder="Tell families about your business..."
                  :disabled="saving"
                ></textarea>
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.address"
                  type="text"
                  class="input"
                  placeholder="123 Main St"
                  :disabled="saving"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  City <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.city"
                  type="text"
                  class="input"
                  placeholder="Springfield"
                  :disabled="saving"
                />
              </div>

              <!-- State -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  State <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.state"
                  type="text"
                  class="input"
                  placeholder="IL"
                  maxlength="2"
                  :disabled="saving"
                />
              </div>

              <!-- Zip Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.zipCode"
                  type="text"
                  class="input"
                  placeholder="62701"
                  :disabled="saving"
                />
              </div>

              <!-- Service Radius -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (miles)
                </label>
                <input
                  v-model.number="formData.serviceRadius"
                  type="number"
                  min="1"
                  max="50"
                  class="input"
                  :disabled="saving"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Rewards will be shown to families within this radius
                </p>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end pt-4 border-t">
              <button
                @click="saveBusinessInfo"
                class="btn-primary"
                :disabled="saving || !isFormValid"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </div>

          <!-- Logo & Media Tab -->
          <div v-if="activeTab === 'logo'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Business Logo</h3>

              <!-- Logo Preview -->
              <div v-if="logoPreview" class="mb-4">
                <img
                  :src="logoPreview"
                  alt="Logo preview"
                  class="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>

              <!-- Upload Input -->
              <div class="space-y-4">
                <label class="block">
                  <span class="sr-only">Choose logo image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleLogoSelect"
                    class="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      cursor-pointer"
                    :disabled="saving"
                  />
                </label>
                <p class="text-xs text-gray-500">
                  JPG, PNG or WebP. Max size 5MB.
                </p>

                <button
                  v-if="logoFile"
                  @click="uploadLogo"
                  class="btn-primary"
                  :disabled="saving"
                >
                  <span v-if="saving">Uploading...</span>
                  <span v-else>Upload Logo</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Billing Tab -->
          <div v-if="activeTab === 'billing'" class="space-y-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p class="text-sm text-blue-700">
                Billing settings are view-only. Contact support to make changes.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Billing Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Billing Type
                </label>
                <input
                  :value="formData.billingType"
                  type="text"
                  class="input bg-gray-50"
                  disabled
                />
              </div>

              <!-- Monthly Budget -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Ad Budget
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    :value="formData.monthlyBudget"
                    type="number"
                    class="input bg-gray-50 pl-8"
                    disabled
                  />
                </div>
              </div>

              <!-- Verification Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      formData.verificationStatus === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : formData.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ formData.verificationStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Tab -->
          <div v-if="activeTab === 'account'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

              <div class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    v-model="currentPassword"
                    type="password"
                    class="input"
                    :disabled="saving"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    v-model="newPassword"
                    type="password"
                    class="input"
                    :disabled="saving"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="input"
                    :disabled="saving"
                  />
                </div>

                <button
                  @click="changePassword"
                  class="btn-primary"
                  :disabled="saving"
                >
                  <span v-if="saving">Updating...</span>
                  <span v-else>Update Password</span>
                </button>
              </div>
            </div>

            <div class="pt-6 border-t">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Email Address</h3>
              <p class="text-gray-600 mb-4">{{ authStore.user?.email }}</p>
              <p class="text-sm text-gray-500">Contact support to change your email address.</p>
            </div>

            <div class="pt-6 border-t">
              <h3 class="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
              <p class="text-gray-600 mb-4">
                Delete your business account and all associated data.
              </p>
              <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
