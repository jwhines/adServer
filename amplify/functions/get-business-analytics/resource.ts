import { defineFunction } from '@aws-amplify/backend';

export const getBusinessAnalytics = defineFunction({
  name: 'getBusinessAnalytics',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
});
