import { defineFunction } from '@aws-amplify/backend';

export const getRewardsForFamily = defineFunction({
  name: 'getRewardsForFamily',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
});
