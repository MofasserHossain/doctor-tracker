import { generateAccessToken, loginUserWithEmailAndPassword } from "@/api/auth/auth.service";
import type { LoginUserType } from "@/api/auth/auth.validation";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { CookieOptions, Request, Response } from "express";
import httpStatus from "http-status";

const getAccessTokenCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    sameSite: env.COOKIE_SAME_SITE as CookieOptions["sameSite"],
    secure: env.isProduction,
    maxAge: env.JWT_ACCESS_EXPIRATION_MINUTES * 60 * 1000,
    ...(env.COOKIE_PARTITIONED ? { partitioned: true } : {}),
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
};

const getClearAccessTokenCookieOptions = (): CookieOptions => {
  const { maxAge: _maxAge, ...options } = getAccessTokenCookieOptions();
  return options;
};

export const login = async (req: Request<unknown, unknown, LoginUserType>, res: Response) => {
  const user = await loginUserWithEmailAndPassword(req.body.email, req.body.password);
  const token = generateAccessToken(user);

  res.cookie("accessToken", token, getAccessTokenCookieOptions());

  const serviceResponse = ServiceResponse.success("Login successful", { user });
  return handleServiceResponse(serviceResponse, res);
};

export const me = async (req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success("Authenticated user fetched", { user: req.user });
  return handleServiceResponse(serviceResponse, res);
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", getClearAccessTokenCookieOptions());
  const serviceResponse = ServiceResponse.success("Logout successful", null, httpStatus.OK);
  return handleServiceResponse(serviceResponse, res);
};
