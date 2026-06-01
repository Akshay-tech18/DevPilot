// google + github oauth strategies
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const prisma = require("./db");

//Google oauth 

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const avatar = profile.photos?.[0]?.value;

                if(!email){
                    return done(new Error("Google account has no email address"),null);
                }

                const user = await prisma.user.upsert({
                    where: {googleId: profile.id},
                    update: {name: profile.displayName, avatar},
                    create: {
                        name: profile.displayName,
                        email,
                        avatar,
                        googleId: profile.id,
                        role: "DEVELOPER",
                    },
                });

                return done(null, user);
            }catch (err){
                if(err.code === "P2002"){
                    return done(
                        new Error("An account with this email. already exists. please log in with your original provider. "),
                        null
                    );
                }
                return done(err, null);
            }
        }
    )
);

//GitHub oauth

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env. GITHUB_CALLBACK_URL,
            scope: ["usesr:email","repo","read:org"],
        },
        async (accessToken, _refreshToken, profile, done) => {
            try{
                const email = profile.emails?.find((e) => e.primary && e.verified)?.value ||
                profile.emails?.[0]?.value ||
                `${profile.username}@github.noemail`;

                const avatar = profile.photos?.[0]?.value;

                const user = await prisma.user.upsert({
                    where: {githubId: profile.id.toString() },
                    update: {
                        name: profile.displayName || profile.username,
                        avatar,
                        githubToken: accessToken,
                    },
                    create: {
                        name: profile.displayName || profile.username,
                        email,
                        avatar,
                        githubId: profile.id.toString(),
                        githubToken: accessToken,
                        role: "DEVELOPER",
                    },
                });
                return done(null, user);
            }catch(err){
                if(err.code === "P2002") {
                    return done(
                        new Error("An account with this email already exists. Please log in with your original provider. "),
                        null
                    );
                }
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
