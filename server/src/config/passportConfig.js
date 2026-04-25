import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.js";

// ✅ Serialize / Deserialize
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ✅ Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/user/auth/google/callback",
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email =
                        profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : null;
                    const profilePhoto =
                        profile.photos && profile.photos[0]
                            ? profile.photos[0].value
                            : "";

                    // Check if user already exists by email
                    let user = await User.findOne({ email });

                    if (user) {
                        // Link account: update existing user with Google data
                        user.profilePhoto = user.profilePhoto || profilePhoto;
                        user.authProvider =
                            user.authProvider === "local" ? "google" : user.authProvider;
                        user.providerId = user.providerId || profile.id;
                        await user.save();
                    } else {
                        // Create new user
                        user = await User.create({
                            name: profile.displayName,
                            email,
                            profilePhoto,
                            authProvider: "google",
                            providerId: profile.id,
                        });
                    }

                    done(null, user);
                } catch (err) {
                    console.error("Google OAuth error:", err);
                    done(err, null);
                }
            }
        )
    );
}

// ✅ GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: "/api/user/auth/github/callback",
                scope: ["user:email", "repo"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email =
                        profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : `${profile.username}@github.noemail`;
                    const profilePhoto =
                        profile.photos && profile.photos[0]
                            ? profile.photos[0].value
                            : "";

                    // Check if user already exists by email
                    let user = await User.findOne({ email });

                    if (user) {
                        // Link account: update existing user with GitHub data
                        user.profilePhoto = user.profilePhoto || profilePhoto;
                        user.authProvider =
                            user.authProvider === "local" ? "github" : user.authProvider;
                        user.providerId = user.providerId || profile.id;
                        user.githubUsername = profile.username;
                        user.githubAccessToken = accessToken;
                        await user.save();
                    } else {
                        // Create new user
                        user = await User.create({
                            name: profile.displayName || profile.username,
                            email,
                            profilePhoto,
                            authProvider: "github",
                            providerId: profile.id,
                            githubUsername: profile.username,
                            githubAccessToken: accessToken,
                        });
                    }

                    done(null, user);
                } catch (err) {
                    console.error("GitHub OAuth error:", err);
                    done(err, null);
                }
            }
        )
    );
}

export default passport;
