import express from "express";
import WorkspaceData from "./models/WorkspaceData.js";

const router = express.Router();
const requireAuth = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).json({ message: "Please sign in to continue." });
const fields = {
  goals: ["id", "title", "targetMinutes", "completedMinutes", "period", "done", "createdAt"],
  tasks: ["id", "title", "date", "priority", "done", "createdAt"],
  notes: ["id", "title", "content", "updatedAt"],
  bookmarks: ["id", "title", "url", "category", "createdAt"],
  flashcards: ["id", "question", "answer", "known", "createdAt"]
};
const limits = { goals: 100, tasks: 200, notes: 200, bookmarks: 200, flashcards: 300 };
function cleanCollection(key, value) {
  if (!Array.isArray(value)) return null;
  return value.slice(0, limits[key]).filter(item => item && typeof item === "object" && !Array.isArray(item)).map(item => {
    const clean = {};
    for (const field of fields[key]) {
      const v = item[field];
      if (typeof v === "string") clean[field] = v.trim().slice(0, field === "content" || field === "answer" ? 10000 : 500);
      else if (typeof v === "number" && Number.isFinite(v)) clean[field] = Math.max(0, Math.min(1000000, v));
      else if (typeof v === "boolean") clean[field] = v;
    }
    return clean;
  });
}
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const data = await WorkspaceData.findOne({ owner: req.user._id }).lean();
    res.set("Cache-Control", "no-store").json({ workspace: data || { goals: [], tasks: [], notes: [], bookmarks: [], flashcards: [] } });
  } catch (e) { next(e); }
});
router.put("/", requireAuth, async (req, res, next) => {
  try {
    const update = {};
    for (const key of Object.keys(fields)) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        const clean = cleanCollection(key, req.body[key]);
        if (!clean) return res.status(400).json({ message: "Invalid workspace data." });
        update[key] = clean;
      }
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: "No workspace changes supplied." });
    const workspace = await WorkspaceData.findOneAndUpdate(
      { owner: req.user._id },
      { $set: update, $setOnInsert: { owner: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.set("Cache-Control", "no-store").json({ workspace });
  } catch (e) { next(e); }
});
export default router;
