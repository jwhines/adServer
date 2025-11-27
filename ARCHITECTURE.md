
# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APPS                              │
│                    (iOS & tvOS - Swift)                          │
│                                                                   │
│  • Browse rewards by location                                    │
│  • Redeem points for rewards                                     │
│  • View redemption codes                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ GraphQL Queries/Mutations
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    AWS AppSync (GraphQL API)                     │
│                                                                   │
│  • getRewardsForFamily (query)                                   │
│  • redeemReward (mutation)                                       │
│  • trackAdEvent (mutation)                                       │
│  • uploadRewardImage (mutation)                                  │
│  • getBusinessAnalytics (query)                                  │
└────────┬─────────────────────────┬──────────────────────────────┘
         │                         │
         │                         │
         ├─────────────────────────┼──────────────────┐
         │                         │                  │
         ▼                         ▼                  ▼
┌────────────────┐     ┌──────────────────┐  ┌───────────────────┐
│   Lambda       │     │   Lambda         │  │   Lambda          │
│   Functions    │     │   Functions      │  │   Functions       │
│   (5 total)    │     │                  │  │                   │
│                │     │                  │  │                   │
│ • Get Rewards  │     │ • Redeem Reward  │  │ • Track Events    │
│ • Analytics    │     │ • Upload Image   │  │                   │
└───────┬────────┘     └─────────┬────────┘  └──────────┬────────┘
        │                        │                       │
        │                        │                       │
        ▼                        ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                      Amazon DynamoDB                            │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │  Business   │  │   Reward    │  │  RewardRedemption    │   │
│  │   Table     │  │   Table     │  │      Table           │   │
│  └─────────────┘  └─────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │  BusinessAnalytics   │                                       │
│  │       Table          │                                       │
│  └──────────────────────┘                                       │
└────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   Amazon S3      │
                         │                  │
                         │ • Reward images  │
                         │ • Business logos │
                         └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS PORTAL (Web)                         │
│                   Vue 3 + TypeScript + Tailwind                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Rewards    │  │  Analytics   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Redemptions  │  │   Profile    │  │    Admin     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ AWS Amplify SDK
                         │
                         ▼
            ┌────────────────────────┐
            │  Amazon Cognito        │
            │  (Authentication)      │
            │                        │
            │ • Email/Password       │
            │ • User Groups          │
            │ • Email Verification   │
            └────────────────────────┘
```

## Data Flow Diagrams

### 1. Business Registration Flow

```
Business Owner
    │
    ├─> Visits business-portal.com
    │
    ├─> Clicks "Register"
    │
    ├─> Fills registration form
    │       ├─ Business name
    │       ├─ Email
    │       ├─ Password
    │       └─ Contact info
    │
    ├─> Cognito creates user
    │
    ├─> Sends verification email
    │
    ├─> User enters verification code
    │
    ├─> Cognito confirms user
    │
    ├─> User logs in
    │
    ├─> Creates Business record in DynamoDB
    │       └─ Status: PENDING
    │
    └─> Admin reviews and approves
            └─ Status: APPROVED ✅
```

### 2. Reward Creation Flow

```
Business Owner (Logged In)
    │
    ├─> Navigates to Create Reward
    │
    ├─> Fills 7-step wizard
    │       ├─ Step 1: Basic info (title, description)
    │       ├─ Step 2: Pricing (point cost)
    │       ├─ Step 3: Upload image
    │       │       └─> uploadRewardImage Lambda
    │       │               └─> S3 bucket
    │       ├─ Step 4: Targeting (age, radius)
    │       ├─ Step 5: Inventory (limits, dates)
    │       ├─ Step 6: Redemption (type, instructions)
    │       └─ Step 7: Preview & submit
    │
    ├─> GraphQL mutation: createReward
    │
    ├─> DynamoDB: Create Reward record
    │       └─ Status: PENDING_APPROVAL
    │
    └─> Admin reviews and approves
            └─ Status: ACTIVE ✅
```

### 3. Reward Redemption Flow

```
Family (Mobile App)
    │
    ├─> Queries getRewardsForFamily
    │       └─ Filters by location, child age
    │
    ├─> Lambda: get-rewards-for-family
    │       ├─ Calculates distances
    │       ├─ Filters by availability
    │       └─ Returns sorted list
    │
    ├─> Family views rewards
    │
    ├─> Child selects reward
    │
    ├─> Mutation: redeemReward
    │       └─ Passes: rewardId, familyId, childId, points
    │
    ├─> Lambda: redeem-reward
    │       ├─ Validates availability
    │       ├─ Checks points balance
    │       ├─ Generates 8-char code
    │       ├─ Creates RewardRedemption record
    │       ├─ Updates Reward.currentRedemptions++
    │       └─ Updates BusinessAnalytics
    │
    ├─> Returns redemption code
    │
    ├─> Family presents code to business
    │
    └─> Business marks as REDEEMED ✅
```

### 4. Analytics Tracking Flow

```
Mobile App
    │
    ├─> User views reward (impression)
    │       └─> Mutation: trackAdEvent
    │               └─> Lambda: track-ad-event
    │                       ├─ Reward.impressions++
    │                       └─ BusinessAnalytics.impressions++
    │
    └─> User clicks reward (click)
            └─> Mutation: trackAdEvent
                    └─> Lambda: track-ad-event
                            ├─ Reward.clicks++
                            └─ BusinessAnalytics.clicks++

Business Portal
    │
    └─> Views Analytics Dashboard
            └─> Query: getBusinessAnalytics
                    └─> Lambda: get-business-analytics
                            ├─ Aggregates by date range
                            ├─ Calculates ROI
                            └─ Returns timeline + summary
```

## Technology Stack Details

### Backend Infrastructure

```
AWS Amplify Gen 2
├── Authentication
│   └── Amazon Cognito
│       ├── User Pool
│       ├── User Groups (BUSINESS_OWNER, PLATFORM_ADMIN)
│       └── Email verification
│
├── API
│   └── AWS AppSync (GraphQL)
│       ├── Schema with 4 models
│       ├── 5 custom queries/mutations
│       └── JWT authorization
│
├── Compute
│   └── AWS Lambda (Node.js 18)
│       ├── get-rewards-for-family (512MB, 30s timeout)
│       ├── redeem-reward (512MB, 30s timeout)
│       ├── upload-reward-image (1024MB, 60s timeout)
│       ├── get-business-analytics (512MB, 30s timeout)
│       └── track-ad-event (256MB, 15s timeout)
│
├── Database
│   └── Amazon DynamoDB
│       ├── Business table (owner-based access)
│       ├── Reward table (owner-based access)
│       ├── RewardRedemption table (authenticated access)
│       └── BusinessAnalytics table (owner-based access)
│
└── Storage
    └── Amazon S3
        ├── rewards/ (reward images)
        ├── businesses/ (business logos)
        └── CloudFront CDN (future)
```

### Frontend Architecture

```
Vue.js Business Portal
├── Build Tool
│   └── Vite (fast dev server, HMR)
│
├── Framework
│   └── Vue 3
│       ├── Composition API
│       ├── <script setup>
│       └── TypeScript
│
├── Styling
│   └── Tailwind CSS
│       ├── Custom color palette
│       ├── Utility classes
│       └── Responsive design
│
├── State Management
│   └── Pinia
│       ├── Auth store
│       ├── Business store
│       └── Rewards store
│
├── Routing
│   └── Vue Router
│       ├── Protected routes
│       ├── Admin routes
│       └── Lazy loading
│
└── AWS Integration
    └── Amplify JavaScript SDK
        ├── Auth (Cognito)
        ├── API (GraphQL)
        └── Storage (S3)
```

## Security Architecture

```
Security Layers
├── Transport Security
│   └── HTTPS/TLS everywhere
│
├── Authentication
│   └── Amazon Cognito
│       ├── JWT tokens (1 hour expiry)
│       ├── Refresh tokens
│       └── Email verification required
│
├── Authorization
│   └── Multi-level
│       ├── AppSync (API level)
│       │   └── JWT validation
│       ├── DynamoDB (row level)
│       │   ├── Owner-based access
│       │   └── Group-based access
│       └── S3 (object level)
│           └── Authenticated upload only
│
├── Input Validation
│   ├── Frontend (TypeScript types)
│   ├── GraphQL (schema validation)
│   └── Lambda (runtime checks)
│
└── Data Protection
    ├── Family data (minimal collection)
    ├── City/zip only (no precise location)
    └── No credit cards stored
```

## Scalability Architecture

```
Scalability Features
├── Serverless Compute
│   └── Lambda (auto-scales to 1000s concurrent)
│
├── Database
│   └── DynamoDB
│       ├── On-demand billing (auto-scales)
│       ├── Global secondary indexes
│       └── Point-in-time recovery
│
├── Storage
│   └── S3
│       ├── 99.999999999% durability
│       ├── Unlimited storage
│       └── CloudFront CDN ready
│
├── API
│   └── AppSync
│       ├── Managed GraphQL
│       └── Auto-scales
│
└── Monitoring
    └── CloudWatch
        ├── Lambda logs
        ├── API metrics
        └── Alarms (future)
```

## Cost Optimization

```
Cost-Effective Design
├── Cognito: Free tier (50K MAU)
├── DynamoDB: On-demand (pay per request)
├── Lambda: Pay per invocation (1M free/month)
├── S3: Pay per GB stored (~$0.023/GB)
├── AppSync: Pay per query (~$4/1M queries)
└── Total: ~$60-80/month for 1000 businesses
```

## Monitoring & Observability

```
Monitoring Stack (Future)
├── CloudWatch Logs
│   ├── Lambda execution logs
│   ├── API Gateway logs
│   └── Error tracking
│
├── CloudWatch Metrics
│   ├── Lambda duration
│   ├── API latency
│   ├── DynamoDB throttles
│   └── S3 request counts
│
├── CloudWatch Alarms
│   ├── Error rate > 5%
│   ├── Lambda duration > 10s
│   └── Cost > $100/month
│
└── X-Ray (Distributed Tracing)
    ├── End-to-end request flow
    └── Performance bottlenecks
```

## Disaster Recovery

```
DR Strategy
├── Backups
│   ├── DynamoDB: Point-in-time recovery (35 days)
│   ├── S3: Versioning enabled
│   └── Cognito: User export scripts
│
├── Multi-Region (Future)
│   ├── DynamoDB global tables
│   ├── S3 cross-region replication
│   └── CloudFront distribution
│
└── RTO/RPO
    ├── RTO: < 4 hours (manual restore)
    └── RPO: < 1 hour (continuous backup)
```

## Development Environments

```
Environments
├── Local Development
│   ├── Amplify Sandbox
│   ├── Local DynamoDB
│   └── Vite dev server
│
├── Staging
│   └── ampx deploy --branch staging
│
└── Production
    └── ampx deploy --branch main
```

---

This architecture is designed for:
- ✅ **Scalability**: Handles 1000s of businesses
- ✅ **Security**: Enterprise-grade auth and authorization
- ✅ **Cost-efficiency**: Pay only for what you use
- ✅ **Maintainability**: Serverless, managed services
- ✅ **Performance**: Sub-second API responses
- ✅ **Reliability**: 99.99% uptime SLA
