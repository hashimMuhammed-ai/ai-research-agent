import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../types";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";


export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Not authorized — no token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      throw new AppError("User belonging to this token no longer exists", 401);
    }

    req.user = user;
    next();
  }
);