import { env } from "@/common/utils/envConfig";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

const createRateLimit = (options: { windowMs: number; max: number; message: string }) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const authRateLimit = createRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: "Too many authentication attempts, please try again later.",
});

export const apiRateLimit = createRateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  message: "Too many requests, please try again later.",
});

export const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xXssProtection: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
