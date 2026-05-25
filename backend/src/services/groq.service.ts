import Groq from "groq-sdk";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";


class GroqService {
  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new AppError("GROQ_API_KEY is not defined in environment", 500);
    }

    this.client = new Groq({ apiKey });

    this.model =
      process.env.GROQ_MODEL ||
      "meta-llama/llama-4-scout-17b-16e-instruct";
  }


  async generate(prompt: string): Promise<string> {
    try {
      logger.info("Sending prompt to Groq", {
        model:        this.model,
        promptLength: prompt.length,
      });

      const completion = await this.client.chat.completions.create({
        model:    this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens:  2096,
      });

      const text = completion.choices[0]?.message?.content;

      if (!text) {
        throw new AppError("Groq returned an empty response", 502);
      }

      logger.info("Groq response received", {
        responseLength:   text.length,
        promptTokens:     completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens:      completion.usage?.total_tokens,
      });

      return text;
    } catch (error) {
      if (error instanceof AppError) throw error;

      const err = error as Error;
      logger.error("Groq API call failed", { error: err.message });
      throw new AppError(`Groq API error: ${err.message}`, 502);
    }
  }
}

export const groqService = new GroqService();