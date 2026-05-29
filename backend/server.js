// entry point -- app + socket
// backend/server.js — Entry point
// Starts Express + Socket.IO, verifies DB connection on boot

require("dotenv").config();

const http   = require("http");
//const { Server } = require("socket.io");
const app    = require("./app");
const prisma = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// HTTP SERVER

const server = http.createServer(app);

// SOCKET.IO

// const io = new Server(server, {
//   cors: {
//     origin:      (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(","),
//     methods:     ["GET", "POST"],
//     credentials: true,
//   },
// });

// Namespace: /project — clients join a room per project ID
// const projectNS = io.of("/project");

// projectNS.on("connection", (socket) => {
//   console.log(`[Socket] Client connected: ${socket.id}`);

//   // Client sends: { projectId: "uuid" }
//   socket.on("join_project", (projectId) => {
//     socket.join(projectId);
//     console.log(`[Socket] ${socket.id} joined room: ${projectId}`);
//   });

//   socket.on("leave_project", (projectId) => {
//     socket.leave(projectId);
//   });

//   socket.on("disconnect", () => {
//     console.log(`[Socket] Client disconnected: ${socket.id}`);
//   });
// });

// Attach io to app so routes can emit events via req.app.get("io")
//app.set("io", io);

// DATABASE CONNECTION CHECK ON STARTUP

async function checkDatabaseConnection() {
  console.log("\n🔌 Checking Neon PostgreSQL connection...");
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully (Neon PostgreSQL)\n");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("   Check your DATABASE_URL in .env\n");
    return false;
  }
}

// STARTUP


async function startServer() {
  const dbOk = await checkDatabaseConnection();

  if (!dbOk) {
    console.error("🚫 Server startup aborted — database unreachable.");
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log("=".repeat(50));
    console.log(`🚀 DevPilot API running`);
    console.log(`   Mode    : ${process.env.NODE_ENV || "development"}`);
    console.log(`   HTTP    : http://localhost:${PORT}`);
    console.log(`   Health  : http://localhost:${PORT}/health`);
    console.log(`   DB ping : http://localhost:${PORT}/health/db`);
    console.log(`   Full    : http://localhost:${PORT}/health/full`);
    console.log("=".repeat(50) + "\n");
  });
}


// GRACEFUL SHUTDOWN

async function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully...`);

  server.close(async () => {
    console.log("   HTTP server closed");
    await prisma.$disconnect();
    console.log("   Prisma disconnected");
    console.log("   Goodbye 👋\n");
    process.exit(0);
  });

  // Force exit after 10 seconds if something hangs
  setTimeout(() => {
    console.error("   Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

// Unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("[UnhandledRejection]", reason);
});

startServer();