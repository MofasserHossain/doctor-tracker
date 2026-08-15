import { env } from "@/common/utils/envConfig";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { pino } from "pino";

const logger = pino({ name: "doctor-tracker-db" });

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose.connect(env.MONGODB_URI, {
    autoIndex: !env.isProduction,
  });

  await connectionPromise.finally(() => {
    connectionPromise = null;
  });

  logger.info("MongoDB connected");
};

export const disconnectFromDatabase = async () => {
  connectionPromise = null;
  await mongoose.disconnect();
};

export const databaseConnectionMiddleware = async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
};
