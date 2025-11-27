import { defineFunction } from '@aws-amplify/backend';

export const trackEngagement = defineFunction({
  name: 'track-engagement',
  entry: './handler.ts',
});
