import express, {Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcryptjs";
import path from "path";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import { initPassport } from "./config/passport";
import { isAuthenticated } from "./middleware/auth";
import { isGuest } from "./middleware/guest";
import cookieParser from "cookie-parser";
import { jwtCreateToken } from "./utils/jwt-create-token";
import { connectDB } from "./config/db";
import userRoutes from './routes/user-routes';
import { createUser, getUser } from "./services/user-service";
import urlRoutes from './routes/url-routes';
import { UrlHistory } from "./models/url-history-model";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { limitBy, rateLimiterMiddleware, signUpLimiter } from "./middleware/rate-limit";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
connectDB();
const app = express();
app.use(rateLimiterMiddleware);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

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
  res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
  next();
});

initPassport();

/* ROUTES */
app.use('/user', userRoutes);

app.get("/", isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
  // res.render("home", { ...viewData, user: req.user });
});

app.get("/login", isGuest, (req, res) => {
  res.render("login", {...viewData, title: 'Login'});
});

app.get("/register", isGuest, (req, res) => {
  res.render("register", {...viewData, title: 'Register'});
});

app.get("/dashboard", isAuthenticated, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user!._id;
   const urls = await UrlHistory.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  res.render("dashboard", {
    ...viewData,
    title: "Dashboard",
    urls,
    shortUrl: req.query.shortUrl || null,
    user: req.user,
    baseUrl: res.locals.baseUrl
  });
});

// REGISTER
app.post("/register", limitBy(signUpLimiter) ,async (req, res) => {
  const { email, password } = req.body;

  if (await getUser(email)) {
    return res.redirect('/login');
  }

  const hashed = await bcrypt.hash(password, 10);

  // TempDb.users.push(userData);
  const user = await createUser({email, password: hashed});
  const token = jwtCreateToken(user._id.toString());
  res.cookie('token', token, {httpOnly: true});
  res.redirect("/");
});

// LOCAL LOGIN
app.post(
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

// GOOGLE LOGIN
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
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

// LOGOUT
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.use('/', urlRoutes);


app.listen(3000, () => console.log("Server running on http://localhost:3000"));
