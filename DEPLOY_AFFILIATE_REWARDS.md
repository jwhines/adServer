# Deploy Affiliate Rewards - Quick Fix Guide

## Issue

When trying to create an affiliate reward in the Business Portal, you get this error:

```
The variables input contains a field that is not defined for input object type 'CreateRewardInput'
```

## Root Cause

The **backend schema hasn't been deployed yet** with the new affiliate reward fields. The frontend is trying to send fields (`rewardSource`, `affiliateNetwork`, `affiliateLink`, etc.) that don't exist in the currently deployed GraphQL API.

## What I've Done

✅ **Fixed schema error** - Changed `PlatformAnalytics.platform` from enum to required string for composite key compatibility

✅ **Added affiliate fields to CreateRewardView** - The UI now supports creating affiliate rewards

✅ **Created package.json files** for Lambda functions missing them:
- `track-affiliate-click/package.json`
- `verify-redemption/package.json`
- `track-engagement/package.json`
- `get-investor-metrics/package.json`

## What You Need to Do

### Step 1: Install ALL Lambda Dependencies

Run this command **from the ad server root directory**:

```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer

# Install dependencies for each Lambda function
cd amplify/functions/get-business-analytics && npm install
cd ../get-investor-metrics && npm install
cd ../get-rewards-for-family && npm install
cd ../redeem-reward && npm install
cd ../track-affiliate-click && npm install
cd ../track-engagement && npm install
cd ../upload-reward-image && npm install
cd ../verify-redemption && npm install
cd ../../..
```

### Step 2: Deploy the Backend

```bash
npx ampx sandbox
```

This will:
- Synthesize the backend with new affiliate fields
- Deploy updated GraphQL schema
- Create/update DynamoDB tables
- Deploy all Lambda functions

**Expected time:** 5-10 minutes

### Step 3: Test Affiliate Reward Creation

Once deployed, go to Business Portal:

1. Navigate to: `http://localhost:5173/rewards/create`
2. **Step 1:** Select "Affiliate Link Reward"
3. Fill in the fields:
   - Title: "LEGO Star Wars Set"
   - Description: "1,351-piece building set..."
   - Affiliate Network: "Amazon Associates"
   - Merchant Name: "Amazon"
   - Affiliate Link: `https://www.amazon.com/dp/B07516QZPH?tag=your-id`
4. Complete remaining steps
5. Submit!

If it works, you'll see the reward created successfully! 🎉

---

## Alternative: Quick Test Without Full Deployment

If you want to test faster, you can **temporarily simplify** which Lambda functions are deployed:

### Option A: Comment Out Unused Functions

Edit `amplify/backend.ts` and comment out functions you're not actively using:

```typescript
// Comment out temporarily:
// trackAffiliateClick,
// verifyRedemption,
// uploadRewardImage,
```

Then run: `npx ampx sandbox`

This will deploy faster without those functions.

### Option B: Deploy Schema Only

If you just want to test reward creation:

```bash
npx ampx sandbox --once
```

This deploys once and exits, faster than watching mode.

---

## Files Modified Summary

### Backend Schema
- **`amplify/data/resource.ts`**
  - Fixed: `PlatformAnalytics.platform` is now `a.string().required()`
  - Already has: All affiliate reward fields (rewardSource, affiliateNetwork, etc.)

### Frontend (Business Portal)
- **`business-portal/src/views/rewards/CreateRewardView.vue`**
  - Added: Reward source selection (Local Business vs Affiliate Link)
  - Added: Affiliate-specific fields (network, merchant, link, commission)
  - Updated: Validation logic for affiliate rewards
  - Updated: Submit logic to handle optional businessId

### Documentation
- **`HOW_TO_ADD_AFFILIATE_REWARDS.md`** - Complete usage guide
- **`DEPLOY_AFFILIATE_REWARDS.md`** - This file (deployment guide)

---

## Troubleshooting

### Error: "Could not resolve @aws-sdk/client-dynamodb"

**Solution:** Dependencies not installed. Run:
```bash
cd amplify/functions/[FUNCTION_NAME]
npm install
```

### Error: "Invalid identifier definition"

**Solution:** Already fixed! The `platform` field is now a required string.

### Error: Still getting "field not defined" error

**Solution:** Schema hasn't deployed yet. Make sure `npx ampx sandbox` completes successfully and shows:

```
✔ Deployed
[Sandbox] Watching for file changes...
```

---

## Next Steps After Deployment

Once the backend is deployed:

1. ✅ **Test affiliate reward creation** - Follow Step 3 above
2. ✅ **Test in family app** - Open iOS/tvOS app and browse rewards
3. ✅ **Test affiliate click flow** - Click an affiliate reward and verify tracking URL generation
4. ✅ **Check analytics** - View investor dashboard to see affiliate metrics

---

**Need Help?**

If deployment keeps failing:
1. Check the full error output from `npx ampx sandbox`
2. Share the specific error message
3. I can help debug further

The affiliate reward functionality is **ready to go** - it just needs the backend to deploy! 🚀
