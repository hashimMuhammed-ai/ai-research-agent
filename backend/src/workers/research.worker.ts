import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { ResearchJobData, ResearchJobResult, AgentProgress } from "../types";
import { searcherAgent } from "../services/agents/searcher.agent";
import { summarizerAgent } from "../services/agents/summarizer.agent";
import { factCheckerAgent } from "../services/agents/factChecker.agent";
import { writerAgent } from "../services/agents/writer.agent";
import logger from "../utils/logger";
import { ReportModel } from "../models/report.model";



const runAgent = async <T>(
  job: Job<ResearchJobData>,
  agent: AgentProgress["agent"],
  task: () => Promise<T>
): Promise<T> => {
  await job.updateProgress({ agent, status: "active" } as AgentProgress);
  const result = await task();
  await job.updateProgress({ agent, status: "completed" } as AgentProgress);
  return result;
};

const researchWorker = new Worker<ResearchJobData, ResearchJobResult>(
  "research",
  async (job: Job<ResearchJobData>): Promise<ResearchJobResult> => {
    const { topic, userId } = job.data;
    logger.info("Research job started", { jobId: job.id, topic });

    const afterSearch = await runAgent(job, "searcher", () =>
      searcherAgent(topic)
    );

    const afterSummary = await runAgent(job, "summarizer", () =>
      summarizerAgent(afterSearch)
    );

    const afterFactCheck = await runAgent(job, "factChecker", () =>
      factCheckerAgent(afterSummary)
    );

    const afterReport = await runAgent(job, "writer", () =>
      writerAgent(afterFactCheck)
    );

    if (!afterReport.report) {
      throw new Error("Pipeline completed but no report was generated");
    }

    logger.info("Research job completed", { jobId: job.id, topic });

    return {
      topic,
      userId,
      report: afterReport.report,
    };
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

researchWorker.on("completed", async (job: Job, result: ResearchJobResult) => {
  logger.info("Job completed", { jobId: job.id, topic: result.topic });

  await ReportModel.findOneAndUpdate(
    { jobId: job.id },
    { status: "completed", report: result.report },
    { new: true }
  );
});

researchWorker.on("failed", async (job: Job | undefined, err: Error) => {
  logger.error("Job failed", { jobId: job?.id, error: err.message });

  if (job?.id) {
    await ReportModel.findOneAndUpdate(
      { jobId: job.id },
      { status: "failed", error: err.message }
    );
  }
});

researchWorker.on("progress", (_job: Job, progress) => {
  const typedProgress = progress as AgentProgress
  logger.info("Agent progress update", {
    agent: typedProgress.agent,
    status: typedProgress.status,
  });
});

export default researchWorker;