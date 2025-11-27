import { defineFunction } from '@aws-amplify/backend';

export const trackAdEvent = defineFunction({
  name: 'trackAdEvent',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  resourceGroupName: 'data', // Assign to data stack to avoid circular dependency
  environment: {
    // Table names will be injected by Amplify automatically based on data resource access
    // The Lambda will use generated table names from DynamoDB
  },
});
