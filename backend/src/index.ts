import { connectToDatabase, disconnectFromDatabase } from "@/common/db/db";
import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandledRejection");
});

const startServer = async () => {
  await connectToDatabase();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`Server (${env.NODE_ENV}) running on http://${env.HOST}:${env.PORT}`);
  });

  const onCloseSignal = async () => {
    logger.info("Shutdown signal received, shutting down");
    await disconnectFromDatabase();

    server.close(() => {
      logger.info("Server closed");
      process.exit();
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => void onCloseSignal());
  process.on("SIGTERM", () => void onCloseSignal());
};

void startServer();
