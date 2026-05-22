import { Response } from "express";
import { researchService } from "../services/research.service";
import { AuthRequest } from "../types";
import { CreateResearchInput } from "../validations/research.validation";


export const researchController = {

  async createResearch(req: AuthRequest, res: Response): Promise<void> {
    const { topic } = req.body as CreateResearchInput;
    const userId = req.user!._id.toString();

    const report = await researchService.createResearchJob(topic, userId);

    res.status(202).json({  
      success: true,
      message: "Research job queued successfully",
      data: {
        jobId: report.jobId,
        reportId: report._id,
        topic: report.topic,
        status: report.status,
      },
    });
  },

 
  async getJobStatus(req: AuthRequest, res: Response): Promise<void> {
    const jobId  = req.params.jobId as string;
    const userId = req.user!._id.toString();

    const report = await researchService.getReportByJobId(jobId, userId);

    res.status(200).json({
      success: true,
      message: "Job status fetched",
      data: {
        jobId: report.jobId,
        reportId: report._id,
        topic: report.topic,
        status: report.status,
        error: report.error,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  },


  async getUserReports(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id.toString();
    const reports = await researchService.getUserReports(userId);

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
    });
  },


  async getFullReport(req: AuthRequest, res: Response): Promise<void> {
    const reportId = req.params.reportId as string;
    const userId = req.user!._id.toString();

    const report = await researchService.getFullReport(reportId, userId);

    res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report,
    });
  },
};