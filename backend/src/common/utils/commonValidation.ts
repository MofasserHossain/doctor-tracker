import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const commonValidations = {
  objectId: z.string().regex(objectIdRegex, "Invalid MongoDB object id"),
  email: z.string().trim().email().toLowerCase(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  password: z.string().min(8).max(128),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(120).optional(),
  dateOnly: z.string().regex(dateOnlyRegex, "Expected YYYY-MM-DD"),
};
