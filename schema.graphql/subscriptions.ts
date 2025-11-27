/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateBusiness = /* GraphQL */ `subscription OnCreateBusiness(
  $filter: ModelSubscriptionBusinessFilterInput
  $owner: String
) {
  onCreateBusiness(filter: $filter, owner: $owner) {
    address
    billingType
    businessType
    city
    cpmRate
    createdAt
    currentSpend
    description
    email
    id
    isActive
    isVerified
    latitude
    logoKey
    logoUrl
    longitude
    monthlyBudget
    name
    owner
    phone
    rejectionReason
    rewards {
      nextToken
      __typename
    }
    serviceRadius
    state
    updatedAt
    verificationStatus
    website
    zipCode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateBusinessSubscriptionVariables,
  APITypes.OnCreateBusinessSubscription
>;
export const onCreateBusinessAnalytics = /* GraphQL */ `subscription OnCreateBusinessAnalytics(
  $filter: ModelSubscriptionBusinessAnalyticsFilterInput
  $owner: String
) {
  onCreateBusinessAnalytics(filter: $filter, owner: $owner) {
    avgChildAge
    businessId
    clicks
    createdAt
    date
    id
    impressions
    owner
    redemptions
    revenue
    spend
    topRewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateBusinessAnalyticsSubscriptionVariables,
  APITypes.OnCreateBusinessAnalyticsSubscription
>;
export const onCreateReward = /* GraphQL */ `subscription OnCreateReward(
  $filter: ModelSubscriptionRewardFilterInput
  $owner: String
) {
  onCreateReward(filter: $filter, owner: $owner) {
    availableRadius
    business {
      address
      billingType
      businessType
      city
      cpmRate
      createdAt
      currentSpend
      description
      email
      id
      isActive
      isVerified
      latitude
      logoKey
      logoUrl
      longitude
      monthlyBudget
      name
      owner
      phone
      rejectionReason
      serviceRadius
      state
      updatedAt
      verificationStatus
      website
      zipCode
      __typename
    }
    businessId
    category
    clicks
    createdAt
    currentRedemptions
    dailyLimit
    daysOfWeek
    description
    endDate
    id
    imageKey
    imageUrl
    impressions
    isActive
    owner
    pointCost
    redemptionInstructions
    redemptionRecords {
      nextToken
      __typename
    }
    redemptionType
    redemptions
    retailValue
    rewardType
    startDate
    status
    targetAgeRanges
    targetFamilySizes
    termsAndConditions
    title
    totalAvailable
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRewardSubscriptionVariables,
  APITypes.OnCreateRewardSubscription
>;
export const onCreateRewardRedemption = /* GraphQL */ `subscription OnCreateRewardRedemption(
  $filter: ModelSubscriptionRewardRedemptionFilterInput
  $owner: String
) {
  onCreateRewardRedemption(filter: $filter, owner: $owner) {
    businessId
    businessRevenue
    childAge
    childId
    createdAt
    expiresAt
    familyId
    fulfilledAt
    id
    notes
    owner
    pointsSpent
    redemptionCity
    redemptionCode
    redemptionDate
    redemptionStatus
    redemptionZip
    reward {
      availableRadius
      businessId
      category
      clicks
      createdAt
      currentRedemptions
      dailyLimit
      daysOfWeek
      description
      endDate
      id
      imageKey
      imageUrl
      impressions
      isActive
      owner
      pointCost
      redemptionInstructions
      redemptionType
      redemptions
      retailValue
      rewardType
      startDate
      status
      targetAgeRanges
      targetFamilySizes
      termsAndConditions
      title
      totalAvailable
      updatedAt
      __typename
    }
    rewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRewardRedemptionSubscriptionVariables,
  APITypes.OnCreateRewardRedemptionSubscription
>;
export const onDeleteBusiness = /* GraphQL */ `subscription OnDeleteBusiness(
  $filter: ModelSubscriptionBusinessFilterInput
  $owner: String
) {
  onDeleteBusiness(filter: $filter, owner: $owner) {
    address
    billingType
    businessType
    city
    cpmRate
    createdAt
    currentSpend
    description
    email
    id
    isActive
    isVerified
    latitude
    logoKey
    logoUrl
    longitude
    monthlyBudget
    name
    owner
    phone
    rejectionReason
    rewards {
      nextToken
      __typename
    }
    serviceRadius
    state
    updatedAt
    verificationStatus
    website
    zipCode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteBusinessSubscriptionVariables,
  APITypes.OnDeleteBusinessSubscription
>;
export const onDeleteBusinessAnalytics = /* GraphQL */ `subscription OnDeleteBusinessAnalytics(
  $filter: ModelSubscriptionBusinessAnalyticsFilterInput
  $owner: String
) {
  onDeleteBusinessAnalytics(filter: $filter, owner: $owner) {
    avgChildAge
    businessId
    clicks
    createdAt
    date
    id
    impressions
    owner
    redemptions
    revenue
    spend
    topRewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteBusinessAnalyticsSubscriptionVariables,
  APITypes.OnDeleteBusinessAnalyticsSubscription
>;
export const onDeleteReward = /* GraphQL */ `subscription OnDeleteReward(
  $filter: ModelSubscriptionRewardFilterInput
  $owner: String
) {
  onDeleteReward(filter: $filter, owner: $owner) {
    availableRadius
    business {
      address
      billingType
      businessType
      city
      cpmRate
      createdAt
      currentSpend
      description
      email
      id
      isActive
      isVerified
      latitude
      logoKey
      logoUrl
      longitude
      monthlyBudget
      name
      owner
      phone
      rejectionReason
      serviceRadius
      state
      updatedAt
      verificationStatus
      website
      zipCode
      __typename
    }
    businessId
    category
    clicks
    createdAt
    currentRedemptions
    dailyLimit
    daysOfWeek
    description
    endDate
    id
    imageKey
    imageUrl
    impressions
    isActive
    owner
    pointCost
    redemptionInstructions
    redemptionRecords {
      nextToken
      __typename
    }
    redemptionType
    redemptions
    retailValue
    rewardType
    startDate
    status
    targetAgeRanges
    targetFamilySizes
    termsAndConditions
    title
    totalAvailable
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRewardSubscriptionVariables,
  APITypes.OnDeleteRewardSubscription
>;
export const onDeleteRewardRedemption = /* GraphQL */ `subscription OnDeleteRewardRedemption(
  $filter: ModelSubscriptionRewardRedemptionFilterInput
  $owner: String
) {
  onDeleteRewardRedemption(filter: $filter, owner: $owner) {
    businessId
    businessRevenue
    childAge
    childId
    createdAt
    expiresAt
    familyId
    fulfilledAt
    id
    notes
    owner
    pointsSpent
    redemptionCity
    redemptionCode
    redemptionDate
    redemptionStatus
    redemptionZip
    reward {
      availableRadius
      businessId
      category
      clicks
      createdAt
      currentRedemptions
      dailyLimit
      daysOfWeek
      description
      endDate
      id
      imageKey
      imageUrl
      impressions
      isActive
      owner
      pointCost
      redemptionInstructions
      redemptionType
      redemptions
      retailValue
      rewardType
      startDate
      status
      targetAgeRanges
      targetFamilySizes
      termsAndConditions
      title
      totalAvailable
      updatedAt
      __typename
    }
    rewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRewardRedemptionSubscriptionVariables,
  APITypes.OnDeleteRewardRedemptionSubscription
>;
export const onUpdateBusiness = /* GraphQL */ `subscription OnUpdateBusiness(
  $filter: ModelSubscriptionBusinessFilterInput
  $owner: String
) {
  onUpdateBusiness(filter: $filter, owner: $owner) {
    address
    billingType
    businessType
    city
    cpmRate
    createdAt
    currentSpend
    description
    email
    id
    isActive
    isVerified
    latitude
    logoKey
    logoUrl
    longitude
    monthlyBudget
    name
    owner
    phone
    rejectionReason
    rewards {
      nextToken
      __typename
    }
    serviceRadius
    state
    updatedAt
    verificationStatus
    website
    zipCode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateBusinessSubscriptionVariables,
  APITypes.OnUpdateBusinessSubscription
>;
export const onUpdateBusinessAnalytics = /* GraphQL */ `subscription OnUpdateBusinessAnalytics(
  $filter: ModelSubscriptionBusinessAnalyticsFilterInput
  $owner: String
) {
  onUpdateBusinessAnalytics(filter: $filter, owner: $owner) {
    avgChildAge
    businessId
    clicks
    createdAt
    date
    id
    impressions
    owner
    redemptions
    revenue
    spend
    topRewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateBusinessAnalyticsSubscriptionVariables,
  APITypes.OnUpdateBusinessAnalyticsSubscription
>;
export const onUpdateReward = /* GraphQL */ `subscription OnUpdateReward(
  $filter: ModelSubscriptionRewardFilterInput
  $owner: String
) {
  onUpdateReward(filter: $filter, owner: $owner) {
    availableRadius
    business {
      address
      billingType
      businessType
      city
      cpmRate
      createdAt
      currentSpend
      description
      email
      id
      isActive
      isVerified
      latitude
      logoKey
      logoUrl
      longitude
      monthlyBudget
      name
      owner
      phone
      rejectionReason
      serviceRadius
      state
      updatedAt
      verificationStatus
      website
      zipCode
      __typename
    }
    businessId
    category
    clicks
    createdAt
    currentRedemptions
    dailyLimit
    daysOfWeek
    description
    endDate
    id
    imageKey
    imageUrl
    impressions
    isActive
    owner
    pointCost
    redemptionInstructions
    redemptionRecords {
      nextToken
      __typename
    }
    redemptionType
    redemptions
    retailValue
    rewardType
    startDate
    status
    targetAgeRanges
    targetFamilySizes
    termsAndConditions
    title
    totalAvailable
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRewardSubscriptionVariables,
  APITypes.OnUpdateRewardSubscription
>;
export const onUpdateRewardRedemption = /* GraphQL */ `subscription OnUpdateRewardRedemption(
  $filter: ModelSubscriptionRewardRedemptionFilterInput
  $owner: String
) {
  onUpdateRewardRedemption(filter: $filter, owner: $owner) {
    businessId
    businessRevenue
    childAge
    childId
    createdAt
    expiresAt
    familyId
    fulfilledAt
    id
    notes
    owner
    pointsSpent
    redemptionCity
    redemptionCode
    redemptionDate
    redemptionStatus
    redemptionZip
    reward {
      availableRadius
      businessId
      category
      clicks
      createdAt
      currentRedemptions
      dailyLimit
      daysOfWeek
      description
      endDate
      id
      imageKey
      imageUrl
      impressions
      isActive
      owner
      pointCost
      redemptionInstructions
      redemptionType
      redemptions
      retailValue
      rewardType
      startDate
      status
      targetAgeRanges
      targetFamilySizes
      termsAndConditions
      title
      totalAvailable
      updatedAt
      __typename
    }
    rewardId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRewardRedemptionSubscriptionVariables,
  APITypes.OnUpdateRewardRedemptionSubscription
>;
