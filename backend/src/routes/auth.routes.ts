import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { registerSchema, loginSchema } from "../validations/auth.validation";


const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.get(
  "/me",
  protect,
  asyncHandler(authController.getMe)
);

export default router;