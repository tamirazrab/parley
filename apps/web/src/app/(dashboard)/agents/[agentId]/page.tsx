import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrationBoundary, defaultShouldDehydrateQuery, dehydrate } from "@tanstack/react-query";

import { 
  AgentIdView, 
  AgentIdViewError, 
  AgentIdViewLoading
} from "@/modules/agents/ui/views/agent-id-view";
import { getQueryClient, trpc } from "@/utils/trpc";

interface Props {
  params: Promise<{ agentId: string }>
};

const Page = async ({ params }: Props) => {
  const { agentId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );

  const dehydratedState = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) ||
      query.state.status === 'pending',
  });


  return ( 
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<AgentIdViewLoading />}>
        <ErrorBoundary fallback={<AgentIdViewError />}>
          <AgentIdView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
