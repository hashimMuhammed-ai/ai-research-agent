import { geminiService } from "../gemini.service";
import { AgentChainData } from "../../types";
import { AppError } from "../../utils/AppError";
import logger from "../../utils/logger";


const buildWriterPrompt = (
  topic: string,
  verifiedSummary: string,
  searchResults: AgentChainData["searchResults"]
): string => {
  const sourcesList = searchResults
    .map((result, index) => `${index + 1}. [${result.title}](${result.url})`)
    .join("\n");

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `You are a professional research writer producing formal research reports.

TASK: Write a complete, polished research report about "${topic}".

VERIFIED RESEARCH CONTENT:
${verifiedSummary}

INSTRUCTIONS:
- Structure the report using this exact Markdown format:

# Research Report: ${topic}

**Generated:** ${today}  
**Topic:** ${topic}

## Executive Summary
[2-3 sentence high-level overview]

## Key Findings
[4-6 bullet points of the most important findings]

## Detailed Analysis
[3-4 paragraphs expanding on the verified research content]

## Implications & Applications
[1-2 paragraphs on real-world impact and use cases]

## Conclusion
[1 paragraph wrapping up the research]

## Sources
${sourcesList}

---
- Use professional, authoritative language
- Make it suitable for a business or academic audience
- Do not add facts beyond what's in the verified content
- Return ONLY the formatted report, nothing else

REPORT:`;
};

export const writerAgent = async (
  chainData: AgentChainData
): Promise<AgentChainData> => {
  const { topic, searchResults, verifiedSummary } = chainData;

  if (!verifiedSummary) {
    throw new AppError("Writer received no verified summary", 500);
  }

  logger.info("Writer agent running", { topic });

  const prompt = buildWriterPrompt(topic, verifiedSummary, searchResults);
  const report = await geminiService.generate(prompt);

  logger.info("Writer agent done", { topic });

  return { ...chainData, report };
};