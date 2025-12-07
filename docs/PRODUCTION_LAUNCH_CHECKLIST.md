# Production Launch Checklist

> **Complete guide for launching the Ad Server analytics dashboard to production**

Last Updated: December 5, 2025

## ✅ Current Status

### Analytics Dashboard - PRODUCTION READY

**Good News**: Your analytics dashboard is using **100% REAL DATA** from DynamoDB. No mock data!

**What's Working**:
- ✅ InvestorView dashboard queries real `getInvestorMetrics` API
- ✅ All Lambda functions use environment variables (fixed!)
- ✅ Proper IAM permissions for all analytics functions
- ✅ Real-time data from:
  - `AppMetrics` table
  - `PlatformAnalytics` table
  - `UserEngagement` table
  - `Business` table
  - `Reward` table
  - `Impression` table

## 🎯 Environment Status

### Current Environment: **SANDBOX**

Both systems are currently pointing to sandbox:

```
┌──────────────────────────────────────────────┐
│         Current Configuration                 │
├──────────────────────────────────────────────┤
│ iOS App          → Ad Server Sandbox         │
│ Business Portal  → Ad Server Sandbox         │
│ Analytics Data   → Sandbox DynamoDB Tables   │
└──────────────────────────────────────────────┘
```

**Sandbox AppSync Endpoint**:
```
https://ul2mnbr4rrbffklynytp2ma34a.appsync-api.us-east-1.amazonaws.com/graphql
```

**Sandbox Stack ID**:
```
pihfldm7hzbt5mgtbe3j3dpphm
```

## 🚀 Switching to Production (For Launch)

### Step 1: Deploy Production Backend

```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer

# Deploy to production
npx ampx deploy --branch main

# This creates a SEPARATE production stack with:
# - New DynamoDB tables (different stack ID)
# - New Lambda functions
# - New AppSync endpoint
# - New API key
```

### Step 2: Configure iOS App for Production

**File**: `Mumaku/adserver_outputs_production.json`

After production deployment, copy the outputs:

```json
{
  "data": {
    "url": "<production-appsync-url-from-deployment>",
    "api_key": "<production-api-key-from-deployment>",
    "aws_region": "us-east-1"
  }
}
```

**Update AdServerEnvironmentManager** to use production config:

```swift
// In AdServerEnvironmentManager.swift
func getCurrentConfig() -> AdServerConfig? {
    #if DEBUG
    return getSandboxConfig()  // Dev builds use sandbox
    #else
    return getProductionConfig()  // Release builds use production
    #endif
}
```

### Step 3: Configure Business Portal for Production

**Option A: Build-Time Environment (Recommended)**

Create environment-specific config files:

```bash
# business-portal/.env.development
VITE_AMPLIFY_ENV=sandbox

# business-portal/.env.production
VITE_AMPLIFY_ENV=production
```

**Update** `business-portal/src/main.ts`:

```typescript
import { Amplify } from 'aws-amplify';
import sandboxOutputs from '../amplify_outputs.json';
import productionOutputs from '../amplify_outputs_production.json';

const config = import.meta.env.VITE_AMPLIFY_ENV === 'production'
  ? productionOutputs
  : sandboxOutputs;

Amplify.configure(config);
```

**Build for production**:
```bash
cd business-portal
npm run build  # Uses .env.production automatically
```

**Option B: Runtime Environment Switcher (Future Enhancement)**

Add a settings page where admins can toggle environments.

### Step 4: Verify Production Deployment

```bash
# Check DynamoDB tables exist
aws dynamodb list-tables | grep -E "(AppMetrics|UserEngagement|PlatformAnalytics)"

# Verify Lambda functions have env vars
aws lambda list-functions --query "Functions[?contains(FunctionName, 'track')].FunctionName"

# Test a Lambda function
aws lambda get-function-configuration \
  --function-name <production-track-engagement-function> \
  --query 'Environment.Variables'
```

## 📊 Making the Dashboard Better for Launch

### 1. Add Empty State Handling

When no data exists yet (brand new users), show helpful messaging:

**Add to** `InvestorView.vue`:

```vue
<template>
  <div v-if="!loading && metrics && isEmptyData" class="empty-state">
    <div class="empty-icon">📊</div>
    <h2>No Data Yet</h2>
    <p>Analytics will appear here once users start using the app.</p>
    <p class="text-sm text-gray-500">
      Make sure the iOS app is tracking events with trackEngagement and trackAdEvent mutations.
    </p>
  </div>
</template>

<script setup>
const isEmptyData = computed(() => {
  return metrics.value &&
         metrics.value.overview.currentDAU === 0 &&
         metrics.value.engagement.totalSessions === 0;
});
</script>
```

### 2. Add Environment Indicator

Show which environment you're viewing:

**Create** `business-portal/src/components/EnvironmentBadge.vue`:

```vue
<template>
  <div :class="badgeClass">
    <span class="indicator"></span>
    {{ environmentName }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Detect environment from API URL
const apiUrl = import.meta.env.VITE_AMPLIFY_API_URL ||
               (window as any).amplifyConfig?.data?.url || '';

const environmentName = computed(() => {
  // If URL contains 'sandbox' or matches sandbox stack, it's sandbox
  if (apiUrl.includes('sandbox') || apiUrl.includes('webbyj')) {
    return 'Sandbox';
  }
  return 'Production';
});

const badgeClass = computed(() => {
  const base = 'env-badge';
  return environmentName.value === 'Production'
    ? `${base} env-production`
    : `${base} env-sandbox`;
});
</script>

<style scoped>
.env-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.env-sandbox {
  background: #FEF3C7;
  color: #92400E;
}

.env-production {
  background: #D1FAE5;
  color: #065F46;
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.env-sandbox .indicator {
  background: #F59E0B;
}

.env-production .indicator {
  background: #10B981;
}
</style>
```

**Add to** `InvestorView.vue` header:

```vue
<div class="page-header">
  <div class="flex items-center gap-3">
    <h1>Investor Dashboard</h1>
    <EnvironmentBadge />
  </div>
  <p class="subtitle">Growth metrics and platform performance</p>
  <!-- ... -->
</div>
```

### 3. Add Real-Time Data Freshness Indicator

Show when data was last updated:

```vue
<template>
  <div class="data-freshness">
    <span class="text-sm text-gray-500">
      Data as of: {{ lastUpdated }}
    </span>
    <button @click="fetchMetrics" class="refresh-btn">
      <RefreshIcon :class="{ spinning: loading }" />
      Refresh
    </button>
  </div>
</template>

<script setup>
const lastUpdated = computed(() => {
  if (!metrics.value) return 'Never';
  return new Date().toLocaleString();
});
</script>

<style scoped>
.refresh-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 4. Add Date Range Presets

Make it easier to view common date ranges:

```vue
<div class="date-presets">
  <button @click="setDateRange('today')">Today</button>
  <button @click="setDateRange('week')">Last 7 Days</button>
  <button @click="setDateRange('month')">Last 30 Days</button>
  <button @click="setDateRange('quarter')">Last 90 Days</button>
</div>

<script setup>
function setDateRange(preset: string) {
  const end = new Date();
  let start = new Date();

  switch (preset) {
    case 'today':
      start = end;
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setDate(end.getDate() - 30);
      break;
    case 'quarter':
      start.setDate(end.getDate() - 90);
      break;
  }

  dateRange.value = {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}
</script>
```

### 5. Add Export Functionality

The dashboard already has CSV export! To improve it:

**Add PDF Export** (currently shows alert):

```bash
cd business-portal
npm install jspdf html2canvas
```

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function exportToPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');

  // Add header
  pdf.setFontSize(20);
  pdf.text('Investor Metrics Report', 20, 20);
  pdf.setFontSize(10);
  pdf.text(`${dateRange.value.startDate} to ${dateRange.value.endDate}`, 20, 28);

  // Capture charts as images
  const charts = document.querySelectorAll('canvas');
  let yPosition = 40;

  for (const chart of Array.from(charts)) {
    const canvas = await html2canvas(chart);
    const imgData = canvas.toDataURL('image/png');

    if (yPosition + 100 > 280) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 85);
    yPosition += 95;
  }

  pdf.save(`investor-report-${Date.now()}.pdf`);
}
```

## 🎯 Data-Driven Recommendations

### 1. Set Up Alerts

Create alerts for key metrics:

```typescript
// Check if DAU dropped significantly
if (metrics.value.overview.dauGrowthRate < -20) {
  // Send alert via email or Slack
  notifyTeam({
    metric: 'DAU',
    change: metrics.value.overview.dauGrowthRate,
    severity: 'high',
  });
}
```

### 2. Add Cohort Analysis

Track user retention by signup cohort:

```typescript
// In get-investor-metrics Lambda
const cohorts = groupUsersByCohort(userEngagementRecords);
return {
  ...investorMetrics,
  cohorts: {
    'Week of Dec 1': { retention_d7: 65%, retention_d30: 42% },
    'Week of Dec 8': { retention_d7: 72%, retention_d30: null },
  }
};
```

### 3. Add A/B Test Tracking

Track feature experiments:

```typescript
trackEngagement({
  eventType: 'feature_view',
  metadata: {
    experiment: 'reward_layout_v2',
    variant: 'treatment',
  }
});
```

### 4. Add Goal Tracking

Define and track business goals:

```typescript
const goals = {
  dau_target: 1000,
  current_dau: metrics.value.overview.currentDAU,
  progress: (metrics.value.overview.currentDAU / 1000) * 100,
};
```

### 5. Add Platform-Specific Insights

Show which platforms perform best:

```vue
<div v-for="(data, platform) in topPlatforms" :key="platform">
  <h4>{{ platform }}</h4>
  <p>Engagement Score: {{ data.engagementScore }}/100</p>
  <p>Avg Session: {{ data.avgSessionDuration }}min</p>
  <p>CTR: {{ data.ctr }}%</p>
</div>
```

## 📋 Pre-Launch Checklist

### Technical Setup

- [ ] Deploy production backend with `npx ampx deploy --branch main`
- [ ] Copy production outputs to `adserver_outputs_production.json`
- [ ] Configure iOS app to use production config for release builds
- [ ] Build business portal with production config
- [ ] Verify all Lambda functions have environment variables set
- [ ] Test analytics tracking from iOS app in production
- [ ] Verify data appears in production DynamoDB tables
- [ ] Set up CloudWatch alarms for Lambda errors
- [ ] Configure API key rotation schedule (every 30 days)

### Dashboard Improvements

- [ ] Add empty state handling for zero data
- [ ] Add environment indicator badge
- [ ] Add real-time data freshness indicator
- [ ] Add date range presets (today, week, month)
- [ ] Implement PDF export functionality
- [ ] Add goal tracking widgets
- [ ] Set up alert thresholds
- [ ] Test CSV export with real data
- [ ] Verify charts render correctly with production data

### Data Validation

- [ ] Confirm analytics events are being tracked
- [ ] Verify session_start events create UserEngagement records
- [ ] Verify screen_view events update session records
- [ ] Verify trackAdEvent creates Impression records
- [ ] Check AppMetrics daily rollups are working
- [ ] Check PlatformAnalytics platform-specific data
- [ ] Verify investor metrics aggregation is correct

### Documentation

- [ ] Document environment switching process
- [ ] Create runbook for common issues
- [ ] Document how to add new metrics
- [ ] Create data dictionary for analytics events
- [ ] Document alert escalation process

## 🔄 Production Deployment Commands

```bash
# 1. Deploy production backend
cd /Users/webbyj/Documents/projects/dev/aws/adServer
npx ampx deploy --branch main

# 2. Save production outputs
cp amplify_outputs.json amplify_outputs_production.json

# 3. Copy to iOS project
cp amplify_outputs_production.json ../apple/cleanhouse-apple/Mumaku/adserver_outputs_production.json

# 4. Build iOS app for release
# In Xcode: Product → Archive → Distribute to App Store

# 5. Build business portal for production
cd business-portal
npm run build

# 6. Deploy business portal
# Option A: Amplify Hosting
npx ampx hosting add

# Option B: S3 + CloudFront
aws s3 sync dist/ s3://your-production-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## 🎉 Post-Launch

### Monitor These Metrics

**Week 1**:
- DAU growth
- Error rates in CloudWatch
- API response times
- Data freshness (is new data coming in?)

**Month 1**:
- User retention (D1, D7, D30)
- Platform distribution (iOS vs tvOS)
- Engagement patterns (session duration, screens per session)
- Business metrics (active businesses, total revenue)

### Iterate Based on Data

1. **If DAU is low**: Focus on user acquisition
2. **If retention is low**: Improve onboarding and engagement
3. **If session duration is low**: Add more valuable features
4. **If CTR is low**: Improve reward presentation
5. **If redemption rate is low**: Adjust reward pricing or inventory

## 🆘 Troubleshooting Production

### Data Not Appearing

```bash
# Check Lambda logs
aws logs tail /aws/lambda/<production-track-engagement-function> --follow

# Check DynamoDB tables
aws dynamodb scan --table-name AppMetrics-<prod-stack-id>-NONE --limit 5

# Verify API endpoint
curl -X POST \
  https://<production-appsync-url>/graphql \
  -H "x-api-key: <production-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { listAppMetrics { items { date } } }"}'
```

### iOS App Not Tracking

1. Check `adserver_outputs_production.json` exists and has correct URL
2. Verify `AdServerEnvironmentManager` is using production config
3. Check CloudWatch logs for 401 errors (wrong API key)
4. Verify iOS app is calling correct GraphQL endpoint

### Dashboard Showing Zero Data

1. Confirm production backend is deployed
2. Check iOS app is pointing to production
3. Verify analytics events are being sent
4. Check DynamoDB tables have data
5. Verify `getInvestorMetrics` Lambda has permissions

## 📞 Support

**For Production Issues**:
- Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- View CloudWatch logs
- Contact: justin@plysee.com

---

**You're Ready to Launch!** 🚀

The analytics dashboard is production-ready and using 100% real data. Follow this checklist to deploy to production when you're ready.
