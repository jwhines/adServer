# MRC-Compliant Impression Tracking

## Overview

The ad server now supports **MRC (Media Rating Council) compliant** impression and click tracking for reward ads displayed in family iOS/tvOS apps.

### MRC Standards Implemented

- **Viewability Threshold**: 50% of the ad must be visible on screen
- **Duration Threshold**: Ad must remain visible for at least 1 continuous second
- **Standard Compliance**: Follows IAB/MRC guidelines for display ad impressions

## Architecture

### Backend (Ad Server)

#### GraphQL Mutation: `trackAdEvent`

**Location**: `amplify/data/resource.ts`

**Authorization**: Public API key access (allows family apps to track without authentication)

**Arguments**:
```graphql
mutation TrackAdEvent(
  $eventType: String!      # "impression" | "click"
  $rewardId: String!       # ID of the reward being tracked
  $businessId: String!     # ID of the business that owns the reward
  $timestamp: String!      # ISO 8601 timestamp
  $metadata: AWSJSON       # Optional metadata (viewability %, duration, platform, etc.)
) {
  trackAdEvent(
    eventType: $eventType
    rewardId: $rewardId
    businessId: $businessId
    timestamp: $timestamp
    metadata: $metadata
  ) {
    success
    error
  }
}
```

**Returns**:
```typescript
{
  success: boolean
  error?: string
}
```

#### Lambda Function: `track-ad-event`

**Location**: `amplify/functions/track-ad-event/handler.ts`

**What it does**:
1. Increments `impressions` or `clicks` counter on the `Reward` record
2. Updates or creates a `BusinessAnalytics` record for the current date
3. Performs atomic DynamoDB updates using ADD operations

**Key Implementation**:
```typescript
// Increment reward counter
await docClient.send(new UpdateCommand({
  TableName: 'Reward',
  Key: { id: rewardId },
  UpdateExpression: `ADD #field :inc SET updatedAt = :now`,
  ExpressionAttributeNames: { '#field': 'impressions' }, // or 'clicks'
  ExpressionAttributeValues: { ':inc': 1, ':now': new Date().toISOString() }
}));

// Update daily analytics
await docClient.send(new UpdateCommand({
  TableName: 'BusinessAnalytics',
  Key: { id: `${businessId}#${date}` },
  UpdateExpression: `ADD impressions :impressions, clicks :clicks`,
  ExpressionAttributeValues: { ':impressions': 1, ':clicks': 0 }
}));
```

### Frontend (Family App)

#### ImpressionTracker Service

**Location**: `CleanHouse/Services/ImpressionTracker.swift`

**Features**:
- Singleton service for centralized tracking
- MRC-compliant viewability detection (50% for 1+ second)
- Deduplication (each reward impression tracked once per session)
- Automatic server-side tracking via GraphQL mutations

**Key Methods**:
```swift
// Called continuously while reward is visible
func rewardBecameVisible(rewardId: String, businessId: String, visiblePercentage: Double)

// Called when reward goes below 50% visibility
func rewardBecameInvisible(rewardId: String)

// Called when user taps/clicks reward
func trackClick(rewardId: String, businessId: String)
```

#### ViewabilityModifier (SwiftUI)

**Location**: `CleanHouse/Views/ViewabilityModifier.swift`

**How it works**:
1. Uses `GeometryReader` to measure view frame
2. Calculates visible percentage by intersecting with screen bounds
3. Runs timer every 0.1 seconds to check viewability
4. Fires impression when both thresholds met

**Usage**:
```swift
RewardCard(reward: reward)
  .trackViewability(rewardId: reward.id, businessId: reward.businessId)
  .trackClick(rewardId: reward.id, businessId: reward.businessId)
```

#### AdServerAPI

**Location**: `CleanHouse/AdServerAPI.swift`

**Tracking Methods**:
```swift
static func trackImpression(rewardId: String, metadata: [String: String]) async throws
static func trackClick(rewardId: String, metadata: [String: String]) async throws
```

**Metadata Sent**:
```swift
// Impressions
[
  "businessId": "abc123",
  "viewability": "0.75",        // 75% visible
  "duration": "1.00",           // 1 second
  "standard": "MRC",
  "platform": "iOS"
]

// Clicks
[
  "businessId": "abc123",
  "platform": "iOS",
  "action": "tap"
]
```

## Data Flow

### Impression Tracking Flow

```
1. Reward card appears on screen
   ↓
2. ViewabilityModifier detects 50%+ visibility
   ↓
3. Timer starts counting
   ↓
4. After 1 second, ImpressionTracker.fireImpression()
   ↓
5. GraphQL mutation sent to ad server
   ↓
6. Lambda increments Reward.impressions and BusinessAnalytics
   ↓
7. Analytics available in business portal
```

### Click Tracking Flow

```
1. User taps reward card
   ↓
2. .trackClick() modifier calls ImpressionTracker.trackClick()
   ↓
3. GraphQL mutation sent to ad server
   ↓
4. Lambda increments Reward.clicks and BusinessAnalytics
   ↓
5. Analytics available in business portal
```

## Database Schema

### Reward Model
```typescript
{
  id: string
  title: string
  description: string
  businessId: string
  // ... other fields

  // Analytics counters
  impressions: number     // Total MRC-compliant impressions
  clicks: number          // Total user clicks/taps
  redemptions: number     // Total redemptions
}
```

### BusinessAnalytics Model
```typescript
{
  id: string              // Format: "{businessId}#{date}"
  businessId: string
  date: string            // Format: "YYYY-MM-DD"

  // Daily metrics
  impressions: number
  clicks: number
  redemptions: number
  revenue: number
  spend: number
}
```

## Deployment

### Backend Deployment

1. Navigate to ad server directory:
   ```bash
   cd /Users/webbyj/Documents/projects/dev/aws/adServer
   ```

2. Deploy to AWS:
   ```bash
   npx ampx sandbox  # For sandbox environment
   # OR
   npx ampx deploy   # For production
   ```

3. Verify GraphQL schema includes `trackAdEvent` mutation

### Frontend Integration

The tracking is already integrated in:
- `RewardsCarouselView.swift` (tvOS)
- `RewardsCarouselView_iOS.swift` (iOS)
- `RewardCardView.swift` (example implementation)

**No additional setup required** - tracking will start automatically when rewards are displayed.

## Testing

### Test Impression Tracking

1. Open family app on iOS/tvOS
2. Navigate to rewards screen
3. Ensure reward card is 50%+ visible for 1+ second
4. Check console logs for:
   ```
   ⏱️ Started viewability timer for reward {id}
   📊 MRC IMPRESSION FIRED
   ✅ Impression tracked: {id}
   ```

### Test Click Tracking

1. Tap on any reward card
2. Check console logs for:
   ```
   🖱️ Click tracked for reward {id}
   ✅ Click tracked: {id}
   ```

### Verify Backend Updates

1. Log into business portal
2. Navigate to analytics dashboard
3. Verify impression/click counts are incrementing
4. Check CloudWatch logs for Lambda function:
   - Function: `trackAdEvent`
   - Look for: `✅ Incremented impressions for reward {id}`

## Troubleshooting

### Impressions Not Tracking

**Check 1**: Is the reward 50%+ visible?
- Use GeometryReader debug logs to verify visibility percentage

**Check 2**: Has the reward been on screen for 1+ second?
- Check timer logs: "Started viewability timer..."

**Check 3**: Is businessId being passed correctly?
- Verify `rewardWithBusiness.business.id` is not empty

**Check 4**: Is API key configured?
- Verify `adserver_outputs.json` is in Xcode project
- Or check `Secrets.xcconfig` is configured

### Clicks Not Tracking

**Check 1**: Is `.trackClick()` modifier applied?
- Verify modifier is on the reward card view

**Check 2**: Is businessId being passed?
- Check console for: "⚠️ No businessId provided in metadata"

### Backend Errors

**Check 1**: Lambda permissions
- Verify Lambda has DynamoDB read/write access

**Check 2**: Table names
- Verify environment variables: `REWARD_TABLE_NAME`, `BUSINESS_ANALYTICS_TABLE_NAME`

**Check 3**: GraphQL authorization
- Verify `allow.publicApiKey()` is enabled on `trackAdEvent` mutation

## Analytics Dashboard (Future Enhancement)

The tracked data can be used to build:
- Real-time impression/click dashboards
- CTR (Click-Through Rate) calculations: `clicks / impressions * 100`
- ROI reporting for businesses
- A/B testing for reward creative
- Viewability heatmaps

## Compliance & Privacy

- **MRC Compliance**: ✅ 50% viewability for 1+ second
- **Privacy**: Only rewardId, businessId, and aggregate metrics are tracked
- **No PII**: Family IDs are optional and not currently tracked
- **Deduplication**: Each impression counted once per session

## References

- [IAB/MRC Viewability Guidelines](https://www.iab.com/guidelines/iab-measurement-guidelines/)
- [MRC Desktop Display Impression Measurement Guidelines](https://mediaratingcouncil.org/Desktop%20Display%20Impression%20Measurement%20Guidelines%20v1.pdf)
- [Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/)
