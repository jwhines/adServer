import { defineFunction } from '@aws-amplify/backend';

export const redeemReward = defineFunction({
  name: 'redeemReward',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
});
