import { Router } from "express";
import bcrypt from "bcryptjs";
import { isGuest } from "../middleware/guest.js";
import { jwtCreateToken } from "../utils/jwt-create-token.js";
import { createUser, getUser } from "../services/user-service.js";
import passport from "passport";
import { limitBy, signUpLimiter } from "../middleware/rate-limit.js";
import { body } from "express-validator";
import { loginValidation, validate, verifyValidation } from "../middleware/validate.js";
import { User } from "../models/user-model.js";

const router = Router();
const viewData = {user: null, title: 'Home'};

//USE isGuest in app.ts
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
  return res.redirect('/verify/' + user._id);
  // const token = jwtCreateToken(user._id.toString());
  // res.cookie('token', token, {httpOnly: true});
  // res.redirect("/");
});

router.post(
  "/login",
  loginValidation,
  validate,
  (req, res, next) => {
      passport.authenticate("local", (err: string | null, user) => {
      if (err) {
        req.flash("error", err);
        return res.redirect('/login');
      }

      const token = jwtCreateToken(user._id.toString());

      res.cookie("token", token, { httpOnly: true });
      res.redirect("/dashboard");
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
      req.flash("error", "Invalid credentials");
      return res.redirect('/login');
    }

    const token = jwtCreateToken(user._id.toString());

    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/");
  })(req, res, next);
}
);

router.get('/verify/:id', isGuest, (req, res) => {
  const userId = req.params.id;
  res.render("verify", {...viewData, title: 'Verify Email', userId});
});

router.post('/verify', isGuest, verifyValidation, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) {
    req.flash('error', 'Invalid Request. Try again!');
    return res.redirect('/login');
  }
  user.isVerified = true;
  user.save().catch(console.error);
  const token = jwtCreateToken(user._id.toString());
  res.cookie('token', token, {httpOnly: true});
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

export default router;
