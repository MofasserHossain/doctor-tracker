'use client';

import { getCurrentUser, login, logout, type LoginPayload } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/error';
import { queryKeys } from '@/lib/services/query-keys';
import type { LoginResponse } from '@/types/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type AuthMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
};

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    retry: false,
  });
};

export const useLoginMutation = (
  options: AuthMutationOptions<LoginResponse, LoginPayload> = {},
) => {
  return useMutation({
    mutationFn: login,
    onSuccess: async (data, variables) => {
      toast.success('Signed in');
      await options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Invalid email or password'));
    },
  });
};

export const useLogoutMutation = (options: AuthMutationOptions<void, void> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      queryClient.clear();
      await options.onSettled?.();
      toast.success('Signed out');
    },
  });
};
