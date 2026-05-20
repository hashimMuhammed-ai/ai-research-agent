import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";


const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);


export default router;