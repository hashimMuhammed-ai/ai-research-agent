import { tavily } from "@tavily/core";
import { SearchResultItem, AgentChainData } from "../../types";
import { AppError } from "../../utils/AppError";
import logger from "../../utils/logger";


const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY as string,
});

export const searcherAgent = async (
  topic: string
): Promise<AgentChainData> => {
  if (!process.env.TAVILY_API_KEY) {
    throw new AppError("TAVILY_API_KEY is not defined in environment", 500);
  }

  logger.info("Searcher agent running — real web search", { topic });

  try {
    const response = await tavilyClient.search(topic, {
      searchDepth: "advanced",  
      maxResults:  7,         
      includeAnswer: false,   
    });

    if (!response.results || response.results.length === 0) {
      throw new AppError(`No search results found for topic: "${topic}"`, 404);
    }

    const searchResults: SearchResultItem[] = response.results.map((result) => ({
      title:   result.title   || "Untitled",
      snippet: result.content || result.rawContent || "",
      url:     result.url     || "",
    }));

    logger.info("Searcher agent done", {
      topic,
      resultCount: searchResults.length,
    });

    return { topic, searchResults };

  } catch (error) {
    if (error instanceof AppError) throw error;

    const err = error as Error;
    logger.error("Tavily search failed", { error: err.message, topic });
    throw new AppError(`Web search failed: ${err.message}`, 502);
  }
};