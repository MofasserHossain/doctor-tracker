import { env } from '@/config/env';
import { create } from 'axios';

export const http = create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
