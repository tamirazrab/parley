import "server-only";

import { StreamChat } from "stream-chat";

if (!process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_STREAM_CHAT_API_KEY");
}
if (!process.env.STREAM_CHAT_SECRET_KEY) {
  throw new Error("Missing required environment variable: STREAM_CHAT_SECRET_KEY");
}

export const streamChat = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY,
  process.env.STREAM_CHAT_SECRET_KEY
);
