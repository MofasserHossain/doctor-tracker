import { timingSafeEqual } from "node:crypto";

import { ServiceResponse } from "@/common/models/serviceResponse";
import ApiError from "@/common/utils/ApiError";
import { env } from "@/common/utils/envConfig";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { seedDatabase } from "@/seed";
import type { Request, Response } from "express";
import httpStatus from "http-status";

const isSeedSecretValid = (providedSecret?: string) => {
  if (!providedSecret) return false;

  const expectedSecret = Buffer.from(env.SEED_SECRET);
  const receivedSecret = Buffer.from(providedSecret);

  if (expectedSecret.length !== receivedSecret.length) return false;

  return timingSafeEqual(expectedSecret, receivedSecret);
};

export const seed = async (req: Request, res: Response) => {
  if (!isSeedSecretValid(req.get("x-seed-secret"))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await seedDatabase();
  const serviceResponse = ServiceResponse.success("Seed completed", result);

  return handleServiceResponse(serviceResponse, res);
};
