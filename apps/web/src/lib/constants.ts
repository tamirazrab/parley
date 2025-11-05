export const PROJECT = {
  name: "Parley",
  id: "parley-ai",
  tagline: "Your AIs. Your ideas. One table.",
  description: "Parley lets you create and host interactive meetings with your own AI agents. Each AI is shaped by custom instructions, roles, or expertise, enabling realistic multi-agent discussions. Invite others to join, observe, or participate as your AIs exchange ideas and simulate real-world collaboration.",
  author: "Tamir",
  url: "https://parley.com"
};


export const FREE_TIER_LIMITS = {
  meetings: 3,
  agents: 1
}

export const PAGINATION = {
  DEFAULT: {
    PAGE: 1,
    PAGE_SIZE: 10,
  },
  LIMITS: {
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
  },
} as const;

export const MEETING_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
  PROCESSING: "processing",
  CANCELLED: "cancelled",
} as const;

export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];

export type AvatarVariant = "botttsNeutral" | "initials";