import type { AppRouter } from "@parley/api/routers/index";
import type { inferRouterOutputs } from "@trpc/server";


export type AgentsGetMany = inferRouterOutputs<AppRouter>["agents"]["getMany"]["items"];
export type AgentGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];
