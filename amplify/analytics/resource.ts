import { defineBackend } from '@aws-amplify/backend';
import { CfnApp } from 'aws-cdk-lib/aws-pinpoint';
import { Stack } from 'aws-cdk-lib';

/**
 * AWS Pinpoint Analytics Configuration
 *
 * Tracks user engagements, page views, and platform-specific usage
 * for iOS, tvOS, AndroidTV, LG TV, Comcast, etc.
 */

export function createPinpointApp(stack: Stack, appName: string): CfnApp {
  // Create Pinpoint App for analytics
  const pinpointApp = new CfnApp(stack, 'FamilyRewardsAnalytics', {
    name: appName || 'FamilyRewardsAdServer',
  });

  return pinpointApp;
}

/**
 * Pinpoint Event Types to Track:
 *
 * User Engagement Events:
 * - app_start: When app launches
 * - app_end: When app closes
 * - screen_view: Page/screen navigation
 * - reward_view: When a reward is viewed
 * - reward_click: When a reward is clicked
 * - reward_redeem: When a reward is redeemed
 * - search_perform: When user searches
 * - filter_apply: When filters are applied
 *
 * Platform Events:
 * - session_start: New session with platform info
 * - session_end: Session ends with duration
 *
 * Attributes to track:
 * - platform: iOS, tvOS, Android, AndroidTV, LG, Comcast, etc.
 * - deviceModel: specific device model
 * - osVersion: operating system version
 * - appVersion: app version number
 * - familyId: encrypted family identifier
 * - userId: encrypted user identifier
 */

export const eventTypes = {
  APP_START: 'app_start',
  APP_END: 'app_end',
  SCREEN_VIEW: 'screen_view',
  REWARD_VIEW: 'reward_view',
  REWARD_CLICK: 'reward_click',
  REWARD_REDEEM: 'reward_redeem',
  SEARCH_PERFORM: 'search_perform',
  FILTER_APPLY: 'filter_apply',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
} as const;

export const platforms = {
  IOS: 'iOS',
  TVOS: 'tvOS',
  ANDROID: 'Android',
  ANDROID_TV: 'AndroidTV',
  SAMSUNG_TV: 'SamsungTV',
  LG_TV: 'LGTV',
  COMCAST_TV: 'ComcastTV',
  FIRE_TV: 'FireTV',
  ROKU: 'Roku',
  WEB: 'Web',
} as const;
