import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { ResearchJobData } from "../types";


export const researchQueue = new Queue<ResearchJobData>("research", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2s → 4s → 8s between retries
    },
    removeOnComplete: 100, // Keep last 100 in Redis for debugging
    removeOnFail: 50,
  },
});