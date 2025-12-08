import express, {Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import path, { dirname } from "path";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import { initPassport } from "./config/passport.js";
import { isAuthenticated } from "./middleware/auth.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import urlRoutes from './routes/url-routes.js';
import { UrlHistory } from "./models/url-history-model.js";
import { fileURLToPath } from "url";
import {  rateLimiterMiddleware } from "./middleware/rate-limit.js";
import authRoutes from './routes/auth-routes.js';
import flash from "express-flash";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
connectDB();
const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// skip this for redirection endpoint or find another way to rate limit.
app.use(rateLimiterMiddleware);

const viewData = {user: null, title: 'Home'};

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use((req: any, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
  next();
});

initPassport();

/* ROUTES */
app.get("/", isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

app.get("/dashboard", isAuthenticated, async (req: Request, res: Response) => {
  const userId = req.user._id;
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


app.use('/', authRoutes);
app.use('/', urlRoutes);


app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.BASE_URL}`));
