import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../types";
import logger from "../utils/logger";


let io: SocketServer<ClientToServerEvents, ServerToClientEvents>;

export const initSocket = (httpServer: HttpServer): void => {
  io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    }
  );


  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string };

      (socket as any).userId = decoded.id;

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });


  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;

    // Join private room
    socket.join(`user:${userId}`);

    logger.info("Socket connected", {
      socketId: socket.id,
      userId,
      room: `user:${userId}`,
    });

    socket.on("job:subscribe", (jobId: string) => {
      socket.join(`job:${jobId}`);
      logger.info("Socket subscribed to job", { socketId: socket.id, jobId });
    });

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", { socketId: socket.id, reason });
    });
  });

  logger.info("Socket.io server initialized");
};

export const getIO = (): SocketServer<ClientToServerEvents, ServerToClientEvents> => {
  if (!io) {
    throw new Error("Socket.io not initialized — call initSocket() first");
  }
  return io;
};