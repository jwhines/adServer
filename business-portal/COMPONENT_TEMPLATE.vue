<script setup lang="ts">
/**
 * ComponentName
 *
 * Brief description of what this component does.
 *
 * Usage:
 * <ComponentName :prop="value" @event="handler" />
 */

import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
// Import other stores, components, composables as needed

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  // Define prop types
  id?: string;
  title: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  // Set defaults for optional props
  disabled: false,
});

interface Emits {
  // Define emitted events with payload types
  update: [value: string];
  submit: [data: any];
}

const emit = defineEmits<Emits>();

// ============================================================================
// STORES & COMPOSABLES
// ============================================================================

const router = useRouter();
const authStore = useAuthStore();
// const otherStore = useOtherStore();

// ============================================================================
// REACTIVE STATE
// ============================================================================

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<any>(null);

// Form state (if applicable)
const formData = ref({
  field1: '',
  field2: '',
});

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const isValid = computed(() => {
  // Validation logic
  return formData.value.field1.length > 0;
});

const displayValue = computed(() => {
  // Derived data
  return formData.value.field1.toUpperCase();
});

// ============================================================================
// METHODS
// ============================================================================

async function fetchData(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    // Fetch data from API/store
    // data.value = await someStore.fetchSomething();
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch data';
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit(): Promise<void> {
  if (!isValid.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Submit data
    // await someStore.submitSomething(formData.value);

    // Emit success
    emit('submit', formData.value);

    // Navigate or show success
    // router.push('/success');
  } catch (err: any) {
    error.value = err.message || 'Failed to submit';
    console.error('Error submitting:', err);
  } finally {
    loading.value = false;
  }
}

function handleCancel(): void {
  // Reset form or navigate away
  router.back();
}

// ============================================================================
// WATCHERS
// ============================================================================

watch(
  () => props.id,
  async (newId) => {
    if (newId) {
      await fetchData();
    }
  }
);

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  // Initialize component
  if (props.id) {
    await fetchData();
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
      <p class="mt-2 text-gray-600">
        Description text
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4 bg-danger-light border border-danger rounded-lg text-danger-dark mb-6"
    >
      {{ error }}
    </div>

    <!-- Main Content -->
    <div v-else class="card">
      <!-- Form Example -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Input Field -->
        <div>
          <label for="field1" class="block text-sm font-medium text-gray-700 mb-2">
            Field Label
          </label>
          <input
            id="field1"
            v-model="formData.field1"
            type="text"
            class="input"
            placeholder="Enter value"
            :disabled="loading || disabled"
          />
        </div>

        <!-- Textarea -->
        <div>
          <label for="field2" class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="field2"
            v-model="formData.field2"
            rows="4"
            class="input"
            placeholder="Enter description"
            :disabled="loading || disabled"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-4">
          <button
            type="button"
            @click="handleCancel"
            class="btn-secondary"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading || !isValid"
          >
            <span v-if="loading">Submitting...</span>
            <span v-else>Submit</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Empty State Example -->
    <!-- <div v-if="!data || data.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No data found</p>
      <button class="btn-primary" @click="handleCreate">
        Create New
      </button>
    </div> -->

    <!-- List/Grid Example -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in data"
        :key="item.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="handleItemClick(item)"
      >
        <h3 class="text-lg font-semibold">{{ item.title }}</h3>
        <p class="text-gray-600 mt-2">{{ item.description }}</p>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
/* Add component-specific styles if needed */
/* Prefer Tailwind classes over custom CSS */
</style>
