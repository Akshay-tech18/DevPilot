// =============================================================================
// prisma/seed.js — DevPilot demo data seeder
// Run: npx prisma db seed
// =============================================================================

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =============================================================================
// HELPERS
// =============================================================================

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// =============================================================================
// MAIN SEED
// =============================================================================

async function main() {
  console.log("🌱 Seeding DevPilot database...\n");

  // ---------------------------------------------------------------------------
  // 1. USERS
  // ---------------------------------------------------------------------------
  console.log("👤 Creating users...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@devpilot.dev" },
    update: {},
    create: {
      name: "Alice Admin",
      email: "admin@devpilot.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      role: "ADMIN",
      googleId: "google_alice_001",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@devpilot.dev" },
    update: {},
    create: {
      name: "Bob Manager",
      email: "manager@devpilot.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      role: "MANAGER",
      githubId: "github_bob_002",
    },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: "dev1@devpilot.dev" },
    update: {},
    create: {
      name: "Carol Developer",
      email: "dev1@devpilot.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
      role: "DEVELOPER",
      githubId: "github_carol_003",
    },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: "dev2@devpilot.dev" },
    update: {},
    create: {
      name: "Dan Developer",
      email: "dev2@devpilot.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dan",
      role: "DEVELOPER",
      githubId: "github_dan_004",
    },
  });

  const qa = await prisma.user.upsert({
    where: { email: "qa@devpilot.dev" },
    update: {},
    create: {
      name: "Eve QA",
      email: "qa@devpilot.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve",
      role: "QA_TESTER",
      googleId: "google_eve_005",
    },
  });

  console.log(`   ✔ Created 5 users\n`);

  // ---------------------------------------------------------------------------
  // 2. PROJECT
  // ---------------------------------------------------------------------------
  console.log("📁 Creating project...");

  const project = await prisma.project.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "DevPilot Platform",
      description:
        "Intelligent software project management system with GitHub integration and ML-based bug prediction.",
      ownerId: admin.id,
      deadline: daysFromNow(90),
      progress: 35,
      status: "ACTIVE",
    },
  });

  console.log(`   ✔ Created project: ${project.name}\n`);

  // ---------------------------------------------------------------------------
  // 3. PROJECT MEMBERS
  // ---------------------------------------------------------------------------
  console.log("👥 Adding project members...");

  await prisma.projectMember.createMany({
    skipDuplicates: true,
    data: [
      { projectId: project.id, userId: admin.id,   role: "MANAGER"   },
      { projectId: project.id, userId: manager.id, role: "MANAGER"   },
      { projectId: project.id, userId: dev1.id,    role: "DEVELOPER" },
      { projectId: project.id, userId: dev2.id,    role: "DEVELOPER" },
      { projectId: project.id, userId: qa.id,      role: "QA_TESTER" },
    ],
  });

  console.log(`   ✔ Added 5 members\n`);

  // ---------------------------------------------------------------------------
  // 4. SPRINTS
  // ---------------------------------------------------------------------------
  console.log("🏃 Creating sprints...");

  const sprint1 = await prisma.sprint.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      projectId: project.id,
      name: "Sprint 1 — Auth & Core",
      goal: "Complete authentication module and core project/task CRUD.",
      startDate: daysAgo(14),
      endDate: daysAgo(1),
      status: "COMPLETED",
    },
  });

  const sprint2 = await prisma.sprint.upsert({
    where: { id: "00000000-0000-0000-0000-000000000011" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000011",
      projectId: project.id,
      name: "Sprint 2 — GitHub Integration",
      goal: "Implement webhook handling, commit tracking, and auto task updates.",
      startDate: daysFromNow(0),
      endDate: daysFromNow(14),
      status: "ACTIVE",
    },
  });

  const sprint3 = await prisma.sprint.upsert({
    where: { id: "00000000-0000-0000-0000-000000000012" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000012",
      projectId: project.id,
      name: "Sprint 3 — ML Bug Prediction",
      goal: "Feature extraction pipeline and XGBoost model integration.",
      startDate: daysFromNow(15),
      endDate: daysFromNow(29),
      status: "PLANNED",
    },
  });

  console.log(`   ✔ Created 3 sprints\n`);

  // ---------------------------------------------------------------------------
  // 5. TASKS
  // ---------------------------------------------------------------------------
  console.log("✅ Creating tasks...");

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000020" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000020",
        projectId: project.id,
        sprintId: sprint1.id,
        reporterId: manager.id,
        assigneeId: dev1.id,
        title: "Setup Google OAuth with Passport.js",
        description: "Implement Google OAuth 2.0 login strategy using passport-google-oauth20.",
        priority: "HIGH",
        status: "COMPLETED",
        orderIndex: 1000,
        dueDate: daysAgo(7),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000021" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000021",
        projectId: project.id,
        sprintId: sprint1.id,
        reporterId: manager.id,
        assigneeId: dev2.id,
        title: "Implement JWT refresh token flow",
        description: "Short-lived access tokens (15m) + refresh tokens (7d) stored in httpOnly cookies.",
        priority: "HIGH",
        status: "COMPLETED",
        orderIndex: 2000,
        dueDate: daysAgo(5),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000022" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000022",
        projectId: project.id,
        sprintId: sprint2.id,
        reporterId: manager.id,
        assigneeId: dev1.id,
        title: "GitHub webhook endpoint with HMAC verification",
        description: "POST /api/webhooks/github — verify X-Hub-Signature-256, parse push and PR events.",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        orderIndex: 1000,
        dueDate: daysFromNow(5),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000023" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000023",
        projectId: project.id,
        sprintId: sprint2.id,
        reporterId: dev1.id,
        assigneeId: dev2.id,
        title: "Commit parser — extract #TASK-xx from messages",
        description: "Regex: /#(TASK-\\d+)/g. On match, move linked task to IN_REVIEW and log activity.",
        priority: "HIGH",
        status: "TODO",
        orderIndex: 2000,
        dueDate: daysFromNow(8),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000024" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000024",
        projectId: project.id,
        sprintId: sprint2.id,
        reporterId: manager.id,
        assigneeId: qa.id,
        title: "QA — test auth flow end-to-end",
        description: "Test Google OAuth, GitHub OAuth, JWT refresh, and RBAC middleware on all protected routes.",
        priority: "MEDIUM",
        status: "IN_REVIEW",
        orderIndex: 3000,
        dueDate: daysFromNow(3),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000025" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000025",
        projectId: project.id,
        sprintId: null,
        reporterId: admin.id,
        assigneeId: null,
        title: "Design XGBoost feature extraction pipeline",
        description: "Backlog: define commit_frequency, code_churn, contributor count aggregation per file.",
        priority: "MEDIUM",
        status: "TODO",
        orderIndex: 1000,
        dueDate: daysFromNow(20),
      },
    }),
    prisma.task.upsert({
      where: { id: "00000000-0000-0000-0000-000000000026" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000026",
        projectId: project.id,
        sprintId: sprint2.id,
        reporterId: dev2.id,
        assigneeId: dev2.id,
        title: "Kanban drag-and-drop orderIndex persistence",
        description: "On DragEnd, PATCH /tasks/reorder with updated orderIndex values for affected tasks.",
        priority: "MEDIUM",
        status: "BLOCKED",
        orderIndex: 4000,
        dueDate: daysFromNow(10),
      },
    }),
  ]);

  console.log(`   ✔ Created ${tasks.length} tasks\n`);

  // ---------------------------------------------------------------------------
  // 6. TASK COMMENTS
  // ---------------------------------------------------------------------------
  console.log("💬 Adding task comments...");

  await prisma.taskComment.createMany({
    skipDuplicates: true,
    data: [
      {
        taskId: tasks[0].id,
        userId: dev1.id,
        content: "Completed. Passport strategy configured, user upserted on callback.",
      },
      {
        taskId: tasks[0].id,
        userId: manager.id,
        content: "Verified — login and profile fetch working. Marking complete.",
      },
      {
        taskId: tasks[2].id,
        userId: dev1.id,
        content: "HMAC verification done. Push event parsing in progress.",
      },
      {
        taskId: tasks[3].id,
        userId: dev2.id,
        content: "Regex pattern tested. Edge cases: multiple task IDs in one commit message handled.",
      },
      {
        taskId: tasks[5].id, // blocked task
        userId: dev2.id,
        content: "Blocked — waiting on Task TASK-22 webhook endpoint to be ready before testing reorder.",
      },
    ],
  });

  console.log(`   ✔ Added 5 comments\n`);

  // ---------------------------------------------------------------------------
  // 7. REPOSITORY
  // ---------------------------------------------------------------------------
  console.log("🗂  Creating repository...");

  const repo = await prisma.repository.upsert({
    where: { githubRepoId: "987654321" },
    update: {},
    create: {
      projectId: project.id,
      githubRepoId: "987654321",
      name: "devpilot",
      fullName: "devpilot-team/devpilot",
      webhookSecret: "seed_webhook_secret_replace_in_production",
    },
  });

  console.log(`   ✔ Created repo: ${repo.fullName}\n`);

  // ---------------------------------------------------------------------------
  // 8. COMMITS
  // ---------------------------------------------------------------------------
  console.log("📝 Creating commits...");

  await prisma.commit.createMany({
    skipDuplicates: true,
    data: [
      {
        repoId: repo.id,
        taskId: tasks[0].id,
        sha: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        message: "#TASK-20 Setup Google OAuth passport strategy and user upsert on callback",
        authorName: "Carol Developer",
        filesChanged: JSON.stringify([
          "src/config/passport.js",
          "src/modules/auth/auth.service.js",
          "src/modules/auth/auth.routes.js",
        ]),
        committedAt: daysAgo(8),
      },
      {
        repoId: repo.id,
        taskId: tasks[1].id,
        sha: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
        message: "#TASK-21 Implement JWT access and refresh token flow with httpOnly cookies",
        authorName: "Dan Developer",
        filesChanged: JSON.stringify([
          "src/utils/jwt.utils.js",
          "src/middleware/auth.middleware.js",
          "src/modules/auth/auth.controller.js",
        ]),
        committedAt: daysAgo(6),
      },
      {
        repoId: repo.id,
        taskId: tasks[2].id,
        sha: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
        message: "#TASK-22 Add HMAC SHA-256 webhook signature verification middleware",
        authorName: "Carol Developer",
        filesChanged: JSON.stringify([
          "src/middleware/webhook.middleware.js",
          "src/utils/crypto.utils.js",
          "src/modules/github/webhook.handler.js",
        ]),
        committedAt: daysAgo(1),
      },
      {
        repoId: repo.id,
        taskId: null,
        sha: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
        message: "chore: update dependencies and fix eslint warnings",
        authorName: "Dan Developer",
        filesChanged: JSON.stringify(["package.json", "package-lock.json", ".eslintrc.js"]),
        committedAt: daysAgo(3),
      },
    ],
  });

  console.log(`   ✔ Created 4 commits\n`);

  // ---------------------------------------------------------------------------
  // 9. PULL REQUESTS
  // ---------------------------------------------------------------------------
  console.log("🔀 Creating pull requests...");

  await prisma.pullRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        repoId: repo.id,
        githubPrNumber: 1,
        title: "feat: Google & GitHub OAuth integration",
        state: "MERGED",
        mergedAt: daysAgo(6),
      },
      {
        repoId: repo.id,
        githubPrNumber: 2,
        title: "feat: JWT refresh token flow with httpOnly cookie",
        state: "MERGED",
        mergedAt: daysAgo(4),
      },
      {
        repoId: repo.id,
        githubPrNumber: 3,
        title: "feat: GitHub webhook endpoint and HMAC verification",
        state: "OPEN",
        mergedAt: null,
      },
    ],
  });

  console.log(`   ✔ Created 3 pull requests\n`);

  // ---------------------------------------------------------------------------
  // 10. MESSAGES
  // ---------------------------------------------------------------------------
  console.log("💬 Creating messages...");

  await prisma.message.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        senderId: manager.id,
        receiverId: null,
        content: "Sprint 2 kick-off! Focus on GitHub webhook integration this week. Let's ship it 🚀",
        isGroup: true,
      },
      {
        projectId: project.id,
        senderId: dev1.id,
        receiverId: null,
        content: "Webhook signature verification is done. Starting on the commit parser next.",
        isGroup: true,
      },
      {
        projectId: project.id,
        senderId: dev2.id,
        receiverId: dev1.id,
        content: "Carol, can you review my PR for the JWT flow? Left some comments on the refresh logic.",
        isGroup: false,
      },
      {
        projectId: project.id,
        senderId: qa.id,
        receiverId: null,
        content: "Starting QA on auth flow today. Will log bugs in the tracker.",
        isGroup: true,
      },
    ],
  });

  console.log(`   ✔ Created 4 messages\n`);

  // ---------------------------------------------------------------------------
  // 11. PREDICTION RESULTS
  // ---------------------------------------------------------------------------
  console.log("🤖 Creating ML prediction results...");

  await prisma.predictionResult.createMany({
    skipDuplicates: true,
    data: [
      {
        repoId: repo.id,
        filePath: "src/modules/auth/auth.service.js",
        commitFrequency: 8.5,
        codeChurn: 320.0,
        contributors: 2,
        prCount: 3,
        bugFixRatio: 0.25,
        riskLevel: "MEDIUM",
        confidence: 0.72,
      },
      {
        repoId: repo.id,
        filePath: "src/middleware/webhook.middleware.js",
        commitFrequency: 12.0,
        codeChurn: 480.0,
        contributors: 1,
        prCount: 2,
        bugFixRatio: 0.4,
        riskLevel: "HIGH",
        confidence: 0.85,
      },
      {
        repoId: repo.id,
        filePath: "src/utils/jwt.utils.js",
        commitFrequency: 3.2,
        codeChurn: 95.0,
        contributors: 1,
        prCount: 1,
        bugFixRatio: 0.1,
        riskLevel: "LOW",
        confidence: 0.91,
      },
      {
        repoId: repo.id,
        filePath: "src/config/passport.js",
        commitFrequency: 6.0,
        codeChurn: 210.0,
        contributors: 2,
        prCount: 2,
        bugFixRatio: 0.33,
        riskLevel: "MEDIUM",
        confidence: 0.68,
      },
    ],
  });

  console.log(`   ✔ Created 4 prediction results\n`);

  // ---------------------------------------------------------------------------
  // 12. ACTIVITY LOGS
  // ---------------------------------------------------------------------------
  console.log("📋 Creating activity logs...");

  await prisma.activityLog.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        userId: admin.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: project.id,
        metadata: { projectName: "DevPilot Platform" },
      },
      {
        projectId: project.id,
        userId: dev1.id,
        action: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        entityId: tasks[0].id,
        metadata: { from: "IN_PROGRESS", to: "COMPLETED", taskTitle: tasks[0].title },
      },
      {
        projectId: project.id,
        userId: dev1.id,
        action: "COMMIT_LINKED",
        entityType: "COMMIT",
        entityId: tasks[2].id,
        metadata: {
          sha: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
          message: "#TASK-22 Add HMAC SHA-256 webhook signature verification middleware",
          taskMoved: "IN_REVIEW",
        },
      },
      {
        projectId: project.id,
        userId: manager.id,
        action: "MEMBER_ADDED",
        entityType: "MEMBER",
        entityId: qa.id,
        metadata: { userName: "Eve QA", role: "QA_TESTER" },
      },
      {
        projectId: project.id,
        userId: manager.id,
        action: "SPRINT_STARTED",
        entityType: "SPRINT",
        entityId: sprint2.id,
        metadata: { sprintName: sprint2.name, goal: sprint2.goal },
      },
      {
        projectId: project.id,
        userId: dev2.id,
        action: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        entityId: tasks[5].id,
        metadata: { from: "IN_PROGRESS", to: "BLOCKED", reason: "Waiting on webhook endpoint" },
      },
    ],
  });

  console.log(`   ✔ Created 6 activity logs\n`);

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("=".repeat(50));
  console.log("✅ Seed complete! Summary:");
  console.log(`   Users              : 5`);
  console.log(`   Projects           : 1`);
  console.log(`   Project Members    : 5`);
  console.log(`   Sprints            : 3`);
  console.log(`   Tasks              : ${tasks.length}`);
  console.log(`   Task Comments      : 5`);
  console.log(`   Repositories       : 1`);
  console.log(`   Commits            : 4`);
  console.log(`   Pull Requests      : 3`);
  console.log(`   Messages           : 4`);
  console.log(`   Prediction Results : 4`);
  console.log(`   Activity Logs      : 6`);
  console.log("=".repeat(50));
}

// =============================================================================
// RUN
// =============================================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });