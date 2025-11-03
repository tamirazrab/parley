"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { useConfirm } from "@/modules/agents/hooks/use-confirm";
import { ErrorState } from "@/components/custom/error-state";
import { LoadingState } from "@/components/custom/loading-state";

import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";

import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancelled-state";
import { CompletedState } from "../components/completed-state";
import { ProcessingState } from "../components/processing-state";
import { UpcomingState } from "../components/upcoming-state";

interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "The following action will remove this meeting."
  );

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({})),
          queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions()),
        ]);
        router.push("/meetings");
      },
    })
  );

  const handleRemoveMeeting = useCallback(async () => {
    const ok = await confirmRemove();
    if (ok) await removeMeeting.mutateAsync({ id: meetingId });
  }, [confirmRemove, removeMeeting, meetingId]);

  const handleEditMeeting = useCallback(() => {
    setUpdateDialogOpen(true);
  }, []);

  const renderState = () => {
    switch (data.status) {
      case "cancelled":
        return <CancelledState />;
      case "processing":
        return <ProcessingState />;
      case "completed":
        return <CompletedState data={data} />;
      case "active":
        return <ActiveState meetingId={meetingId} />;
      case "upcoming":
        return <UpcomingState meetingId={meetingId} />;
      default:
        return null;
    }
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        initialValues={data}
      />
      <div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={handleEditMeeting}
          onRemove={handleRemoveMeeting}
        />
        {renderState()}
      </div>
    </>
  );
};

export const MeetingIdViewLoading = () => (
  <LoadingState
    title="Loading Meeting"
    description="This may take a few seconds"
  />
);

export const MeetingIdViewError = () => (
  <ErrorState
    title="Error Loading Meeting"
    description="Please try again later"
  />
);
