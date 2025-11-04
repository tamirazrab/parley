"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";
import { trpc } from "@/utils/trpc";
import { meetingsInsertSchema } from "@parley/api/routers/meetings/api/schemas";
import type { MeetingGetOne } from "@/lib/types";
import { CommandSelect } from "@/components/custom/command-select";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    }),
  );

  const invalidateMeetingQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({})),
      queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions()),
    ]);
  };

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof meetingsInsertSchema>) => {
      return initialValues?.id
        ? trpc.meetings.update.mutateAsync({ ...values, id: initialValues.id })
        : trpc.meetings.create.mutateAsync(values);
    },
    onSuccess: async (data) => {
      await invalidateMeetingQueries();
      if (initialValues?.id) {
        await queryClient.invalidateQueries(
          trpc.meetings.getOne.queryOptions({ id: initialValues.id }),
        );
      }
      onSuccess?.(data?.id);
    },
    onError: (error: any) => {
      toast.error(error.message);
      if (error.data?.code === "FORBIDDEN") router.push("/upgrade");
    },
  });

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isEdit = Boolean(initialValues?.id);

  const agentOptions = useMemo(
    () =>
      (agents.data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="border size-6"
            />
            <span>{agent.name}</span>
          </div>
        ),
      })),
    [agents.data],
  );

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return (
    <>
      <NewAgentDialog
        open={openNewAgentDialog}
        onOpenChange={setOpenNewAgentDialog}
      />

      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Math Consultations" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="agentId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent</FormLabel>
                <FormControl>
                  <CommandSelect
                    options={agentOptions}
                    onSelect={field.onChange}
                    onSearch={setAgentSearch}
                    value={field.value}
                    placeholder="Select an agent"
                  />
                </FormControl>
                <FormDescription>
                  Not found what you&apos;re looking for?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    Create new agent
                  </button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-x-2">
            {onCancel && (
              <Button
                variant="ghost"
                type="button"
                onClick={onCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={mutation.isPending}>
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
