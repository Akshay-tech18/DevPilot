// src/config/passport.js

const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const prisma = require("./db");


passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email address"), null);
        }

        // // Upsert — find by googleId, fall back to email, create if new
        // const user = await prisma.user.upsert({
        //   where:  { googleId: profile.id },
        //   update: { name: profile.displayName, avatar },
        //   create: {
        //     name:     profile.displayName,
        //     email,
        //     avatar,
        //     googleId: profile.id,
        //     role:     "DEVELOPER",
        //   },
        // });

        // return done(null, user);
        let user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (user) {
          // Existing account → link Google to it (or update profile)
          user = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              googleId: profile.id,
              name: profile.displayName,
              avatar,
            },
          });
        } else {
          // First login → create new account
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              avatar,
              googleId: profile.id,
              role: "DEVELOPER",
            },
          });
        }

        return done(null, user);
      } catch (err) {
        // Handle case where email already exists under a different provider
        if (err.code === "P2002") {
          return done(
            new Error("An account with this email already exists. Please log in with your original provider."),
            null
          );
        }
        return done(err, null);
      }
    }
  )
);


passport.use(
  new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
      scope:        ["user:email", "repo", "read:org"],
    },
    async (accessToken, _refreshToken, profile, done) => {
      try {
        // GitHub may not expose email publicly — check emails array
        const email =
          profile.emails?.find((e) => e.primary && e.verified)?.value ||
          profile.emails?.[0]?.value ||
          `${profile.username}@github.noemail`;

        const avatar = profile.photos?.[0]?.value;

        // const user = await prisma.user.upsert({
        //   where:  { githubId: profile.id.toString() },
        //   update: {
        //     name:        profile.displayName || profile.username,
        //     avatar,
        //     githubToken: accessToken, // store for Octokit calls
        //   },
        //   create: {
        //     name:        profile.displayName || profile.username,
        //     email,
        //     avatar,
        //     githubId:    profile.id.toString(),
        //     githubToken: accessToken,
        //     role:        "DEVELOPER",
        //   },
        // });

        // return done(null, user);

        // 1. Try to find an existing GitHub account
      let user = await prisma.user.findUnique({
        where: {
          githubId: profile.id.toString(),
        },
      });

      if (user) {
        // Existing GitHub user → update profile and token
        user = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name: profile.displayName || profile.username,
            avatar,
            githubToken: accessToken,
          },
        });
      } else {
        // 2. No GitHub account found → check if this email already exists
        user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (user) {
          // Existing account (probably created via Google) → link GitHub
          user = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              githubId: profile.id.toString(),
              githubToken: accessToken,
              name: profile.displayName || profile.username,
              avatar,
            },
          });
        } else {
          // 3. Brand new user
          user = await prisma.user.create({
            data: {
              name: profile.displayName || profile.username,
              email,
              avatar,
              githubId: profile.id.toString(),
              githubToken: accessToken,
              role: "DEVELOPER",
            },
          });
        }
      }

      return done(null, user);
      } catch (err) {
        if (err.code === "P2002") {
          return done(
            new Error("An account with this email already exists. Please log in with your original provider."),
            null
          );
        }
        return done(err, null);
      }
    }
  )
);

// We use JWT — no session serialization needed.
// passport.serializeUser / deserializeUser intentionally omitted.

module.exports = passport;