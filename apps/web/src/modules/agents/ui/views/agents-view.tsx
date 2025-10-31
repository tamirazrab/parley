"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";


import { columns } from "../components/columns";
import { DataPagination } from "../components/data-pagination";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataTable } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/empty-state";
import { ErrorState } from "@/components/custom/error-state";
import { LoadingState } from "@/components/custom/loading-state";
import { trpc } from "@/utils/trpc";

/**
 * Displays the main view of agents with pagination.
 * Fetches agent data using TRPC and React Query Suspense.
 */
export const AgentsView = () => {
  const router = useRouter();
  const [filters, updateAgentFilters] = useAgentsFilters();

  // Suspense query automatically handles loading and error states
  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({ ...filters })
  );

  const { items: agentList, totalPages } = data;

  // Navigate to agent details
  const handleAgentClick = useCallback(
    (agent: { id: string }) => {
      router.push(`/agents/${agent.id}`);
    },
    [router]
  );

  // Handle pagination updates
  const handlePageChange = useCallback(
    (newPage: number) => updateAgentFilters({ page: newPage }),
    [updateAgentFilters]
  );

  // Show empty state when no agents exist
  if (!agentList || agentList.length === 0) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join your meetings. Each agent follows your instructions and interacts with participants during calls."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable
        data={agentList}
        columns={columns}
        onRowClick={handleAgentClick}
      />
      <DataPagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

/**
 * Suspense fallback component displayed while agents are loading.
 */
export const AgentsViewLoading = () => (
  <LoadingState
    title="Loading Agents"
    description="This may take a few seconds."
  />
);

/**
 * Error boundary fallback displayed when data fetching fails.
 */
export const AgentsViewError = () => (
  <ErrorState
    title="Error Loading Agents"
    description="Something went wrong while fetching agents."
  />
);
