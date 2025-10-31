import { PAGINATION } from '../../../constants';
import { generateAvatarUri } from '@/lib/avatar';
import { user } from '@parley/db/src/schema/auth';
import { db } from '@parley/db';
import { meetings } from '@parley/db/src/schema/meeting';
import { agents } from '@parley/db/src/schema/agent';
import { z } from "zod";
import JSONL from "jsonl-parse-stringify";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, ilike, inArray, sql } from "drizzle-orm";

// import { streamVideo } from "@/lib/stream-video";

import { MeetingStatus, type StreamTranscriptItem } from "../types";
import { protectedProcedure, router } from "@parley/api";

import { meetingsUpdateSchema, } from "./schemas";
// import { streamChat } from "@/lib/stream-chat";

const { PAGE, PAGE_SIZE } = PAGINATION.DEFAULT;
const { MAX_PAGE_SIZE, MIN_PAGE_SIZE } = PAGINATION.LIMITS;

/**
 * Centralized Speaker Fetcher
 * Maps both Users & Agents into a unified speaker structure.
 */
async function getSpeakersByIds(ids: string[]) {
  const distinctIds = [...new Set(ids)];

  const [usersList, agentsList] = await Promise.all([
    db.select().from(user).where(inArray(user.id, distinctIds)),
    db.select().from(agents).where(inArray(agents.id, distinctIds)),
  ]);

  return [
    ...usersList.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image ?? generateAvatarUri({ seed: u.name, variant: "initials" }),
    })),
    ...agentsList.map((a) => ({
      id: a.id,
      name: a.name,
      image: generateAvatarUri({ seed: a.name, variant: "botttsNeutral" }),
    })),
  ];
}

export const meetingsRouter = router({
  generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
    const token = streamChat.createToken(ctx.session.user.id);
    await streamChat.upsertUser({
      id: ctx.session.user.id,
      role: "admin",
    });

    return token;
  }),
  getTranscript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existing] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.session.user.id)));

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      if (!existing.transcriptUrl) return [];

      const transcript = await fetch(existing.transcriptUrl)
        .then((r) => r.text())
        .then((t) => JSONL.parse<StreamTranscriptItem>(t))
        .catch(() => []);

      const speakers = await getSpeakersByIds(transcript.map((t) => t.speaker_id));

      return transcript.map((item) => {
        const speaker = speakers.find((s) => s.id === item.speaker_id);
        return {
          ...item,
          user: speaker ?? {
            name: "Unknown",
            image: generateAvatarUri({ seed: "Unknown", variant: "initials" }),
          },
        };
      });
    }),

  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamVideo.upsertUsers([
      {
        id: ctx.session.user.id,
        name: ctx.session.user.name,
        role: "admin",
        image:
          ctx.session.user.image ??
          generateAvatarUri({ seed: ctx.session.user.name, variant: "initials" }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    return streamVideo.generateUserToken({
      user_id: ctx.session.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db
        .delete(meetings)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.session.user.id)))
        .returning();

      if (!removed) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return removed;
    }),

  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(meetings)
        .set(input)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.session.user.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return updated;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existing] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.session.user.id)));

      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });

      return existing;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize, status, agentId } = input;

      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.session.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.session.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          )
        );

      return {
        items: data,
        total: total.count,
        totalPages: Math.ceil(total.count / pageSize),
      };
    }),

  // create: premiumProcedure("meetings")
  //   .input(meetingsInsertSchema)
  //   .mutation(async ({ input, ctx }) => {
  //     const [createdMeeting] = await db
  //       .insert(meetings)
  //       .values({
  //         ...input,
  //         userId: ctx.session.user.id,
  //       })
  //       .returning();

  //     const call = streamVideo.video.call("default", createdMeeting.id);
  //     await call.create({
  //       data: {
  //         created_by_id: ctx.session.user.id,
  //         custom: {
  //           meetingId: createdMeeting.id,
  //           meetingName: createdMeeting.name
  //         },
  //         settings_override: {
  //           transcription: {
  //             language: "en",
  //             mode: "auto-on",
  //             closed_caption_mode: "auto-on",
  //           },
  //           recording: {
  //             mode: "auto-on",
  //             quality: "1080p",
  //           },
  //         },
  //       },
  //     });

  //     const [existingAgent] = await db
  //       .select()
  //       .from(agents)
  //       .where(eq(agents.id, createdMeeting.agentId));

  //     if (!existingAgent) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Agent not found",
  //       });
  //     }

  //     await streamVideo.upsertUsers([
  //       {
  //         id: existingAgent.id,
  //         name: existingAgent.name,
  //         role: "user",
  //         image: generateAvatarUri({
  //           seed: existingAgent.name,
  //           variant: "botttsNeutral",
  //         }),
  //       },
  //     ]);

  //     return createdMeeting;
  //   }),
});
