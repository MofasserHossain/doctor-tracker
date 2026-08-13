import { http } from '@/lib/api/http';
import type { ServiceResponse } from '@/types/api';
import type { LoginResponse } from '@/types/domain';

export type LoginPayload = {
  email: string;
  password: string;
};

export const login = async (payload: LoginPayload) => {
  const response = await http.post<ServiceResponse<LoginResponse>>('/auth/login', payload);
  return response.data.data;
};
