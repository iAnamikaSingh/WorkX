import mongoose from "mongoose";

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  goals: { type: [mongoose.Schema.Types.Mixed], default: [] },
  tasks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  notes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  bookmarks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  flashcards: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

export default mongoose.models.WorkspaceData || mongoose.model("WorkspaceData", schema);
