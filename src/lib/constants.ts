export const APP_NAME = "Soul Space";
export const APP_DESCRIPTION = "A privacy-focused social platform for mental health support";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
export const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000";
export const BETTER_AUTH_URL = `${AUTH_BASE_URL}/api/auth`;

export const USER_ROLES = {
  USER: "USER",
  CONSULTANT: "CONSULTANT",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export const POST_STATUS = {
  ACTIVE: "ACTIVE",
  HIDDEN_BY_USER: "HIDDEN_BY_USER",
  UNDER_REVIEW: "UNDER_REVIEW",
  REMOVED: "REMOVED",
} as const;

export const POST_VISIBILITY = {
  PUBLIC: "PUBLIC",
  CONSULTANTS_ONLY: "CONSULTANTS_ONLY",
} as const;

export const REACTION_TYPES = {
  SUPPORT: "SUPPORT",
  HUG: "HUG",
  RELATE: "RELATE",
  THANKS: "THANKS",
  STRENGTH: "STRENGTH",
} as const;

export const REACTION_EMOJIS: Record<string, { emoji: string; label: string }> = {
  SUPPORT: { emoji: "🫶", label: "Support" },
  HUG: { emoji: "🤗", label: "Hug" },
  RELATE: { emoji: "🫂", label: "Relate" },
  THANKS: { emoji: "🙏", label: "Thanks" },
  STRENGTH: { emoji: "💪", label: "Strength" },
};

export const CONSULTANT_SPECIALIZATIONS = [
  "Anxiety",
  "Depression",
  "Grief",
  "Trauma",
  "PTSD",
  "Stress",
  "Relationships",
  "Self-Esteem",
  "Addiction",
  "Eating Disorders",
  "OCD",
  "Bipolar Disorder",
  "ADHD",
  "LGBTQ+ Issues",
  "Family Conflict",
];

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export const REPORT_TYPES = {
  HARASSMENT: "HARASSMENT",
  MISINFORMATION: "MISINFORMATION",
  SPAM: "SPAM",
  IMPERSONATION: "IMPERSONATION",
  COPYRIGHT: "COPYRIGHT",
} as const;
