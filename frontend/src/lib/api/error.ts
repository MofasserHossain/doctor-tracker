import { isAxiosError } from 'axios';

type ApiErrorBody = {
  message?: string;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data.message) {
    return error.response.data.message;
  }

  return fallback;
};
