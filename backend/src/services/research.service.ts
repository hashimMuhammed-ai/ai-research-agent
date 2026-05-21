import { researchQueue } from "../queues/research.queue";
import { ReportModel, IReport } from "../models/report.model";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";


export const researchService = {

  async createResearchJob(topic: string, userId: string): Promise<IReport> {

    const job = await researchQueue.add("research-job", { topic, userId });

    logger.info("Research job queued", { jobId: job.id, topic, userId });

    const report = await ReportModel.create({
      userId,
      topic,
      jobId: job.id,
      status: "pending",
    });

    return report;
  },

  async getReportByJobId(jobId: string, userId: string): Promise<IReport> {
    const report = await ReportModel.findOne({ jobId, userId });

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    return report;
  },

  async getUserReports(userId: string): Promise<IReport[]> {
    return await ReportModel.find({ userId })
      .sort({ createdAt: -1 }) 
      .select("-report");   
  },

  async getFullReport(reportId: string, userId: string): Promise<IReport> {
    const report = await ReportModel.findOne({ _id: reportId, userId });

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (report.status !== "completed") {
      throw new AppError(`Report is not ready yet. Status: ${report.status}`, 400);
    }

    return report;
  },
};