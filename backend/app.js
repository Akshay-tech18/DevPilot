//express setup, middleware, route mounting
// backend/app.js — Express app setup (middleware + route mounting)

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const prisma     = require("./src/config/db");
const passport = require("./src/config/passport");
const cookieParser = require("cookie-parser");
const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true, // needed for httpOnly cookies (JWT)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// RATE LIMITING

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: "Too many requests. Please try again later." },
});

app.use("/api", limiter);

// BODY PARSING


// Raw body needed BEFORE json() for webhook signature verification
// app.use(
//   "/api/webhooks",
//   express.raw({ type: "application/json" })
// );

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// HEALTH / DB CHECK ROUTES

//GET /health
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status:  "ok",
    service: "DevPilot API",
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});


//GET /health/db
//Deep health check — confirms PostgreSQL (Neon) connection is alive.
app.get("/health/db", async (req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    res.status(200).json({
      success:  true,
      status:   "ok",
      database: "connected",
      provider: "Neon PostgreSQL",
      latencyMs: latency,
      time:     new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DB Health] Connection failed:", error.message);

    res.status(503).json({
      success:  false,
      status:   "degraded",
      database: "disconnected",
      error:    error.message,
      time:     new Date().toISOString(),
    });
  }
});


//GET /health/full
//Full check: server + DB + lists all Prisma models to verify schema sync.

app.get("/health/full", async (req, res) => {
  const checks = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (e) {
    checks.database = { status: "error", message: e.message };
  }

  try {
    const [users, projects, tasks] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
    ]);
    checks.seeded = { users, projects, tasks };
  } catch (e) {
    checks.seeded = { status: "error", message: e.message };
  }

  const allOk = Object.values(checks).every((c) => c.status !== "error");

  res.status(allOk ? 200 : 503).json({
    success: allOk,
    service: "DevPilot API",
    checks,
    time:    new Date().toISOString(),
  });
});

app.use(cookieParser());
app.use(passport.initialize());
// API ROUTES  (mount feature modules here as you build them)

app.use("/api/auth",     require("./src/modules/auth/auth.routes"));
// app.use("/api/projects", require("./src/modules/projects/project.routes"));
// app.use("/api/tasks",    require("./src/modules/tasks/task.routes"));
// app.use("/api/webhooks", require("./src/modules/github/github.routes"));
// app.use("/api/messages", require("./src/modules/communication/message.routes"));
// app.use("/api/analytics",require("./src/modules/analytics/analytics.routes"));
// app.use("/api/ml",       require("./src/modules/ml/ml.routes"));

// 404 HANDLER

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route ${req.method} ${req.path} not found`,
  });
});

// GLOBAL ERROR HANDLER

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Global Error]", err.stack || err.message);

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error:   "A record with that value already exists.",
      field:   err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error:   "Record not found.",
    });
  }

  // CORS error
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:   process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;