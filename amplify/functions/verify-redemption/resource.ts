import { defineFunction } from '@aws-amplify/backend';

export const verifyRedemption = defineFunction({
  name: 'verifyRedemption',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  resourceGroupName: 'data',
});
