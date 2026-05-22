import { getIO } from "../config/socket";
import {
  AgentProgressEvent,
  JobCompletedEvent,
  JobFailedEvent,
} from "../types";
import logger from "../utils/logger";


export const socketService = {

  emitAgentProgress(userId: string, data: AgentProgressEvent): void {
    try {

      getIO().to(`user:${userId}`).emit("agent:progress", data);

      logger.info("Socket event emitted: agent:progress", {
        userId,
        agent: data.agent,
        status: data.status,
      });
    } catch (error) {
      logger.error("Failed to emit agent:progress", {
        error: (error as Error).message,
      });
    }
  },

  emitJobCompleted(userId: string, data: JobCompletedEvent): void {
    try {
      getIO().to(`user:${userId}`).emit("job:completed", data);

      logger.info("Socket event emitted: job:completed", {
        userId,
        jobId: data.jobId,
      });
    } catch (error) {
      logger.error("Failed to emit job:completed", {
        error: (error as Error).message,
      });
    }
  },

  emitJobFailed(userId: string, data: JobFailedEvent): void {
    try {
      getIO().to(`user:${userId}`).emit("job:failed", data);

      logger.info("Socket event emitted: job:failed", {
        userId,
        jobId: data.jobId,
      });
    } catch (error) {
      logger.error("Failed to emit job:failed", {
        error: (error as Error).message,
      });
    }
  },
};