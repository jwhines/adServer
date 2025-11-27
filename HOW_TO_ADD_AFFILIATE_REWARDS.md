# How to Add Affiliate Rewards on the Ad Server

## Overview

Your ad server now supports **two types of rewards**:

1. **Local Business Rewards** - Your business directly fulfills the reward (in-store pickup, delivery, service, etc.)
2. **Affiliate Link Rewards** - Families get a shopping link to Amazon, Target, Walmart, etc. You earn commission on purchases.

This guide shows you how to add affiliate rewards through the Business Portal.

---

## Step-by-Step Guide: Adding an Affiliate Reward

### 1. Log in to Business Portal

Navigate to: `https://your-business-portal.com/login`

**Credentials:**
- Use your business email and password
- Role: Business Owner or Platform Admin

### 2. Go to Create Reward

From the dashboard, click:
- **Rewards** (sidebar)
- **Create New Reward** button

### 3. Select "Affiliate Link Reward"

On Step 1 (Basic Information), you'll see two options:

**Option 1: Local Business Reward**
- Your business directly fulfills this reward
- Requires in-store pickup, delivery, or service

**Option 2: Affiliate Link Reward** ✅ **Select This**
- Families get a shopping link
- You earn commission on purchases
- No inventory management needed

### 4. Fill in Basic Information

**Title** (Required)
```
Example: "LEGO Star Wars Millennium Falcon"
```

**Description** (Required)
```
Example: "Build the iconic Millennium Falcon with this 1,351-piece LEGO set.
Perfect for ages 9+ and includes 7 minifigures."
```

**Terms & Conditions** (Optional)
```
Example: "Commission earned on purchase. Product ships from Amazon.
Delivery times vary by location."
```

**Category** (Required)
- Select: `Technology`, `Entertainment`, `Family Activity`, etc.

**Reward Type** (Required)
- Select: `Physical Item`, `Digital Content`, etc.

### 5. Fill in Affiliate Link Setup

This section appears **only** when "Affiliate Link Reward" is selected.

#### **Affiliate Network** (Required)
Select from:
- Amazon Associates
- Target Affiliates
- Walmart Affiliates
- Rakuten Advertising
- ShareASale
- CJ Affiliate
- Custom/Other

**Example:** `Amazon Associates`

#### **Merchant Name** (Required)
Display name shown to families

**Example:** `Amazon`

#### **Affiliate Link** (Required)
Your full affiliate tracking link (including your affiliate ID)

**Amazon Example:**
```
https://www.amazon.com/dp/B07XYZ1234?tag=youraffid-20
```

**Target Example:**
```
https://goto.target.com/c/123456/123456/2092?u=https%3A%2F%2Fwww.target.com%2Fp%2Flego-star-wars%2F-%2FA-12345678
```

**Important:**
- Make sure your affiliate ID is included in the link
- Test the link in a private/incognito browser first
- Commission tracking requires your proper affiliate setup

#### **Commission Rate (%)** (Optional)
Your commission rate from the affiliate network

**Example:** `8` (for 8%)

This is optional and used for internal tracking/analytics.

### 6. Continue Through Steps

**Step 2: Pricing & Value**
- **Point Cost:** How many points families spend (e.g., `50` points)
- **Retail Value:** Actual product price (e.g., `$159.99`)

**Step 3: Image Upload**
- Upload product image (recommended)
- Use high-quality product photos

**Step 4: Targeting**
- **Age Ranges:** Select target ages (e.g., "9-12", "13-15")
- **Family Sizes:** Optional targeting

**Step 5: Inventory & Schedule**
- **Start Date:** When reward becomes available
- **End Date:** Optional expiration
- **Total Available:** Leave blank for unlimited
- **Daily Limit:** Optional

**Step 6: Redemption**
- **Redemption Instructions:** Automatically set to "Online" for affiliate rewards
- Add instructions like:
  ```
  1. Click "Get Link" to receive your Amazon shopping link
  2. Complete your purchase within 24 hours
  3. Product ships directly from Amazon
  ```

**Step 7: Preview & Submit**
- Review all details
- Click **"Submit for Approval"** or **"Save as Draft"**

---

## Example: Complete Affiliate Reward

### Amazon Product Example

**Reward Type:** Affiliate Link Reward

**Basic Info:**
- Title: "LEGO Star Wars Millennium Falcon"
- Description: "Build the iconic Millennium Falcon with this 1,351-piece LEGO set. Perfect for ages 9+ and includes 7 minifigures."
- Category: Entertainment
- Reward Type: Physical Item

**Affiliate Setup:**
- Network: Amazon Associates
- Merchant: Amazon
- Link: `https://www.amazon.com/dp/B07516QZPH?tag=youraffid-20`
- Commission: 8%

**Pricing:**
- Point Cost: 150 points
- Retail Value: $159.99

**Targeting:**
- Ages: 9-12, 13-15
- All family sizes

**Schedule:**
- Start: Today
- End: No expiration
- Available: Unlimited

**Redemption:**
- Type: Online
- Instructions: "Click 'Get Link' to receive your Amazon shopping link. Complete purchase within 24 hours."

---

## How It Works for Families

### On iOS/tvOS App:

1. **Family browses rewards**
   - Sees "LEGO Star Wars Millennium Falcon"
   - Point cost: 150 points

2. **Family clicks reward**
   - Opens RewardDetailView
   - Sees "Shop at Amazon" button
   - Shows affiliate indicator: "This reward is from Amazon"

3. **Family clicks "Shop at Amazon"**
   - Alert asks: "Spend 150 points to get Amazon link?"
   - Family confirms

4. **Points are deducted**
   - Family loses 150 points
   - `trackAffiliateClick` mutation called

5. **Family gets shopping link**
   - **iOS:** Safari opens with tracking URL
   - **tvOS:** QR code displayed to scan with phone

6. **Family completes purchase**
   - Buys product on Amazon
   - You earn commission (8% = $12.80 on $159.99)

---

## Commission Tracking

### How You Get Paid:

1. **Affiliate Network Handles Payment**
   - Amazon, Target, etc. track purchases
   - You get paid through their affiliate dashboard
   - Typical payment schedule: 60-90 days

2. **Ad Server Tracks Clicks**
   - `affiliateClickCount` - How many families clicked
   - `affiliateConversionCount` - How many purchased (requires webhook setup)
   - `affiliateRevenue` - Total order value
   - `affiliateCommissionEarned` - Your total commission

3. **View Analytics**
   - Business Portal → Analytics
   - See click-through rates
   - Track conversion rates
   - Monitor revenue

---

## Best Practices

### Choosing Products

✅ **Good Affiliate Rewards:**
- Popular brand name products
- Clear product images
- Specific items (not generic categories)
- Age-appropriate
- Good value for points

❌ **Avoid:**
- Generic "shop our store" links
- Products with bad reviews
- Seasonal items near expiration
- Overpriced items

### Setting Point Costs

**Formula:**
```
Point Cost = Retail Value × 0.5 to 1.5

Examples:
- $50 product → 25-75 points
- $100 product → 50-150 points
- $200 product → 100-300 points
```

**Consider:**
- Higher point cost = higher perceived value
- Commission earnings offset point value
- Family spending habits

### Writing Good Descriptions

**Include:**
- Product features
- Age suitability
- What's included
- Dimensions/size
- Brand name

**Example:**
```
"Fisher-Price Laugh & Learn Smart Stages Chair -
Interactive learning chair teaches 100+ songs, sounds,
and phrases. 3 levels of learning grow with your child
ages 1-3. Includes light-up remote and interactive book."
```

---

## Managing Affiliate Rewards

### View All Rewards

Navigate to: **Rewards** → **Reward List**

**Filter by:**
- Reward Source: "Affiliate Link"
- Status: Active, Draft, Pending Approval

### Edit Affiliate Reward

1. Click reward from list
2. Click **"Edit"**
3. Update affiliate link if needed
4. Change point cost
5. Update inventory/schedule
6. Save changes

### Deactivate Reward

**Reasons:**
- Product out of stock
- Affiliate program ended
- Link expired
- Better alternative available

**Steps:**
1. Open reward
2. Click **"Deactivate"**
3. Status changes to "INACTIVE"
4. Families can no longer see/redeem

### View Performance

Navigate to: **Analytics** → **Rewards**

**Metrics Available:**
- Impressions (views)
- Clicks
- Click-through rate
- Redemptions
- Revenue (if conversion tracking setup)

---

## Troubleshooting

### "Affiliate Link Not Working"

**Check:**
- Link includes your affiliate ID/tag
- Link is properly formatted
- Network account is active
- Product is still available

**Fix:**
- Test link in incognito browser
- Re-copy from affiliate dashboard
- Update reward with new link

### "Not Getting Commission"

**Check:**
- Affiliate network dashboard
- Payment threshold reached
- Cookie/tracking duration
- Customer completed purchase

**Fix:**
- Ensure link includes your ID
- Check affiliate dashboard for pending commissions
- Contact affiliate network support

### "Families Can't Access Link"

**Check:**
- Reward status is "ACTIVE"
- Start date is in the past
- Inventory isn't exhausted
- App is updated

**Fix:**
- Check reward status in portal
- Verify dates and inventory
- Test on your own device

---

## Platform Admin: Adding Rewards for Businesses

If you're a **Platform Admin**, you can add affiliate rewards on behalf of any business:

1. **Log in as Platform Admin**
2. **Select Business**
   - Admin → Businesses
   - Click business to manage
3. **Create Reward as That Business**
   - Follow same steps above
   - Reward is associated with that business
   - Business can edit/manage later

---

## Technical Details

### Database Schema

Affiliate rewards are stored with:

```typescript
{
  rewardSource: 'AFFILIATE_LINK',
  affiliateNetwork: 'AMAZON',
  affiliateLink: 'https://...',
  affiliateMerchant: 'Amazon',
  commissionRate: 0.08,
  affiliateClickCount: 0,
  affiliateConversionCount: 0,
  affiliateRevenue: 0.0,
  affiliateCommissionEarned: 0.0,
  businessId: null, // Optional for affiliate rewards
  redemptionType: 'ONLINE'
}
```

### GraphQL Mutation

When family clicks affiliate reward:

```graphql
mutation TrackAffiliateClick($input: TrackAffiliateClickInput!) {
  trackAffiliateClick(input: $input) {
    success
    clickId
    trackingUrl
    error
  }
}
```

**Input:**
- rewardId
- familyId
- childId
- platform (IOS/TVOS)
- timestamp
- metadata

**Output:**
- success: Boolean
- clickId: Unique click tracking ID
- trackingUrl: URL with click tracking
- error: Error message if failed

---

## Support

**Need Help?**

- **Business Portal Support:** support@family-rewards.com
- **Affiliate Network Issues:** Contact your affiliate network directly
- **Technical Issues:** Create GitHub issue

**Documentation:**
- `ANALYTICS_IMPLEMENTATION.md` - Analytics tracking
- `FAMILY_APP_ANALYTICS_INTEGRATION.md` - App integration
- `SCHEMA_NOTES.md` - Database schema

---

## Quick Reference

### Affiliate Networks

| Network | Sign Up | Commission |
|---------|---------|------------|
| Amazon Associates | https://affiliate-program.amazon.com | 1-10% |
| Target Affiliates | https://goto.target.com/affiliates | 1-8% |
| Walmart Affiliates | https://affiliates.walmart.com | 1-4% |
| Rakuten | https://rakutenadvertising.com | Varies |
| ShareASale | https://www.shareasale.com | Varies |
| CJ Affiliate | https://www.cj.com | Varies |

### Point Cost Guidelines

| Price Range | Suggested Points | Commission (8%) |
|-------------|-----------------|-----------------|
| $10-$25 | 10-25 points | $0.80-$2.00 |
| $25-$50 | 25-50 points | $2.00-$4.00 |
| $50-$100 | 50-100 points | $4.00-$8.00 |
| $100-$200 | 100-200 points | $8.00-$16.00 |
| $200+ | 200+ points | $16.00+ |

---

**Now you're ready to add affiliate rewards!** 🎉

Start with popular products from Amazon or Target and see how families respond. Track your analytics and adjust point costs as needed.
