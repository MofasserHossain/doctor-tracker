import { commonValidations } from "@/common/utils/commonValidation";
import { z } from "zod";

export const createDoctorSchemaBody = z.object({
  name: commonValidations.name,
  specialization: z.string().trim().min(2).max(120),
  hospital: z.string().trim().min(2).max(160),
  phone: commonValidations.phone,
  email: commonValidations.email,
});

export const updateDoctorSchemaBody = createDoctorSchemaBody
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const getDoctorSchema = z.object({
  id: commonValidations.objectId,
});

export const queryDoctorsSchema = z.object({
  limit: commonValidations.limit,
  cursor: commonValidations.cursor,
  search: commonValidations.search,
  specialization: z.string().trim().min(1).max(120).optional(),
  hospital: z.string().trim().min(1).max(160).optional(),
  from: commonValidations.dateOnly.optional(),
  to: commonValidations.dateOnly.optional(),
});

export type CreateDoctorSchemaBodyType = z.infer<typeof createDoctorSchemaBody>;
export type UpdateDoctorSchemaBodyType = z.infer<typeof updateDoctorSchemaBody>;
export type GetDoctorType = z.infer<typeof getDoctorSchema>;
export type QueryDoctorsSchemaType = z.infer<typeof queryDoctorsSchema>;
