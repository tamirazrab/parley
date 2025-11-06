import OpenAI from "openai";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { generateAvatarUri } from "@/lib/avatar";
import { streamVideo } from "@/lib/stream-video";
import { streamChat } from "@/lib/stream-chat";

import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { db } from "../../../../../../packages/db/src";
import { agents } from "../../../../../../packages/db/src/schema/agent";
import { meetings } from "../../../../../../packages/db/src/schema/meeting";
import type { CallSessionStartedEvent, CallSessionParticipantLeftEvent, CallEndedEvent, CallTranscriptionReadyEvent, CallRecordingReadyEvent, MessageNewEvent } from "@stream-io/node-sdk";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");
    if (!signature || !apiKey)
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });

    const body = await req.text();
    if (!verifySignatureWithSDK(body, signature))
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const payload = JSON.parse(body) as Record<string, unknown>;
    const eventType = payload?.["type"];

    switch (eventType) {
      case "call.session_started": {
        const event = payload as unknown as CallSessionStartedEvent;

        const meetingId = event.call.custom?.meetingId;
        if (!meetingId)
          return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });

        const [meeting] = await db
          .select()
          .from(meetings)
          .where(
            and(
              eq(meetings.id, meetingId),
              not(eq(meetings.status, "completed")),
              not(eq(meetings.status, "active")),
              not(eq(meetings.status, "cancelled")),
              not(eq(meetings.status, "processing"))
            )
          );

        if (!meeting)
          return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        await db
          .update(meetings)
          .set({ status: "active", startedAt: new Date() })
          .where(eq(meetings.id, meeting.id));

        const [agent] = await db.select().from(agents).where(eq(agents.id, meeting.agentId));
        if (!agent)
          return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        const call = streamVideo.video.call("default", meetingId);
        const realtimeClient = await streamVideo.video.connectOpenAi({
          call,
          openAiApiKey: process.env.OPENAI_API_KEY!,
          agentUserId: agent.id,
        });

        realtimeClient.updateSession({ instructions: agent.instructions });
        break;
      }

      case "call.session_participant_left": {
        const event = payload as unknown as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid?.split(":")[1];

        if (!meetingId) {
          return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        const call = await streamVideo.video.call("default", meetingId).get();
        const remainingParticipants = call?.members?.filter(
          (m) => m.role !== "removed" && m.role !== "left"
        );

        if (!remainingParticipants || remainingParticipants.length === 0) {
          await streamVideo.video.call("default", meetingId).end();
        }

        break;
      }


      case "call.session_ended": {
        const event = payload as unknown as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;
        if (!meetingId)
          return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });

        await db
          .update(meetings)
          .set({ status: "processing", endedAt: new Date() })
          .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
        break;
      }

      case "call.transcription_ready": {
        const event = payload as unknown as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid?.split(":")[1];
        if (!meetingId)
          return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });

        const [meeting] = await db
          .update(meetings)
          .set({ transcriptUrl: event.call_transcription.url })
          .where(eq(meetings.id, meetingId))
          .returning();

        if (!meeting)
          return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        await inngest.send({
          name: "meetings/processing",
          data: {
            meetingId: meeting.id,
            transcriptUrl: meeting.transcriptUrl,
          },
        });
        break;
      }

      case "call.recording_ready": {
        const event = payload as unknown as CallRecordingReadyEvent;
        const meetingId = event.call_cid?.split(":")[1];
        
        if (!meetingId)
          return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        
        const [meeting] = await db
          .update(meetings)
          .set({ recordingUrl: event.call_recording.url })
          .where(eq(meetings.id, meetingId))
          .returning();
        
        if (!meeting)
          return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        
        break;
      }

      case "message.new": {
        const event = payload as unknown as MessageNewEvent;
        const { user, channel_id: channelId, message } = event;
        const userId = user?.id;
        const text = message?.text;

        if (!userId || !channelId || !text)
          return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });

        const [meeting] = await db
          .select()
          .from(meetings)
          .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));
        if (!meeting)
          return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        const [agent] = await db.select().from(agents).where(eq(agents.id, meeting.agentId));
        if (!agent)
          return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        if (userId !== agent.id) {
          const channel = streamChat.channel("messaging", channelId);
          await channel.watch();

          const previousMessages = channel.state.messages
            .slice(-5)
            .filter((msg) => msg.text && msg.text.trim() !== "")
            .map<ChatCompletionMessageParam>((m) => ({
              role: m.user?.id === agent.id ? "assistant" : "user",
              content: m.text!,
            }));

          if (!meeting.summary) {
            return NextResponse.json(
              { error: "Meeting summary not yet available" },
              { status: 400 }
            );
          }

          const instructions = `
            You are an AI assistant helping the user revisit a recently completed meeting.
            Below is a summary of the meeting, generated from the transcript:
            
            ${meeting.summary}
            
            The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
            
            ${agent.instructions}
            
            The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
            Always base your responses on the meeting summary above.
            
            You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
            
            If the summary does not contain enough information to answer a question, politely let the user know.
            
            Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
            `;

          const GPTResponse = await openaiClient.chat.completions.create({
            messages: [
              { role: "system", content: instructions },
              ...previousMessages,
              { role: "user", content: text },
            ],
            model: "gpt-4o",
          });

          const GPTResponseText = GPTResponse.choices[0]?.message?.content;

          if (!GPTResponseText) {
            return NextResponse.json(
              { error: "No response from GPT" },
              { status: 400 }
            );
          }

          const avatarUrl = generateAvatarUri({
            seed: agent.name,
            variant: "botttsNeutral",
          });

          await streamChat.upsertUser({
            id: agent.id,
            name: agent.name,
            image: avatarUrl,
          });

          await channel.sendMessage({
            text: GPTResponseText,
            user: { id: agent.id, name: agent.name, image: avatarUrl },
          });
        }
        break;
      }

      default:
        console.warn(`[Webhook] Unhandled event type: ${eventType}`);
        return NextResponse.json({ status: "ignored", eventType });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
