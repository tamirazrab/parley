import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Channel as StreamChannel } from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { trpc } from "@/utils/trpc";
import { LoadingState } from "@/components/custom/loading-state";

interface ChatUIProps {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage?: string;
}

export const ChatUI = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: ChatUIProps) => {
  // TODO: fix the default value
  const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY || 'wrong';


  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions()
  );

  const userData = useMemo(
    () => ({
      id: userId,
      name: userName,
      image: userImage,
    }),
    [userId, userName, userImage]
  );

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: async () => {
      try {
        return await generateChatToken();
      } catch (err) {
        console.error("Failed to generate chat token:", err);
        throw err;
      }
    },
    userData,
  });

  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    let isMounted = true;

    const setupChannel = async () => {
      try {
        setLoading(true);
        const newChannel = client.channel("messaging", meetingId, {
          members: [userId],
        });
        await newChannel.watch();

        if (isMounted) {
          setChannel(newChannel);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing chat channel:", err);
        if (isMounted) setError("Failed to connect to chat.");
      }
    };

    setupChannel();

    return () => {
      isMounted = false;
      client.disconnectUser().catch((e) =>
        console.warn("Error disconnecting chat client:", e)
      );
    };
  }, [client, meetingId,  userId]);

  if (!apiKey) {
    console.error(
      "Missing required environment variable: NEXT_PUBLIC_STREAM_CHAT_API_KEY"
    );
    return (
      <div className="p-4 text-red-600">
        Missing chat configuration. Please contact support.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error || "An unexpected chat error occurred."}
      </div>
    );
  }

  if (loading || !client || !channel) {
    return (
      <LoadingState
        title="Loading Chat"
        description="Setting up your chat session..."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <div className="max-h-[calc(100vh-23rem)] flex-1 overflow-y-auto border-b">
              <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
