import { seed } from "@/api/seed/seed.controller";
import { apiRateLimit } from "@/common/middleware/security";
import express, { type Router } from "express";

const seedRouter: Router = express.Router();

seedRouter.use(apiRateLimit);
seedRouter.post("/", seed);

export default seedRouter;
