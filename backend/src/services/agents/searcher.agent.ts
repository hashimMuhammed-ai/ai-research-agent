import { SearchResultItem, AgentChainData } from "../../types";
import logger from "../../utils/logger";


const getMockSearchResults = (topic: string): SearchResultItem[] => [
  {
    title: `${topic}: A Comprehensive Overview`,
    snippet: `${topic} has emerged as one of the most significant developments in recent years, with widespread applications across multiple industries and domains.`,
    url: `https://example.com/${topic.toLowerCase().replace(/ /g, "-")}-overview`,
  },
  {
    title: `The Science Behind ${topic}`,
    snippet: `Researchers have made breakthrough discoveries related to ${topic}, revealing fundamental principles that challenge our previous understanding of the field.`,
    url: `https://research.example.com/${topic.toLowerCase().replace(/ /g, "-")}`,
  },
  {
    title: `${topic}: Current Applications and Future Trends`,
    snippet: `Industries ranging from healthcare to finance are actively adopting ${topic} technologies, with the global market projected to grow significantly over the next decade.`,
    url: `https://trends.example.com/${topic.toLowerCase().replace(/ /g, "-")}`,
  },
  {
    title: `Challenges and Limitations of ${topic}`,
    snippet: `Despite promising advances, ${topic} faces several key challenges including scalability, ethical considerations, and regulatory hurdles that researchers are working to address.`,
    url: `https://analysis.example.com/${topic.toLowerCase().replace(/ /g, "-")}-challenges`,
  },
  {
    title: `${topic} in Practice: Real-World Case Studies`,
    snippet: `Several organizations have successfully implemented ${topic} solutions, demonstrating measurable improvements in efficiency, accuracy, and cost reduction.`,
    url: `https://casestudies.example.com/${topic.toLowerCase().replace(/ /g, "-")}`,
  },
];

export const searcherAgent = async (
  topic: string
): Promise<AgentChainData> => {
  logger.info("Searcher agent running", { topic });

  const searchResults = getMockSearchResults(topic);

  logger.info("Searcher agent done", {
    topic,
    resultCount: searchResults.length,
  });

  return { topic, searchResults };
};