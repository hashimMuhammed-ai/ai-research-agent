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
    const fullError = err?.message || String(err);

    // Produce a short, user-friendly error for clients while keeping
    // the full error in server-side storage/logs.
    const shortError = (() => {
      try {
        const msg = fullError.replace(/\s+/g, " ").trim();

        // If there's an explicit retry time, surface that first
        const retryMatch = msg.match(/retry(?:ing)?(?: in)?\s*([0-9]+(?:\.[0-9]+)?)s/i);
        if (retryMatch) {
          return `Groq API error: Quota exceeded — retry in ${retryMatch[1]}s`;
        }

        // Common quota wording
        if (/quota.*exceed/i.test(msg) || /quota exceeded/i.test(msg)) {
          return "Groq API error: Quota exceeded — please try again later";
        }

        // Prefer the Groq API short prefix if present
        const genMatch = msg.match(/(Groq API error:[^\[]*?)(?:\[|$)/i);
        if (genMatch) return genMatch[1].trim();

        // Fallback: return the first sentence (trimmed)
        const firstSentence = msg.split(/\. |\n/)[0];
        return firstSentence.length > 200 ? firstSentence.slice(0, 200) + "…" : firstSentence;
      } catch {
        return "An unexpected error occurred";
      }
    })();

    // Store full error in DB for debugging
    await ReportModel.findOneAndUpdate(
      { jobId: job.id },
      { status: "failed", error: fullError }
    );

    // Emit concise error to client
    socketService.emitJobFailed(job.data.userId, {
      jobId: job.id,
      topic: job.data.topic,
      error: shortError,
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