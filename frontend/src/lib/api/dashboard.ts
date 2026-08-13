import { http } from '@/lib/api/http';
import type { ServiceResponse } from '@/types/api';
import type { DashboardSummary } from '@/types/domain';

export const getDashboardSummary = async () => {
  const response = await http.get<ServiceResponse<DashboardSummary>>('/dashboard/summary');
  return response.data.data;
};
