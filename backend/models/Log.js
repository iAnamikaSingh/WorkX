import mongoose from "mongoose";
const schema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topics: [{
    topicName: { type: String, required: true, trim: true, maxlength: 120 },
    subtopics: [{ type: String, trim: true }],
    time: { hour: { type: Number, min: 0, max: 24, default: 0 }, minute: { type: Number, min: 0, max: 59, default: 0 } }
  }]
});
export default mongoose.models.Learning_log || mongoose.model("Learning_log", schema);