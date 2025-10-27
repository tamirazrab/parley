"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";

interface DashboardCommandProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: DashboardCommandProps) => {
  const router = useRouter();
  const trpc = useTRPC();

  const [search, setSearch] = useState("");

  const { data: meetings } = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  const { data: agents } = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  const handleSelect = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <CommandResponsiveDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Find a meeting or agent..."
        value={search}
        onValueChange={setSearch}
      />

      <CommandList>
        {/* === Meetings === */}
        <CommandGroup heading="Meetings">
          {!meetings?.items?.length ? (
            <CommandEmpty>
              <span className="text-sm text-muted-foreground">No meetings found</span>
            </CommandEmpty>
          ) : (
            meetings.items.map(({ id, name }) => (
              <CommandItem key={id} onSelect={() => handleSelect(`/meetings/${id}`)}>
                {name}
              </CommandItem>
            ))
          )}
        </CommandGroup>

        {/* === Agents === */}
        <CommandGroup heading="Agents">
          {!agents?.items?.length ? (
            <CommandEmpty>
              <span className="text-sm text-muted-foreground">No agents found</span>
            </CommandEmpty>
          ) : (
            agents.items.map(({ id, name }) => (
              <CommandItem key={id} onSelect={() => handleSelect(`/agents/${id}`)}>
                <GeneratedAvatar seed={name} variant="botttsNeutral" className="size-5 mr-2" />
                {name}
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
