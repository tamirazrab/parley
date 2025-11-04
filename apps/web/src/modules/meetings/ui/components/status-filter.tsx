import { CommandSelect } from "@/components/custom/command-select";
import { MEETING_STATUS, type MeetingStatus } from "@/lib/constants";
import {
  CircleXIcon,
  CircleCheckIcon,
  ClockArrowUpIcon,
  VideoIcon,
  LoaderIcon,
} from "lucide-react";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";


const options = [
  {
    id: MEETING_STATUS.UPCOMING,
    value: MEETING_STATUS.UPCOMING,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <ClockArrowUpIcon />
        {MEETING_STATUS.UPCOMING}
      </div>
    )
  },
  {
    id: MEETING_STATUS.COMPLETED,
    value: MEETING_STATUS.COMPLETED,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <CircleCheckIcon />
        {MEETING_STATUS.COMPLETED}
      </div>
    ),
  },
  {
    id: MEETING_STATUS.ACTIVE,
    value: MEETING_STATUS.ACTIVE,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <VideoIcon />
        {MEETING_STATUS.ACTIVE}
      </div>
    ),
  },
  {
    id: MEETING_STATUS.PROCESSING,
    value: MEETING_STATUS.PROCESSING,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <LoaderIcon />
        {MEETING_STATUS.PROCESSING}
      </div>
    ),
  },
  {
    id: MEETING_STATUS.CANCELLED,
    value: MEETING_STATUS.CANCELLED,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <CircleXIcon />
        {MEETING_STATUS.CANCELLED}
      </div>
    ),
  },
];

export const StatusFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  return (
    <CommandSelect
      placeholder="Status"
      className="h-9"
      options={options}
      onSelect={(value) => setFilters({ status: value as MeetingStatus })}
      value={filters.status ?? ""}
    />
  );
};
