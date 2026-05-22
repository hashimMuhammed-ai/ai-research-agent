import "dotenv/config";
import createApp from "./src/app";
import connectDB from "./src/config/db";
import { initSocket } from "./src/config/socket";
import logger from "./src/utils/logger";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  const { httpServer } = createApp();

  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info("Server started", {
      port: PORT,
      environment: process.env.NODE_ENV,
      url: `http://localhost:${PORT}/api/v1/health`,
    });
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received — shutting down gracefully");
    process.exit(0);
  });
};

startServer();