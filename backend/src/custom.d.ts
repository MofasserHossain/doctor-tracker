import type { UserRole } from "@/api/auth/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}
