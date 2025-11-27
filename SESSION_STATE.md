# Current Session State - Family Rewards Ad Platform

**Last Updated:** 2025-10-02

## Project Overview
Building a complete AWS Amplify Gen 2 backend with Vue.js business portal for a family rewards advertising platform. Local Durham businesses can create reward campaigns that families can redeem based on location, age ranges, and other criteria.

## What's Working ✅

### Backend (AWS Amplify Gen 2)
- ✅ **Deployed successfully** via `npx ampx sandbox`
- ✅ **Authentication**: Cognito email/password with user groups (BUSINESS_OWNER, PLATFORM_ADMIN)
- ✅ **GraphQL API**: 4 data models (Business, Reward, RewardRedemption, BusinessAnalytics)
- ✅ **Lambda Functions**: 5 serverless functions deployed
- ✅ **S3 Storage**: Configured for image uploads
- ✅ **DynamoDB**: Tables created with owner-based authorization

### Frontend (Vue.js Business Portal)
- ✅ **Authentication Flow**:
  - Register → Email verification → Login → Dashboard
  - Auto-redirects working properly
- ✅ **Navigation**: Top navigation bar with mobile hamburger menu
- ✅ **Routes Working**:
  - `/login` - LoginView
  - `/register` - RegisterView
  - `/confirm` - ConfirmView
  - `/` - Dashboard
  - `/profile` - Business Profile
  - `/rewards` - Rewards List
  - `/rewards/create` - Create Reward (7-step wizard)

### Completed Components

#### Views Created:
1. **LoginView** (`/views/auth/LoginView.vue`)
   - Email/password login
   - Logout-first logic to handle existing sessions
   - Auto-redirect if already authenticated

2. **RegisterView** (`/views/auth/RegisterView.vue`)
   - Business registration form
   - Client-side validation

3. **ConfirmView** (`/views/auth/ConfirmView.vue`)
   - Email verification with 6-digit code
   - Resend code functionality

4. **DashboardView** (`/views/dashboard/DashboardView.vue`)
   - Welcome message
   - Account info display
   - Next steps checklist
   - Sign out button

5. **BusinessProfileView** (`/views/profile/BusinessProfileView.vue`)
   - 4-tab interface: Business Info, Logo & Media, Billing, Account
   - Form with all business fields
   - Logo upload (placeholder for S3)
   - Password change (placeholder for Cognito)
   - **FIXED ISSUES**:
     - Changed `phoneNumber` → `phone`
     - Changed `monthlyAdBudget` → `monthlyBudget`
     - Changed `billingType: 'MONTHLY'` → `'MONTHLY_RETAINER'`
     - Fixed dropdown: `SERVICE` → `SERVICES`
     - Added all schema enum values: EDUCATION, SPORTS_RECREATION
     - Added required `owner` field on create

6. **RewardListView** (`/views/rewards/RewardListView.vue`)
   - Grid/list view toggle
   - Search and status filtering
   - Reward cards with image, stats, actions
   - Edit/delete functionality
   - **FIXED**: Calls `client.models.Reward.list()` directly (no filter) to avoid DynamoDB filter syntax errors

7. **CreateRewardView** (`/views/rewards/CreateRewardView.vue`)
   - 7-step wizard form:
     1. Basic Info (title, description, category, type)
     2. Pricing (points, retail value)
     3. Image Upload (with preview)
     4. Targeting (age ranges, family sizes, radius)
     5. Inventory & Schedule (availability, dates, days)
     6. Redemption (type, instructions)
     7. Preview & Submit
   - Save as draft or submit for approval
   - Progress bar showing completion %

8. **AppLayout** (`/components/layout/AppLayout.vue`)
   - Top navigation bar with logo
   - Desktop: Horizontal nav links (Dashboard, Business Profile, Rewards, Analytics)
   - Mobile: Hamburger menu
   - User email display and sign out button
   - Active route highlighting

### Stores (Pinia)
- ✅ **authStore** (`/stores/auth.ts`)
  - login, register, confirmRegistration, logout, initialize
  - User state management

- ✅ **businessStore** (`/stores/business.ts`)
  - fetchBusiness, createBusiness, updateBusiness
  - Single business state (not array)

- ✅ **rewardsStore** (`/stores/rewards.ts`)
  - fetchRewards, createReward, updateReward, deleteReward
  - uploadRewardImage (with base64 conversion)
  - fetchRedemptions

## Known Issues & Fixes Applied

### Issue 1: Node.js Version Compatibility ✅ FIXED
- **Error**: Vite 6 required Node 20.19+, user had 20.10.0
- **Fix**: Downgraded to Vite 5.4.11

### Issue 2: GraphQL Schema Syntax ✅ FIXED
- **Errors**:
  - `.default()` not supported on enums
  - `.array()` not supported on custom types
  - `allow.authenticated()` not supported
- **Fixes**:
  - Removed all `.default()` calls
  - Changed custom query returns to `a.json()`
  - Used `allow.owner()` instead

### Issue 3: Missing npm install ✅ FIXED
- **Error**: Could not determine executable to run
- **Fix**: Run `npm install` before `npx ampx sandbox`

### Issue 4: Login "Already Signed In" Error ✅ FIXED
- **Error**: User couldn't login, showed "already signed in" message
- **Fix**:
  - Added logout-first logic in login handler
  - Added onMounted auto-redirect if authenticated

### Issue 5: Business Profile Field Mismatches ✅ FIXED
- **Error**: Invalid fields in CreateBusinessInput
- **Fixes**:
  - `phoneNumber` → `phone`
  - `monthlyAdBudget` → `monthlyBudget`
  - `billingType: 'MONTHLY'` → `'MONTHLY_RETAINER'`
  - Added required `owner` field from current user

### Issue 6: Business Type Enum Mismatch ✅ FIXED
- **Error**: "Variable 'businessType' has an invalid value"
- **Fix**: Changed dropdown from `SERVICE` to `SERVICES` (plural)
- **Also Added**: EDUCATION, SPORTS_RECREATION options

### Issue 7: Rewards List DynamoDB Filter Error ✅ FIXED
- **Error**: Invalid FilterExpression syntax error
- **Fix**: Call `client.models.Reward.list()` without filter, let GraphQL authorization handle filtering

## Current User Status
- ✅ User successfully registered: justin@plysee.com
- ✅ User verified email
- ✅ User logged in
- ✅ Viewing dashboard
- ✅ Navigation working
- ✅ Can access Business Profile
- ✅ Can access Rewards page
- ⏳ Creating first business profile (in progress)

## File Locations

### Backend
```
/Users/webbyj/Documents/projects/dev/aws/adServer/
├── amplify/
│   ├── backend.ts
│   ├── auth/resource.ts
│   ├── data/resource.ts (GraphQL schema)
│   ├── storage/resource.ts
│   └── functions/
│       ├── get-rewards-for-family/
│       ├── redeem-reward/
│       ├── upload-reward-image/
│       ├── get-business-analytics/
│       └── track-ad-event/
└── package.json
```

### Frontend
```
/Users/webbyj/Documents/projects/dev/aws/adServer/business-portal/
├── src/
│   ├── views/
│   │   ├── auth/ (LoginView, RegisterView, ConfirmView)
│   │   ├── dashboard/ (DashboardView)
│   │   ├── profile/ (BusinessProfileView)
│   │   └── rewards/ (RewardListView, CreateRewardView)
│   ├── components/
│   │   ├── layout/ (AppLayout)
│   │   └── common/ (Button - only one created so far)
│   ├── stores/ (auth, business, rewards)
│   ├── types/index.ts
│   └── router/index.ts
└── package.json
```

## GraphQL Schema Summary

### Business Model
**Required fields:**
- `name: string`
- `address: string`
- `city: string`
- `state: string`
- `zipCode: string`
- `email: email`
- `owner: string` (Cognito user ID)

**businessType enum:**
- RESTAURANT
- ENTERTAINMENT
- RETAIL
- SERVICES
- EDUCATION
- SPORTS_RECREATION
- OTHER

**billingType enum:**
- CPM
- CPC
- MONTHLY_RETAINER

### Reward Model
**Key fields:**
- `businessId: id` (required)
- `title: string` (required)
- `description: string` (required)
- `pointCost: integer` (required)
- `imageUrl: string`
- `ageRanges: string[]`
- `familySizes: integer[]`
- `status: enum` (DRAFT, ACTIVE, PAUSED, etc.)

## Next Steps (From IMPLEMENTATION_GUIDE.md)

### Immediate Priority
1. ✅ Create Business Profile view - **DONE**
2. ✅ Build Reward Management features - **DONE** (list + create)
3. ⏳ Test business profile creation - **IN PROGRESS**

### Remaining Components to Build
1. **Analytics View** (`/views/analytics/`)
   - Date range picker
   - Charts (impressions, redemptions)
   - Per-reward breakdown table
   - CSV export

2. **Redemptions View** (`/views/redemptions/`)
   - Filter by status, date, code
   - Redemptions table
   - Mark as redeemed
   - Verify redemption codes

3. **Admin Views** (if user is PLATFORM_ADMIN)
   - Business approval workflow
   - Platform analytics
   - User management

4. **Additional Components** (as needed)
   - Modal.vue
   - LoadingSpinner.vue
   - Badge.vue
   - Card.vue
   - Input.vue
   - Select.vue

## How to Resume Development

### 1. Start the Backend
```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer
npx ampx sandbox
# Wait for "Sandbox is ready!" message
```

### 2. Start the Frontend
```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer/business-portal
npm run dev
# Opens at http://localhost:5173
```

### 3. Login
- Email: justin@plysee.com
- Password: (your password)

### 4. Current Task
User is filling out the Business Profile form. Once submitted successfully:
- Move on to creating a reward
- Test the full reward creation flow
- Build Analytics view
- Build Redemptions view

## Important Notes

### Authorization Model
- Uses **owner-based authorization** (`allow.owner()`)
- Each business can only see/edit their own data
- Platform admins have full access via `allow.group('PLATFORM_ADMIN')`

### Image Upload Strategy
- Lambda function converts base64 to S3 upload
- Current implementation returns mock URLs
- TODO: Full S3 integration with signed URLs

### Testing Credentials
- User: justin@plysee.com
- Business: Plysee LLC (SERVICES type)
- Location: Durham, NC 27707

### Common Commands
```bash
# Backend
npx ampx sandbox                    # Start sandbox
npx ampx sandbox delete            # Delete sandbox

# Frontend
npm run dev                        # Dev server
npm run build                      # Production build
npm run type-check                 # TypeScript check

# Git (if needed)
git status
git add .
git commit -m "message"
```

## Documentation Files
- `/IMPLEMENTATION_GUIDE.md` - Component specs
- `/ARCHITECTURE.md` - System design
- `/PROJECT_STATUS.md` - What's done vs pending
- `/QUICKSTART.md` - Setup guide
- `/TROUBLESHOOTING.md` - Common errors
- `/DELIVERY_SUMMARY.md` - Full project summary

## Quick Diagnostics

### If Backend Breaks
1. Check sandbox status: `npx ampx sandbox`
2. Look for schema errors in terminal
3. Verify all Lambda functions deployed
4. Check DynamoDB tables exist

### If Frontend Breaks
1. Check browser console for errors
2. Verify Amplify configuration in `src/main.ts`
3. Check network tab for GraphQL errors
4. Verify routes in `router/index.ts`

### If Auth Breaks
1. Clear browser local storage
2. Check Cognito user pool in AWS Console
3. Verify user groups exist
4. Try logout and login again

## Success Criteria

### Completed ✅
- [x] User can register and verify email
- [x] User can login and access dashboard
- [x] User can navigate between pages
- [x] Business profile form displays correctly
- [x] Rewards list displays correctly
- [x] Create reward form works (7 steps)

### In Progress ⏳
- [ ] User can create/update business profile
- [ ] User can create rewards with images
- [ ] User can view analytics
- [ ] User can manage redemptions

### Not Started ❌
- [ ] Admin can approve businesses
- [ ] Analytics charts display data
- [ ] CSV export works
- [ ] Full image upload to S3
- [ ] Geocoding for addresses
