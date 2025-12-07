import { defineFunction } from '@aws-amplify/backend';

export const trackEngagement = defineFunction({
  name: 'track-engagement',
  entry: './handler.ts',
  resourceGroupName: 'data', // Assign to data stack to avoid circular dependency
});
