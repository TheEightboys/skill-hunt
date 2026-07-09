import { eq, and, gte, lt } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";
import type { Event } from "../../db/schema.js";

export interface EventNotification {
  type: "phase_change" | "deadline_reminder" | "registration_opened" | "results_available";
  eventId: number;
  eventName: string;
  message: string;
  deadline?: Date;
  link?: string;
}

/**
 * Check for upcoming deadlines and phase changes
 * Should be called periodically (e.g., every hour)
 */
export async function checkEventPhaseChanges() {
  const db = getDb();
  const now = new Date();
  
  // Find events with upcoming deadlines (within 24 hours)
  const events = await db.query.events.findMany({
    where: and(
      eq(schema.events.isPublic, true),
      eq(schema.events.isCompleted, false)
    ),
  });

  const notifications: EventNotification[] = [];

  for (const event of events) {
    // Check submission deadline (24 hours before)
    if (event.submissionDeadline) {
      const deadline = new Date(event.submissionDeadline);
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 24) {
        notifications.push({
          type: "deadline_reminder",
          eventId: event.id,
          eventName: event.name,
          message: `Submission deadline for ${event.name} is in ${Math.floor(hoursUntilDeadline)} hours!`,
          deadline: deadline,
          link: "/dashboard",
        });
      }
    }

    // Check review deadline
    if (event.reviewDeadline) {
      const deadline = new Date(event.reviewDeadline);
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 24) {
        notifications.push({
          type: "deadline_reminder",
          eventId: event.id,
          eventName: event.name,
          message: `Review and voting deadline for ${event.name} is in ${Math.floor(hoursUntilDeadline)} hours!`,
          deadline: deadline,
          link: "/projects",
        });
      }
    }

    // Check if event just moved to submission open
    if (
      event.status === "submission_open" &&
      event.registrationStartAt &&
      now >= event.registrationStartAt &&
      event.submissionDeadline &&
      now < event.submissionDeadline
    ) {
      notifications.push({
        type: "phase_change",
        eventId: event.id,
        eventName: event.name,
        message: `${event.name} is now open for submissions!`,
        deadline: event.submissionDeadline,
        link: "/submit",
      });
    }

    // Check if results published
    if (event.status === "published" && event.resultsPublishedAt) {
      const publishedTime = new Date(event.resultsPublishedAt);
      const hoursSincePublished = (now.getTime() - publishedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSincePublished >= 0 && hoursSincePublished < 1) {
        notifications.push({
          type: "results_available",
          eventId: event.id,
          eventName: event.name,
          message: `Results for ${event.name} are now available!`,
          link: "/leaderboard",
        });
      }
    }
  }

  return notifications;
}

/**
 * Get event registrations for bulk notifications
 */
export async function getEventRegisteredUsers(eventId: number) {
  const db = getDb();
  
  return db.query.eventRegistrations.findMany({
    where: eq(schema.eventRegistrations.eventId, eventId),
    with: {
      user: true,
    },
  });
}

/**
 * Create notification for user
 */
export async function createUserNotification(
  userId: number,
  type: "info" | "success" | "warning" | "error",
  message: string,
  link?: string
) {
  const db = getDb();
  
  try {
    await db.insert(schema.notifications).values({
      userId,
      type,
      message,
      link: link || null,
      read: false,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Send event phase notifications to registered users
 */
export async function notifyRegisteredUsers(
  eventId: number,
  notificationType: "info" | "success" | "warning" | "error",
  message: string,
  link?: string
) {
  const registrations = await getEventRegisteredUsers(eventId);
  
  for (const registration of registrations) {
    await createUserNotification(
      registration.userId,
      notificationType,
      message,
      link
    );
  }
}

/**
 * Get event phase summary for dashboard
 */
export async function getEventPhaseSummary(eventId: number) {
  const db = getDb();
  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!event) return null;

  const now = new Date();
  const registrationStart = event.registrationStartAt ? new Date(event.registrationStartAt) : null;
  const submissionDeadline = event.submissionDeadline ? new Date(event.submissionDeadline) : null;
  const votingStart = event.votingStartAt ? new Date(event.votingStartAt) : null;
  const reviewDeadline = event.reviewDeadline ? new Date(event.reviewDeadline) : null;
  const resultsPublished = event.resultsPublishedAt ? new Date(event.resultsPublishedAt) : null;

  const phases = {
    registration: {
      startDate: registrationStart,
      status: registrationStart && now >= registrationStart && submissionDeadline && now < submissionDeadline ? "active" : "pending",
      daysRemaining: submissionDeadline ? Math.ceil((submissionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
    },
    submission: {
      startDate: registrationStart,
      endDate: submissionDeadline,
      status: submissionDeadline && now >= submissionDeadline ? "closed" : "active",
      daysRemaining: submissionDeadline ? Math.ceil((submissionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
    },
    review: {
      startDate: submissionDeadline,
      endDate: reviewDeadline,
      status: reviewDeadline && now >= reviewDeadline ? "closed" : now >= (submissionDeadline || new Date(0)) ? "active" : "pending",
      daysRemaining: reviewDeadline ? Math.ceil((reviewDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
    },
    voting: {
      startDate: votingStart,
      endDate: reviewDeadline,
      status: votingStart && now >= votingStart ? "active" : "pending",
      daysRemaining: votingStart ? Math.ceil((votingStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
    },
    results: {
      publishedDate: resultsPublished,
      status: event.status === "published" ? "published" : "pending",
      link: event.status === "published" ? "/leaderboard" : null,
    },
  };

  return {
    eventId,
    eventName: event.name,
    currentPhase: event.status?.replace(/_/g, " "),
    phases,
    isCompleted: event.isCompleted,
    completedAt: event.completedAt,
  };
}

/**
 * Calculate days until key milestones
 */
export function getDaysUntilMilestone(targetDate: Date | null, label: string) {
  if (!targetDate) return null;

  const now = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { label, daysRemaining: 0, status: "passed" };
  } else if (daysRemaining === 0) {
    return { label, daysRemaining, status: "today" };
  } else if (daysRemaining === 1) {
    return { label, daysRemaining, status: "tomorrow" };
  } else if (daysRemaining <= 7) {
    return { label, daysRemaining, status: "soon" };
  } else {
    return { label, daysRemaining, status: "upcoming" };
  }
}
