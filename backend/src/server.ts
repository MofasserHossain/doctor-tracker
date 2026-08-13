import apiRouter from "@/baseRouter";
import { errorConverter, errorHandlers } from "@/common/middleware/error";
import requestLogger from "@/common/middleware/requestLogger";
import { securityHeaders } from "@/common/middleware/security";
import ApiError from "@/common/utils/ApiError";
import { env } from "@/common/utils/envConfig";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import httpStatus from "http-status";
import { pino } from "pino";

const logger = pino({ name: "doctor-tracker-api" });
const app: Express = express();

app.set("trust proxy", 1);

app.use(securityHeaders);

const allowedOrigins = new Set(
  env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(httpStatus.FORBIDDEN, "Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(requestLogger);

app.use("/api/v1", apiRouter);

app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);
app.use(errorHandlers);

export { app, logger };
