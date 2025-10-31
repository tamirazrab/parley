"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { UpdateAgentDialog } from "../components/update-agent-dialog";
import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { ErrorState } from "@/components/custom/error-state";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";
import { LoadingState } from "@/components/custom/loading-state";
import { trpc } from "@/utils/trpc";
import { useConfirm } from "../../hooks/use-confirm";

interface AgentIdViewProps {
  agentId: string;
}

/**
 * Displays details of a specific agent, including name, avatar, and instructions.
 * Allows editing and removing the agent, with confirmation and cache invalidation.
 */
export const AgentIdView = ({ agentId }: AgentIdViewProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Fetch single agent data
  const { data: agent  } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  // Confirmation modal for removal
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure you want to remove this agent?",
    `This action will permanently remove agent "${agent.name}" and its ${agent.meetingCount} associated ${
      agent.meetingCount === 1 ? "meeting" : "meetings"
    }.`
  );

  // Remove mutation
  const removeAgentMutation = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        // Invalidate related queries concurrently
        await Promise.all([
          queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({})),
          queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions()),
        ]);

        toast.success(`Agent "${agent.name}" has been removed.`);
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to remove agent.");
      },
    })
  );

  // Handle remove action with confirmation
  const handleRemoveAgent = useCallback(async () => {
    const userConfirmed = await confirmRemove();
    if (!userConfirmed) return;

    await removeAgentMutation.mutateAsync({ id: agentId });
   
  }, [agentId, confirmRemove, removeAgentMutation]);

  const handleEditAgent = useCallback(() => {
    setIsUpdateDialogOpen(true);
  }, []);

  return (
    <>
      <RemoveConfirmation />
      <UpdateAgentDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        initialValues={agent}
      />

      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <AgentIdViewHeader
          agentId={agentId}
          agentName={agent.name}
          onEdit={handleEditAgent}
          onRemove={handleRemoveAgent}
        />

        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 flex flex-col gap-y-5">
            {/* Agent Header */}
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                variant="botttsNeutral"
                seed={agent.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium">{agent.name}</h2>
            </div>

            {/* Meeting Count */}
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-blue-700" />
              {agent.meetingCount}{" "}
              {agent.meetingCount === 1 ? "meeting" : "meetings"}
            </Badge>

            {/* Instructions */}
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{agent.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Suspense fallback shown while agent data is loading.
 */
export const AgentIdViewLoading = () => (
  <LoadingState
    title="Loading Agent"
    description="This may take a few seconds."
  />
);

/**
 * Error fallback shown when agent data fails to load.
 */
export const AgentIdViewError = () => (
  <ErrorState
    title="Error Loading Agent"
    description="Something went wrong while fetching the agent details."
  />
);
