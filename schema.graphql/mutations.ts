/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createBusiness = /* GraphQL */ `mutation CreateBusiness(
  $condition: ModelBusinessConditionInput
  $input: CreateBusinessInput!
) {
  createBusiness(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateBusinessMutationVariables,
  APITypes.CreateBusinessMutation
>;
export const createBusinessAnalytics = /* GraphQL */ `mutation CreateBusinessAnalytics(
  $condition: ModelBusinessAnalyticsConditionInput
  $input: CreateBusinessAnalyticsInput!
) {
  createBusinessAnalytics(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateBusinessAnalyticsMutationVariables,
  APITypes.CreateBusinessAnalyticsMutation
>;
export const createReward = /* GraphQL */ `mutation CreateReward(
  $condition: ModelRewardConditionInput
  $input: CreateRewardInput!
) {
  createReward(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRewardMutationVariables,
  APITypes.CreateRewardMutation
>;
export const createRewardRedemption = /* GraphQL */ `mutation CreateRewardRedemption(
  $condition: ModelRewardRedemptionConditionInput
  $input: CreateRewardRedemptionInput!
) {
  createRewardRedemption(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRewardRedemptionMutationVariables,
  APITypes.CreateRewardRedemptionMutation
>;
export const deleteBusiness = /* GraphQL */ `mutation DeleteBusiness(
  $condition: ModelBusinessConditionInput
  $input: DeleteBusinessInput!
) {
  deleteBusiness(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteBusinessMutationVariables,
  APITypes.DeleteBusinessMutation
>;
export const deleteBusinessAnalytics = /* GraphQL */ `mutation DeleteBusinessAnalytics(
  $condition: ModelBusinessAnalyticsConditionInput
  $input: DeleteBusinessAnalyticsInput!
) {
  deleteBusinessAnalytics(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteBusinessAnalyticsMutationVariables,
  APITypes.DeleteBusinessAnalyticsMutation
>;
export const deleteReward = /* GraphQL */ `mutation DeleteReward(
  $condition: ModelRewardConditionInput
  $input: DeleteRewardInput!
) {
  deleteReward(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRewardMutationVariables,
  APITypes.DeleteRewardMutation
>;
export const deleteRewardRedemption = /* GraphQL */ `mutation DeleteRewardRedemption(
  $condition: ModelRewardRedemptionConditionInput
  $input: DeleteRewardRedemptionInput!
) {
  deleteRewardRedemption(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRewardRedemptionMutationVariables,
  APITypes.DeleteRewardRedemptionMutation
>;
export const updateBusiness = /* GraphQL */ `mutation UpdateBusiness(
  $condition: ModelBusinessConditionInput
  $input: UpdateBusinessInput!
) {
  updateBusiness(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateBusinessMutationVariables,
  APITypes.UpdateBusinessMutation
>;
export const updateBusinessAnalytics = /* GraphQL */ `mutation UpdateBusinessAnalytics(
  $condition: ModelBusinessAnalyticsConditionInput
  $input: UpdateBusinessAnalyticsInput!
) {
  updateBusinessAnalytics(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateBusinessAnalyticsMutationVariables,
  APITypes.UpdateBusinessAnalyticsMutation
>;
export const updateReward = /* GraphQL */ `mutation UpdateReward(
  $condition: ModelRewardConditionInput
  $input: UpdateRewardInput!
) {
  updateReward(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRewardMutationVariables,
  APITypes.UpdateRewardMutation
>;
export const updateRewardRedemption = /* GraphQL */ `mutation UpdateRewardRedemption(
  $condition: ModelRewardRedemptionConditionInput
  $input: UpdateRewardRedemptionInput!
) {
  updateRewardRedemption(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRewardRedemptionMutationVariables,
  APITypes.UpdateRewardRedemptionMutation
>;
