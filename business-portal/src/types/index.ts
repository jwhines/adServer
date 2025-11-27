/**
 * TypeScript Type Definitions for Business Portal
 */

export type BusinessType =
  | 'RESTAURANT'
  | 'ENTERTAINMENT'
  | 'RETAIL'
  | 'SERVICES'
  | 'EDUCATION'
  | 'SPORTS_RECREATION'
  | 'OTHER';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BillingType = 'CPM' | 'CPC' | 'MONTHLY_RETAINER';

export interface Business {
  id: string;
  name: string;
  description?: string;
  businessType: BusinessType;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;

  // Contact
  phone?: string;
  email: string;
  website?: string;

  // Media
  logoUrl?: string;
  logoKey?: string;

  // Status
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;

  // Billing
  billingType?: BillingType;
  monthlyBudget?: number;
  cpmRate?: number;
  currentSpend: number;

  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type RewardType =
  | 'PHYSICAL_ITEM'
  | 'EXPERIENCE'
  | 'SERVICE'
  | 'FOOD'
  | 'FAMILY_ACTIVITY'
  | 'DIGITAL_CONTENT';

export type RewardCategory =
  | 'ENTERTAINMENT'
  | 'EDUCATION'
  | 'FOOD'
  | 'SPORTS'
  | 'ARTS_CRAFTS'
  | 'TECHNOLOGY'
  | 'FAMILY_ACTIVITY';

export type RewardStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED';

export type RedemptionType = 'CODE' | 'IN_STORE' | 'ONLINE' | 'QR_CODE';

export interface Reward {
  id: string;
  businessId: string;

  // Content
  title: string;
  description: string;
  termsAndConditions?: string;

  // Media
  imageUrl?: string;
  imageKey?: string;

  // Pricing
  pointCost: number;
  retailValue?: number;

  // Categorization
  rewardType?: RewardType;
  category?: RewardCategory;

  // Targeting
  targetAgeRanges?: string[];
  targetFamilySizes?: number[];
  availableRadius?: number;

  // Inventory
  totalAvailable?: number;
  currentRedemptions: number;
  dailyLimit?: number;

  // Schedule
  startDate: string;
  endDate?: string;
  daysOfWeek?: string[];

  // Status
  isActive: boolean;
  status: RewardStatus;

  // Analytics
  impressions: number;
  clicks: number;
  redemptions: number;

  // Redemption
  redemptionType?: RedemptionType;
  redemptionInstructions?: string;

  createdAt: string;
  updatedAt: string;
}

export type RedemptionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface RewardRedemption {
  id: string;
  rewardId: string;

  // Family info
  familyId: string;
  childId: string;
  childAge?: number;

  // Transaction
  pointsSpent: number;
  redemptionStatus: RedemptionStatus;

  // Redemption details
  redemptionCode?: string;
  redemptionDate?: string;
  expiresAt?: string;
  fulfilledAt?: string;

  // Business tracking
  businessId?: string;
  businessRevenue?: number;

  // Location
  redemptionCity?: string;
  redemptionZip?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  // Populated fields
  reward?: Reward;
}

export interface BusinessAnalytics {
  businessId: string;
  date: string;

  impressions: number;
  clicks: number;
  redemptions: number;
  revenue: number;
  spend: number;

  avgChildAge?: number;
  topRewardId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalRedemptions: number;
  totalRevenue: number;
  totalSpend: number;
  roi: number;
}

export interface TimelineEntry {
  date: string;
  impressions: number;
  redemptions: number;
  revenue: number;
}

export interface TopReward {
  rewardId: string;
  title: string;
  redemptions: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  timeline: TimelineEntry[];
  topRewards: TopReward[];
}

export interface User {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
  groups?: string[];
}
