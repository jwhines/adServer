import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { trackAdEvent as trackAdEventFunction } from '../functions/track-ad-event/resource';
import { trackAffiliateClick as trackAffiliateClickFunction } from '../functions/track-affiliate-click/resource';
import { redeemReward as redeemRewardFunction } from '../functions/redeem-reward/resource';
import { verifyRedemption as verifyRedemptionFunction } from '../functions/verify-redemption/resource';
import { getBusinessAnalytics as getBusinessAnalyticsFunction } from '../functions/get-business-analytics/resource';
import { getRewardsForFamily as getRewardsForFamilyFunction } from '../functions/get-rewards-for-family/resource';
import { trackEngagement as trackEngagementFunction } from '../functions/track-engagement/resource';
import { getInvestorMetrics as getInvestorMetricsFunction } from '../functions/get-investor-metrics/resource';

/**
 * Family Rewards Ad Platform - GraphQL Schema
 *
 * Data Models:
 * - Business: Local Durham businesses offering rewards
 * - Reward: Reward campaigns created by businesses
 * - RewardRedemption: Records when families redeem rewards
 * - BusinessAnalytics: Aggregated analytics data by date
 */
const schema = a.schema({
  // ============================================================================
  // BUSINESS MODEL
  // ============================================================================
  Business: a
    .model({
      // Basic Information
      name: a.string().required(),
      description: a.string(),
      businessType: a.enum([
        'RESTAURANT',
        'ENTERTAINMENT',
        'RETAIL',
        'SERVICES',
        'EDUCATION',
        'SPORTS_RECREATION',
        'OTHER',
      ]),

      // Location
      address: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      zipCode: a.string().required(),
      latitude: a.float(),
      longitude: a.float(),
      serviceRadius: a.float(), // miles

      // Contact
      phone: a.string(),
      email: a.email().required(),
      website: a.url(),

      // Media
      logoUrl: a.string(),
      logoKey: a.string(), // S3 key

      // Status
      isActive: a.boolean().default(true),
      isVerified: a.boolean().default(false),
      verificationStatus: a.enum(['PENDING', 'APPROVED', 'REJECTED']),
      rejectionReason: a.string(),

      // Billing
      billingType: a.enum(['CPM', 'CPC', 'MONTHLY_RETAINER']),
      monthlyBudget: a.float(),
      cpmRate: a.float(),
      currentSpend: a.float().default(0),

      // Relationships
      rewards: a.hasMany('Reward', 'businessId'),
      owner: a.string().required(), // Cognito user ID
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('PLATFORM_ADMIN'),
      allow.publicApiKey().to(['read']), // Allow public read access for family apps to see business details
    ]),

  // ============================================================================
  // REWARD MODEL
  // ============================================================================
  Reward: a
    .model({
      // NEW: Source of reward (distinguishes local business from affiliate)
      rewardSource: a.enum(['LOCAL_BUSINESS', 'AFFILIATE_LINK', 'PLATFORM_REWARD']),

      // Relationships (now optional - only required for LOCAL_BUSINESS)
      businessId: a.id(), // Optional for affiliate rewards
      business: a.belongsTo('Business', 'businessId'),

      // Content
      title: a.string().required(),
      description: a.string().required(),
      termsAndConditions: a.string(),

      // Media
      imageUrl: a.string(),
      imageKey: a.string(), // S3 key

      // Pricing
      pointCost: a.integer().required(),
      retailValue: a.float(), // Actual dollar value

      // Categorization
      rewardType: a.enum([
        'PHYSICAL_ITEM',
        'EXPERIENCE',
        'SERVICE',
        'FOOD',
        'FAMILY_ACTIVITY',
        'DIGITAL_CONTENT',
      ]),
      category: a.enum([
        'ENTERTAINMENT',
        'EDUCATION',
        'FOOD',
        'SPORTS',
        'ARTS_CRAFTS',
        'TECHNOLOGY',
        'FAMILY_ACTIVITY',
      ]),

      // NEW: Affiliate-specific fields
      affiliateNetwork: a.enum(['AMAZON', 'TARGET', 'WALMART', 'RAKUTEN', 'SHAREASALE', 'CJ', 'CUSTOM']),
      affiliateLink: a.url(), // Base affiliate URL
      affiliateMerchant: a.string(), // Display name: "Amazon", "Target", etc.
      commissionRate: a.float(), // e.g., 0.08 for 8%

      // Affiliate analytics (NEW)
      affiliateClickCount: a.integer().default(0),
      affiliateConversionCount: a.integer().default(0), // Actual purchases
      affiliateRevenue: a.float().default(0), // Total order value from conversions
      affiliateCommissionEarned: a.float().default(0), // Our commission

      // Targeting (stored as JSON strings)
      targetAgeRanges: a.string().array(), // ["6-8", "9-12", "13-15", "16-18"]
      targetFamilySizes: a.integer().array(), // [3, 4, 5]
      availableRadius: a.float(), // miles from business (not used for affiliates)

      // Inventory
      totalAvailable: a.integer(), // null = unlimited
      currentRedemptions: a.integer().default(0),
      dailyLimit: a.integer(), // max redemptions per day

      // Schedule
      startDate: a.date().required(),
      endDate: a.date(),
      daysOfWeek: a.string().array(), // ["monday", "tuesday", ...]

      // Status
      isActive: a.boolean().default(true),
      status: a.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED']),

      // Analytics
      impressions: a.integer().default(0),
      clicks: a.integer().default(0),
      redemptions: a.integer().default(0),

      // Redemption (updated to include affiliate)
      redemptionType: a.enum(['CODE', 'IN_STORE', 'ONLINE', 'QR_CODE', 'AFFILIATE_CLICK']),
      redemptionInstructions: a.string(),

      // Relationships
      redemptionRecords: a.hasMany('RewardRedemption', 'rewardId'),
      affiliateClicks: a.hasMany('AffiliateClick', 'rewardId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('PLATFORM_ADMIN'),
      allow.publicApiKey().to(['read']), // Allow public read access for family apps
    ]),

  // ============================================================================
  // POINTS TRANSACTION MODEL
  // ============================================================================
  PointsTransaction: a
    .model({
      // Family member who earned/spent points
      userId: a.string().required(), // Family member ID from family app
      familyId: a.string().required(),
      userName: a.string(), // Cache of family member name for display

      // Transaction details
      type: a.enum(['EARNED', 'SPENT', 'ADJUSTED']),
      amount: a.integer().required(), // Positive for earned, negative for spent
      balance: a.integer(), // Running balance after this transaction

      // Source tracking
      sourceType: a.enum(['JOB', 'REWARD_REDEMPTION', 'SCHOOL', 'ADMIN_ADJUSTMENT']),
      sourceId: a.string(), // jobId, rewardRedemptionId, etc
      sourceDescription: a.string(),

      // Redemption linking (for SPENT transactions)
      redemptionId: a.string(), // Links to RewardRedemption
      isUsedForRedemption: a.boolean().default(false),

      // Metadata
      description: a.string(),
      metadata: a.json(),
      timestamp: a.datetime().required(),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['timestamp']).queryField('transactionsByUser'),
      index('familyId').sortKeys(['timestamp']).queryField('transactionsByFamily'),
    ])
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'read']), // Allow family app to create/read
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // REWARD REDEMPTION MODEL
  // ============================================================================
  RewardRedemption: a
    .model({
      // Relationships
      rewardId: a.id().required(),
      reward: a.belongsTo('Reward', 'rewardId'),

      // Family member info (from family app)
      userId: a.string().required(), // Which family member is redeeming
      userName: a.string(), // Cache of family member name
      familyId: a.string().required(),
      childAge: a.integer(),

      // Points & Jobs used
      pointsSpent: a.integer().required(),
      jobsUsed: a.string().array(), // Array of job IDs that earned these points
      pointTransactionIds: a.string().array(), // Link to PointsTransaction records

      // QR Code & Verification
      qrCodeData: a.string(), // Encrypted QR code payload
      redemptionCode: a.string().required(), // Human-readable code (e.g., "ABC-123-XYZ")
      pinCode: a.string(), // Optional 4-6 digit PIN for additional security

      // Status & Timestamps
      redemptionStatus: a.enum(['PENDING', 'APPROVED', 'REDEEMED', 'EXPIRED', 'CANCELLED']),
      redemptionDate: a.datetime(), // When family member redeemed
      expiresAt: a.datetime().required(), // QR code expiration (24-48 hours)
      fulfilledAt: a.datetime(), // When business marked as fulfilled
      cancelledAt: a.datetime(),

      // Business verification
      businessId: a.string().required(),
      businessVerifiedAt: a.datetime(), // When business scanned/verified
      businessVerifiedBy: a.string(), // Business employee who verified
      businessRevenue: a.float(), // What business pays for this redemption

      // Location tracking (privacy-safe city/zip only)
      redemptionCity: a.string(),
      redemptionZip: a.string(),

      // Additional info
      notes: a.string(),
      metadata: a.json(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'read', 'update']), // Allow family app and business portal
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // AFFILIATE CLICK TRACKING MODEL
  // ============================================================================
  AffiliateClick: a
    .model({
      // Relationships
      rewardId: a.id().required(),
      reward: a.belongsTo('Reward', 'rewardId'),
      familyId: a.id().required(),
      childId: a.id(), // Optional: which child clicked (privacy consideration)

      // Tracking
      clickId: a.id().required(), // Unique tracking ID for this click
      trackingUrl: a.url().required(), // Personalized affiliate URL with sub-ID
      affiliateNetwork: a.enum(['AMAZON', 'TARGET', 'WALMART', 'RAKUTEN', 'SHAREASALE', 'CJ', 'CUSTOM']),

      // Platform tracking
      platform: a.enum(['IOS', 'TVOS']), // Where the click originated
      clickedAt: a.datetime().required(),

      // Conversion tracking (updated by webhook)
      converted: a.boolean().default(false),
      convertedAt: a.datetime(),
      orderValue: a.float(), // Total order amount
      commissionAmount: a.float(), // Commission we earned
      attributionWindow: a.integer().default(30), // Days (typically 30 for Amazon)

      // Additional metadata
      userAgent: a.string(),
      ipCity: a.string(), // Privacy-safe location tracking
      metadata: a.json(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'read', 'update']),
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // BUSINESS ANALYTICS MODEL
  // ============================================================================
  BusinessAnalytics: a
    .model({
      businessId: a.id().required(),
      date: a.date().required(),

      // Metrics
      impressions: a.integer().default(0),
      clicks: a.integer().default(0),
      redemptions: a.integer().default(0),
      revenue: a.float().default(0),
      spend: a.float().default(0),

      // Demographics
      avgChildAge: a.float(),
      topRewardId: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // PLATFORM ANALYTICS MODEL (For Platform-Specific Metrics)
  // ============================================================================
  PlatformAnalytics: a
    .model({
      // Platform identifier (iOS, tvOS, AndroidTV, LG, Comcast, etc.)
      platform: a.string().required(), // String instead of enum for composite key compatibility

      date: a.date().required(), // YYYY-MM-DD format

      // User Metrics
      dailyActiveUsers: a.integer().default(0),
      monthlyActiveUsers: a.integer().default(0),
      newUsers: a.integer().default(0),
      returningUsers: a.integer().default(0),

      // Engagement Metrics
      sessions: a.integer().default(0),
      avgSessionDuration: a.float().default(0), // seconds
      impressions: a.integer().default(0),
      clicks: a.integer().default(0),
      redemptions: a.integer().default(0),

      // Platform Demographics
      avgChildAge: a.float(),
      topCategory: a.string(),

      // Growth Metrics (investor-focused)
      retentionRate: a.float(), // percentage
      churnRate: a.float(), // percentage
    })
    .identifier(['platform', 'date']) // Composite primary key
    .authorization((allow) => [
      allow.group('PLATFORM_ADMIN'),
      allow.publicApiKey().to(['read']), // Allow apps to read for analytics
    ]),

  // ============================================================================
  // USER ENGAGEMENT MODEL (Session and Interaction Tracking)
  // ============================================================================
  UserEngagement: a
    .model({
      // User & Session Info
      userId: a.string().required(), // Family member ID
      familyId: a.string().required(),
      sessionId: a.string().required(),

      // Platform Info
      platform: a.enum([
        'IOS',
        'TVOS',
        'ANDROID',
        'ANDROID_TV',
        'SAMSUNG_TV',
        'LG_TV',
        'COMCAST_TV',
        'FIRE_TV',
        'ROKU',
        'WEB',
        'OTHER',
      ]),
      deviceModel: a.string(),
      osVersion: a.string(),
      appVersion: a.string(),

      // Session Metrics
      sessionStart: a.datetime().required(),
      sessionEnd: a.datetime(),
      duration: a.integer(), // seconds

      // Interaction Metrics
      eventType: a.string(),
      screenName: a.string(),
      rewardId: a.string(),
      screensViewed: a.string().array(), // screen names
      rewardsViewed: a.string().array(), // reward IDs
      rewardsClicked: a.string().array(), // reward IDs
      searchesPerformed: a.integer().default(0),
      filtersUsed: a.string().array(),

      // Engagement Score (for investor metrics)
      engagementScore: a.float(), // calculated score

      // Metadata
      metadata: a.json(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'read']),
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // APP METRICS MODEL (Overall App Growth and Performance)
  // ============================================================================
  AppMetrics: a
    .model({
      date: a.date().required(),

      // Overall Platform Metrics (aggregate all platforms)
      totalDailyActiveUsers: a.integer().default(0),
      totalMonthlyActiveUsers: a.integer().default(0),
      totalNewUsers: a.integer().default(0),
      totalSessions: a.integer().default(0),

      // Revenue & Business Metrics (investor-focused)
      totalRedemptions: a.integer().default(0),
      totalRevenue: a.float().default(0),
      totalBusinesses: a.integer().default(0),
      activeBusinesses: a.integer().default(0),
      totalRewards: a.integer().default(0),
      activeRewards: a.integer().default(0),

      // Growth Metrics
      userGrowthRate: a.float(), // percentage
      revenueGrowthRate: a.float(), // percentage
      averageRevenuePerUser: a.float(),

      // Engagement Metrics
      avgSessionsPerUser: a.float(),
      avgSessionDuration: a.float(), // seconds
      redemptionRate: a.float(), // clicks to redemptions %

      // Retention Metrics (investor KPIs)
      day1Retention: a.float(), // percentage
      day7Retention: a.float(),
      day30Retention: a.float(),

      // Platform Breakdown (JSON for flexibility)
      platformBreakdown: a.json(), // { iOS: 40%, tvOS: 30%, AndroidTV: 20%, ... }

      // Metadata
      metadata: a.json(),
    })
    .identifier(['date']) // Primary key is just date
    .authorization((allow) => [
      allow.group('PLATFORM_ADMIN'),
      allow.publicApiKey().to(['read']),
    ]),

  // ============================================================================
  // IMPRESSION MODEL
  // ============================================================================
  Impression: a
    .model({
      // Relationships
      businessId: a.id().required(),
      rewardId: a.id().required(),

      // Impression Type
      impressionType: a.enum(['IMPRESSION', 'CLICK']),

      // Device Information
      deviceType: a.enum([
        'APPLE_TV',
        'IOS',
        'ANDROID',
        'ANDROID_TV',
        'SAMSUNG_TV',
        'LG_TV',
        'COMCAST_TV',
        'FIRE_TV',
        'ROKU',
        'WEB',
        'OTHER',
      ]),
      deviceModel: a.string(),
      osVersion: a.string(),

      // Family Information
      familyId: a.string(),
      childAge: a.integer(),

      // Timestamp
      timestamp: a.datetime().required(),

      // Session tracking
      sessionId: a.string(),

      // Additional metadata
      metadata: a.json(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'read']), // Allow family apps to create impressions
      allow.group('PLATFORM_ADMIN'),
    ]),

  // ============================================================================
  // CUSTOM MUTATIONS
  // ============================================================================

  /**
   * Track ad impression or click event
   * Public access for family apps using API key
   */
  trackAdEvent: a
    .mutation()
    .arguments({
      eventType: a.string().required(), // 'impression' | 'click'
      rewardId: a.string().required(),
      businessId: a.string().required(),
      familyId: a.string(),
      childAge: a.integer(),
      timestamp: a.string().required(),
      metadata: a.json(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        error: a.string(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(), // Allow family apps to track events
      allow.authenticated(),
    ])
    .handler(a.handler.function(trackAdEventFunction)),

  /**
   * Track affiliate link click
   * Creates a personalized tracking URL for affiliate rewards
   */
  trackAffiliateClick: a
    .mutation()
    .arguments({
      rewardId: a.string().required(),
      familyId: a.string().required(),
      childId: a.string(),
      platform: a.string().required(), // 'IOS' | 'TVOS'
      timestamp: a.string().required(),
      metadata: a.json(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        clickId: a.string(),
        trackingUrl: a.string(),
        redemptionId: a.string(),
        pointsSpent: a.integer(),
        error: a.string(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ])
    .handler(a.handler.function(trackAffiliateClickFunction)),

  /**
   * Redeem a reward with job tracking
   * Family app calls this to create a redemption with QR code
   */
  redeemReward: a
    .mutation()
    .arguments({
      rewardId: a.string().required(),
      userId: a.string().required(), // Family member redeeming
      userName: a.string(),
      familyId: a.string().required(),
      childAge: a.integer(),
      jobIds: a.string().array(), // Jobs being used for this redemption
      pointsToSpend: a.integer().required(),
      city: a.string(),
      zipCode: a.string(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        redemptionId: a.string(),
        redemptionCode: a.string(),
        qrCodeData: a.string(),
        expiresAt: a.string(),
        businessName: a.string(),
        rewardTitle: a.string(),
        error: a.string(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ])
    .handler(a.handler.function(redeemRewardFunction)),

  /**
   * Verify and fulfill a redemption (Business portal endpoint)
   * Business scans QR code and marks redemption as fulfilled
   */
  verifyRedemption: a
    .mutation()
    .arguments({
      redemptionCode: a.string().required(),
      businessId: a.string().required(),
      verifiedBy: a.string(), // Business employee name/ID
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        redemption: a.json(),
        error: a.string(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
      allow.group('PLATFORM_ADMIN'),
    ])
    .handler(a.handler.function(verifyRedemptionFunction)),

  /**
   * Track Engagement - Track user engagement events (sessions, page views, etc.)
   * Family apps call this to record user interactions for analytics
   */
  trackEngagement: a
    .mutation()
    .arguments({
      eventType: a.string().required(), // 'session_start' | 'session_end' | 'screen_view' | etc.
      userId: a.string().required(),
      familyId: a.string().required(),
      sessionId: a.string().required(),
      platform: a.string().required(), // 'IOS' | 'TVOS' | 'ANDROID_TV' | etc.
      deviceModel: a.string(),
      osVersion: a.string(),
      appVersion: a.string(),
      timestamp: a.string().required(),
      metadata: a.json(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        error: a.string(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ])
    .handler(a.handler.function(trackEngagementFunction)),

  // ============================================================================
  // CUSTOM QUERIES
  // ============================================================================

  /**
   * Get Business Analytics Dashboard - Aggregate analytics data for dashboard
   * Returns summary metrics, timeline data, and top performing rewards
   */
  getBusinessDashboardAnalytics: a
    .query()
    .arguments({
      businessId: a.string().required(),
      startDate: a.string().required(),
      endDate: a.string().required(),
      groupBy: a.string(), // 'day' | 'week' | 'month'
    })
    .returns(
      a.customType({
        summary: a.json(),
        timeline: a.json(),
        topRewards: a.json(),
      })
    )
    .authorization((allow) => [
      allow.authenticated(),
      allow.group('PLATFORM_ADMIN'),
    ])
    .handler(a.handler.function(getBusinessAnalyticsFunction)),

  /**
   * Get Rewards For Family - Location-based reward discovery
   * Returns nearby rewards based on family location and preferences
   */
  getRewardsForFamily: a
    .query()
    .arguments({
      familyId: a.string().required(),
      latitude: a.float().required(),
      longitude: a.float().required(),
      city: a.string().required(),
      zipCode: a.string().required(),
      childAge: a.integer(),
      category: a.string(),
      maxPointCost: a.integer(),
      page: a.integer(),
      limit: a.integer(),
    })
    .returns(
      a.customType({
        rewards: a.json(),
        totalCount: a.integer(),
        page: a.integer(),
      })
    )
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ])
    .handler(a.handler.function(getRewardsForFamilyFunction)),

  /**
   * Get Investor Metrics - Comprehensive analytics for investor presentations
   * Returns growth, engagement, revenue, and platform breakdown metrics
   */
  getInvestorMetrics: a
    .query()
    .arguments({
      startDate: a.string().required(),
      endDate: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [
      allow.authenticated(),
      allow.group('PLATFORM_ADMIN'),
    ])
    .handler(a.handler.function(getInvestorMetricsFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
