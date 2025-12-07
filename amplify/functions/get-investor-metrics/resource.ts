import { defineFunction } from '@aws-amplify/backend';

export const getInvestorMetrics = defineFunction({
  name: 'get-investor-metrics',
  entry: './handler.ts',
  resourceGroupName: 'data', // Assign to data stack to avoid circular dependency
});
