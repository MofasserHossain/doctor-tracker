import { commonValidations } from "@/common/utils/commonValidation";
import { z } from "zod";

export const loginUserSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.password,
});

export type LoginUserType = z.infer<typeof loginUserSchema>;
