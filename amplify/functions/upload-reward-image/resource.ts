import { defineFunction } from '@aws-amplify/backend';

export const uploadRewardImage = defineFunction({
  name: 'uploadRewardImage',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 1024,
});
