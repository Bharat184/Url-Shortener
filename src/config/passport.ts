import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";

interface User {
  id: number;
  email?: string;
  password?: string;
  googleId?: string;
}

const users: User[] = []; // TEMP DB

export function initPassport() {
  // LOCAL STRATEGY
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      (email, password, done) => {
        const user = users.find((u) => u.email === email);
        if (!user) return done(null, false);

        if (!user.password) return done(null, false);

        bcrypt.compare(password, user.password, (err, match) => {
          if (match) return done(null, user);
          return done(null, false);
        });
      }
    )
  );

  // GOOGLE STRATEGY
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        let user = users.find((u) => u.googleId === profile.id);

        if (!user) {
          user = {
            id: Date.now(),
            googleId: profile.id,
            email: profile.emails?.[0].value,
          };
          users.push(user);
        }

        return done(null, user);
      }
    )
  );

  // SESSION HANDLING
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user || false);
  });
}
