import { http } from '@/lib/api/http';
import type { ServiceResponse } from '@/types/api';
import type { CurrentUserResponse, LoginResponse } from '@/types/domain';

export type LoginPayload = {
  email: string;
  password: string;
};

export const login = async (payload: LoginPayload) => {
  const response = await http.post<ServiceResponse<LoginResponse>>('/auth/login', payload);
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await http.get<ServiceResponse<CurrentUserResponse>>('/auth/me');
  return response.data.data.user;
};

export const logout = async () => {
  await http.post<ServiceResponse<null>>('/auth/logout');
};
