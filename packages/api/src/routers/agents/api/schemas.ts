import { z } from "zod";

export const agentBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructions: z.string().min(1, "Instructions are required"),
});

export const agentsInsertSchema = agentBaseSchema;

export const agentsUpdateSchema = agentBaseSchema.extend({
  id: z.string().min(1, "ID is required"),
});
