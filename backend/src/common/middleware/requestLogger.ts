import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { env } from "@/common/utils/envConfig";
import type { RequestHandler } from "express";
import httpStatus from "http-status";
import type { LevelWithSilent } from "pino";
import { pinoHttp, type CustomAttributeKeys, type Options } from "pino-http";

const customAttributeKeys: CustomAttributeKeys = {
  req: "request",
  res: "response",
  err: "error",
  responseTime: "timeTaken",
};

const customLogLevel = (_req: IncomingMessage, res: ServerResponse<IncomingMessage>, err?: Error): LevelWithSilent => {
  if (err || res.statusCode >= httpStatus.INTERNAL_SERVER_ERROR) return "error";
  if (res.statusCode >= httpStatus.BAD_REQUEST) return "warn";
  if (res.statusCode >= httpStatus.MULTIPLE_CHOICES) return "silent";
  return "info";
};

const genReqId = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  const existingID = req.headers["x-request-id"];

  if (existingID) return existingID;

  const id = randomUUID();
  res.setHeader("X-Request-Id", id);
  return id;
};

const requestLogger = (options?: Options): RequestHandler[] => {
  const pinoOptions: Options = {
    enabled: env.isProduction,
    genReqId,
    customLogLevel,
    customSuccessMessage: (req, res) => `${req.method} completed with status ${res.statusCode}`,
    customReceivedMessage: (req) => `request received: ${req.method}`,
    customErrorMessage: (_req, res) => `request errored with status code: ${res.statusCode}`,
    customAttributeKeys,
    ...options,
  };

  return [pinoHttp(pinoOptions)];
};

export default requestLogger();
