import IORedis from "ioredis";
import logger from "../utils/logger";

const redisHost = process.env.REDIS_HOST || "localhost";
const useTls = process.env.REDIS_TLS === "true" || redisHost.endsWith(".upstash.io");

export const redisConnectionOptions = {
  host:                 redisHost,
  port:                 Number(process.env.REDIS_PORT) || 6379,
  password:             process.env.REDIS_PASSWORD || undefined,
  tls:                  useTls ? {} : undefined,
  maxRetriesPerRequest: null,
};

export const redisConnection = new IORedis(redisConnectionOptions);

redisConnection.on("connect", () => logger.info("Redis connected"));
redisConnection.on("error",   (err: Error) =>
  logger.error("Redis error", { error: err.message })
);