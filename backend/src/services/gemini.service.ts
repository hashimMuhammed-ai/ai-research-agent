import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";


class GeminiService {
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new AppError("GEMINI_API_KEY is not defined in environment", 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
  }


  async generate(prompt: string): Promise<string> {
    try {
      logger.info("Sending prompt to Gemini", {
        promptLength: prompt.length,
      });

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.info("Gemini response received", {
        responseLength: text.length,
      });

      return text;
    } catch (error) {
      const err = error as Error;
      logger.error("Gemini API call failed", { error: err.message });
      throw new AppError(`Gemini API error: ${err.message}`, 502);
    }
  }
}

export const geminiService = new GeminiService();