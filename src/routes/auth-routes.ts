import { Router } from "express";
import bcrypt from "bcryptjs";
import { isGuest } from "../middleware/guest.js";
import { jwtCreateToken } from "../utils/jwt-create-token.js";
import { createUser, getUser } from "../services/user-service.js";
import passport from "passport";
import { limitBy, signUpLimiter } from "../middleware/rate-limit.js";

const router = Router();
const viewData = {user: null, title: 'Home'};


router.get("/login", isGuest, (req, res) => {
  res.render("login", {...viewData, title: 'Login'});
});

router.get("/register", isGuest, (req, res) => {
  res.render("register", {...viewData, title: 'Register'});
});

router.post("/register", limitBy(signUpLimiter) ,async (req, res) => {
  const { email, password } = req.body;

  if (await getUser(email)) {
    return res.redirect('/login');
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await createUser({email, password: hashed});
  const token = jwtCreateToken(user._id.toString());
  res.cookie('token', token, {httpOnly: true});
  res.redirect("/");
});

router.post(
  "/login",
  (req, res, next) => {
      passport.authenticate("local", (err, user) => {
      if (!user || err) {
        return res.status(401).json({ message: err ? "Sign in with google only enabled" : "Invalid credentials" });
      }

      const token = jwtCreateToken(user._id.toString());

      res.cookie("token", token, { httpOnly: true });
      res.redirect("/");
    })(req, res, next);
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwtCreateToken(user._id.toString());

    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/");
  })(req, res, next);
}
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

export default router;
