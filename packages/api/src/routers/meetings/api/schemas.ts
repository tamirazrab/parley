import { z } from "zod";

const baseMeetingSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  agentId: z.string().min(1, { message: "Agent is required" }),
});

export const meetingsInsertSchema = baseMeetingSchema;

export const meetingsUpdateSchema = baseMeetingSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});