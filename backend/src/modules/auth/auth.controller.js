// src/modules/auth/auth.controller.js

const {
  setAuthCookies,
  clearAuthCookies,
  refreshAccessToken,
  sanitizeUser,
} = require("./auth.service");
const { ok, unauthorized, serverError } = require("../../utils/response.utils");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ---------------------------------------------------------------------------
// OAUTH CALLBACKS
// Both Google and GitHub strategies attach req.user after passport.authenticate
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/google/callback
 * GET /api/auth/github/callback
 * Called by passport after successful OAuth — issues tokens and redirects.
 */
function oauthCallback(req, res) {
  try {
    setAuthCookies(res, req.user);
    // Redirect to frontend dashboard after login
    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("[Auth] OAuth callback error:", err);
    res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
  }
}

/**
 * POST /api/auth/refresh
 * Reads refresh token from cookie, issues new access token.
 */
async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return unauthorized(res, "No refresh token provided.");
    }

    const { accessToken, refreshToken } = await refreshAccessToken(token);

    const { ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } = require("../../utils/jwt.utils");
    res.cookie("accessToken",  accessToken,  ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return ok(res, { accessToken }, "Token refreshed");
  } catch (err) {
    return unauthorized(res, err.message || "Invalid or expired refresh token.");
  }
}

/**
 * POST /api/auth/logout
 * Clears auth cookies.
 */
function logout(req, res) {
  clearAuthCookies(res);
  return ok(res, {}, "Logged out successfully");
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (no secrets).
 */
function me(req, res) {
  return ok(res, sanitizeUser(req.user), "Authenticated user");
}

module.exports = { oauthCallback, refresh, logout, me };