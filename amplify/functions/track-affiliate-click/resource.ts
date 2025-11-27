import { defineFunction } from '@aws-amplify/backend';

export const trackAffiliateClick = defineFunction({
  name: 'trackAffiliateClick',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  resourceGroupName: 'data',
  environment: {
    // Table names will be injected by Amplify automatically
  },
});
