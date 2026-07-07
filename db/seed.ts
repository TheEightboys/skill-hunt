/**
 * Seed script for Skill Hunt University demo data.
 * Run with: npx tsx db/seed.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";

const DEFAULT_RUBRIC_CRITERIA = [
  { name: "Innovation / Originality", weightPercent: "20.00", description: "Novelty and creativity of the solution" },
  { name: "Technical Depth", weightPercent: "25.00", description: "Complexity and sophistication of technical implementation" },
  { name: "Code Quality", weightPercent: "20.00", description: "Code organization, readability, and best practices" },
  { name: "UI / UX", weightPercent: "15.00", description: "User interface design and user experience" },
  { name: "Documentation", weightPercent: "10.00", description: "Quality of project documentation" },
  { name: "Working Live Demo", weightPercent: "10.00", description: "Functionality and stability of live demo" },
];

async function seed() {
  const queryClient = postgres(process.env.DATABASE_URL ?? "");
  const db = drizzle(queryClient, { schema });

  console.log("Seeding database...");

  // Check if already seeded
  const existingEvent = await db.query.events.findFirst({
    where: eq(schema.events.slug, "cs-showcase-2026"),
  });
  if (existingEvent) {
    console.log("Database already seeded. Skipping.");
    await queryClient.end();
    process.exit(0);
  }

  // ─── Create Demo Event ───────────────────────────────────────────
  const [eventResult] = await db.insert(schema.events).values({
    name: "CS Project Showcase 2026",
    slug: "cs-showcase-2026",
    description: "Annual Computer Science project showcase and competition. Students present their best projects for evaluation by faculty judges and peer voting.",
    status: "published",
    isActive: true,
    isPublic: true,
    registrationStartAt: new Date("2026-01-01"),
    submissionDeadline: new Date("2026-06-15"),
    votingStartAt: new Date("2026-06-16"),
    reviewDeadline: new Date("2026-07-15"),
    resultsPublishedAt: new Date("2026-07-06"),
  }).returning();

  const eventId = eventResult.id;
  console.log(`Created event: ${eventId}`);

  // ─── Create Score Config ─────────────────────────────────────────
  await db.insert(schema.eventScoreConfigs).values({
    eventId,
    facultyWeightPercent: 85,
    peerWeightPercent: 15,
    minFacultyReviews: 3,
  });

  // ─── Create Rubric Criteria ──────────────────────────────────────
  for (let i = 0; i < DEFAULT_RUBRIC_CRITERIA.length; i++) {
    const crit = DEFAULT_RUBRIC_CRITERIA[i];
    await db.insert(schema.rubricCriteria).values({
      eventId,
      name: crit.name,
      description: crit.description,
      weightPercent: crit.weightPercent,
      displayOrder: i,
    });
  }

  // ─── Create Designation Weights ──────────────────────────────────
  const designationWeights = [
    { designation: "vice_chancellor" as const, weight: 10 },
    { designation: "dean" as const, weight: 8 },
    { designation: "hod" as const, weight: 6 },
    { designation: "professor" as const, weight: 5 },
    { designation: "associate_professor" as const, weight: 4 },
    { designation: "assistant_professor" as const, weight: 3 },
  ];
  for (const dw of designationWeights) {
    await db.insert(schema.designationWeights).values(dw);
  }

  // ─── Create Users ────────────────────────────────────────────────
  // 1 Admin
  const [adminUser] = await db.insert(schema.users).values({
    unionId: "admin_user_001",
    name: "Dr. Sarah Mitchell",
    email: "admin@university.edu",
    role: "admin",
    accountStatus: "active",
  }).returning();

  // 3 Faculty
  const [faculty1] = await db.insert(schema.users).values({
    unionId: "faculty_001",
    name: "Dr. James Anderson",
    email: "j.anderson@university.edu",
    role: "user",
    accountStatus: "active",
  }).returning();

  const [faculty2] = await db.insert(schema.users).values({
    unionId: "faculty_002",
    name: "Prof. Emily Chen",
    email: "e.chen@university.edu",
    role: "user",
    accountStatus: "active",
  }).returning();

  const [faculty3] = await db.insert(schema.users).values({
    unionId: "faculty_003",
    name: "Dr. Michael Roberts",
    email: "m.roberts@university.edu",
    role: "user",
    accountStatus: "active",
  }).returning();

  // 10 Students
  const students = [
    { unionId: "student_001", name: "Alice Johnson", email: "alice.j@university.edu" },
    { unionId: "student_002", name: "Bob Williams", email: "bob.w@university.edu" },
    { unionId: "student_003", name: "Carol Davis", email: "carol.d@university.edu" },
    { unionId: "student_004", name: "David Brown", email: "david.b@university.edu" },
    { unionId: "student_005", name: "Eva Martinez", email: "eva.m@university.edu" },
    { unionId: "student_006", name: "Frank Lee", email: "frank.l@university.edu" },
    { unionId: "student_007", name: "Grace Wilson", email: "grace.w@university.edu" },
    { unionId: "student_008", name: "Henry Taylor", email: "henry.t@university.edu" },
    { unionId: "student_009", name: "Iris Garcia", email: "iris.g@university.edu" },
    { unionId: "student_010", name: "Jack Thomas", email: "jack.t@university.edu" },
  ];

  const studentIds: number[] = [];
  for (const s of students) {
    const [result] = await db.insert(schema.users).values({
      unionId: s.unionId,
      name: s.name,
      email: s.email,
      role: "user",
      accountStatus: "active",
    }).returning();
    studentIds.push(result.id);
  }

  // ─── Create Faculty Profiles ─────────────────────────────────────
  await db.insert(schema.facultyProfiles).values({
    userId: faculty1.id,
    department: "Computer Science",
    designation: "professor",
    verifiedByAdmin: true,
    verifiedAt: new Date(),
  });

  await db.insert(schema.facultyProfiles).values({
    userId: faculty2.id,
    department: "Software Engineering",
    designation: "associate_professor",
    verifiedByAdmin: true,
    verifiedAt: new Date(),
  });

  await db.insert(schema.facultyProfiles).values({
    userId: faculty3.id,
    department: "Data Science",
    designation: "assistant_professor",
    verifiedByAdmin: true,
    verifiedAt: new Date(),
  });

  // ─── Create Student Profiles ─────────────────────────────────────
  const departments = ["CS", "SE", "DS", "AI", "Cybersecurity"];
  for (let i = 0; i < studentIds.length; i++) {
    await db.insert(schema.studentProfiles).values({
      userId: studentIds[i],
      department: departments[i % departments.length],
      year: "3rd",
      section: "A",
      batch: `202${(i % 3) + 4}`,
    });
  }

  // ─── Create Projects (5) ─────────────────────────────────────────
  const projectData = [
    {
      ownerIndex: 0,
      title: "AI-Powered Campus Navigation",
      slug: "ai-campus-nav",
      abstract: "An intelligent campus navigation system using computer vision and pathfinding algorithms to help students find their way around campus efficiently.",
      category: "Mobile App",
      department: "CS",
      githubUrl: "https://github.com/demo/ai-campus-nav",
      previewUrl: "https://ai-campus-nav.demo",
    },
    {
      ownerIndex: 1,
      title: "Distributed Task Scheduler",
      slug: "distributed-scheduler",
      abstract: "A fault-tolerant distributed task scheduling system built with Go and Raft consensus algorithm for cloud-native environments.",
      category: "Backend System",
      department: "SE",
      githubUrl: "https://github.com/demo/distributed-scheduler",
      previewUrl: "https://scheduler.demo",
    },
    {
      ownerIndex: 2,
      title: "Real-Time Collaborative Code Editor",
      slug: "collab-code-editor",
      abstract: "A web-based collaborative code editor with real-time synchronization, syntax highlighting, and video chat integration.",
      category: "Web Application",
      department: "CS",
      githubUrl: "https://github.com/demo/collab-editor",
    },
    {
      ownerIndex: 3,
      title: "Smart Waste Management IoT",
      slug: "smart-waste-iot",
      abstract: "An IoT-based smart waste management system using ESP32 sensors, LoRaWAN, and a dashboard for monitoring fill levels and optimizing collection routes.",
      category: "IoT",
      department: "DS",
      githubUrl: "https://github.com/demo/smart-waste",
      previewUrl: "https://smart-waste.demo",
    },
    {
      ownerIndex: 4,
      title: "Privacy-Preserving ML Platform",
      slug: "privacy-ml-platform",
      abstract: "A machine learning platform implementing federated learning and differential privacy for training models on sensitive healthcare data.",
      category: "Machine Learning",
      department: "AI",
      githubUrl: "https://github.com/demo/privacy-ml",
    },
  ];

  const projectIds: number[] = [];
  for (const pd of projectData) {
    const [result] = await db.insert(schema.projects).values({
      eventId,
      ownerUserId: studentIds[pd.ownerIndex],
      title: pd.title,
      slug: pd.slug,
      abstract: pd.abstract,
      category: pd.category,
      department: pd.department,
      githubUrl: pd.githubUrl,
      previewUrl: pd.previewUrl,
      previewStatus: pd.previewUrl ? "live" : "unknown",
      githubCommitCount: Math.floor(Math.random() * 200) + 20,
      githubLastCommitAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      submissionStatus: "submitted",
      submittedAt: new Date("2026-06-10"),
    }).returning();
    projectIds.push(result.id);
  }

  // ─── Add Team Members ────────────────────────────────────────────
  for (let i = 0; i < projectData.length; i++) {
    const pd = projectData[i];
    // Leader
    await db.insert(schema.projectTeamMembers).values({
      projectId: projectIds[i],
      studentUserId: studentIds[pd.ownerIndex],
      name: students[pd.ownerIndex].name,
      email: students[pd.ownerIndex].email,
      isLeader: true,
    });

    // Add 1-2 more team members
    const additionalMembers = [
      studentIds[(pd.ownerIndex + 1) % studentIds.length],
      studentIds[(pd.ownerIndex + 2) % studentIds.length],
    ];
    for (const memberId of additionalMembers) {
      const student = students.find((_, idx) => studentIds[idx] === memberId);
      if (student) {
        await db.insert(schema.projectTeamMembers).values({
          projectId: projectIds[i],
          studentUserId: memberId,
          name: student.name,
          email: student.email,
          isLeader: false,
        });
      }
    }
  }

  // ─── Add Tags ────────────────────────────────────────────────────
  const tags = ["React", "Node.js", "Python", "TensorFlow", "Go", "IoT", "Flutter", "Rust", "TypeScript", "PostgreSQL"];
  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await db.insert(schema.projectTags).values({ name: tagName, slug }).onConflictDoUpdate({ target: [schema.projectTags.slug], set: { name: tagName } });
  }

  // Link tags to projects
  const tagLinks = [
    ["Flutter", "TensorFlow", "Python"],
    ["Go", "PostgreSQL", "Rust"],
    ["React", "TypeScript", "Node.js"],
    ["IoT", "Python", "Node.js"],
    ["Python", "TensorFlow", "PostgreSQL"],
  ];

  for (let i = 0; i < tagLinks.length; i++) {
    for (const tagName of tagLinks[i]) {
      const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const tag = await db.query.projectTags.findFirst({ where: eq(schema.projectTags.slug, slug) });
      if (tag) {
        await db.insert(schema.projectTagLinks).values({ projectId: projectIds[i], tagId: tag.id })
          .onConflictDoUpdate({ target: [schema.projectTagLinks.projectId, schema.projectTagLinks.tagId], set: { tagId: tag.id } });
      }
    }
  }

  // ─── Create Faculty Reviews ──────────────────────────────────────
  // Project 1: 3 reviews (ranked)
  // Project 2: 3 reviews (ranked)
  // Project 3: 2 reviews (unranked)
  // Project 4: 3 reviews (ranked)
  // Project 5: 1 review (unranked)

  const reviewData = [
    // Project 1 - 3 reviews, good scores
    { projectIdx: 0, facultyIdx: 0, scores: [8, 9, 8, 9, 8, 9] },
    { projectIdx: 0, facultyIdx: 1, scores: [9, 8, 9, 8, 9, 8] },
    { projectIdx: 0, facultyIdx: 2, scores: [8, 8, 9, 9, 8, 8] },
    // Project 2 - 3 reviews, high scores
    { projectIdx: 1, facultyIdx: 0, scores: [9, 9, 9, 8, 9, 9] },
    { projectIdx: 1, facultyIdx: 1, scores: [9, 10, 9, 9, 9, 9] },
    { projectIdx: 1, facultyIdx: 2, scores: [8, 9, 9, 8, 8, 9] },
    // Project 3 - 2 reviews only (unranked)
    { projectIdx: 2, facultyIdx: 0, scores: [7, 8, 7, 8, 7, 8] },
    { projectIdx: 2, facultyIdx: 1, scores: [8, 7, 8, 7, 8, 7] },
    // Project 4 - 3 reviews, medium scores
    { projectIdx: 3, facultyIdx: 0, scores: [7, 7, 7, 8, 7, 7] },
    { projectIdx: 3, facultyIdx: 1, scores: [6, 7, 7, 7, 6, 7] },
    { projectIdx: 3, facultyIdx: 2, scores: [7, 6, 6, 7, 7, 6] },
    // Project 5 - 1 review only (unranked)
    { projectIdx: 4, facultyIdx: 0, scores: [8, 8, 7, 8, 8, 7] },
  ];

  const facultyIdList = [faculty1.id, faculty2.id, faculty3.id];
  const criteriaList = await db.query.rubricCriteria.findMany({
    where: eq(schema.rubricCriteria.eventId, eventId),
  });

  for (const rd of reviewData) {
    // Calculate weighted score
    let weightedSum = 0;
    let totalWeight = 0;
    for (let i = 0; i < criteriaList.length; i++) {
      const weight = parseFloat(criteriaList[i].weightPercent);
      weightedSum += rd.scores[i] * weight;
      totalWeight += weight;
    }
    const reviewScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10 * 100) / 100 : 0;

    const [reviewResult] = await db.insert(schema.facultyReviews).values({
      eventId,
      projectId: projectIds[rd.projectIdx],
      facultyUserId: facultyIdList[rd.facultyIdx],
      status: "submitted",
      overallComment: `This is a detailed review comment for ${projectData[rd.projectIdx].title}. The project demonstrates strong technical capabilities and innovative approach. Overall, the implementation is solid with room for improvement in documentation and testing coverage.`,
      computedWeightedScore: reviewScore.toString(),
      submittedAt: new Date("2026-07-01"),
    }).returning();

    // Insert criterion scores
    for (let i = 0; i < criteriaList.length; i++) {
      await db.insert(schema.facultyReviewScores).values({
        reviewId: reviewResult.id,
        criterionId: criteriaList[i].id,
        score: rd.scores[i],
        weightedContribution: (rd.scores[i] * parseFloat(criteriaList[i].weightPercent) / 10).toString(),
      });
    }
  }

  // ─── Create Peer Votes ───────────────────────────────────────────
  // Project 1: 3 votes
  // Project 2: 2 votes
  // Project 3: 1 vote
  // Project 4: 2 votes
  // Project 5: 0 votes

  const voteAssignments = [
    { projectIdx: 0, voters: [5, 6, 7] },
    { projectIdx: 1, voters: [8, 9] },
    { projectIdx: 2, voters: [] },
    { projectIdx: 3, voters: [] },
    { projectIdx: 4, voters: [] },
  ];

  for (const va of voteAssignments) {
    for (const voterIdx of va.voters) {
      await db.insert(schema.peerVotes).values({
        eventId,
        voterUserId: studentIds[voterIdx],
        projectId: projectIds[va.projectIdx],
      });
    }
  }

  // ─── Create Score Snapshots ──────────────────────────────────────
  // Compute and store scores manually for demo
  const projectScores = [
    { projectIdx: 0, facultyScore: 85.33, peerScore: 100, finalScore: 87.03, votes: 3, reviews: 3, rank: 1, isRanked: true, peoplesChoice: true },
    { projectIdx: 1, facultyScore: 91.33, peerScore: 66.67, finalScore: 87.73, votes: 2, reviews: 3, rank: 2, isRanked: true, peoplesChoice: false },
    { projectIdx: 2, facultyScore: 75.00, peerScore: 33.33, finalScore: 68.75, votes: 1, reviews: 2, rank: null, isRanked: false, peoplesChoice: false },
    { projectIdx: 3, facultyScore: 68.33, peerScore: 66.67, finalScore: 68.08, votes: 2, reviews: 3, rank: 3, isRanked: true, peoplesChoice: false },
    { projectIdx: 4, facultyScore: 78.00, peerScore: 0, finalScore: 66.30, votes: 0, reviews: 1, rank: null, isRanked: false, peoplesChoice: false },
  ];

  for (const ps of projectScores) {
    await db.insert(schema.projectScoreSnapshots).values({
      eventId,
      projectId: projectIds[ps.projectIdx],
      facultyScore: ps.facultyScore.toString(),
      peerScore: ps.peerScore.toString(),
      finalScore: ps.finalScore.toString(),
      facultyReviewCount: ps.reviews,
      totalVotes: ps.votes,
      rank: ps.rank,
      isRanked: ps.isRanked,
      hasPeoplesChoice: ps.peoplesChoice,
      computedAt: new Date(),
      publishedAt: new Date(),
    });
  }

  // ─── Create Preview Check Logs ───────────────────────────────────
  for (let i = 0; i < projectIds.length; i++) {
    if (projectData[i].previewUrl) {
      await db.insert(schema.previewChecks).values({
        projectId: projectIds[i],
        status: i % 3 === 0 ? "live" : "live",
        statusCode: 200,
        responseTimeMs: Math.floor(Math.random() * 500) + 100,
      });
    }
  }

  console.log("Seeding complete!");
  console.log(`- Event: ${eventId}`);
  console.log(`- Users: 1 admin, 3 faculty, 10 students`);
  console.log(`- Projects: ${projectIds.length}`);
  console.log(`- Reviews: ${reviewData.length}`);
  console.log(`- Votes: ${voteAssignments.reduce((sum, va) => sum + va.voters.length, 0)}`);

  await queryClient.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
