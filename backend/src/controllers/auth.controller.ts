import { Response } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../types";
import { RegisterInput, LoginInput } from "../validations/auth.validation";


export const authController = {
  async register(req: AuthRequest, res: Response): Promise<void> {
    const input = req.body as RegisterInput;
    const data = await authService.register(input);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data,
    });
  },

  async login(req: AuthRequest, res: Response): Promise<void> {
    const input = req.body as LoginInput;
    const data = await authService.login(input);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data,
    });
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    // req.user is already attached by protect middleware
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: req.user,
    });
  },
};