import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

import passport from "passport";
import LocalStrategy from "passport-local";

import engine from "ejs-mate";

import User from "./models/user.js";

import logRoutes from "./routes/logs.js";
import userRoutes from "./routes/users.js";
import otpRoutes from "./routes/otp.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine
app.set("view engine", "ejs");

app.engine("ejs", engine);

app.set("views", [
  path.join(__dirname, "views/pages"),
  path.join(__dirname, "views/layouts"),
  path.join(__dirname, "views/includes"),
]);

// Middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.use(methodOverride("_method"));

app.use(cookieParser("secretcode"));

// Session Configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET,

  resave: false,

  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,

    httpOnly: true,
  },
};

app.use(session(sessionOptions));

// Passport Configuration
app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// Flash-like Session Messages
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  res.locals.currentUser = req.user;

  delete req.session.success;
  delete req.session.error;

  next();
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.error = "Please log in to continue.";
  return res.redirect("/login");
};

app.use(["/logs", "/log"], isLoggedIn);

// Routes
app.use("/", logRoutes);
app.use("/", userRoutes);
app.use("/", otpRoutes);

app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/css/styles.css"));
});

app.get("/auth.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/css/auth.css"));
});

// Home Page
app.get("/", (req, res) => {
  res.render("home.ejs", { title: "Home" });
});

// Database + Server
async function main() {
  try{
    app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
  await mongoose.connect(process.env.MONGO_URL);
  console.log("DB connected");
  } catch(err){
    console.log(err);
  }
  
}
main();
