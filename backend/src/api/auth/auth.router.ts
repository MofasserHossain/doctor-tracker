import { login, logout, me } from "@/api/auth/auth.controller";
import authMiddleware from "@/api/auth/auth.middleware";
import { loginUserSchema } from "@/api/auth/auth.validation";
import { authRateLimit } from "@/common/middleware/security";
import { validateRequest } from "@/common/middleware/validateRequest";
import express, { type Router } from "express";

const authRouter: Router = express.Router();

authRouter.use(authRateLimit);
authRouter.post("/login", validateRequest({ body: loginUserSchema }), login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/me", authMiddleware, me);

export default authRouter;
