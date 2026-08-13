import { getUserFromToken } from "@/api/auth/auth.service";
import type { UserRole } from "@/api/auth/user.model";
import ApiError from "@/common/utils/ApiError";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) return undefined;
  return authorization.slice("Bearer ".length);
};

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const token = getBearerToken(req.headers.authorization) ?? req.cookies?.accessToken;

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }

  const user = await getUserFromToken(token);
  req.user = user;

  return next();
};

export default authMiddleware;

export const roleMiddleware = (requiredRole: UserRole | UserRole[]) => {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
    }

    return next();
  };
};
