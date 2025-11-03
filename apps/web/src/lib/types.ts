import type { AppRouter } from '@parley/api/routers';
import type { inferRouterOutputs } from '@trpc/server';

// Infer all router outputs once
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Meetings Types
export type MeetingGetMany =
	RouterOutputs['meetings']['getMany']['items'];
export type MeetingGetOne =
	RouterOutputs['meetings']['getOne'];

export const MEETING_STATUS = {
	Upcoming: 'upcoming',
	Active: 'active',
	Completed: 'completed',
	Processing: 'processing',
	Cancelled: 'cancelled',
} as const;

export type MeetingStatus =
	(typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];

// Transcript typed with discriminators for clarity & better IntelliSense
export type StreamTranscriptItem = {
	speaker_id: string;
	text: string;
	start_ts: number; // epoch seconds or ms? If ms -> rename to startMs
	stop_ts: number;
} & (
	| { type: 'word' }
	| { type: 'sentence' }
	| { type: 'noise' }
	| { type: 'unknown' }
);
