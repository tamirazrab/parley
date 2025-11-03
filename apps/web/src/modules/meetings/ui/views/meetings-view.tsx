"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { trpc } from "@/utils/trpc";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

import { DataTable } from "@/components/custom/data-table";
import { DataPagination } from "@/components/custom/data-pagination";
import { EmptyState } from "@/components/custom/empty-state";
import { LoadingState } from "@/components/custom/loading-state";
import { ErrorState } from "@/components/custom/error-state";

import { columns } from "../components/columns";
import { useCallback } from "react";

export const MeetingsView = () => {
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({ ...filters })
  );

  const handleRowClick = useCallback(
    (row: { id: string }) => router.push(`/meetings/${row.id}`),
    [router]
  );

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  if (data.items.length === 0) {
    return (
      <div className="flex-1 px-4 py-4 md:px-8">
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to collaborate, share ideas, and connect with others in real time."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={handleRowClick}
      />
      {data.totalPages > 1 && (
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export const MeetingsViewLoading = () => (
  <LoadingState
    title="Loading Meetings"
    description="This may take a few seconds"
  />
);

export const MeetingsViewError = () => (
  <ErrorState
    title="Error Loading Meetings"
    description="Something went wrong. Please try again later."
  />
);
