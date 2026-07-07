import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  decimal,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── pgEnum Definitions ──────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const accountStatusEnum = pgEnum("account_status", ["pending", "active", "rejected", "disabled"]);
export const designationEnum = pgEnum("designation", [
  "vice_chancellor",
  "dean",
  "hod",
  "professor",
  "associate_professor",
  "assistant_professor",
]);
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "registration_open",
  "submission_open",
  "review_and_voting_open",
  "results_ready",
  "published",
  "archived",
]);
export const previewStatusEnum = pgEnum("preview_status", ["live", "down", "unknown", "pending"]);
export const submissionStatusEnum = pgEnum("submission_status", ["draft", "submitted"]);
export const reviewStatusEnum = pgEnum("review_status", ["draft", "submitted"]);
export const conflictReasonEnum = pgEnum("conflict_reason", ["guide", "mentor", "conflict"]);
export const previewCheckStatusEnum = pgEnum("preview_check_status", ["live", "down", "unknown"]);
export const githubSyncStatusEnum = pgEnum("github_sync_status", ["success", "error", "not_found"]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "success", "warning", "error"]);

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  accountStatus: accountStatusEnum("accountStatus")
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Student Profiles ────────────────────────────────────────────────
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).notNull().unique(),
  department: varchar("department", { length: 255 }),
  year: varchar("year", { length: 50 }),
  section: varchar("section", { length: 50 }),
  batch: varchar("batch", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

// ─── Faculty Profiles ────────────────────────────────────────────────
export const facultyProfiles = pgTable("faculty_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).notNull().unique(),
  department: varchar("department", { length: 255 }),
  designation: designationEnum("designation"),
  verifiedByAdmin: boolean("verifiedByAdmin").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type FacultyProfile = typeof facultyProfiles.$inferSelect;
export type InsertFacultyProfile = typeof facultyProfiles.$inferInsert;

// ─── Designation Weights ─────────────────────────────────────────────
export const designationWeights = pgTable("designation_weights", {
  id: serial("id").primaryKey(),
  designation: designationEnum("designation").notNull().unique(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type DesignationWeight = typeof designationWeights.$inferSelect;
export type InsertDesignationWeight = typeof designationWeights.$inferInsert;

// ─── Events ──────────────────────────────────────────────────────────
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  status: eventStatusEnum("status")
    .default("draft")
    .notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  registrationStartAt: timestamp("registrationStartAt"),
  submissionDeadline: timestamp("submissionDeadline"),
  votingStartAt: timestamp("votingStartAt"),
  reviewDeadline: timestamp("reviewDeadline"),
  resultsPublishedAt: timestamp("resultsPublishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event Score Configs ─────────────────────────────────────────────
export const eventScoreConfigs = pgTable("event_score_configs", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull().unique(),
  facultyWeightPercent: integer("facultyWeightPercent").default(85).notNull(),
  peerWeightPercent: integer("peerWeightPercent").default(15).notNull(),
  minFacultyReviews: integer("minFacultyReviews").default(3).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type EventScoreConfig = typeof eventScoreConfigs.$inferSelect;
export type InsertEventScoreConfig = typeof eventScoreConfigs.$inferInsert;

// ─── Rubric Criteria ─────────────────────────────────────────────────
export const rubricCriteria = pgTable("rubric_criteria", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  weightPercent: decimal("weightPercent", { precision: 5, scale: 2 }).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type RubricCriterion = typeof rubricCriteria.$inferSelect;
export type InsertRubricCriterion = typeof rubricCriteria.$inferInsert;

// ─── Projects ────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  ownerUserId: bigint("ownerUserId", { mode: "number" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  abstract: text("abstract"),
  category: varchar("category", { length: 255 }),
  department: varchar("department", { length: 255 }),
  githubUrl: varchar("githubUrl", { length: 500 }),
  previewUrl: varchar("previewUrl", { length: 500 }),
  previewStatus: previewStatusEnum("previewStatus")
    .default("unknown")
    .notNull(),
  previewLastCheckedAt: timestamp("previewLastCheckedAt"),
  previewLastStatusCode: integer("previewLastStatusCode"),
  githubCommitCount: integer("githubCommitCount"),
  githubLastCommitAt: timestamp("githubLastCommitAt"),
  githubLastSyncedAt: timestamp("githubLastSyncedAt"),
  submissionStatus: submissionStatusEnum("submissionStatus")
    .default("draft")
    .notNull(),
  submittedAt: timestamp("submittedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("project_slug_event").on(table.slug, table.eventId),
]);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Project Team Members ────────────────────────────────────────────
export const projectTeamMembers = pgTable("project_team_members", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  studentUserId: bigint("studentUserId", { mode: "number" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  isLeader: boolean("isLeader").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectTeamMember = typeof projectTeamMembers.$inferSelect;
export type InsertProjectTeamMember = typeof projectTeamMembers.$inferInsert;

// ─── Project Tags ────────────────────────────────────────────────────
export const projectTags = pgTable("project_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectTag = typeof projectTags.$inferSelect;
export type InsertProjectTag = typeof projectTags.$inferInsert;

// ─── Project Tag Links ───────────────────────────────────────────────
export const projectTagLinks = pgTable("project_tag_links", {
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  tagId: bigint("tagId", { mode: "number" }).notNull(),
}, (table) => [
  uniqueIndex("project_tag_unique").on(table.projectId, table.tagId),
]);

// ─── Project Screenshots ─────────────────────────────────────────────
export const projectScreenshots = pgTable("project_screenshots", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  storagePath: varchar("storagePath", { length: 500 }),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectScreenshot = typeof projectScreenshots.$inferSelect;
export type InsertProjectScreenshot = typeof projectScreenshots.$inferInsert;

// ─── Faculty Reviews ─────────────────────────────────────────────────
export const facultyReviews = pgTable("faculty_reviews", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  facultyUserId: bigint("facultyUserId", { mode: "number" }).notNull(),
  status: reviewStatusEnum("status").default("draft").notNull(),
  overallComment: text("overallComment").notNull(),
  computedWeightedScore: decimal("computedWeightedScore", { precision: 6, scale: 2 }),
  submittedAt: timestamp("submittedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("faculty_review_unique").on(table.eventId, table.projectId, table.facultyUserId),
]);

export type FacultyReview = typeof facultyReviews.$inferSelect;
export type InsertFacultyReview = typeof facultyReviews.$inferInsert;

// ─── Faculty Review Scores ───────────────────────────────────────────
export const facultyReviewScores = pgTable("faculty_review_scores", {
  id: serial("id").primaryKey(),
  reviewId: bigint("reviewId", { mode: "number" }).notNull(),
  criterionId: bigint("criterionId", { mode: "number" }).notNull(),
  score: integer("score").notNull(),
  weightedContribution: decimal("weightedContribution", { precision: 6, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("review_criterion_unique").on(table.reviewId, table.criterionId),
]);

export type FacultyReviewScore = typeof facultyReviewScores.$inferSelect;
export type InsertFacultyReviewScore = typeof facultyReviewScores.$inferInsert;

// ─── Peer Votes ──────────────────────────────────────────────────────
export const peerVotes = pgTable("peer_votes", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  voterUserId: bigint("voterUserId", { mode: "number" }).notNull(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("peer_vote_unique").on(table.eventId, table.voterUserId),
]);

export type PeerVote = typeof peerVotes.$inferSelect;
export type InsertPeerVote = typeof peerVotes.$inferInsert;

// ─── Peer Vote History ───────────────────────────────────────────────
export const peerVoteHistory = pgTable("peer_vote_history", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  voterUserId: bigint("voterUserId", { mode: "number" }).notNull(),
  fromProjectId: bigint("fromProjectId", { mode: "number" }),
  toProjectId: bigint("toProjectId", { mode: "number" }).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type PeerVoteHistory = typeof peerVoteHistory.$inferSelect;

// ─── Project Faculty Conflicts ───────────────────────────────────────
export const projectFacultyConflicts = pgTable("project_faculty_conflicts", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  facultyUserId: bigint("facultyUserId", { mode: "number" }).notNull(),
  reason: conflictReasonEnum("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("project_faculty_conflict_unique").on(table.projectId, table.facultyUserId),
]);

// ─── Preview Checks ──────────────────────────────────────────────────
export const previewChecks = pgTable("preview_checks", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  status: previewCheckStatusEnum("status").notNull(),
  statusCode: integer("statusCode"),
  responseTimeMs: integer("responseTimeMs"),
  resolvedUrl: varchar("resolvedUrl", { length: 500 }),
  errorMessage: text("errorMessage"),
});

export type PreviewCheck = typeof previewChecks.$inferSelect;

// ─── GitHub Sync Logs ────────────────────────────────────────────────
export const githubSyncLogs = pgTable("github_sync_logs", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number" }).notNull(),
  commitCount: integer("commitCount"),
  lastCommitAt: timestamp("lastCommitAt"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  status: githubSyncStatusEnum("status").default("success").notNull(),
  errorMessage: text("errorMessage"),
});

export type GitHubSyncLog = typeof githubSyncLogs.$inferSelect;

// ─── Project Score Snapshots ─────────────────────────────────────────
export const projectScoreSnapshots = pgTable("project_score_snapshots", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number" }).notNull(),
  projectId: bigint("projectId", { mode: "number" }).notNull().unique(),
  facultyScore: decimal("facultyScore", { precision: 8, scale: 4 }),
  peerScore: decimal("peerScore", { precision: 8, scale: 4 }),
  finalScore: decimal("finalScore", { precision: 8, scale: 4 }),
  facultyReviewCount: integer("facultyReviewCount").default(0).notNull(),
  totalVotes: integer("totalVotes").default(0).notNull(),
  rank: integer("rank"),
  isRanked: boolean("isRanked").default(false).notNull(),
  hasPeoplesChoice: boolean("hasPeoplesChoice").default(false).notNull(),
  computedAt: timestamp("computedAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type ProjectScoreSnapshot = typeof projectScoreSnapshots.$inferSelect;

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
