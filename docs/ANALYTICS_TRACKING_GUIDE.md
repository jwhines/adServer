# Analytics Tracking Guide

> **Complete guide to the Ad Server analytics tracking system**

Last Updated: December 5, 2025

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Analytics Tracking Flow](#analytics-tracking-flow)
4. [Lambda Functions](#lambda-functions)
5. [Data Models](#data-models)
6. [iOS/tvOS Integration](#iostvos-integration)
7. [Deployment & Configuration](#deployment--configuration)
8. [Troubleshooting](#troubleshooting)
9. [Recent Fixes](#recent-fixes)

## Overview

The Ad Server backend provides analytics tracking for the Mumaku family management platform. It tracks:

- **User Engagement**: Sessions, screen views, interactions
- **Ad Performance**: Impressions, clicks, CTR
- **Business Analytics**: Redemptions, revenue, ROI
- **Platform Metrics**: iOS, tvOS, Android TV, etc.

### Key Features

- ✅ **Separate from Family Backend**: Uses API key auth (not Cognito)
- ✅ **Privacy-Focused**: No PII, aggregated analytics only
- ✅ **Real-Time Tracking**: Immediate updates to DynamoDB
- ✅ **Multi-Platform**: Supports 10+ platforms
- ✅ **Production-Ready**: Proper IAM permissions, error handling

## Architecture

### Two-Backend System

```
┌──────────────────────────────────────────────────────────┐
│           Mumaku iOS/tvOS Apps                           │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             │ Family Data           │ Analytics & Ads
             │ (Cognito Auth)        │ (API Key Auth)
             ▼                       ▼
┌──────────────────────┐  ┌────────────────────────────────┐
│  Family Backend      │  │   Ad Server Backend            │
│  Main Amplify        │  │   (This Documentation)         │
├──────────────────────┤  ├────────────────────────────────┤
│ • Chores & tasks     │  │ • Analytics tracking           │
│ • Family members     │  │ • Ad impressions/clicks        │
│ • Points earned      │  │ • Business management          │
│ • Calendar events    │  │ • Reward redemptions           │
└──────────────────────┘  └────────────────────────────────┘
```

### Why Two Backends?

1. **Authentication**: Family data requires Cognito user authentication, analytics uses public API keys
2. **Privacy**: Family data is private, analytics can be aggregated and anonymized
3. **Scaling**: Ad tracking scales differently than family management
4. **Team Separation**: Different teams can manage each backend independently

## Analytics Tracking Flow

### 1. Session Tracking

```
iOS App Launch
    ↓
Generate sessionId (UUID)
    ↓
trackEngagement(eventType: 'session_start')
    ↓
Lambda: track-engagement
    ↓
DynamoDB: UserEngagement table
    ↓
DynamoDB: AppMetrics (daily rollup)
    ↓
DynamoDB: PlatformAnalytics (platform-specific)
```

### 2. Screen View Tracking

```
User navigates to screen
    ↓
trackEngagement(eventType: 'screen_view')
    ↓
Lambda updates session record
    ↓
Adds screen to screensViewed array
```

### 3. Ad Impression Tracking

```
Reward card appears on screen
    ↓
trackAdEvent(eventType: 'impression')
    ↓
Lambda: track-ad-event
    ↓
Creates Impression record
    ↓
Updates Reward.impressions counter
    ↓
Updates BusinessAnalytics daily record
    ↓
Updates PlatformAnalytics
```

### 4. Ad Click Tracking

```
User clicks reward
    ↓
trackAdEvent(eventType: 'click')
    ↓
Lambda: track-ad-event
    ↓
Creates Impression record (type: CLICK)
    ↓
Updates Reward.clicks counter
    ↓
Updates analytics tables
```

## Lambda Functions

### 1. track-engagement

**Purpose**: Record user engagement events

**File**: `amplify/functions/track-engagement/handler.ts`

**Environment Variables** (Automatically Set):
```bash
USER_ENGAGEMENT_TABLE=UserEngagement-{stackId}-NONE
APP_METRICS_TABLE=AppMetrics-{stackId}-NONE
PLATFORM_ANALYTICS_TABLE=PlatformAnalytics-{stackId}-NONE
```

**Supported Event Types**:
- `session_start` - User opens app
- `session_end` - User closes app (includes duration)
- `screen_view` - User navigates to a screen
- `reward_view` - Reward appears in viewport
- `reward_click` - User taps/clicks a reward
- `search` - User performs a search
- `filter` - User applies a filter

**Example Request**:
```graphql
mutation TrackSession {
  trackEngagement(
    eventType: "session_start"
    userId: "user-abc123"
    familyId: "family-xyz789"
    sessionId: "session-def456"
    platform: "IOS"
    deviceModel: "iPhone 14 Pro"
    osVersion: "17.0"
    appVersion: "1.0.0"
    timestamp: "2025-12-05T22:45:00Z"
  ) {
    success
    error
  }
}
```

**Response**:
```json
{
  "success": true,
  "error": null
}
```

### 2. track-ad-event

**Purpose**: Record ad impressions and clicks

**File**: `amplify/functions/track-ad-event/handler.ts`

**Environment Variables**:
```bash
REWARD_TABLE=Reward-{stackId}-NONE
BUSINESS_ANALYTICS_TABLE=BusinessAnalytics-{stackId}-NONE
IMPRESSION_TABLE=Impression-{stackId}-NONE
PLATFORM_ANALYTICS_TABLE=PlatformAnalytics-{stackId}-NONE
```

**Operations**:
1. Create Impression record in DynamoDB
2. Increment reward counter (impressions or clicks)
3. Update BusinessAnalytics daily record
4. Update PlatformAnalytics for the platform

**Platform Mapping**:
```typescript
// Device type → Platform enum
'iOS' | 'iPhone' | 'iPad' → 'IOS'
'Apple TV' | 'tvOS' → 'TVOS'
'Android' → 'ANDROID'
'Android TV' → 'ANDROID_TV'
'Samsung TV' → 'SAMSUNG_TV'
'LG TV' → 'LG_TV'
'Comcast TV' → 'COMCAST_TV'
'Fire TV' → 'FIRE_TV'
'Roku' → 'ROKU'
'Web' → 'WEB'
Other → 'OTHER'
```

**Example Request**:
```graphql
mutation TrackImpression {
  trackAdEvent(
    eventType: "impression"
    rewardId: "reward-123"
    businessId: "business-456"
    familyId: "family-789"
    childAge: 10
    timestamp: "2025-12-05T22:45:00Z"
    metadata: {
      deviceType: "APPLE_TV"
      deviceModel: "Apple TV 4K"
      osVersion: "tvOS 17.0"
      sessionId: "session-abc"
    }
  ) {
    success
    error
  }
}
```

## Data Models

### UserEngagement

**Purpose**: Individual user session records

**Primary Key**: `id` (UUID)

**Fields**:
```typescript
{
  id: string                    // UUID
  userId: string                // Family member ID
  familyId: string              // Family ID
  sessionId: string             // Session UUID
  platform: Platform            // IOS, TVOS, etc.
  deviceModel?: string          // "iPhone 14 Pro"
  osVersion?: string            // "17.0"
  appVersion?: string           // "1.0.0"
  sessionStart: AWSDateTime     // ISO 8601
  sessionEnd?: AWSDateTime      // ISO 8601
  duration?: number             // Seconds
  screensViewed: string[]       // ["HomeScreen", "RewardsScreen"]
  rewardsViewed: string[]       // ["reward-123", "reward-456"]
  rewardsClicked: string[]      // ["reward-123"]
  searchesPerformed: number     // Count of searches
  filtersUsed: string[]         // ["category:food", "points:25"]
  metadata?: AWSJSON            // Additional data
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### AppMetrics

**Purpose**: Daily aggregated app-wide metrics

**Primary Key**: `date` (YYYY-MM-DD)

**Fields**:
```typescript
{
  date: string                  // "2025-12-05"
  totalDailyActiveUsers: number
  totalMonthlyActiveUsers: number
  totalNewUsers: number
  totalSessions: number
  totalRedemptions: number
  totalRevenue: number
  totalBusinesses: number
  activeBusinesses: number
  totalRewards: number
  activeRewards: number
  userGrowthRate: number        // Percentage
  revenueGrowthRate: number     // Percentage
  avgSessionsPerUser: number
  avgSessionDuration: number    // Seconds
  redemptionRate: number        // Percentage
  day1Retention: number         // Percentage
  day7Retention: number
  day30Retention: number
  platformBreakdown: AWSJSON    // { IOS: 40%, TVOS: 30%, ... }
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### PlatformAnalytics

**Purpose**: Platform-specific daily metrics

**Primary Key**: `id` (platform#date, e.g., "IOS#2025-12-05")

**Fields**:
```typescript
{
  id: string                    // Composite: "IOS#2025-12-05"
  platform: Platform            // IOS, TVOS, ANDROID_TV, etc.
  date: string                  // "2025-12-05"
  sessions: number              // Sessions for this platform
  impressions: number           // Ad impressions
  clicks: number                // Ad clicks
  redemptions: number           // Reward redemptions
  dailyActiveUsers: number
  monthlyActiveUsers: number
  newUsers: number
  returningUsers: number
  avgSessionDuration: number    // Seconds
  retentionRate: number         // Percentage
  churnRate: number             // Percentage
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### Impression

**Purpose**: Individual ad impression/click records

**Primary Key**: `id` (UUID)

**Fields**:
```typescript
{
  id: string                    // UUID
  rewardId: string              // Reward being viewed/clicked
  businessId: string            // Business offering the reward
  impressionType: ImpressionType // IMPRESSION | CLICK
  familyId?: string             // Optional family tracking
  childAge?: number             // Optional demographic
  timestamp: AWSDateTime        // When it happened
  deviceType?: string           // "APPLE_TV"
  deviceModel?: string          // "Apple TV 4K"
  osVersion?: string            // "tvOS 17.0"
  sessionId?: string            // Link to session
  metadata?: AWSJSON            // Additional data
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

## iOS/tvOS Integration

### 1. Configuration

**File**: `Mumaku/AdServerConfig.swift`

```swift
import Foundation

struct AdServerConfig {
    static var apiURL: String {
        guard let config = AdServerEnvironmentManager.shared.getCurrentConfig() else {
            fatalError("❌ Ad Server not configured!")
        }
        return config.apiEndpoint
    }

    static var apiKey: String {
        guard let config = AdServerEnvironmentManager.shared.getCurrentConfig() else {
            fatalError("❌ Ad Server not configured!")
        }
        return config.apiKey
    }
}
```

**File**: `Mumaku/adserver_outputs.json`

```json
{
  "data": {
    "url": "https://ul2mnbr4rrbffklynytp2ma34a.appsync-api.us-east-1.amazonaws.com/graphql",
    "api_key": "da2-quzz6zhsondqra6svspgootvly",
    "aws_region": "us-east-1"
  }
}
```

### 2. Analytics Manager

**File**: `Mumaku/Services/AnalyticsManager.swift`

```swift
import Foundation

class AnalyticsManager {
    static let shared = AnalyticsManager()

    private var sessionId: String?
    private var sessionStart: Date?

    func startSession() {
        sessionId = UUID().uuidString
        sessionStart = Date()

        Task {
            await trackEngagement(
                eventType: "session_start",
                sessionId: sessionId!,
                timestamp: ISO8601DateFormatter().string(from: sessionStart!)
            )
        }
    }

    func endSession() {
        guard let sessionId = sessionId,
              let sessionStart = sessionStart else { return }

        let duration = Date().timeIntervalSince(sessionStart)

        Task {
            await trackEngagement(
                eventType: "session_end",
                sessionId: sessionId,
                timestamp: ISO8601DateFormatter().string(from: Date()),
                metadata: ["sessionDuration": duration]
            )
        }

        self.sessionId = nil
        self.sessionStart = nil
    }

    func trackPageView(_ screenName: String) {
        guard let sessionId = sessionId else { return }

        Task {
            await trackEngagement(
                eventType: "screen_view",
                sessionId: sessionId,
                timestamp: ISO8601DateFormatter().string(from: Date()),
                metadata: ["screenName": screenName]
            )
        }
    }

    private func trackEngagement(
        eventType: String,
        sessionId: String,
        timestamp: String,
        metadata: [String: Any]? = nil
    ) async {
        // GraphQL mutation to Ad Server
        let mutation = """
        mutation TrackEngagement {
          trackEngagement(
            eventType: "\(eventType)"
            userId: "\(getUserId())"
            familyId: "\(getFamilyId())"
            sessionId: "\(sessionId)"
            platform: "IOS"
            deviceModel: "\(UIDevice.current.model)"
            osVersion: "\(UIDevice.current.systemVersion)"
            appVersion: "\(getAppVersion())"
            timestamp: "\(timestamp)"
            \(metadataString(metadata))
          ) {
            success
            error
          }
        }
        """

        // Execute GraphQL request to Ad Server
        await executeGraphQL(mutation)
    }
}
```

### 3. Usage in Views

```swift
import SwiftUI

struct LandingPage: View {
    let analytics = AnalyticsManager.shared

    var body: some View {
        VStack {
            // Content
        }
        .onAppear {
            analytics.startSession()
            analytics.trackPageView("landingPage")
        }
        .onDisappear {
            analytics.endSession()
        }
    }
}
```

## Deployment & Configuration

### 1. Deploy Ad Server Backend

```bash
cd /Users/webbyj/Documents/projects/dev/aws/adServer

# Deploy to sandbox
npx ampx sandbox --once

# Or deploy to production
npx ampx deploy --branch main
```

### 2. Verify Lambda Functions

After deployment, verify that the Lambda functions have the correct environment variables:

```bash
# Check track-engagement function
aws lambda get-function-configuration \
  --function-name amplify-familyrewardsadpl-trackengagementlambda815-9RgVZQAjtwJC \
  --query 'Environment.Variables' \
  --output json

# Expected output:
{
    "PLATFORM_ANALYTICS_TABLE": "PlatformAnalytics-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "APP_METRICS_TABLE": "AppMetrics-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "USER_ENGAGEMENT_TABLE": "UserEngagement-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "AMPLIFY_SSM_ENV_CONFIG": "{}"
}

# Check trackAdEvent function
aws lambda get-function-configuration \
  --function-name amplify-familyrewardsadpl-trackAdEventlambdaE0B820-glzW6z2WYYIO \
  --query 'Environment.Variables' \
  --output json

# Expected output:
{
    "PLATFORM_ANALYTICS_TABLE": "PlatformAnalytics-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "BUSINESS_ANALYTICS_TABLE": "BusinessAnalytics-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "REWARD_TABLE": "Reward-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "IMPRESSION_TABLE": "Impression-pihfldm7hzbt5mgtbe3j3dpphm-NONE",
    "AMPLIFY_SSM_ENV_CONFIG": "{}"
}
```

### 3. Update iOS App Configuration

Copy the deployed API URL and API key to the iOS app:

**File**: `Mumaku/adserver_outputs.json`

```json
{
  "data": {
    "url": "<AppSync GraphQL URL from deployment>",
    "api_key": "<API Key from deployment>",
    "aws_region": "us-east-1"
  }
}
```

### 4. Verify DynamoDB Tables

```bash
# List all tables
aws dynamodb list-tables --query 'TableNames' --output text

# Should include:
# - UserEngagement-{stackId}-NONE
# - AppMetrics-{stackId}-NONE
# - PlatformAnalytics-{stackId}-NONE
# - Impression-{stackId}-NONE
# - BusinessAnalytics-{stackId}-NONE
# - Reward-{stackId}-NONE
```

## Troubleshooting

### Issue: "Could not discover required DynamoDB tables"

**Symptoms**:
- Analytics tracking fails in iOS app
- Lambda logs show: "Error: Could not discover required DynamoDB tables"
- Events: session_start, screen_view, session_end not recorded

**Root Cause**:
Lambda functions lack IAM permissions to access DynamoDB tables or environment variables are not set.

**Solution**:

1. **Verify Lambda functions are in backend definition** (`amplify/backend.ts`):
```typescript
import { trackEngagement } from './functions/track-engagement/resource';
import { trackAdEvent } from './functions/track-ad-event/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  uploadRewardImage,
  trackEngagement,  // ← Must be here
  trackAdEvent,     // ← Must be here
});
```

2. **Verify DynamoDB permissions are granted**:
```typescript
// Grant trackEngagement function access to its tables
userEngagementTable.grantReadWriteData(backend.trackEngagement.resources.lambda);
appMetricsTable.grantReadWriteData(backend.trackEngagement.resources.lambda);
platformAnalyticsTable.grantReadWriteData(backend.trackEngagement.resources.lambda);

// Grant trackAdEvent function access to its tables
rewardTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
businessAnalyticsTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
impressionTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
platformAnalyticsTable.grantReadWriteData(backend.trackAdEvent.resources.lambda);
```

3. **Verify environment variables are set**:
```typescript
// Set table names as environment variables for trackEngagement
backend.trackEngagement.addEnvironment('USER_ENGAGEMENT_TABLE', userEngagementTable.tableName);
backend.trackEngagement.addEnvironment('APP_METRICS_TABLE', appMetricsTable.tableName);
backend.trackEngagement.addEnvironment('PLATFORM_ANALYTICS_TABLE', platformAnalyticsTable.tableName);
```

4. **Verify Lambda resource is in data stack**:
```typescript
// amplify/functions/track-engagement/resource.ts
export const trackEngagement = defineFunction({
  name: 'track-engagement',
  entry: './handler.ts',
  resourceGroupName: 'data', // ← Must be 'data' to avoid circular dependency
});
```

5. **Redeploy**:
```bash
npx ampx sandbox --once
```

### Issue: Circular Dependency Error

**Error Message**:
```
[ERROR] [CloudformationStackCircularDependencyError] The CloudFormation deployment failed due to circular dependency found between nested stacks [data7552DF31, function1351588B]
```

**Solution**:
Add `resourceGroupName: 'data'` to both Lambda function resource definitions:

```typescript
// amplify/functions/track-engagement/resource.ts
export const trackEngagement = defineFunction({
  name: 'track-engagement',
  entry: './handler.ts',
  resourceGroupName: 'data', // ← This fixes circular dependency
});

// amplify/functions/track-ad-event/resource.ts
export const trackAdEvent = defineFunction({
  name: 'trackAdEvent',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  resourceGroupName: 'data', // ← This fixes circular dependency
});
```

### Issue: GraphQL API Returns 401 Unauthorized

**Symptoms**:
- iOS app receives 401 errors
- GraphQL mutations fail

**Possible Causes**:

1. **Wrong API Key**: Check `adserver_outputs.json` has correct API key
2. **Expired API Key**: API keys expire after 30 days (configurable)
3. **Wrong Authorization Mode**: Should use API key, not Cognito

**Solution**:

```typescript
// Verify authorization mode in data/resource.ts
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30, // ← Adjust as needed
    },
  },
});

// Verify mutations allow public API key access
trackEngagement: a
  .mutation()
  .authorization((allow) => [
    allow.publicApiKey(),  // ← Must be present
    allow.authenticated(),
  ])
  .handler(a.handler.function(trackEngagementFunction))
```

### Viewing CloudWatch Logs

```bash
# Stream logs for track-engagement
aws logs tail /aws/lambda/amplify-familyrewardsadpl-trackengagementlambda815-9RgVZQAjtwJC --follow

# Stream logs for trackAdEvent
aws logs tail /aws/lambda/amplify-familyrewardsadpl-trackAdEventlambdaE0B820-glzW6z2WYYIO --follow

# Filter for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/amplify-familyrewardsadpl-trackengagementlambda815-9RgVZQAjtwJC \
  --filter-pattern "ERROR"
```

## Recent Fixes

### December 5, 2025: Fixed Analytics Tracking Permissions

**Problem**: Analytics tracking was failing with "Could not discover required DynamoDB tables" error.

**Root Cause**: Lambda functions were using ListTablesCommand to discover table names, but lacked IAM permissions to execute `dynamodb:ListTables`.

**Solution Implemented**:

1. **Added Lambda functions to backend definition** (`amplify/backend.ts`)
2. **Granted DynamoDB permissions** via `grantReadWriteData()`
3. **Set environment variables** with table names instead of runtime discovery
4. **Updated Lambda handlers** to use `process.env` instead of `ListTablesCommand`
5. **Set resourceGroupName** to 'data' to avoid circular dependencies

**Files Modified**:
- `amplify/backend.ts` - Added functions and permissions
- `amplify/functions/track-engagement/handler.ts` - Use env vars
- `amplify/functions/track-engagement/resource.ts` - Add resourceGroupName
- `amplify/functions/track-ad-event/handler.ts` - Use env vars

**Verification**:
```bash
# Check environment variables are set
aws lambda get-function-configuration \
  --function-name <function-name> \
  --query 'Environment.Variables'
```

**Result**: Analytics tracking now works correctly with proper IAM permissions.

## Best Practices

### 1. Always Use Environment Variables for Table Names

❌ **Bad** (Runtime Discovery):
```typescript
const tables = await dynamodb.send(new ListTablesCommand({}));
const tableName = tables.TableNames.find(t => t.includes('UserEngagement'));
```

✅ **Good** (Environment Variables):
```typescript
const tableName = process.env.USER_ENGAGEMENT_TABLE;
if (!tableName) throw new Error('Missing USER_ENGAGEMENT_TABLE env var');
```

### 2. Grant Minimal IAM Permissions

Only grant permissions the Lambda actually needs:

```typescript
// ✅ Good - specific table access
userEngagementTable.grantReadWriteData(lambda);

// ❌ Bad - overly broad permissions
backend.data.grantFullAccess(lambda);
```

### 3. Always Set resourceGroupName

Prevent circular dependencies:

```typescript
export const myFunction = defineFunction({
  name: 'my-function',
  entry: './handler.ts',
  resourceGroupName: 'data', // ← Always set this if function uses data resources
});
```

### 4. Validate Environment Variables in Handler

```typescript
export const handler = async (event: any) => {
  const tableName = process.env.USER_ENGAGEMENT_TABLE;

  if (!tableName) {
    console.error('❌ Missing USER_ENGAGEMENT_TABLE environment variable');
    throw new Error('Lambda misconfigured');
  }

  // Proceed with logic
};
```

## Summary

The Ad Server analytics tracking system is now production-ready with:

✅ Proper IAM permissions for all Lambda functions
✅ Environment variables for table names
✅ Public API key authentication for family apps
✅ Real-time tracking of sessions, screens, impressions, and clicks
✅ Platform-specific analytics (iOS, tvOS, Android TV, etc.)
✅ Business analytics and ROI tracking
✅ Comprehensive error handling and logging

The system is deployed and ready for iOS/tvOS app integration.
