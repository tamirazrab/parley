import { useState } from "react";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUri } from "@/lib/avatar";
import { trpc } from "@/utils/trpc";

interface Props {
  meetingId: string;
}

export const Transcript = ({ meetingId }: Props) => {
  const { data } = useQuery(trpc.meetings.getTranscript.queryOptions({ id: meetingId }))

  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = (data ?? []).filter((item) =>
    item.text.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col gap-y-4 rounded-lg border bg-white px-4 py-5">
      <p className="font-medium text-sm">Transcript</p>
      <div className="relative">
        <Input
          placeholder="Search Transcript"
          className="h-9 w-[240px] pl-7"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-2 size-4 text-muted-foreground" />
      </div>
      <ScrollArea>
        <div className="flex flex-col gap-y-4">
          {filteredData.map((item) => {
            return (
              <div
                key={item.start_ts}
                className="flex flex-col gap-y-2 rounded-md border p-4 hover:bg-muted"
              >
                <div className="flex items-center gap-x-2">
                  <Avatar className="size-6">
                    <AvatarImage
                      src={item.user.image ?? generateAvatarUri({ seed: item.user.name, variant: "initials" })}
                      alt="User Avatar"
                    />
                  </Avatar>
                  <p className="font-medium text-sm">{item.user.name}</p>
                  <p className="font-medium text-blue-500 text-sm">
                    {format(
                      new Date(0, 0, 0, 0, 0, 0, item.start_ts),
                      "mm:ss"
                    )}
                  </p>
                </div>
                <Highlighter
                  className="text-neutral-700 text-sm"
                  highlightClassName="bg-yellow-200"
                  searchWords={[searchQuery]}
                  autoEscape={true}
                  textToHighlight={item.text}
                />
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
};