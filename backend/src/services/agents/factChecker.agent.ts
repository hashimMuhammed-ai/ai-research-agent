import { groqService } from "../groq.service";
import { AgentChainData } from "../../types";
import { AppError } from "../../utils/AppError";
import logger from "../../utils/logger";



const buildFactCheckerPrompt = (
  topic: string,
  searchResults: AgentChainData["searchResults"],
  summary: string
): string => {
  const sourcesText = searchResults
    .map(
      (result, index) =>
        `Source ${index + 1}: ${result.title}\n${result.snippet}`
    )
    .join("\n\n");

  return `You are a rigorous fact-checker with expertise in research verification.

TASK: Verify the following summary about "${topic}" against the original sources.

ORIGINAL SOURCES:
${sourcesText}

SUMMARY TO VERIFY:
${summary}

INSTRUCTIONS:
- Check every claim in the summary against the original sources
- Remove or correct any claims not supported by the sources
- Remove speculation or assumptions not grounded in the sources
- Keep all claims that are well-supported
- Maintain the same professional tone and structure
- Return ONLY the verified, corrected summary — no explanation of changes
- Do not add new information

VERIFIED SUMMARY:`;
};

export const factCheckerAgent = async (
  chainData: AgentChainData
): Promise<AgentChainData> => {
  const { topic, searchResults, summary } = chainData;

  if (!summary) {
    throw new AppError("Fact checker received no summary to verify", 500);
  }

  logger.info("Fact checker agent running", { topic });

  const prompt = buildFactCheckerPrompt(topic, searchResults, summary);
  const verifiedSummary = await groqService.generate(prompt);

  logger.info("Fact checker agent done", { topic });

  return { ...chainData, verifiedSummary };
};