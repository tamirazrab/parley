"use client";

import Link from "next/link";
import { RocketIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FREE_TIER_LIMITS } from "@/lib/constants";
import { trpc } from "@/utils/trpc";

export const DashboardTrial = () => {

  const { data } = useQuery(
    trpc.premium.getFreeUsage.queryOptions()
  );


  const agentProgress = Math.min((data.agentCount / FREE_TIER_LIMITS.agents) * 100, 100);
  const meetingProgress = Math.min((data.meetingCount / FREE_TIER_LIMITS.meetings) * 100, 100);

  return (
    <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col">
      <div className="p-3 flex flex-col gap-y-4">
        <div className="flex items-center gap-2">
          <RocketIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">Free Trial</p>
        </div>

        {/* Agents usage */}
        <UsageProgress
          label="Agents"
          count={data.agentCount}
          max={FREE_TIER_LIMITS.agents}
          value={agentProgress}
        />

        {/* Meetings usage */}
        <UsageProgress
          label="Meetings"
          count={data.meetingCount}
          max={FREE_TIER_LIMITS.meetings}
          value={meetingProgress}
        />
      </div>

      <Button
        className="bg-transparent border-t border-border/10 hover:bg-white/10 rounded-t-none"
        asChild
      >
        <Link href="/upgrade">Upgrade</Link>
      </Button>
    </div>
  );
};

// Extracted subcomponent for reuse and clarity
interface UsageProgressProps {
  label: string;
  count: number;
  max: number;
  value: number;
}

const UsageProgress = ({ label, count, max, value }: UsageProgressProps) => (
  <div className="flex flex-col gap-y-2">
    <p className="text-xs">
      {count}/{max} {label}
    </p>
    <Progress value={value} />
  </div>
);
