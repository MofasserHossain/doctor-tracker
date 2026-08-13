import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import mongoose from "mongoose";

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: !env.isProduction,
  });

  logger.info("MongoDB connected");
};

export const disconnectFromDatabase = async () => {
  await mongoose.disconnect();
};
