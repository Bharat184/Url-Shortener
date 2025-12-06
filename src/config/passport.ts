import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { createUser, getUser } from "../services/user-service.js";

export function initPassport() {

  let callbackURL = '/auth/google/callback';
  if (process.env.BASE_URL ?? null) {
    callbackURL = process.env.BASE_URL + callbackURL;
  }

  // LOCAL STRATEGY
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await getUser(email);
        if (!user) return done('User not found', null);
        if (!user?.password) return done('Sign in with google to continue...', user);
        if (!(user.isVerified ?? true)) return done('Account not verified', null);

        bcrypt.compare(password, user.password, (err, match) => {
          if (match) return done(null, user);
          return done('Invalid Password', false);
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
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0].value;
        let user = await getUser(email);

        if (!user) {
          user = await createUser({email, googleId: profile.id});
        }

        return done(null, user);
      }
    )
  );

  // SESSION HANDLING USE THIS FOR SESSION
  // passport.serializeUser((user: any, done) => {
  //   done(null, user.id);
  // });

  // passport.deserializeUser((id: number, done) => {
  //   const user = users.find((u) => u.id === id);
  //   done(null, user || false);
  // });
}
