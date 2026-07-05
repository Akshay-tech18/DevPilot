// const express = require("express");
// const passport = require("passport");
// const {oauthCallback, refresh, logout, me} = require("./auth.controller");
// const {protect} = require("../../middleware/auth.middleware");

// const router = express.Router();

// router.get("/google", 
//     passport.authenticate("google", {scope: ["profile","email"], session:false})
// );

// router.get("/google/callback",
//     passport.authenticate("google", {session: false, failureRedirect : "/api/auth/failed"}),oauthCallback
// );

// router.get("/github", passport.authenticate("github", {scope: ["user:email", "repo"], session:false}));

// router.get("/github/callback", passport.authenticate("github", {session: false, failureRedirect: "/api/auth/failed"}), oauthCallback);

// router.post("/refresh", refresh);

// router.post("/logout", protect, logout);

// router.get("/me", protect, me);

// router.get("/failed", (req, res) => {
//     res.status(401).json({success: false, message: "OAuth authentication failed. "});
// });

// module.exports = router;

// src/modules/auth/auth.routes.js

const express  = require("express");
const passport = require("passport");
const { oauthCallback, refresh, logout, me } = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();


// Step 1 — redirect user to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2 — Google redirects here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/failed" }),
  oauthCallback
);


router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email", "repo"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/api/auth/failed" }),
  oauthCallback
);

// Refresh access token using refresh cookie
router.post("/refresh", refresh);

// Logout — clears both cookies
router.post("/logout", protect, logout);

// Return current user
router.get("/me", protect, me);

// OAuth failure fallback
router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "OAuth authentication failed." });
});

module.exports = router;