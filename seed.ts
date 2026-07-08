import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function run() {
  console.log("Seeding evaluations and peer votes using Drizzle...");
  const db = getDb();

  // 1. Get Event
  const events = await db.query.events.findMany();
  if (events.length === 0) {
    console.log("No events found.");
    return;
  }
  const event = events[0];
  console.log("Found event:", event.id);

  // 2. Get Criteria
  let criteria = await db.query.rubricCriteria.findMany({ where: eq(schema.rubricCriteria.eventId, event.id) });
  if (criteria.length === 0) {
    console.log("Creating rubric criteria...");
    const defaultCriteria = [
      { eventId: event.id, name: "Innovation / Originality", weightPercent: "20.00", displayOrder: 1 },
      { eventId: event.id, name: "Technical Depth", weightPercent: "25.00", displayOrder: 2 },
      { eventId: event.id, name: "Code Quality", weightPercent: "20.00", displayOrder: 3 },
      { eventId: event.id, name: "UI / UX", weightPercent: "15.00", displayOrder: 4 },
      { eventId: event.id, name: "Documentation", weightPercent: "10.00", displayOrder: 5 },
      { eventId: event.id, name: "Working Live Demo", weightPercent: "10.00", displayOrder: 6 }
    ];
    await db.insert(schema.rubricCriteria).values(defaultCriteria);
    criteria = await db.query.rubricCriteria.findMany({ where: eq(schema.rubricCriteria.eventId, event.id) });
  }

  // 3. Get Faculty
  let facultyProfiles = await db.query.facultyProfiles.findMany();
  if (facultyProfiles.length === 0) {
    console.log("No faculty profiles found. Creating some...");
    for (let i = 1; i <= 3; i++) {
      const res = await db.insert(schema.users).values({
        unionId: `faculty_${i}_union`,
        name: `Faculty ${i}`,
        email: `faculty${i}@skillhunt.com`,
        role: "user"
      }).returning({ id: schema.users.id });
      
      const designation = i === 1 ? "professor" : i === 2 ? "associate_professor" : "assistant_professor";
      await db.insert(schema.facultyProfiles).values({
        userId: res[0].id,
        department: "CS",
        designation: designation as any,
        verifiedByAdmin: true
      });
    }
    facultyProfiles = await db.query.facultyProfiles.findMany();
  }
  console.log("Faculty:", facultyProfiles.length);

  // 4. Get Students
  let studentProfiles = await db.query.studentProfiles.findMany();
  if (studentProfiles.length < 10) {
    console.log("Creating students...");
    for (let i = studentProfiles.length + 1; i <= 15; i++) {
      const res = await db.insert(schema.users).values({
        unionId: `student_${i}_union_${Date.now()}`,
        name: `Student ${i}`,
        email: `student${i}@skillhunt.com`,
        role: "user"
      }).returning({ id: schema.users.id });
      
      await db.insert(schema.studentProfiles).values({
        userId: res[0].id,
        department: "CS",
        year: "3rd",
        batch: "2026"
      });
    }
    studentProfiles = await db.query.studentProfiles.findMany();
  }
  console.log("Students:", studentProfiles.length);

  // 5. Get Projects
  const projects = await db.query.projects.findMany({ where: eq(schema.projects.eventId, event.id) });
  console.log("Projects:", projects.length);

  // Clear existing reviews
  await db.delete(schema.facultyReviewScores);
  await db.delete(schema.facultyReviews);
  await db.delete(schema.peerVotes);
  await db.delete(schema.projectScoreSnapshots);
  console.log("Cleared old data.");

  // 6. Seed Reviews
  for (const project of projects) {
    for (const faculty of facultyProfiles) {
      // 90% chance to review
      if (Math.random() < 0.1) continue;

      const reviewRes = await db.insert(schema.facultyReviews).values({
        eventId: event.id,
        projectId: project.id,
        facultyUserId: faculty.userId,
        status: "submitted",
        overallComment: `Great project! Detailed feedback included in criteria.`,
        submittedAt: new Date(),
      }).returning({ id: schema.facultyReviews.id });
      
      const reviewId = reviewRes[0].id;
      let totalWeighted = 0;
      
      for (const criterion of criteria) {
        const score = Math.floor(Math.random() * 5) + 6; // 6 to 10
        const weightPercent = parseFloat(criterion.weightPercent as unknown as string);
        const weighted = (score * weightPercent) / 100;
        totalWeighted += weighted;
        
        await db.insert(schema.facultyReviewScores).values({
          reviewId,
          criterionId: criterion.id,
          score,
          weightedContribution: weighted.toFixed(2)
        });
      }
      
      await db.update(schema.facultyReviews)
        .set({ computedWeightedScore: totalWeighted.toFixed(2) })
        .where(eq(schema.facultyReviews.id, reviewId));
    }
  }
  console.log("Seeded faculty reviews.");

  // 7. Seed Peer Votes
  for (const student of studentProfiles) {
    if (Math.random() < 0.2) continue; // 80% vote
    const available = projects.filter(p => p.ownerUserId !== student.userId);
    if (available.length > 0) {
      const proj = available[Math.floor(Math.random() * available.length)];
      await db.insert(schema.peerVotes).values({
        eventId: event.id,
        voterUserId: student.userId,
        projectId: proj.id,
      });
    }
  }
  console.log("Seeded peer votes.");

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
