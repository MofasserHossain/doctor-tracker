'use client';

import { getDashboardSummary } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/services/query-keys';
import { useQuery } from '@tanstack/react-query';

export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: getDashboardSummary,
  });
};
