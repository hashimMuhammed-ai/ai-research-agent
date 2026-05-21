import { Router } from "express";
import { researchController } from "../controllers/research.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createResearchSchema } from "../validations/research.validation";


const router = Router();

router.use(protect);

router.post(
  "/",
  validate(createResearchSchema),
  asyncHandler(researchController.createResearch)
);

router.get(
  "/status/:jobId",
  asyncHandler(researchController.getJobStatus)
);

router.get(
  "/reports",
  asyncHandler(researchController.getUserReports)
);

router.get(
  "/reports/:reportId",
  asyncHandler(researchController.getFullReport)
);

export default router;