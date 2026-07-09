export const Session = {
  cookieName: "session_token",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required. Please sign in.",
  insufficientRole: "You do not have permission to access this resource.",
} as const;

export const Paths = {
  oauthCallback: "/api/oauth/callback",
} as const;

// ─── Scoring Constants ───────────────────────────────────────────────
export const DEFAULT_FACULTY_WEIGHT_PERCENT = 85;
export const DEFAULT_PEER_WEIGHT_PERCENT = 15;
export const DEFAULT_MIN_FACULTY_REVIEWS = 3;

export const DEFAULT_DESIGNATION_WEIGHTS: Record<string, number> = {
  vice_chancellor: 10,
  dean: 8,
  hod: 6,
  professor: 5,
  associate_professor: 4,
  assistant_professor: 3,
};

export const DEFAULT_RUBRIC_CRITERIA = [
  { name: "Innovation / Originality", weightPercent: "20.00", description: "Novelty and creativity of the solution" },
  { name: "Technical Depth", weightPercent: "25.00", description: "Complexity and sophistication of technical implementation" },
  { name: "Code Quality", weightPercent: "20.00", description: "Code organization, readability, and best practices" },
  { name: "UI / UX", weightPercent: "15.00", description: "User interface design and user experience" },
  { name: "Documentation", weightPercent: "10.00", description: "Quality of project documentation" },
  { name: "Working Live Demo", weightPercent: "10.00", description: "Functionality and stability of live demo" },
];

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;
export const COMMENT_MIN_LENGTH = 30;

// ─── Event Status Transitions ────────────────────────────────────────
export const EVENT_STATUS_FLOW = [
  "draft",
  "registration_open",
  "submission_open",
  "review_and_voting_open",
  "results_ready",
  "published",
  "archived",
] as const;

// ─── Role Constants ──────────────────────────────────────────────────
export const ROLES = {
  PUBLIC: "public",
  STUDENT: "student",
  FACULTY: "faculty",
  ADMIN: "admin",
} as const;

export const ACCOUNT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
  DISABLED: "disabled",
} as const;

// ─── Preview Check ───────────────────────────────────────────────────
export const PREVIEW_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
