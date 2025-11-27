/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getBusiness = /* GraphQL */ `query GetBusiness($id: ID!) {
  getBusiness(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetBusinessQueryVariables,
  APITypes.GetBusinessQuery
>;
export const getBusinessAnalytics = /* GraphQL */ `query GetBusinessAnalytics($id: ID!) {
  getBusinessAnalytics(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetBusinessAnalyticsQueryVariables,
  APITypes.GetBusinessAnalyticsQuery
>;
export const getReward = /* GraphQL */ `query GetReward($id: ID!) {
  getReward(id: $id) {
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
` as GeneratedQuery<APITypes.GetRewardQueryVariables, APITypes.GetRewardQuery>;
export const getRewardRedemption = /* GraphQL */ `query GetRewardRedemption($id: ID!) {
  getRewardRedemption(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetRewardRedemptionQueryVariables,
  APITypes.GetRewardRedemptionQuery
>;
export const listBusinessAnalytics = /* GraphQL */ `query ListBusinessAnalytics(
  $filter: ModelBusinessAnalyticsFilterInput
  $limit: Int
  $nextToken: String
) {
  listBusinessAnalytics(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBusinessAnalyticsQueryVariables,
  APITypes.ListBusinessAnalyticsQuery
>;
export const listBusinesses = /* GraphQL */ `query ListBusinesses(
  $filter: ModelBusinessFilterInput
  $limit: Int
  $nextToken: String
) {
  listBusinesses(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBusinessesQueryVariables,
  APITypes.ListBusinessesQuery
>;
export const listRewardRedemptions = /* GraphQL */ `query ListRewardRedemptions(
  $filter: ModelRewardRedemptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listRewardRedemptions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      rewardId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRewardRedemptionsQueryVariables,
  APITypes.ListRewardRedemptionsQuery
>;
export const listRewards = /* GraphQL */ `query ListRewards(
  $filter: ModelRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  listRewards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRewardsQueryVariables,
  APITypes.ListRewardsQuery
>;
