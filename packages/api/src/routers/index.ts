import { protectedProcedure, publicProcedure, router } from "../index";
import { agentsRouter } from "./agents/api/agent-router";
import { meetingsRouter } from "./meetings/api/meeting-router";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
  agents: agentsRouter,
  meetings: meetingsRouter
});
export type AppRouter = typeof appRouter;
