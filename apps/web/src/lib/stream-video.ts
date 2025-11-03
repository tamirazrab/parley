import "server-only";

import { StreamClient } from "@stream-io/node-sdk";

if (!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_STREAM_VIDEO_API_KEY");
}
if (!process.env.STREAM_VIDEO_SECRET_KEY) {
  throw new Error("Missing required environment variable: STREAM_VIDEO_SECRET_KEY");
}

export const streamVideo = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
  process.env.STREAM_VIDEO_SECRET_KEY
);
