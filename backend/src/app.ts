import express, { Application } from "express";
import cors from "cors";
import "dotenv/config";
import rootRouter from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import "./workers/research.worker"; // Boot worker on app start


const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", rootRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use(errorMiddleware);

  return app;
};

export default createApp;