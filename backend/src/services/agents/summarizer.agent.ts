import { geminiService } from "../gemini.service";
import { AgentChainData } from "../../types";
import { AppError } from "../../utils/AppError";
import logger from "../../utils/logger";



const buildSummarizerPrompt = (
  topic: string,
  searchResults: AgentChainData["searchResults"]
): string => {
  const sourcesText = searchResults
    .map(
      (result, index) =>
        `Source ${index + 1}: ${result.title}\n${result.snippet}\nURL: ${result.url}`
    )
    .join("\n\n");

  return `You are a research assistant specializing in creating clear, accurate summaries.

TASK: Summarize the following search results about "${topic}".

SEARCH RESULTS:
${sourcesText}

INSTRUCTIONS:
- Write a comprehensive summary of 3-4 paragraphs
- Only use information from the provided sources
- Do NOT add external knowledge or make assumptions
- Highlight the most important findings and key themes
- Use clear, professional language suitable for a research report
- Start directly with the summary — no preamble or meta-commentary

SUMMARY:`;
};

export const summarizerAgent = async (
  chainData: AgentChainData
): Promise<AgentChainData> => {
  const { topic, searchResults } = chainData;

  if (!searchResults || searchResults.length === 0) {
    throw new AppError("Summarizer received no search results", 500);
  }

  logger.info("Summarizer agent running", { topic });

  const prompt = buildSummarizerPrompt(topic, searchResults);
  const summary = await geminiService.generate(prompt);

  logger.info("Summarizer agent done", { topic });

  return { ...chainData, summary };
};