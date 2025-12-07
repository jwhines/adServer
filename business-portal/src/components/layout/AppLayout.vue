<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import EnvironmentBadge from '@/components/EnvironmentBadge.vue';
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher.vue';

const authStore = useAuthStore();
const route = useRoute();

const mobileMenuOpen = ref(false);

const navigation = [
  { name: 'App Analytics', path: '/', icon: '📊' },
  { name: 'Business Profile', path: '/profile', icon: '🏢' },
  { name: 'Rewards', path: '/rewards', icon: '🎁' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
];

const adminNavigation = [
  { name: 'Admin Dashboard', path: '/admin', icon: '⚙️' },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Desktop Navigation -->
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-primary-600">Family Rewards</h1>
            </div>

            <!-- Desktop Navigation Links -->
            <div class="hidden sm:ml-8 sm:flex sm:space-x-4">
              <router-link
                v-for="item in navigation"
                :key="item.path"
                :to="item.path"
                :class="[
                  'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <span class="mr-2">{{ item.icon }}</span>
                {{ item.name }}
              </router-link>

              <!-- Admin Navigation (if admin) -->
              <template v-if="authStore.isAdmin">
                <div class="border-l border-gray-300 mx-2"></div>
                <router-link
                  v-for="item in adminNavigation"
                  :key="item.path"
                  :to="item.path"
                  :class="[
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive(item.path)
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <span class="mr-2">{{ item.icon }}</span>
                  {{ item.name }}
                </router-link>
              </template>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <EnvironmentSwitcher />
            <EnvironmentBadge />
            <span class="text-sm text-gray-600 hidden sm:block">
              {{ authStore.user?.email }}
            </span>
            <button
              @click="authStore.logout"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center sm:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-200">
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            :class="[
              'block px-4 py-2 text-base font-medium',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.name }}
          </router-link>

          <!-- Admin Navigation (if admin) -->
          <template v-if="authStore.isAdmin">
            <div class="border-t border-gray-200 my-2"></div>
            <router-link
              v-for="item in adminNavigation"
              :key="item.path"
              :to="item.path"
              @click="mobileMenuOpen = false"
              :class="[
                'block px-4 py-2 text-base font-medium',
                isActive(item.path)
                  ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <span class="mr-2">{{ item.icon }}</span>
              {{ item.name }}
            </router-link>
          </template>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="px-4 text-sm text-gray-600 mb-2">
            {{ authStore.user?.email }}
          </div>
          <button
            @click="authStore.logout"
            class="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <RouterView />
    </main>
  </div>
</template>
