import { Suspense } from "react";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { defaultShouldDehydrateQuery, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { loadSearchParams } from "@/modules/agents/params";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { 
  AgentsView, 
  AgentsViewError, 
  AgentsViewLoading
} from "@/modules/agents/ui/views/agents-view";
import { queryClient, trpc } from "@/utils/trpc";
import { auth } from "@parley/auth";

interface Props {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
    ...filters,
  }));

  const dehydratedState = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) ||
      query.state.status === 'pending',
  });

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};
 
export default Page;
