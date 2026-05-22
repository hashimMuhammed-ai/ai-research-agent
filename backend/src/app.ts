import express, { Application } from "express";
import { createServer, Server as HttpServer } from "http";
import cors from "cors";
import "dotenv/config";
import rootRouter from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import "./workers/research.worker";


const createApp = (): { app: Application; httpServer: HttpServer } => {
  const app = express();
  const httpServer = createServer(app); 

  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", rootRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use(errorMiddleware);

  return { app, httpServer };
};

export default createApp;