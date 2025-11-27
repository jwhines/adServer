<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';
import { useRewardsStore } from '@/stores/rewards';
import { useBusinessStore } from '@/stores/business';
import type { Reward } from '@/types';

const client = generateClient<Schema>();

/**
 * CreateRewardView
 *
 * Multi-step form wizard for creating rewards:
 * 1. Basic Info
 * 2. Pricing & Value
 * 3. Image Upload
 * 4. Targeting
 * 5. Inventory & Schedule
 * 6. Redemption
 * 7. Preview & Submit
 */

const router = useRouter();
const rewardsStore = useRewardsStore();
const businessStore = useBusinessStore();
const { business } = storeToRefs(businessStore);

// Form state
const currentStep = ref(1);
const totalSteps = 7;

// Form data
const formData = ref<Partial<Reward>>({
  // Reward Source
  rewardSource: 'LOCAL_BUSINESS', // NEW: Default to local business

  // Basic Info
  title: '',
  description: '',
  termsAndConditions: '',
  category: 'FOOD',
  rewardType: 'FOOD',
  pointCost: 0,
  retailValue: 0,

  // Affiliate Fields (NEW)
  affiliateNetwork: undefined,
  affiliateLink: '',
  affiliateMerchant: '',
  commissionRate: undefined,

  // Targeting
  targetAgeRanges: [],
  targetFamilySizes: [],
  availableRadius: 10,

  // Inventory
  totalAvailable: undefined,
  dailyLimit: undefined,

  // Schedule
  startDate: '',
  endDate: '',
  daysOfWeek: [],

  // Redemption
  redemptionType: 'IN_STORE',
  redemptionInstructions: '',
  status: 'DRAFT',
});

// Image upload
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// Loading and error states
const saving = ref(false);
const error = ref<string | null>(null);
const validationError = ref<string | null>(null);
const initialLoading = ref(true);

// Load business on mount
onMounted(async () => {
  try {
    // If business not already loaded, fetch it
    if (!business.value) {
      const { data, errors } = await client.models.Business.list({
        limit: 1
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (data && data.length > 0) {
        // GraphQL authorization filters by owner, so we get the user's business
        businessStore.business = data[0] as any;
      } else {
        error.value = 'No business found. Please create a business profile first.';
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load business data';
  } finally {
    initialLoading.value = false;
  }
});

// Check if current reward is an affiliate reward
const isAffiliateReward = computed(() => formData.value.rewardSource === 'AFFILIATE_LINK');

// Validation for each step
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      // Basic info validation
      const hasBasicInfo = !!(formData.value.title && formData.value.description && formData.value.category);

      // If affiliate reward, also need affiliate fields
      if (isAffiliateReward.value) {
        return hasBasicInfo &&
               !!(formData.value.affiliateLink &&
                  formData.value.affiliateMerchant &&
                  formData.value.affiliateNetwork);
      }

      return hasBasicInfo;
    case 2:
      return !!(formData.value.pointCost && formData.value.pointCost > 0);
    case 3:
      return true; // Image is optional
    case 4:
      return !!(formData.value.targetAgeRanges && formData.value.targetAgeRanges.length > 0);
    case 5:
      return !!(formData.value.startDate);
    case 6:
      // For affiliate rewards, redemption type should be ONLINE
      if (isAffiliateReward.value) {
        return !!(formData.value.redemptionInstructions);
      }
      return !!(formData.value.redemptionType && formData.value.redemptionInstructions);
    case 7:
      return true;
    default:
      return false;
  }
});

// Get validation error message for current step
const getValidationMessage = (): string => {
  switch (currentStep.value) {
    case 1:
      if (!formData.value.title) return 'Please enter a reward title';
      if (!formData.value.description) return 'Please enter a description';
      if (!formData.value.category) return 'Please select a category';
      return '';
    case 2:
      if (!formData.value.pointCost || formData.value.pointCost <= 0) {
        return 'Please enter a point cost greater than 0';
      }
      return '';
    case 4:
      if (!formData.value.targetAgeRanges || formData.value.targetAgeRanges.length === 0) {
        return 'Please select at least one age range';
      }
      return '';
    case 5:
      if (!formData.value.startDate) return 'Please select a start date';
      return '';
    case 6:
      if (!formData.value.redemptionType) return 'Please select a redemption type';
      if (!formData.value.redemptionInstructions) return 'Please enter redemption instructions';
      return '';
    default:
      return '';
  }
};

// Navigation
const nextStep = () => {
  validationError.value = null;

  if (!isStepValid.value) {
    validationError.value = getValidationMessage();
    return;
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  validationError.value = null;
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Handle image selection
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error.value = 'Please upload a JPG, PNG, or WebP image';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image must be less than 5MB';
      return;
    }

    imageFile.value = file;
    error.value = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Toggle array value
const toggleArrayValue = (arr: any[], value: any) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  } else {
    arr.push(value);
  }
};

// Submit form
const submitReward = async () => {
  error.value = null;
  saving.value = true;

  try {
    // For local business rewards, businessId is required
    // For affiliate rewards, businessId is optional (platform-managed)
    const rewardData: any = {
      ...formData.value
    };

    if (formData.value.rewardSource === 'LOCAL_BUSINESS') {
      if (!business.value?.id) {
        throw new Error('Business ID not found. Please reload the page.');
      }
      rewardData.businessId = business.value.id;
    } else if (formData.value.rewardSource === 'AFFILIATE_LINK') {
      // Set redemption type to ONLINE for affiliate rewards
      rewardData.redemptionType = 'ONLINE';
      // businessId is optional for affiliate rewards
      if (business.value?.id) {
        rewardData.businessId = business.value.id;
      }
    }

    // Create reward
    const reward = await rewardsStore.createReward(rewardData as Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>);

    // Upload image if provided (currently not implemented)
    if (imageFile.value && reward.id) {
      try {
        await rewardsStore.uploadRewardImage(reward.id, imageFile.value);
      } catch (err) {
        console.warn('Image upload skipped:', err);
        // Don't fail the entire creation if image upload fails
      }
    }

    // Redirect to rewards list
    router.push('/rewards');
  } catch (err: any) {
    error.value = err.message || 'Failed to create reward';
  } finally {
    saving.value = false;
  }
};

// Save as draft
const saveAsDraft = async () => {
  formData.value.status = 'DRAFT';
  await submitReward();
};

// Submit for approval
const submitForApproval = async () => {
  formData.value.status = 'PENDING_APPROVAL';
  await submitReward();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="initialLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create New Reward</h1>
          <p class="mt-2 text-gray-600">
            Follow the steps to create an engaging reward for families
          </p>
        </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</span>
          <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}% Complete</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
      >
        {{ error }}
      </div>

      <!-- Validation Error Alert -->
      <div
        v-if="validationError"
        class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800"
      >
        {{ validationError }}
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow p-8">
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <!-- Reward Source Selection (NEW) -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-900 mb-3">
              Reward Source <span class="text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <label class="flex items-start cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.rewardSource"
                  value="LOCAL_BUSINESS"
                  class="mt-1 mr-3"
                />
                <div>
                  <div class="font-medium text-gray-900">Local Business Reward</div>
                  <div class="text-sm text-gray-600">Your business directly fulfills this reward (in-store, delivery, etc.)</div>
                </div>
              </label>
              <label class="flex items-start cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.rewardSource"
                  value="AFFILIATE_LINK"
                  class="mt-1 mr-3"
                />
                <div>
                  <div class="font-medium text-gray-900">Affiliate Link Reward</div>
                  <div class="text-sm text-gray-600">Families get a shopping link to Amazon, Target, etc. You earn commission on purchases.</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="input"
              placeholder="e.g., Free Kids Meal"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="input"
              placeholder="Describe what families will receive..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              v-model="formData.termsAndConditions"
              rows="3"
              class="input"
              placeholder="Any restrictions or conditions..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category <span class="text-red-500">*</span>
              </label>
              <select v-model="formData.category" class="input">
                <option value="FOOD">Food</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="EDUCATION">Education</option>
                <option value="SPORTS">Sports</option>
                <option value="ARTS_CRAFTS">Arts & Crafts</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="FAMILY_ACTIVITY">Family Activity</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reward Type
              </label>
              <select v-model="formData.rewardType" class="input">
                <option value="PHYSICAL_ITEM">Physical Item</option>
                <option value="EXPERIENCE">Experience</option>
                <option value="SERVICE">Service</option>
                <option value="FOOD">Food</option>
                <option value="FAMILY_ACTIVITY">Family Activity</option>
                <option value="DIGITAL_CONTENT">Digital Content</option>
              </select>
            </div>
          </div>

          <!-- Affiliate-Specific Fields (NEW) -->
          <div v-if="isAffiliateReward" class="space-y-4 border-t-2 border-orange-200 pt-6">
            <div class="bg-orange-50 p-3 rounded-lg">
              <h3 class="text-sm font-semibold text-orange-900 mb-1">Affiliate Link Setup</h3>
              <p class="text-xs text-orange-700">Enter your affiliate link details below. Families will click to shop and you earn commission.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Network <span class="text-red-500">*</span>
              </label>
              <select v-model="formData.affiliateNetwork" class="input">
                <option value="">Select network...</option>
                <option value="AMAZON">Amazon Associates</option>
                <option value="TARGET">Target Affiliates</option>
                <option value="WALMART">Walmart Affiliates</option>
                <option value="RAKUTEN">Rakuten Advertising</option>
                <option value="SHAREASALE">ShareASale</option>
                <option value="CJ">CJ Affiliate</option>
                <option value="CUSTOM">Custom/Other</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">Which affiliate network are you using?</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Merchant Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.affiliateMerchant"
                type="text"
                class="input"
                placeholder="e.g., Amazon, Target, Walmart"
              />
              <p class="mt-1 text-xs text-gray-500">Display name shown to families (e.g., "Amazon", "Target")</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Link <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.affiliateLink"
                type="url"
                class="input"
                placeholder="https://www.amazon.com/dp/B08XYZ?tag=your-affiliate-id"
              />
              <p class="mt-1 text-xs text-gray-500">Your full affiliate tracking link (include your affiliate ID/tag)</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                v-model.number="formData.commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="input"
                placeholder="e.g., 8"
              />
              <p class="mt-1 text-xs text-gray-500">Optional: Your commission rate (e.g., 8 for 8%)</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Pricing & Value -->
        <div v-if="currentStep === 2" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Pricing & Value</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Point Cost <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.pointCost"
              type="number"
              min="1"
              class="input"
              placeholder="e.g., 100"
            />
            <p class="mt-1 text-sm text-gray-500">
              How many points families need to redeem this reward
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Retail Value
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                v-model.number="formData.retailValue"
                type="number"
                min="0"
                step="0.01"
                class="input pl-8"
                placeholder="0.00"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">
              The actual dollar value of this reward
            </p>
          </div>
        </div>

        <!-- Step 3: Image Upload -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Reward Image</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-4">
              Upload an eye-catching image
            </label>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="mb-4">
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-full max-w-md rounded-lg border-2 border-gray-200"
              />
            </div>

            <!-- Upload Input -->
            <label class="block">
              <span class="sr-only">Choose image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleImageSelect"
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  cursor-pointer"
              />
            </label>
            <p class="mt-2 text-xs text-gray-500">
              JPG, PNG or WebP. Max size 5MB. Recommended: 1200x800px
            </p>
          </div>
        </div>

        <!-- Step 4: Targeting -->
        <div v-if="currentStep === 4" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Target Audience</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Age Ranges <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label
                v-for="range in ['6-8', '9-12', '13-15', '16-18']"
                :key="range"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :checked="formData.targetAgeRanges?.includes(range)"
                  @change="toggleArrayValue(formData.targetAgeRanges!, range)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ range }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Family Sizes
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <label
                v-for="size in [1, 2, 3, 4, 5]"
                :key="size"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :checked="formData.targetFamilySizes?.includes(size)"
                  @change="toggleArrayValue(formData.targetFamilySizes!, size)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ size }}{{ size === 5 ? '+' : '' }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Available Radius: {{ formData.availableRadius }} miles
            </label>
            <input
              v-model.number="formData.availableRadius"
              type="range"
              min="1"
              max="50"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 mi</span>
              <span>50 mi</span>
            </div>
          </div>
        </div>

        <!-- Step 5: Inventory & Schedule -->
        <div v-if="currentStep === 5" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Inventory & Schedule</h2>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Total Available
              </label>
              <input
                v-model.number="formData.totalAvailable"
                type="number"
                min="1"
                class="input"
                placeholder="Unlimited"
              />
              <p class="mt-1 text-xs text-gray-500">Leave blank for unlimited</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Daily Limit
              </label>
              <input
                v-model.number="formData.dailyLimit"
                type="number"
                min="1"
                class="input"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.startDate"
                type="date"
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                v-model="formData.endDate"
                type="date"
                class="input"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Days of Week
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label
                v-for="day in ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']"
                :key="day"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :checked="formData.daysOfWeek?.includes(day)"
                  @change="toggleArrayValue(formData.daysOfWeek!, day)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ day.slice(0, 3) }}</span>
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-500">Leave unchecked for all days</p>
          </div>
        </div>

        <!-- Step 6: Redemption -->
        <div v-if="currentStep === 6" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Redemption Details</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Redemption Type <span class="text-red-500">*</span>
            </label>
            <select v-model="formData.redemptionType" class="input">
              <option value="IN_STORE">In-Store</option>
              <option value="ONLINE">Online</option>
              <option value="CODE">Code/Coupon</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Redemption Instructions <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.redemptionInstructions"
              rows="4"
              class="input"
              placeholder="Tell families how to redeem this reward..."
            ></textarea>
          </div>
        </div>

        <!-- Step 7: Preview & Submit -->
        <div v-if="currentStep === 7" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>

          <div class="bg-gray-50 rounded-lg p-6 space-y-4">
            <div v-if="imagePreview" class="mb-4">
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-full max-w-sm rounded-lg"
              />
            </div>

            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ formData.title }}</h3>
              <p class="text-gray-600 mt-1">{{ formData.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Points:</span>
                <span class="font-medium text-gray-900 ml-2">{{ formData.pointCost }}</span>
              </div>
              <div>
                <span class="text-gray-500">Value:</span>
                <span class="font-medium text-gray-900 ml-2">${{ formData.retailValue }}</span>
              </div>
              <div>
                <span class="text-gray-500">Category:</span>
                <span class="font-medium text-gray-900 ml-2">{{ formData.category }}</span>
              </div>
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="font-medium text-gray-900 ml-2">{{ formData.rewardType }}</span>
              </div>
            </div>

            <div class="text-sm">
              <span class="text-gray-500">Target Ages:</span>
              <span class="font-medium text-gray-900 ml-2">{{ formData.targetAgeRanges?.join(', ') || 'All' }}</span>
            </div>

            <div class="text-sm">
              <span class="text-gray-500">Available:</span>
              <span class="font-medium text-gray-900 ml-2">
                {{ formData.startDate }} {{ formData.endDate ? `to ${formData.endDate}` : 'onwards' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8 pt-6 border-t">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button
              v-if="currentStep === totalSteps"
              @click="saveAsDraft"
              :disabled="saving"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>

            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              class="btn-primary"
            >
              Next
            </button>

            <button
              v-else
              @click="submitForApproval"
              :disabled="saving"
              class="btn-primary"
            >
              <span v-if="saving">Submitting...</span>
              <span v-else>Submit for Approval</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
