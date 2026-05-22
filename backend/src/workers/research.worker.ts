import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import {
  ResearchJobData,
  ResearchJobResult,
  AgentProgress,
  AgentName,
} from "../types";
import { searcherAgent }     from "../services/agents/searcher.agent";
import { summarizerAgent }   from "../services/agents/summarizer.agent";
import { factCheckerAgent }  from "../services/agents/factChecker.agent";
import { writerAgent }       from "../services/agents/writer.agent";
import { socketService }     from "../services/socket.service";
import { ReportModel }       from "../models/report.model";
import logger                from "../utils/logger";

const TOTAL_AGENTS = 4;

const agentOrder: AgentName[] = [
  "searcher",
  "summarizer",
  "factChecker",
  "writer",
];


const runAgent = async <T>(
  job: Job<ResearchJobData>,
  agent: AgentName,
  userId: string,
  topic: string,
  task: () => Promise<T>
): Promise<T> => {
  const completedSoFar = agentOrder.indexOf(agent);

  await job.updateProgress({ agent, status: "active" } as AgentProgress);
  socketService.emitAgentProgress(userId, {
    jobId:           job.id!,
    topic,
    agent,
    status:          "active",
    completedAgents: completedSoFar,
    totalAgents:     TOTAL_AGENTS,
  });

  const result = await task();

  await job.updateProgress({ agent, status: "completed" } as AgentProgress);
  socketService.emitAgentProgress(userId, {
    jobId:           job.id!,
    topic,
    agent,
    status:          "completed",
    completedAgents: completedSoFar + 1,
    totalAgents:     TOTAL_AGENTS,
  });

  return result;
};


const researchWorker = new Worker<ResearchJobData, ResearchJobResult>(
  "research",
  async (job: Job<ResearchJobData>): Promise<ResearchJobResult> => {
    const { topic, userId } = job.data;
    logger.info("Research job started", { jobId: job.id, topic });

    await ReportModel.findOneAndUpdate(
      { jobId: job.id },
      { status: "processing" }
    );

    const afterSearch = await runAgent(
      job, "searcher", userId, topic,
      () => searcherAgent(topic)
    );

    const afterSummary = await runAgent(
      job, "summarizer", userId, topic,
      () => summarizerAgent(afterSearch)
    );

    const afterFactCheck = await runAgent(
      job, "factChecker", userId, topic,
      () => factCheckerAgent(afterSummary)
    );

    const afterReport = await runAgent(
      job, "writer", userId, topic,
      () => writerAgent(afterFactCheck)
    );

    if (!afterReport.report) {
      throw new Error("Pipeline completed but no report was generated");
    }

    logger.info("Research job pipeline complete", { jobId: job.id, topic });

    return { topic, userId, report: afterReport.report };
  },
  { connection: redisConnection, concurrency: 3 }
);


researchWorker.on("completed", async (job: Job, result: ResearchJobResult) => {
  logger.info("Job completed", { jobId: job.id, topic: result.topic });

  const updated = await ReportModel.findOneAndUpdate(
    { jobId: job.id },
    { status: "completed", report: result.report },
    { new: true }
  );

  socketService.emitJobCompleted(result.userId, {
    jobId:    job.id!,
    topic:    result.topic,
    reportId: updated!._id.toString(),
    report:   result.report,
  });
});

researchWorker.on("failed", async (job: Job | undefined, err: Error) => {
  logger.error("Job failed", { jobId: job?.id, error: err.message });

  if (job?.id) {
    await ReportModel.findOneAndUpdate(
      { jobId: job.id },
      { status: "failed", error: err.message }
    );

    socketService.emitJobFailed(job.data.userId, {
      jobId: job.id,
      topic: job.data.topic,
      error: err.message,
    });
  }
});

researchWorker.on("progress", (_job: Job, progress) => {
  const typedProgress = progress as AgentProgress
  logger.info("Agent progress", {
    agent:  typedProgress.agent,
    status: typedProgress.status,
  });
});

export default researchWorker;