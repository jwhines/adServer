# Implementation Guide - Family Rewards Ad Platform

## ✅ Completed Components

### Backend (AWS Amplify Gen 2)
- ✅ **Project structure** with package.json and tsconfig
- ✅ **Authentication** (Cognito with email/password)
- ✅ **GraphQL Schema** with all models (Business, Reward, RewardRedemption, BusinessAnalytics)
- ✅ **S3 Storage** configuration for images
- ✅ **Lambda Functions**:
  - `get-rewards-for-family` - Fetch rewards by location/age
  - `redeem-reward` - Process redemptions with code generation
  - `upload-reward-image` - Handle image uploads to S3
  - `get-business-analytics` - Aggregate analytics data
  - `track-ad-event` - Track impressions and clicks
- ✅ **Backend configuration** with permissions and environment variables

### Frontend (Vue.js Business Portal)
- ✅ **Project setup** (Vite, TypeScript, Tailwind CSS)
- ✅ **TypeScript types** for all models
- ✅ **Router** with protected routes and admin guards
- ✅ **Pinia Stores**:
  - Auth store (login, register, logout)
  - Business store (CRUD operations)
  - Rewards store (CRUD, image upload)
- ✅ **Tailwind CSS** configuration with custom colors
- ✅ **App.vue** root component

## 🚧 Remaining Components to Build

### 1. Reusable UI Components

Create these in `business-portal/src/components/common/`:

#### Button.vue
```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
</script>
```

#### Input.vue
```vue
<script setup lang="ts">
interface Props {
  modelValue: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}
</script>
```

#### Select.vue
```vue
<script setup lang="ts">
interface Props {
  modelValue: string | number;
  options: Array<{ label: string; value: string | number }>;
  label?: string;
  error?: string;
  placeholder?: string;
}
</script>
```

#### Modal.vue
```vue
<script setup lang="ts">
interface Props {
  show: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
</script>
```

#### LoadingSpinner.vue
Simple animated spinner using Tailwind CSS.

#### Badge.vue
Status badges for rewards and redemptions.

#### Card.vue
Reusable card container with optional header/footer.

### 2. Layout Components

Create in `business-portal/src/components/layout/`:

#### AppLayout.vue
Main layout wrapper with sidebar and header. Shows `<router-view>` for child routes.

#### AppHeader.vue
- Logo/title
- User menu dropdown (profile, logout)
- Notifications icon (future)
- Search bar (future)

#### AppSidebar.vue
Navigation menu with:
- Dashboard
- Rewards
- Redemptions
- Analytics
- Profile
- Admin section (if admin user)

#### AppFooter.vue
Copyright and links.

### 3. Authentication Views

Create in `business-portal/src/views/auth/`:

#### LoginView.vue
- Email and password inputs
- "Remember me" checkbox
- Login button
- Links to register and reset password
- Error message display

#### RegisterView.vue
- Business name input
- Owner name (first/last)
- Email, password, confirm password
- Phone (optional)
- Terms & conditions checkbox
- Register button → redirects to ConfirmView

#### ConfirmView.vue
- Shows after registration
- Email input (pre-filled from router query)
- Verification code input (6 digits)
- Confirm button
- Resend code button

#### ResetPasswordView.vue
Two-step process:
1. Enter email → request code
2. Enter code + new password → reset

### 4. Dashboard Views

Create in `business-portal/src/views/dashboard/`:

#### DashboardView.vue
Overview dashboard with:
- **Metric Cards** (4 cards in grid):
  - Total Impressions (this month)
  - Total Redemptions
  - Current Spend
  - ROI %
- **Quick Actions** (buttons):
  - Create New Reward
  - View All Rewards
  - View Analytics
- **Recent Activity Feed**:
  - Latest 5 redemptions
  - Reward status changes
- **Active Rewards Summary**:
  - List of active rewards with mini stats

#### AnalyticsView.vue
Comprehensive analytics with:
- **Date Range Picker** (Last 7 days, 30 days, custom)
- **Charts** (using Chart.js + vue-chartjs):
  - Line chart: Impressions over time
  - Bar chart: Redemptions by reward
  - Pie chart: Categories distribution
- **Summary Table**:
  - Per-reward breakdown (title, impressions, clicks, redemptions, CTR)
- **Export Button** (CSV download)

### 5. Reward Management Views

Create in `business-portal/src/views/rewards/`:

#### RewardListView.vue
- Filter bar (status, category, date range)
- Search input
- Grid/table view toggle
- Reward cards with:
  - Image thumbnail
  - Title, point cost
  - Status badge
  - Quick stats (impressions, redemptions)
  - Actions (edit, pause, delete)
- Pagination
- "Create New Reward" FAB button

#### CreateRewardView.vue
Multi-step form wizard:

**Step 1: Basic Info**
- Title (required)
- Description (textarea, required)
- Terms & Conditions (textarea)
- Category (dropdown)
- Reward Type (dropdown)

**Step 2: Pricing & Value**
- Point Cost (number, required)
- Retail Value (dollar amount)

**Step 3: Image Upload**
- Drag & drop or click to upload
- Image preview
- Crop tool (optional, use vue-advanced-cropper)

**Step 4: Targeting**
- Age Range (multi-select: 6-8, 9-12, 13-15, 16-18)
- Family Size (multi-select: 1, 2, 3, 4, 5+)
- Service Radius (slider, 1-50 miles)

**Step 5: Inventory & Schedule**
- Total Available (number, blank = unlimited)
- Daily Limit (number)
- Start Date (date picker)
- End Date (optional)
- Days of Week (checkbox group)

**Step 6: Redemption**
- Redemption Type (dropdown)
- Instructions (textarea)

**Step 7: Preview & Submit**
- Show preview card
- Submit button → saves as DRAFT or PENDING_APPROVAL

#### EditRewardView.vue
Same form as CreateRewardView, but pre-filled with existing data.

#### RedemptionsView.vue
- **Filter Bar**:
  - Status (all, pending, redeemed, expired)
  - Date range
  - Search by code or family ID
- **Redemptions Table**:
  - Redemption Code
  - Reward Title
  - Date
  - Status badge
  - Child Age
  - Location (city, zip)
  - Actions (mark redeemed, view details)
- **Details Modal**:
  - Full redemption info
  - QR code display
  - Notes field
  - Update status button

### 6. Profile View

Create in `business-portal/src/views/profile/`:

#### BusinessProfileView.vue
Tabs:

**Tab 1: Business Info**
- Edit form (name, description, type)
- Address, city, state, zip
- Contact info (phone, email, website)
- Service radius slider
- Save button

**Tab 2: Logo & Media**
- Current logo display
- Upload new logo button
- Logo preview

**Tab 3: Billing Settings**
- Billing type (read-only for now)
- Monthly budget input
- Current spend display
- Payment method (placeholder - future Stripe integration)

**Tab 4: Account Settings**
- Email (read-only)
- Change password button (opens modal)
- Account status
- Delete account (danger zone)

### 7. Admin Views

Create in `business-portal/src/views/admin/`:

#### AdminDashboard.vue
Platform-wide overview:
- Total Businesses (pending, approved, rejected)
- Total Active Rewards
- Platform Revenue
- Top Businesses by redemptions
- Recent signups

#### BusinessApprovalsView.vue
- **Pending Approvals Queue**:
  - List of businesses awaiting approval
  - Business details card
  - Approve/Reject buttons
  - Rejection reason textarea
- **Approved Businesses**:
  - Searchable list
  - Option to revoke approval

#### PlatformAnalyticsView.vue
- Revenue by business (bar chart)
- Redemptions by city (map - future)
- User demographics
- Growth metrics (week-over-week)

### 8. Component-Specific Features

#### ImageUploader.vue
Create in `business-portal/src/components/rewards/`:

Features:
- Drag & drop zone
- Click to browse
- File type validation (jpg, png, webp)
- Size validation (max 5MB)
- Preview thumbnail
- Progress bar during upload
- Error handling

#### RewardCard.vue
Reusable reward display card:
- Image
- Title, description (truncated)
- Point cost badge
- Status badge
- Quick stats
- Action buttons

#### RewardForm.vue
Form component used by both Create and Edit views. Handles:
- Form validation
- Step navigation
- Data binding
- Submit logic

#### MetricCard.vue
Create in `business-portal/src/components/analytics/`:

Displays single metric:
- Icon (from lucide-vue-next)
- Title
- Value (large text)
- Change indicator (+/- percentage)
- Trend sparkline (optional)

#### ChartContainer.vue
Wrapper for Chart.js charts with:
- Loading state
- Error state
- Empty state
- Title and legend
- Responsive sizing

#### DateRangePicker.vue
Custom date range selector:
- Preset options (Today, Week, Month, Year)
- Custom range with calendar pickers
- Apply/Cancel buttons

### 9. Composables

Create in `business-portal/src/composables/`:

#### useAmplify.ts
Helper functions for Amplify operations:
```typescript
export function useAmplify() {
  const uploadToStorage = async (key: string, file: File) => { };
  const downloadFromStorage = async (key: string) => { };
  return { uploadToStorage, downloadFromStorage };
}
```

#### useRewards.ts
Reward-specific logic:
```typescript
export function useRewards() {
  const isRewardActive = (reward: Reward) => { };
  const calculateRemainingInventory = (reward: Reward) => { };
  const formatPointCost = (cost: number) => { };
  return { isRewardActive, calculateRemainingInventory, formatPointCost };
}
```

#### useAnalytics.ts
Analytics helpers:
```typescript
export function useAnalytics() {
  const formatDateRange = (start: string, end: string) => { };
  const calculateROI = (revenue: number, spend: number) => { };
  const exportToCSV = (data: any[], filename: string) => { };
  return { formatDateRange, calculateROI, exportToCSV };
}
```

#### useToast.ts
Toast notification system (consider using a library like vue-toastification).

### 10. Seed Data Scripts

Create in `scripts/`:

#### seed-businesses.ts
Creates 5 sample businesses in Durham, NC with realistic data.

#### seed-rewards.ts
Creates 20 rewards across categories, linked to seed businesses.

#### seed-redemptions.ts
Creates 50 redemption records with varied statuses and dates.

#### seed-analytics.ts
Generates daily analytics data for past 30 days.

Run with: `ts-node scripts/seed-businesses.ts`

## 📋 Implementation Checklist

### Phase 1: Core UI Components
- [ ] Button, Input, Select, Modal components
- [ ] LoadingSpinner, Badge, Card components
- [ ] Layout components (Header, Sidebar, Footer, Layout)

### Phase 2: Authentication
- [ ] LoginView
- [ ] RegisterView
- [ ] ConfirmView
- [ ] ResetPasswordView
- [ ] Test auth flow end-to-end

### Phase 3: Reward Management
- [ ] RewardListView
- [ ] CreateRewardView (wizard)
- [ ] EditRewardView
- [ ] ImageUploader component
- [ ] RewardCard component

### Phase 4: Dashboard & Analytics
- [ ] DashboardView with metric cards
- [ ] AnalyticsView with Chart.js
- [ ] MetricCard, ChartContainer components
- [ ] DateRangePicker component

### Phase 5: Redemptions & Profile
- [ ] RedemptionsView with filtering
- [ ] BusinessProfileView with tabs
- [ ] QR code generation for redemptions

### Phase 6: Admin Portal
- [ ] AdminDashboard
- [ ] BusinessApprovalsView
- [ ] PlatformAnalyticsView

### Phase 7: Polish & Testing
- [ ] Error handling throughout
- [ ] Loading states everywhere
- [ ] Form validation
- [ ] Responsive design testing
- [ ] Browser compatibility testing

### Phase 8: Seed Data & Documentation
- [ ] Seed data scripts
- [ ] API documentation
- [ ] Component documentation (Storybook optional)
- [ ] Deployment guide

## 🎨 Design Patterns to Follow

### Component Structure
```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 2. Props & Emits
interface Props {
  id?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: string];
}>();

// 3. Stores & Composables
const authStore = useAuthStore();
const router = useRouter();

// 4. Reactive State
const loading = ref(false);
const error = ref<string | null>(null);

// 5. Computed Properties
const isValid = computed(() => {
  // validation logic
});

// 6. Methods
const handleSubmit = async () => {
  // implementation
};

// 7. Lifecycle Hooks
onMounted(async () => {
  // initialization
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Component template -->
  </div>
</template>
```

### Form Handling
Use `v-model` for two-way binding, validate on submit, show inline errors.

### Error Handling
Always show user-friendly error messages. Log technical details to console.

### Loading States
Show spinners during async operations. Disable buttons to prevent double-submit.

### Empty States
Show helpful messages when lists/tables are empty with CTAs.

## 🔧 Development Tips

### Running Both Backend and Frontend
```bash
# Terminal 1: Backend
npx ampx sandbox

# Terminal 2: Frontend
cd business-portal && npm run dev
```

### Hot Reloading
Both Vite (frontend) and Amplify sandbox (backend) support hot reloading.

### Debugging
- Use Vue DevTools browser extension
- Use AWS Console to inspect DynamoDB, S3, CloudWatch logs
- Check browser Network tab for GraphQL queries

### Performance
- Use `computed` for derived state
- Use `v-once` for static content
- Lazy load routes with `() => import()`
- Optimize images before upload

## 📦 Additional Packages to Consider

### Frontend
- **vue-toastification** - Toast notifications
- **vee-validate** - Form validation
- **dayjs** - Date manipulation
- **qrcode.vue** - QR code generation
- **vue-advanced-cropper** - Image cropping
- **@headlessui/vue** - Unstyled UI components

### Backend
- **sharp** - Image optimization in Lambda
- **uuid** - Generate unique IDs
- **joi** - Input validation

## 🚀 Next Steps

1. **Install remaining packages**:
   ```bash
   cd business-portal
   npm install vue-toastification dayjs qrcode.vue @headlessui/vue
   ```

2. **Start with UI components** - Build Button, Input, Modal first

3. **Build authentication flow** - Get login/register working

4. **Create one full CRUD flow** - Pick rewards, implement end-to-end

5. **Add analytics** - Integrate Chart.js

6. **Polish and test** - Responsive design, error handling

7. **Deploy to production** - Follow deployment guide in README

## 📚 Resources

- [AWS Amplify Gen 2 Docs](https://docs.amplify.aws/gen2/)
- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Chart.js Docs](https://www.chartjs.org/)

---

This guide provides a complete roadmap for finishing the implementation. Start with the core UI components and work your way through each phase systematically.
