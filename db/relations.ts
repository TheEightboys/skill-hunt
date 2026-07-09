import { relations } from "drizzle-orm";
import {
  users,
  studentProfiles,
  facultyProfiles,
  events,
  eventScoreConfigs,
  rubricCriteria,
  projects,
  projectTeamMembers,
  projectTagLinks,
  projectTags,
  projectScreenshots,
  facultyReviews,
  facultyReviewScores,
  peerVotes,
  projectScoreSnapshots,
  notifications,
  previewChecks,
  githubSyncLogs,
  eventRegistrations,
} from "./schema.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  facultyProfile: one(facultyProfiles, {
    fields: [users.id],
    references: [facultyProfiles.userId],
  }),
  ownedProjects: many(projects),
  facultyReviews: many(facultyReviews),
  peerVotes: many(peerVotes),
  notifications: many(notifications),
  eventRegistrations: many(eventRegistrations),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const facultyProfilesRelations = relations(facultyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [facultyProfiles.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  projects: many(projects),
  rubricCriteria: many(rubricCriteria),
  scoreConfig: one(eventScoreConfigs, {
    fields: [events.id],
    references: [eventScoreConfigs.eventId],
  }),
  facultyReviews: many(facultyReviews),
  peerVotes: many(peerVotes),
  scoreSnapshots: many(projectScoreSnapshots),
  registrations: many(eventRegistrations),
}));

export const eventScoreConfigsRelations = relations(eventScoreConfigs, ({ one }) => ({
  event: one(events, {
    fields: [eventScoreConfigs.eventId],
    references: [events.id],
  }),
}));

export const rubricCriteriaRelations = relations(rubricCriteria, ({ one, many }) => ({
  event: one(events, {
    fields: [rubricCriteria.eventId],
    references: [events.id],
  }),
  reviewScores: many(facultyReviewScores),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  event: one(events, {
    fields: [projects.eventId],
    references: [events.id],
  }),
  owner: one(users, {
    fields: [projects.ownerUserId],
    references: [users.id],
  }),
  teamMembers: many(projectTeamMembers),
  screenshots: many(projectScreenshots),
  tagLinks: many(projectTagLinks),
  facultyReviews: many(facultyReviews),
  peerVotes: many(peerVotes),
  scoreSnapshot: one(projectScoreSnapshots, {
    fields: [projects.id],
    references: [projectScoreSnapshots.projectId],
  }),
  previewChecks: many(previewChecks),
  githubSyncLogs: many(githubSyncLogs),
}));

export const projectTeamMembersRelations = relations(projectTeamMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeamMembers.projectId],
    references: [projects.id],
  }),
}));

export const projectTagLinksRelations = relations(projectTagLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTagLinks.projectId],
    references: [projects.id],
  }),
  tag: one(projectTags, {
    fields: [projectTagLinks.tagId],
    references: [projectTags.id],
  }),
}));

export const projectTagsRelations = relations(projectTags, ({ many }) => ({
  links: many(projectTagLinks),
}));

export const projectScreenshotsRelations = relations(projectScreenshots, ({ one }) => ({
  project: one(projects, {
    fields: [projectScreenshots.projectId],
    references: [projects.id],
  }),
}));

export const facultyReviewsRelations = relations(facultyReviews, ({ one, many }) => ({
  event: one(events, {
    fields: [facultyReviews.eventId],
    references: [events.id],
  }),
  project: one(projects, {
    fields: [facultyReviews.projectId],
    references: [projects.id],
  }),
  faculty: one(users, {
    fields: [facultyReviews.facultyUserId],
    references: [users.id],
  }),
  scores: many(facultyReviewScores),
}));

export const facultyReviewScoresRelations = relations(facultyReviewScores, ({ one }) => ({
  review: one(facultyReviews, {
    fields: [facultyReviewScores.reviewId],
    references: [facultyReviews.id],
  }),
  criterion: one(rubricCriteria, {
    fields: [facultyReviewScores.criterionId],
    references: [rubricCriteria.id],
  }),
}));

export const peerVotesRelations = relations(peerVotes, ({ one }) => ({
  event: one(events, {
    fields: [peerVotes.eventId],
    references: [events.id],
  }),
  voter: one(users, {
    fields: [peerVotes.voterUserId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [peerVotes.projectId],
    references: [projects.id],
  }),
}));

export const projectScoreSnapshotsRelations = relations(projectScoreSnapshots, ({ one }) => ({
  event: one(events, {
    fields: [projectScoreSnapshots.eventId],
    references: [events.id],
  }),
  project: one(projects, {
    fields: [projectScoreSnapshots.projectId],
    references: [projects.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const previewChecksRelations = relations(previewChecks, ({ one }) => ({
  project: one(projects, {
    fields: [previewChecks.projectId],
    references: [projects.id],
  }),
}));

export const githubSyncLogsRelations = relations(githubSyncLogs, ({ one }) => ({
  project: one(projects, {
    fields: [githubSyncLogs.projectId],
    references: [projects.id],
  }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
}));
