import { z } from "zod";

export const createResearchSchema = z.object({
  topic: z
    .string()
    .min(3, "Topic must be at least 3 characters")
    .max(200, "Topic cannot exceed 200 characters")
    .trim(),
});

export type CreateResearchInput = z.infer<typeof createResearchSchema>;