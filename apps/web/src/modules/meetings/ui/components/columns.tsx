"use client";

import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  ClockFadingIcon,
  CornerDownRightIcon,
  LoaderIcon,
} from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MeetingGetMany } from "@/lib/types";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";

const statusIconMap = {
  upcoming: ClockArrowUpIcon,
  active: LoaderIcon,
  completed: CircleCheckIcon,
  processing: LoaderIcon,
  cancelled: CircleXIcon,
};

const statusColorMap = {
  upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
};

const MeetingStatusBadge = ({ status }: { status: keyof typeof statusIconMap }) => {
  const Icon = statusIconMap[status];
  return (
    <Badge
      variant="outline"
      aria-label={status}
      className={cn("text-muted-foreground capitalize [&>svg]:size-4", statusColorMap[status])}
    >
      <Icon className={cn(status === "processing" && "animate-spin")} />
      {status}
    </Badge>
  );
};

export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <span className="truncate font-semibold capitalize">{row.original.name}</span>
        <div className="flex items-center gap-x-2">
                 <div className="flex items-center gap-x-1">
          <CornerDownRightIcon className="size-3 text-muted-foreground" />
          <span className="max-w-[200px] truncate text-muted-foreground text-sm capitalize">
            {row.original.agent?.name ?? "Unknown Agent"}
          </span>
          </div>
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.agent?.name ?? ""}
            className="size-4"
          />
          <span className="text-muted-foreground text-sm">
            {row.original.startedAt
              ? format(new Date(row.original.startedAt), "MMM d")
              : ""}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <MeetingStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex items-center gap-x-2 capitalize [&>svg]:size-4"
      >
        <ClockFadingIcon className="text-blue-700" />
        {row.original.duration
          ? formatDuration(row.original.duration)
          : "No duration"}
      </Badge>
    ),
  },
];
