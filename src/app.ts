import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcryptjs";
import path from "path";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import { initPassport } from "./config/passport";
import { isAuthenticated } from "./middleware/auth";
import { isGuest } from "./middleware/guest";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const viewData = {user: null, title: 'Home'};

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req: any, res, next) => {
  res.locals.user = req.user;
  next();
});

initPassport();

// TEMP DB
const users: any[] = [];

/* ROUTES */
app.get("/", isAuthenticated, (req, res) => {
  res.render("home", { ...viewData, user: req.user });
});

app.get("/login", isGuest, (req, res) => {
  res.render("login", {...viewData, title: 'Login'});
});

app.get("/register", isGuest, (req, res) => {
  res.render("register", {...viewData, title: 'Register'});
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", {...viewData, title: 'Dashboard'});
});

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    email,
    password: hashed,
  });

  res.redirect("/login");
});

// LOCAL LOGIN
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { email: req.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect("/dashboard");
  }
);

// GOOGLE LOGIN
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
     const token = jwt.sign(
      { email: req.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect("/dashboard");
  }
);

// LOGOUT
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
