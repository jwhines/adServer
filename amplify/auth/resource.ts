import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication configuration for business owners and platform admin
 *
 * User Groups:
 * - BUSINESS_OWNER: Local Durham businesses managing their reward campaigns
 * - PLATFORM_ADMIN: Platform owner who approves businesses and curates content
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to Family Rewards Business Portal',
      verificationEmailBody: (createCode) =>
        `Welcome to the Family Rewards Business Portal! Your verification code is ${createCode()}`,
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: false,
    },
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: true,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
  },
  groups: ['BUSINESS_OWNER', 'PLATFORM_ADMIN'],
});
