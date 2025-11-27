import { defineFunction } from '@aws-amplify/backend';

export const getInvestorMetrics = defineFunction({
  name: 'get-investor-metrics',
  entry: './handler.ts',
});
