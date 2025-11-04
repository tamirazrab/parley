"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { CallProvider } from "../components/call-provider";
import { trpc } from "@/utils/trpc";
import { ErrorState } from "@/components/custom/error-state";

interface Props {
  meetingId: string;
};

export const CallView = ({
  meetingId
}: Props) => {
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  if (data.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />
};
