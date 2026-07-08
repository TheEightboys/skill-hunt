import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log("Seeding evaluations and peer votes...");

  // 1. Get Event
  const { data: events } = await supabase.from("events").select("*").limit(1);
  if (!events || events.length === 0) {
    console.log("No events found.");
    return;
  }
  const event = events[0];
  console.log("Found event:", event.id);

  // 2. Get Faculty
  let { data: facultyUsers } = await supabase.from("users").select("*").eq("role", "faculty");
  if (!facultyUsers || facultyUsers.length === 0) {
    console.log("No faculty found, creating some...");
    // Create 3 faculty members
    const newFaculty = [
      { email: "prof1@skillhunt.com", name: "Prof. Alan Turing", role: "faculty", unionId: "turing_f1" },
      { email: "prof2@skillhunt.com", name: "Dr. Grace Hopper", role: "faculty", unionId: "hopper_f2" },
      { email: "prof3@skillhunt.com", name: "Dean Ada Lovelace", role: "faculty", unionId: "lovelace_f3" }
    ];
    for (const f of newFaculty) {
      const { data } = await supabase.from("users").insert(f).select().single();
      if (data) {
        await supabase.from("faculty_profiles").insert({
          userId: data.id,
          department: "CS",
          designation: f.name.includes("Dean") ? "dean" : f.name.includes("Prof") ? "professor" : "associate_professor",
          verifiedByAdmin: true
        });
      }
    }
    facultyUsers = (await supabase.from("users").select("*").eq("role", "faculty")).data;
  }
  console.log(`Found ${facultyUsers.length} faculty users.`);

  // 3. Get Students
  let { data: studentUsers } = await supabase.from("users").select("*").eq("role", "user");
  if (!studentUsers || studentUsers.length < 10) {
    console.log("Not enough students found, creating more...");
    const currentCount = studentUsers ? studentUsers.length : 0;
    for (let i = currentCount; i < 15; i++) {
      const { data } = await supabase.from("users").insert({
        email: `student${i}@skillhunt.com`,
        name: `Student ${i}`,
        role: "user",
        unionId: `student_${i}_union`
      }).select().single();
      if (data) {
        await supabase.from("student_profiles").insert({
          userId: data.id,
          department: "CS",
          year: "3rd",
          batch: "2026"
        });
      }
    }
    studentUsers = (await supabase.from("users").select("*").eq("role", "user")).data;
  }
  console.log(`Found ${studentUsers.length} student users.`);

  // 4. Get Projects
  const { data: projects } = await supabase.from("projects").select("*").eq("eventId", event.id);
  console.log(`Found ${projects.length} projects.`);

  // 5. Get Rubric Criteria
  let { data: criteria } = await supabase.from("rubric_criteria").select("*").eq("eventId", event.id);
  if (!criteria || criteria.length === 0) {
    console.log("Creating rubric criteria...");
    const defaultCriteria = [
      { eventId: event.id, name: "Innovation / Originality", weightPercent: 20 },
      { eventId: event.id, name: "Technical Depth", weightPercent: 25 },
      { eventId: event.id, name: "Code Quality", weightPercent: 20 },
      { eventId: event.id, name: "UI / UX", weightPercent: 15 },
      { eventId: event.id, name: "Documentation", weightPercent: 10 },
      { eventId: event.id, name: "Working Live Demo", weightPercent: 10 }
    ];
    await supabase.from("rubric_criteria").insert(defaultCriteria);
    criteria = (await supabase.from("rubric_criteria").select("*").eq("eventId", event.id)).data;
  }

  // Clear existing reviews to avoid unique constraint errors
  await supabase.from("faculty_review_scores").delete().neq("id", 0);
  await supabase.from("faculty_reviews").delete().neq("id", 0);
  await supabase.from("peer_votes").delete().neq("id", 0);
  
  console.log("Cleared old reviews and votes.");

  // 6. Seed Faculty Reviews
  for (const project of projects) {
    for (const faculty of facultyUsers) {
      // 90% chance a faculty reviews a project
      if (Math.random() < 0.1) continue;

      const { data: review } = await supabase.from("faculty_reviews").insert({
        eventId: event.id,
        projectId: project.id,
        facultyUserId: faculty.id,
        status: "submitted",
        overallComment: `Excellent work on ${project.title}. The presentation was solid and the core features worked as expected. There are a few edge cases that need handling, but overall a strong submission.`,
        submittedAt: new Date().toISOString()
      }).select().single();

      if (review) {
        const scores = [];
        let totalScore = 0;
        for (const criterion of criteria) {
          // Give random score between 6 and 10
          const score = Math.floor(Math.random() * 5) + 6;
          const weighted = (score * criterion.weightPercent) / 100;
          totalScore += weighted;
          scores.push({
            reviewId: review.id,
            criterionId: criterion.id,
            score: score,
            weightedContribution: weighted
          });
        }
        await supabase.from("faculty_review_scores").insert(scores);
        await supabase.from("faculty_reviews").update({ computedWeightedScore: totalScore }).eq("id", review.id);
      }
    }
  }
  console.log("Added faculty reviews.");

  // 7. Seed Peer Votes
  for (const student of studentUsers) {
    // 80% chance to vote
    if (Math.random() < 0.2) continue;

    // Pick a random project, ensuring it's not their own (simple assumption)
    const availableProjects = projects.filter(p => p.ownerUserId !== student.id);
    if (availableProjects.length > 0) {
      const randomProject = availableProjects[Math.floor(Math.random() * availableProjects.length)];
      await supabase.from("peer_votes").insert({
        eventId: event.id,
        voterUserId: student.id,
        projectId: randomProject.id
      });
    }
  }
  console.log("Added peer votes.");

  console.log("Seeding complete! Admin can now Force Recompute All Scores.");
}

run().catch(console.error);
