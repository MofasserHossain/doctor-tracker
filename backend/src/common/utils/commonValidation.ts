import mongoose from "mongoose";
import { z } from "zod";

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

const mongoObjectId = (message: string) => {
  return z.string().refine((value) => mongoose.isObjectIdOrHexString(value), { message });
};

export const commonValidations = {
  objectId: mongoObjectId("Invalid MongoDB object id"),
  email: z.string().trim().email().toLowerCase(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  password: z.string().min(8).max(128),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: mongoObjectId("Invalid cursor").optional(),
  search: z.string().trim().min(1).max(120).optional(),
  dateOnly: z.string().regex(dateOnlyRegex, "Expected YYYY-MM-DD"),
};
