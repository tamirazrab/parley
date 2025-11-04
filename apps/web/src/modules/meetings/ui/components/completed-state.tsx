"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import {
  SparklesIcon,
  FileTextIcon,
  BookOpenTextIcon,
  FileVideoIcon,
  ClockFadingIcon,
} from "lucide-react";
import { format } from "date-fns";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Transcript } from "./transcript";
import { ChatProvider } from "./chat-provider";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";
import type { MeetingGetOne } from "@/lib/types";

const markdownComponents = {
  h1: (props: any) => <h1 className="mb-6 font-medium text-2xl" {...props} />,
  h2: (props: any) => <h2 className="mb-6 font-medium text-xl" {...props} />,
  h3: (props: any) => <h3 className="mb-6 font-medium text-lg" {...props} />,
  h4: (props: any) => <h4 className="mb-6 font-medium text-base" {...props} />,
  p: (props: any) => <p className="mb-6 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="mb-6 list-inside list-disc" {...props} />,
  ol: (props: any) => <ol className="mb-6 list-inside list-decimal" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  strong: (props: any) => <strong className="font-semibold" {...props} />,
  code: (props: any) => (
    <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="my-4 border-l-4 pl-4 italic" {...props} />
  ),
};

const triggerClass =
  "text-muted-foreground rounded-none bg-background border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full";

interface Props {
  data: MeetingGetOne;
}

export const CompletedState = ({ data }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="summary">
        <div className="rounded-lg border bg-white px-3">
          <ScrollArea>
            <TabsList className="h-13 justify-start rounded-none bg-background p-0">
              <TabsTrigger value="summary" className={triggerClass}>
                <BookOpenTextIcon /> Summary
              </TabsTrigger>
              <TabsTrigger value="transcript" className={triggerClass}>
                <FileTextIcon /> Transcript
              </TabsTrigger>
              <TabsTrigger value="recording" className={triggerClass}>
                <FileVideoIcon /> Recording
              </TabsTrigger>
              <TabsTrigger value="chat" className={triggerClass}>
                <SparklesIcon /> Ask AI
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value="chat">
          <ChatProvider meetingId={data.id} meetingName={data.name} />
        </TabsContent>

        <TabsContent value="transcript">
          <Transcript meetingId={data.id} />
        </TabsContent>

        <TabsContent value="recording">
          <div className="rounded-lg border bg-white px-4 py-5">
            {data.recordingUrl ? (
              <video src={data.recordingUrl} className="w-full rounded-lg" controls>
                <track kind="captions" />
              </video>
            ) : (
              <p className="text-muted-foreground">Recording not available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="rounded-lg border bg-white">
            <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
              <h2 className="font-medium text-2xl capitalize">{data.name}</h2>
              <div className="flex items-center gap-x-2">
                <Link
                  href={`/agents/${data.agent.id}`}
                  className="flex items-center gap-x-2 capitalize underline underline-offset-4"
                >
                  <GeneratedAvatar
                    variant="botttsNeutral"
                    seed={data.agent.name}
                    className="size-5"
                  />
                  {data.agent.name}
                </Link>
                <p>
                  {data.startedAt ? format(new Date(data.startedAt), "PPP") : ""}
                </p>
              </div>
              <div className="flex items-center gap-x-2">
                <SparklesIcon className="size-4" />
                <p>General summary</p>
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4"
              >
                <ClockFadingIcon className="text-blue-700" />
                {data.duration ? formatDuration(data.duration) : "No duration"}
              </Badge>
              <Markdown rehypePlugins={[rehypeSanitize]} components={markdownComponents}>
                {data.summary}
              </Markdown>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
