-- ============================================================
-- Skill Hunt University - Demo Seed Data
-- Run this directly in Supabase SQL Editor
-- ============================================================

-- Clean existing demo data
DELETE FROM project_score_snapshots;
DELETE FROM faculty_review_scores;
DELETE FROM faculty_reviews;
DELETE FROM peer_votes;
DELETE FROM peer_vote_history;
DELETE FROM project_tag_links;
DELETE FROM project_tags;
DELETE FROM project_team_members;
DELETE FROM project_screenshots;
DELETE FROM preview_checks;
DELETE FROM projects;
DELETE FROM event_registrations;
DELETE FROM rubric_criteria;
DELETE FROM event_score_configs;
DELETE FROM events;
DELETE FROM faculty_profiles;
DELETE FROM student_profiles;
DELETE FROM designation_weights;
DELETE FROM users;

-- ── Designation Weights ────────────────────────────────────
INSERT INTO designation_weights (designation, weight) VALUES
  ('vice_chancellor', 10),
  ('dean', 8),
  ('hod', 6),
  ('professor', 5),
  ('associate_professor', 4),
  ('assistant_professor', 3);

-- ── Users ──────────────────────────────────────────────────
-- Admin
INSERT INTO users (id, "unionId", name, email, role, "accountStatus") VALUES
  (1, 'admin_user_001', 'Dr. Sarah Mitchell', 'admin@university.edu', 'admin', 'active');

-- Faculty
INSERT INTO users (id, "unionId", name, email, role, "accountStatus") VALUES
  (2, 'faculty_001', 'Dr. James Anderson', 'j.anderson@university.edu', 'user', 'active'),
  (3, 'faculty_002', 'Prof. Emily Chen', 'e.chen@university.edu', 'user', 'active'),
  (4, 'faculty_003', 'Dr. Michael Roberts', 'm.roberts@university.edu', 'user', 'active');

-- Students
INSERT INTO users (id, "unionId", name, email, role, "accountStatus") VALUES
  (5,  'student_001', 'Alice Johnson',  'alice.j@university.edu',  'user', 'active'),
  (6,  'student_002', 'Bob Williams',   'bob.w@university.edu',    'user', 'active'),
  (7,  'student_003', 'Carol Davis',    'carol.d@university.edu',  'user', 'active'),
  (8,  'student_004', 'David Brown',    'david.b@university.edu',  'user', 'active'),
  (9,  'student_005', 'Eva Martinez',   'eva.m@university.edu',    'user', 'active'),
  (10, 'student_006', 'Frank Lee',      'frank.l@university.edu',  'user', 'active'),
  (11, 'student_007', 'Grace Wilson',   'grace.w@university.edu',  'user', 'active'),
  (12, 'student_008', 'Henry Taylor',   'henry.t@university.edu',  'user', 'active'),
  (13, 'student_009', 'Iris Garcia',    'iris.g@university.edu',   'user', 'active'),
  (14, 'student_010', 'Jack Thomas',    'jack.t@university.edu',   'user', 'active');

-- Reset sequence
SELECT setval(pg_get_serial_sequence('users', 'id'), 20);

-- ── Faculty Profiles ───────────────────────────────────────
INSERT INTO faculty_profiles ("userId", department, designation, "verifiedByAdmin", "verifiedAt") VALUES
  (2, 'Computer Science',    'professor',            true, NOW()),
  (3, 'Software Engineering','associate_professor',  true, NOW()),
  (4, 'Data Science',        'assistant_professor',  true, NOW());

-- ── Student Profiles ───────────────────────────────────────
INSERT INTO student_profiles ("userId", department, year, section, batch) VALUES
  (5,  'CS',           '3rd', 'A', '2024'),
  (6,  'SE',           '3rd', 'A', '2024'),
  (7,  'DS',           '3rd', 'A', '2025'),
  (8,  'AI',           '3rd', 'A', '2025'),
  (9,  'Cybersecurity','3rd', 'A', '2026'),
  (10, 'CS',           '3rd', 'A', '2024'),
  (11, 'SE',           '3rd', 'A', '2025'),
  (12, 'DS',           '3rd', 'A', '2026'),
  (13, 'AI',           '3rd', 'A', '2024'),
  (14, 'CS',           '3rd', 'A', '2025');

-- ── Event ──────────────────────────────────────────────────
INSERT INTO events (id, name, slug, description, status, "isActive", "isPublic", "isCompleted",
  "registrationStartAt", "submissionDeadline", "votingStartAt", "reviewDeadline", "resultsPublishedAt") VALUES
  (1,
   'CS Project Showcase 2026',
   'cs-showcase-2026',
   'Annual Computer Science project showcase and competition. Students present their best projects for evaluation by faculty judges and peer voting.',
   'published', true, true, false,
   '2026-01-01 00:00:00',
   '2026-06-15 23:59:59',
   '2026-06-16 00:00:00',
   '2026-07-15 23:59:59',
   '2026-07-06 00:00:00');

SELECT setval(pg_get_serial_sequence('events', 'id'), 5);

-- ── Event Score Config ─────────────────────────────────────
INSERT INTO event_score_configs ("eventId", "facultyWeightPercent", "peerWeightPercent", "minFacultyReviews") VALUES
  (1, 85, 15, 3);

-- ── Rubric Criteria ────────────────────────────────────────
INSERT INTO rubric_criteria (id, "eventId", name, description, "weightPercent", "displayOrder") VALUES
  (1, 1, 'Innovation / Originality', 'Novelty and creativity of the solution',                    20.00, 0),
  (2, 1, 'Technical Depth',          'Complexity and sophistication of technical implementation',  25.00, 1),
  (3, 1, 'Code Quality',             'Code organization, readability, and best practices',         20.00, 2),
  (4, 1, 'UI / UX',                  'User interface design and user experience',                  15.00, 3),
  (5, 1, 'Documentation',            'Quality of project documentation',                          10.00, 4),
  (6, 1, 'Working Live Demo',        'Functionality and stability of live demo',                   10.00, 5);

SELECT setval(pg_get_serial_sequence('rubric_criteria', 'id'), 10);

-- ── Projects (5) ───────────────────────────────────────────
INSERT INTO projects (id, "eventId", "ownerUserId", title, slug, abstract, category, department,
  "githubUrl", "previewUrl", "previewStatus", "githubCommitCount", "githubLastCommitAt",
  "submissionStatus", "submittedAt") VALUES
  (1, 1, 5,
   'AI-Powered Campus Navigation',
   'ai-campus-nav',
   'An intelligent campus navigation system using computer vision and pathfinding algorithms to help students find their way around campus efficiently.',
   'Mobile App', 'CS',
   'https://github.com/TheEightboys/ai-campus-nav',
   'https://ai-campus-nav.vercel.app',
   'live', 142, '2026-06-08 10:00:00', 'submitted', '2026-06-10 09:00:00'),

  (2, 1, 6,
   'Distributed Task Scheduler',
   'distributed-scheduler',
   'A fault-tolerant distributed task scheduling system built with Go and Raft consensus algorithm for cloud-native environments.',
   'Backend System', 'SE',
   'https://github.com/TheEightboys/distributed-scheduler',
   'https://scheduler-demo.vercel.app',
   'live', 198, '2026-06-12 14:00:00', 'submitted', '2026-06-10 10:00:00'),

  (3, 1, 7,
   'Real-Time Collaborative Code Editor',
   'collab-code-editor',
   'A web-based collaborative code editor with real-time synchronization, syntax highlighting, and video chat integration.',
   'Web Application', 'CS',
   'https://github.com/TheEightboys/collab-editor',
   NULL,
   'unknown', 87, '2026-06-05 08:00:00', 'submitted', '2026-06-10 11:00:00'),

  (4, 1, 8,
   'Smart Waste Management IoT',
   'smart-waste-iot',
   'An IoT-based smart waste management system using ESP32 sensors, LoRaWAN, and a dashboard for monitoring fill levels and optimizing collection routes.',
   'IoT', 'DS',
   'https://github.com/TheEightboys/smart-waste',
   'https://smart-waste.vercel.app',
   'live', 65, '2026-06-11 16:00:00', 'submitted', '2026-06-10 12:00:00'),

  (5, 1, 9,
   'Privacy-Preserving ML Platform',
   'privacy-ml-platform',
   'A machine learning platform implementing federated learning and differential privacy for training models on sensitive healthcare data.',
   'Machine Learning', 'AI',
   'https://github.com/TheEightboys/privacy-ml',
   NULL,
   'unknown', 210, '2026-06-13 20:00:00', 'submitted', '2026-06-10 13:00:00');

SELECT setval(pg_get_serial_sequence('projects', 'id'), 10);

-- ── Team Members ───────────────────────────────────────────
INSERT INTO project_team_members ("projectId", "studentUserId", name, email, "isLeader") VALUES
  -- Project 1
  (1, 5,  'Alice Johnson', 'alice.j@university.edu',  true),
  (1, 6,  'Bob Williams',  'bob.w@university.edu',    false),
  -- Project 2
  (2, 6,  'Bob Williams',  'bob.w@university.edu',    true),
  (2, 7,  'Carol Davis',   'carol.d@university.edu',  false),
  -- Project 3
  (3, 7,  'Carol Davis',   'carol.d@university.edu',  true),
  (3, 8,  'David Brown',   'david.b@university.edu',  false),
  -- Project 4
  (4, 8,  'David Brown',   'david.b@university.edu',  true),
  (4, 9,  'Eva Martinez',  'eva.m@university.edu',    false),
  -- Project 5
  (5, 9,  'Eva Martinez',  'eva.m@university.edu',    true),
  (5, 10, 'Frank Lee',     'frank.l@university.edu',  false);

-- ── Event Registrations ────────────────────────────────────
INSERT INTO event_registrations ("userId", "eventId") VALUES
  (5, 1),(6, 1),(7, 1),(8, 1),(9, 1),
  (10, 1),(11, 1),(12, 1),(13, 1),(14, 1);

-- ── Project Tags ───────────────────────────────────────────
INSERT INTO project_tags (id, name, slug) VALUES
  (1,  'React',       'react'),
  (2,  'Node.js',     'nodejs'),
  (3,  'Python',      'python'),
  (4,  'TensorFlow',  'tensorflow'),
  (5,  'Go',          'go'),
  (6,  'IoT',         'iot'),
  (7,  'Flutter',     'flutter'),
  (8,  'Rust',        'rust'),
  (9,  'TypeScript',  'typescript'),
  (10, 'PostgreSQL',  'postgresql');

SELECT setval(pg_get_serial_sequence('project_tags', 'id'), 15);

-- ── Tag Links ──────────────────────────────────────────────
INSERT INTO project_tag_links ("projectId", "tagId") VALUES
  (1, 7),(1, 4),(1, 3),   -- AI Nav: Flutter, TF, Python
  (2, 5),(2, 10),(2, 8),  -- Scheduler: Go, PG, Rust
  (3, 1),(3, 9),(3, 2),   -- Editor: React, TS, Node
  (4, 6),(4, 3),(4, 2),   -- IoT: IoT, Python, Node
  (5, 3),(5, 4),(5, 10);  -- ML: Python, TF, PG

-- ── Faculty Reviews ────────────────────────────────────────
-- Project 1: 3 reviews (RANKED)
INSERT INTO faculty_reviews (id, "eventId", "projectId", "facultyUserId", status, "overallComment", "computedWeightedScore", "submittedAt") VALUES
  (1, 1, 1, 2, 'submitted', 'AI Campus Navigation shows exceptional innovation with its computer vision approach. The pathfinding algorithm is well-implemented and the mobile UX is intuitive. Code quality and documentation could be improved for production readiness.', 85.50, '2026-07-01 10:00:00'),
  (2, 1, 1, 3, 'submitted', 'Strong technical implementation with practical real-world application. The team demonstrated solid understanding of machine learning fundamentals. The live demo works reliably and the UI is clean and responsive across devices.', 86.50, '2026-07-01 11:00:00'),
  (3, 1, 1, 4, 'submitted', 'Good project with clear innovation. The navigation accuracy could be improved but overall this is an impressive student project. Documentation is thorough and the GitHub activity shows consistent development effort throughout the semester.', 85.00, '2026-07-01 12:00:00');

-- Project 2: 3 reviews (RANKED)
INSERT INTO faculty_reviews (id, "eventId", "projectId", "facultyUserId", status, "overallComment", "computedWeightedScore", "submittedAt") VALUES
  (4, 1, 2, 2, 'submitted', 'Outstanding technical depth in the distributed systems implementation. The Raft consensus algorithm is correctly implemented and the fault-tolerance has been properly tested. This is graduate-level work from an undergraduate team, highly impressive.', 91.25, '2026-07-01 13:00:00'),
  (5, 1, 2, 3, 'submitted', 'Excellent backend architecture with production-quality code. The documentation is comprehensive and the system handles edge cases gracefully. The team clearly has a deep understanding of distributed computing principles and best practices.', 92.75, '2026-07-01 14:00:00'),
  (6, 1, 2, 4, 'submitted', 'Very strong project demonstrating advanced systems programming skills. The Go implementation is idiomatic and efficient. Minor deductions for the UI which is functional but basic. Overall this is one of the strongest technical submissions this year.', 89.00, '2026-07-01 15:00:00');

-- Project 3: 2 reviews (UNRANKED - not enough reviews)
INSERT INTO faculty_reviews (id, "eventId", "projectId", "facultyUserId", status, "overallComment", "computedWeightedScore", "submittedAt") VALUES
  (7, 1, 3, 2, 'submitted', 'The collaborative editor has a great concept and the real-time sync works smoothly. The technical implementation using WebSockets is solid. The UI needs polish and the video chat feature seems incomplete. Would benefit from more thorough testing.', 76.00, '2026-07-01 16:00:00'),
  (8, 1, 3, 3, 'submitted', 'Good web application with clear practical utility. The syntax highlighting covers major languages and the collaborative features are functional. Code quality is average with some areas needing refactoring. More documentation needed for setup and deployment.', 74.50, '2026-07-01 17:00:00');

-- Project 4: 3 reviews (RANKED)
INSERT INTO faculty_reviews (id, "eventId", "projectId", "facultyUserId", status, "overallComment", "computedWeightedScore", "submittedAt") VALUES
  (9,  1, 4, 2, 'submitted', 'Innovative IoT application with real social impact. The sensor integration works reliably and the route optimization algorithm is practical. The dashboard UI is clean and the data visualization helps operators understand waste levels at a glance.', 70.25, '2026-07-01 18:00:00'),
  (10, 1, 4, 3, 'submitted', 'Solid IoT project with good hardware-software integration. The LoRaWAN communication is well implemented. The project could benefit from better error handling and the mobile app feels incomplete compared to the web dashboard.', 67.50, '2026-07-01 19:00:00'),
  (11, 1, 4, 4, 'submitted', 'Good use of IoT technologies for a practical campus problem. The fill-level monitoring is accurate and the collection route optimization saves real resources. Documentation is adequate and the code is reasonably organized for a hardware project.', 67.00, '2026-07-01 20:00:00');

-- Project 5: 1 review (UNRANKED - not enough reviews)
INSERT INTO faculty_reviews (id, "eventId", "projectId", "facultyUserId", status, "overallComment", "computedWeightedScore", "submittedAt") VALUES
  (12, 1, 5, 2, 'submitted', 'Highly ambitious project tackling federated learning and differential privacy. The theoretical foundations are solid and the implementation shows good understanding of privacy-preserving ML. The healthcare use case is compelling and well-motivated by current industry needs.', 79.00, '2026-07-01 21:00:00');

SELECT setval(pg_get_serial_sequence('faculty_reviews', 'id'), 20);

-- ── Review Criterion Scores ────────────────────────────────
-- Review 1 (Project 1, Faculty 1): [8,9,8,9,8,9]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (1, 1, 8, 16.00),(1, 2, 9, 22.50),(1, 3, 8, 16.00),(1, 4, 9, 13.50),(1, 5, 8, 8.00),(1, 6, 9, 9.00);
-- Review 2 (Project 1, Faculty 2): [9,8,9,8,9,8]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (2, 1, 9, 18.00),(2, 2, 8, 20.00),(2, 3, 9, 18.00),(2, 4, 8, 12.00),(2, 5, 9, 9.00),(2, 6, 8, 8.00);
-- Review 3 (Project 1, Faculty 3): [8,8,9,9,8,8]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (3, 1, 8, 16.00),(3, 2, 8, 20.00),(3, 3, 9, 18.00),(3, 4, 9, 13.50),(3, 5, 8, 8.00),(3, 6, 8, 8.00);
-- Review 4 (Project 2, Faculty 1): [9,9,9,8,9,9]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (4, 1, 9, 18.00),(4, 2, 9, 22.50),(4, 3, 9, 18.00),(4, 4, 8, 12.00),(4, 5, 9, 9.00),(4, 6, 9, 9.00);
-- Review 5 (Project 2, Faculty 2): [9,10,9,9,9,9]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (5, 1, 9, 18.00),(5, 2, 10, 25.00),(5, 3, 9, 18.00),(5, 4, 9, 13.50),(5, 5, 9, 9.00),(5, 6, 9, 9.00);
-- Review 6 (Project 2, Faculty 3): [8,9,9,8,8,9]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (6, 1, 8, 16.00),(6, 2, 9, 22.50),(6, 3, 9, 18.00),(6, 4, 8, 12.00),(6, 5, 8, 8.00),(6, 6, 9, 9.00);
-- Review 7 (Project 3, Faculty 1): [7,8,7,8,7,8]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (7, 1, 7, 14.00),(7, 2, 8, 20.00),(7, 3, 7, 14.00),(7, 4, 8, 12.00),(7, 5, 7, 7.00),(7, 6, 8, 8.00);
-- Review 8 (Project 3, Faculty 2): [8,7,8,7,8,7]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (8, 1, 8, 16.00),(8, 2, 7, 17.50),(8, 3, 8, 16.00),(8, 4, 7, 10.50),(8, 5, 8, 8.00),(8, 6, 7, 7.00);
-- Review 9 (Project 4, Faculty 1): [7,7,7,8,7,7]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (9, 1, 7, 14.00),(9, 2, 7, 17.50),(9, 3, 7, 14.00),(9, 4, 8, 12.00),(9, 5, 7, 7.00),(9, 6, 7, 7.00);
-- Review 10 (Project 4, Faculty 2): [6,7,7,7,6,7]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (10, 1, 6, 12.00),(10, 2, 7, 17.50),(10, 3, 7, 14.00),(10, 4, 7, 10.50),(10, 5, 6, 6.00),(10, 6, 7, 7.00);
-- Review 11 (Project 4, Faculty 3): [7,6,6,7,7,6]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (11, 1, 7, 14.00),(11, 2, 6, 15.00),(11, 3, 6, 12.00),(11, 4, 7, 10.50),(11, 5, 7, 7.00),(11, 6, 6, 6.00);
-- Review 12 (Project 5, Faculty 1): [8,8,7,8,8,7]
INSERT INTO faculty_review_scores ("reviewId", "criterionId", score, "weightedContribution") VALUES
  (12, 1, 8, 16.00),(12, 2, 8, 20.00),(12, 3, 7, 14.00),(12, 4, 8, 12.00),(12, 5, 8, 8.00),(12, 6, 7, 7.00);

SELECT setval(pg_get_serial_sequence('faculty_review_scores', 'id'), 80);

-- ── Peer Votes ─────────────────────────────────────────────
-- Project 1 gets 3 votes (most), Project 2 gets 2 votes
INSERT INTO peer_votes ("eventId", "voterUserId", "projectId") VALUES
  (1, 10, 1),  -- Frank votes Project 1
  (1, 11, 1),  -- Grace votes Project 1
  (1, 12, 1),  -- Henry votes Project 1
  (1, 13, 2),  -- Iris votes Project 2
  (1, 14, 2);  -- Jack votes Project 2

-- ── Score Snapshots ────────────────────────────────────────
-- Faculty scores weighted avg; peer score normalized (proj1=3 votes=highest=100%)
-- Final = faculty*0.85 + peer*0.15
-- Project 1: faculty=85.67, peer=100 -> final = 72.82 + 15 = 87.82, rank=2
-- Project 2: faculty=91.00, peer=66.67 -> final = 77.35 + 10 = 87.35, rank=1 (highest faculty)
-- Project 3: faculty=75.25, peer=0 -> unranked (only 2 reviews)
-- Project 4: faculty=68.25, peer=0 -> final=58.01, rank=3
-- Project 5: faculty=79.00, peer=0 -> unranked (only 1 review)
INSERT INTO project_score_snapshots ("eventId", "projectId", "facultyScore", "peerScore", "finalScore",
  "facultyReviewCount", "totalVotes", rank, "isRanked", "hasPeoplesChoice", "computedAt", "publishedAt") VALUES
  (1, 1, 85.6700, 100.0000, 87.8195, 3, 3, 2, true,  true,  NOW(), NOW()),
  (1, 2, 91.0000, 66.6667,  87.3500, 3, 2, 1, true,  false, NOW(), NOW()),
  (1, 3, 75.2500, 0.0000,   63.9625, 2, 0, NULL, false, false, NOW(), NOW()),
  (1, 4, 68.2500, 0.0000,   58.0125, 3, 0, 3, true,  false, NOW(), NOW()),
  (1, 5, 79.0000, 0.0000,   67.1500, 1, 0, NULL, false, false, NOW(), NOW());

-- ── Preview Check Logs ─────────────────────────────────────
INSERT INTO preview_checks ("projectId", status, "statusCode", "responseTimeMs") VALUES
  (1, 'live', 200, 312),
  (2, 'live', 200, 198),
  (4, 'live', 200, 445);

-- ── Done ───────────────────────────────────────────────────
SELECT 'Seed complete!' as status,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM faculty_reviews) as reviews,
  (SELECT COUNT(*) FROM peer_votes) as votes;
