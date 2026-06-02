const express = require("express");
const passport = require("passport");
const {oauthCallback, refresh, logout, me} = require("./auth.controller");
const {protect} = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/google", 
    passport.authenticate("google", {scope: ["profile","email"], session:false})
);

router.get("/google/callback",
    passport.authenticate("google", {session: false, failureRedirect : "/api/auth/failed"}),oauthCallback
);

router.get("/github", passport.authenticate("github", {scope: ["user:email", "repo"], session:false}));

router.get("/github/callback", passport.authenticate("github", {session: false, failureRedirect: "/api/auth/failed"}), oauthCallback);

router.post("/refresh", refresh);

router.post("/logout", protect, logout);

router.get("/me", protect, me);

router.get("/failed", (req, res) => {
    res.status(401).json({success: false, message: "OAuth authentication failed. "});
});

module.exports = router;