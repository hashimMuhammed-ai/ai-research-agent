import IORedis from "ioredis";
import logger from "../utils/logger";


export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ — do not remove
});

redisConnection.on("connect", () =>
  logger.info("Redis connected")
);

redisConnection.on("error", (err: Error) =>
  logger.error("Redis connection error", { error: err.message })
);