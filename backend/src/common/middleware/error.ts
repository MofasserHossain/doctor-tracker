import ApiError from "@/common/utils/ApiError";
import { env } from "@/common/utils/envConfig";
import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";

const reasonPhrase = (code: number): string => {
  const table = httpStatus as unknown as Record<string, string | undefined>;
  return table[String(code)] ?? "Error";
};

export const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
  const statusCode =
    err instanceof ApiError
      ? err.statusCode
      : typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : httpStatus.INTERNAL_SERVER_ERROR;

  const message =
    err instanceof ApiError
      ? err.message
      : typeof (err as { message?: string }).message === "string"
        ? (err as { message: string }).message
        : reasonPhrase(statusCode);

  const converted =
    err instanceof ApiError ? err : new ApiError(statusCode, message, false, (err as { stack?: string }).stack);

  next(converted);
};

export const errorHandlers: ErrorRequestHandler = (err, _req, res, _next) => {
  const rawStatus = (err as { statusCode?: number }).statusCode;
  const isOperational = Boolean((err as { isOperational?: boolean }).isOperational);
  const baseStatus = typeof rawStatus === "number" ? rawStatus : httpStatus.INTERNAL_SERVER_ERROR;

  const finalStatus = env.isProduction && !isOperational ? httpStatus.INTERNAL_SERVER_ERROR : baseStatus;
  const message =
    env.isProduction && !isOperational
      ? reasonPhrase(httpStatus.INTERNAL_SERVER_ERROR)
      : typeof (err as { message?: string }).message === "string"
        ? (err as { message: string }).message
        : reasonPhrase(finalStatus);

  res.status(finalStatus).json({
    success: false,
    code: finalStatus,
    message,
    ...(env.isDevelopment && { stack: (err as { stack?: string }).stack }),
  });
};
