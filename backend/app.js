import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "node:crypto";
import { BrevoClient } from "@getbrevo/brevo";
import User from "./models/User.js";
import Log from "./models/Log.js";
import Otp from "./models/Otp.js";

const app = express();
const production = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map(v => v.trim()).filter(Boolean);
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin(origin, cb) { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); cb(new Error("Origin not allowed")); }, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && (!req.headers.origin || !allowedOrigins.includes(req.headers.origin))) return res.status(403).json({ message: "Request origin not allowed." });
  next();
});
app.use(session({
  name: "workx.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL, collectionName: "sessions", ttl: 60 * 60 * 24 * 7 }),
  cookie: { httpOnly: true, secure: production, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many attempts. Please try again later." } });
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many OTP requests. Try again later." } });
const requireAuth = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).json({ message: "Please sign in to continue." });
const cleanTopics = (topics) => (Array.isArray(topics) ? topics : []).filter(t => typeof t?.topicName === "string" && t.topicName.trim()).map(t => ({
  topicName: t.topicName.trim().slice(0, 120),
  subtopics: (Array.isArray(t.subtopics) ? t.subtopics : []).filter(s => typeof s === "string" && s.trim()).map(s => s.trim().slice(0, 160)),
  time: { hour: Math.min(24, Math.max(0, Number(t.time?.hour) || 0)), minute: Math.min(59, Math.max(0, Number(t.time?.minute) || 0)) }
}));
const publicUser = user => ({ id: user._id, username: user.username, email: user.email });
const establishLoginSession = (req, res, user, status = 200, next) => {
  req.login(user, loginErr => {
    if (loginErr) return next(loginErr);
    // Persist the regenerated Passport session before returning success to the browser.
    req.session.save(saveErr => {
      if (saveErr) return next(saveErr);
      res.status(status).set("Cache-Control", "no-store").json({ user: publicUser(user) });
    });
  });
};
const otpDigest = (email, otp) => crypto.createHmac("sha256", process.env.OTP_SECRET || process.env.SESSION_SECRET).update(email + ":" + otp).digest("hex");

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "WorkX API" }));
app.get("/api/auth/me", (req, res) => { res.set("Cache-Control", "no-store"); res.json({ user: req.user ? publicUser(req.user) : null }); });

app.get("/api/auth/check-username", async (req, res, next) => {
  try {
    const username = String(req.query.username || "").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return res.json({ available: false, message: "Use 3–20 letters, numbers or underscores." });
    res.json({ available: !(await User.exists({ username })) });
  } catch (e) { next(e); }
});

app.post("/api/auth/send-otp", otpLimit, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (await User.exists({ email })) return res.status(409).json({ message: "An account already uses this email." });
    const otp = crypto.randomInt(100000, 1000000).toString();
    await Otp.findOneAndUpdate({ email }, { otp: otpDigest(email, otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, { upsert: true, new: true, setDefaultsOnInsert: true });
    try {
      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "WorkX" }, to: [{ email }],
        subject: "Your WorkX verification code",
        htmlContent: `<div style="background:#07110d;color:#f4fff8;padding:32px;font-family:Arial"><h1 style="color:#00e58b">WorkX</h1><p>Your email verification code is:</p><div style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#00e58b">${otp}</div><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`
      });
    } catch (e) { await Otp.deleteOne({ email }); throw e; }
    res.json({ success: true, message: "Verification code sent. It expires in 10 minutes." });
  } catch (e) { next(e); }
});

app.post("/api/auth/verify-otp", authLimit, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    const record = await Otp.findOneAndUpdate(
      { email, expiresAt: { $gt: new Date() }, $or: [{ attempts: { $lt: 5 } }, { attempts: { $exists: false } }] },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!record) return res.status(400).json({ message: "Code expired or too many incorrect attempts. Request a new one." });
    const expected = otpDigest(email, otp);
    const actual = record.otp;
    const valid = actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
    if (!valid) return res.status(400).json({ message: "That verification code is incorrect." });
    req.session.verifiedEmail = email;
    await Otp.deleteOne({ _id: record._id });
    res.json({ success: true, message: "Email verified successfully." });
  } catch (e) { next(e); }
});

app.post("/api/auth/signup", authLimit, async (req, res, next) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return res.status(400).json({ message: "Username must be 3–20 letters, numbers or underscores." });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (req.session.verifiedEmail !== email) return res.status(403).json({ message: "Verify your email before creating an account." });
    const user = await User.register(new User({ username, email }), password);
    delete req.session.verifiedEmail;
    establishLoginSession(req, res, user, 201, next);
  } catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Username or email is already registered." }); next(e); }
});

app.post("/api/auth/login", authLimit, (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Invalid username or password." });
    establishLoginSession(req, res, user, 200, next);
  })(req, res, next);
});
app.post("/api/auth/logout", requireAuth, (req, res, next) => req.logout(err => {
  if (err) return next(err);
  req.session.destroy(destroyErr => { if (destroyErr) return next(destroyErr); res.clearCookie("workx.sid", { httpOnly: true, secure: production, sameSite: "lax" }); res.json({ success: true }); });
}));

app.get("/api/logs", requireAuth, async (req, res, next) => {
  try { const logs = await Log.find({ owner: req.user._id }).sort({ date: -1 }).lean(); res.json({ logs }); } catch (e) { next(e); }
});
app.post("/api/logs", requireAuth, async (req, res, next) => {
  try {
    const topics = cleanTopics(req.body.topics);
    if (!topics.length) return res.status(400).json({ message: "Add at least one topic." });
    const log = await Log.create({ owner: req.user._id, date: req.body.date ? new Date(req.body.date) : new Date(), topics });
    res.status(201).json({ log });
  } catch (e) { next(e); }
});
app.patch("/api/logs/:id", requireAuth, async (req, res, next) => {
  try {
    const topics = cleanTopics(req.body.topics);
    if (!topics.length) return res.status(400).json({ message: "Add at least one topic." });
    const update = { topics };
    if (req.body.date) update.date = new Date(req.body.date);
    const log = await Log.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, update, { new: true, runValidators: true });
    if (!log) return res.status(404).json({ message: "Log not found." });
    res.json({ log });
  } catch (e) { next(e); }
});
app.delete("/api/logs/:id", requireAuth, async (req, res, next) => {
  try { const log = await Log.findOneAndDelete({ _id: req.params.id, owner: req.user._id }); if (!log) return res.status(404).json({ message: "Log not found." }); res.json({ success: true }); } catch (e) { next(e); }
});
app.delete("/api/logs/:id/topics/:topicIndex", requireAuth, async (req, res, next) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, owner: req.user._id });
    const i = Number(req.params.topicIndex);
    if (!log || !Number.isInteger(i) || i < 0 || i >= log.topics.length) return res.status(404).json({ message: "Topic not found." });
    log.topics.splice(i, 1); if (!log.topics.length) return res.status(400).json({ message: "A log must contain at least one topic. Delete the log instead." });
    await log.save(); res.json({ log });
  } catch (e) { next(e); }
});
app.delete("/api/logs/:id/topics/:topicIndex/subtopics/:subIndex", requireAuth, async (req, res, next) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, owner: req.user._id });
    const i = Number(req.params.topicIndex), j = Number(req.params.subIndex);
    if (!log || !Number.isInteger(i) || !Number.isInteger(j) || !log.topics[i]?.subtopics[j]) return res.status(404).json({ message: "Subtopic not found." });
    log.topics[i].subtopics.splice(j, 1); await log.save(); res.json({ log });
  } catch (e) { next(e); }
});

app.use((req, res) => res.status(404).json({ message: "API endpoint not found." }));
app.use((err, req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : "Something went wrong. Please try again." });
});
export default app;