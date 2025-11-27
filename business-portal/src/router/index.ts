import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * Vue Router Configuration
 *
 * Protected routes require authentication
 * Admin routes require PLATFORM_ADMIN group
 */

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/confirm',
    name: 'Confirm',
    component: () => import('@/views/auth/ConfirmView.vue'),
    meta: { requiresAuth: false },
  },
  // {
  //   path: '/reset-password',
  //   name: 'ResetPassword',
  //   component: () => import('@/views/auth/ResetPasswordView.vue'),
  //   meta: { requiresAuth: false },
  // },

  // Protected routes
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/BusinessProfileView.vue'),
      },
      {
        path: 'rewards',
        name: 'Rewards',
        component: () => import('@/views/rewards/RewardListView.vue'),
      },
      {
        path: 'rewards/create',
        name: 'CreateReward',
        component: () => import('@/views/rewards/CreateRewardView.vue'),
      },
      {
        path: 'rewards/edit/:id',
        name: 'EditReward',
        component: () => import('@/views/rewards/CreateRewardView.vue'),
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/AnalyticsView.vue'),
      },
      {
        path: 'investor',
        name: 'Investor',
        component: () => import('@/views/investor/InvestorView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'redemptions',
        name: 'Redemptions',
        component: () => import('@/views/redemptions/RedemptionsView.vue'),
      },
      // Admin routes
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/business-approvals',
        name: 'BusinessApprovals',
        component: () => import('@/views/admin/BusinessApprovalsView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/reward-approvals',
        name: 'RewardApprovals',
        component: () => import('@/views/admin/RewardApprovalsView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },

  // Catch-all redirect to login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth if not already done
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initialize();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard if not admin
    next({ name: 'Dashboard' });
  } else if (!requiresAuth && authStore.isAuthenticated && to.name === 'Login') {
    // Redirect to dashboard if already logged in
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
