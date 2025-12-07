# Environment Switching Guide

## Overview

The business portal can connect to different backend environments:
- **Sandbox**: For development and testing
- **Production**: For live production data

## Current Setup

**Currently configured for**: Sandbox

The portal reads from `amplify_outputs.json` which points to:
- **API URL**: `https://ul2mnbr4rrbffklynytp2ma34a.appsync-api.us-east-1.amazonaws.com/graphql`
- **Stack ID**: `pihfldm7hzbt5mgtbe3j3dpphm`
- **Region**: `us-east-1`

---

## How to Switch Environments

### Method 1: Manual File Switching (Quick)

1. **Copy the production outputs** (after deploying production backend):
   ```bash
   cd /Users/webbyj/Documents/projects/dev/aws/adServer

   # After running: npx ampx deploy --branch main
   cp amplify_outputs.json business-portal/amplify_outputs_production.json
   ```

2. **Switch to production**:
   ```bash
   cd business-portal
   cp amplify_outputs_production.json amplify_outputs.json
   ```

3. **Switch back to sandbox**:
   ```bash
   cd business-portal
   # Copy the sandbox file back
   cp ../amplify_outputs.json amplify_outputs.json
   ```

4. **Restart the dev server**:
   ```bash
   npm run dev
   ```

---

### Method 2: Environment Variables (Recommended for Production)

This method allows automatic switching based on build environment.

#### Step 1: Create Environment Files

```bash
cd business-portal

# Create .env.development (for sandbox)
cat > .env.development << 'EOF'
VITE_AMPLIFY_ENV=sandbox
EOF

# Create .env.production (for production)
cat > .env.production << 'EOF'
VITE_AMPLIFY_ENV=production
EOF
```

#### Step 2: Update amplify-config.ts

Edit `business-portal/src/amplify-config.ts`:

```typescript
import { Amplify } from 'aws-amplify';
import sandboxOutputs from '../amplify_outputs.json';
import productionOutputs from '../amplify_outputs_production.json';

/**
 * Configure AWS Amplify with environment-specific backend outputs
 */

const environment = import.meta.env.VITE_AMPLIFY_ENV || 'sandbox';

const config = environment === 'production'
  ? productionOutputs
  : sandboxOutputs;

console.log(`🌍 Amplify configured for: ${environment}`);

Amplify.configure(config);

export default Amplify;
```

#### Step 3: Build for Different Environments

```bash
# Development (uses sandbox)
npm run dev

# Build for production (uses production backend)
npm run build
# This automatically uses .env.production

# Preview production build locally
npm run preview
```

---

### Method 3: Runtime Environment Switcher (Advanced)

Add a UI toggle to switch environments without rebuilding.

#### Create EnvironmentSwitcher Component

Create `business-portal/src/components/EnvironmentSwitcher.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Amplify } from 'aws-amplify';
import sandboxOutputs from '../../amplify_outputs.json';
import productionOutputs from '../../amplify_outputs_production.json';

const currentEnv = ref<'sandbox' | 'production'>('sandbox');

onMounted(() => {
  const stored = localStorage.getItem('amplify_env') as 'sandbox' | 'production';
  if (stored) {
    currentEnv.value = stored;
    applyEnvironment(stored);
  }
});

function switchEnvironment(env: 'sandbox' | 'production') {
  currentEnv.value = env;
  localStorage.setItem('amplify_env', env);
  applyEnvironment(env);

  // Reload page to reinitialize Amplify
  window.location.reload();
}

function applyEnvironment(env: 'sandbox' | 'production') {
  const config = env === 'production' ? productionOutputs : sandboxOutputs;
  Amplify.configure(config);
}
</script>

<template>
  <div class="environment-switcher">
    <label class="text-sm font-medium text-gray-700">Environment:</label>
    <select
      v-model="currentEnv"
      @change="switchEnvironment(currentEnv)"
      class="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm"
    >
      <option value="sandbox">Sandbox</option>
      <option value="production">Production</option>
    </select>
    <span
      :class="[
        'ml-2 px-2 py-1 rounded text-xs font-medium',
        currentEnv === 'production'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      ]"
    >
      {{ currentEnv.toUpperCase() }}
    </span>
  </div>
</template>
```

#### Add to AppLayout

In `src/components/layout/AppLayout.vue`, add the switcher:

```vue
<script setup lang="ts">
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher.vue';
// ... existing imports
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Existing navigation -->

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <EnvironmentSwitcher />  <!-- Add this -->
            <span class="text-sm text-gray-600 hidden sm:block">
              {{ authStore.user?.email }}
            </span>
            <!-- ... rest -->
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
```

---

## Deploying Production Backend

Before switching to production, you need to deploy the production backend:

```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer

# Deploy to production
npx ampx deploy --branch main

# This creates a new stack with:
# - New DynamoDB tables (different stack ID)
# - New Lambda functions
# - New AppSync endpoint
# - New API key

# Copy outputs for the business portal
cp amplify_outputs.json business-portal/amplify_outputs_production.json
```

---

## Verifying Current Environment

### Check in Browser Console

The business portal logs which environment it's using:

```javascript
// Look for this in browser console:
🌍 Amplify configured for: sandbox
// or
🌍 Amplify configured for: production
```

### Check API Endpoint

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter for "graphql"
4. Look at the Request URL:
   - Sandbox: `https://ul2mnbr4rrbffklynytp2ma34a.appsync-api.us-east-1.amazonaws.com/graphql`
   - Production: Different URL (after deployment)

---

## Environment Indicator Component

Already created in PRODUCTION_LAUNCH_CHECKLIST.md!

Add the `EnvironmentBadge` component to show which environment you're viewing:

```vue
<!-- Shows "SANDBOX" or "PRODUCTION" badge -->
<EnvironmentBadge />
```

---

## Best Practices

1. **Development**: Always use sandbox
2. **Testing**: Use sandbox with production-like data
3. **Production Builds**: Use environment variables (Method 2)
4. **Quick Testing**: Use manual file switching (Method 1)
5. **Admin Panel**: Add runtime switcher (Method 3) for easy testing

---

## Troubleshooting

### "Endpoint not found" error
- Check that `amplify_outputs.json` has the correct API URL
- Verify you're using the right file (sandbox vs production)

### "Unauthorized" errors
- Check that the API key is valid (they expire every 30 days)
- Regenerate API key: `npx ampx sandbox --renew-api-key`

### Data shows from wrong environment
- Clear browser cache and reload
- Check Network tab to verify which endpoint is being called
- Verify `amplify_outputs.json` is the correct file

---

## Quick Reference

| Environment | Use Case | Switch Method |
|-------------|----------|---------------|
| Sandbox | Development, testing | Default (already configured) |
| Production | Live app, real users | Method 1, 2, or 3 above |

**Current Environment**: Sandbox
**To Switch**: Follow Method 1, 2, or 3 above
