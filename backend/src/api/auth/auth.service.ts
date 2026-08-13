import { UserModel, type UserRole } from "@/api/auth/user.model";
import ApiError from "@/common/utils/ApiError";
import { env } from "@/common/utils/envConfig";
import { compare } from "bcryptjs";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

const sanitizeUser = (user: { _id: unknown; name: string; email: string; role: UserRole }): AuthUser => {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const generateAccessToken = (user: AuthUser) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: `${env.JWT_ACCESS_EXPIRATION_MINUTES}m` }
  );
};

export const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password").lean();

  if (!user || !user.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect email or password");
  }

  const passwordMatches = await compare(password, user.password);

  if (!passwordMatches) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect email or password");
  }

  return sanitizeUser(user);
};

export const getUserFromToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await UserModel.findById(payload.sub).lean();

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    return sanitizeUser(user);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
};
