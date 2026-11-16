import mongoose from "mongoose";
const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  codeDigest: { type: String, required: true },
  attempts: { type: Number, default: 0, min: 0, max: 5 },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true });
export default mongoose.models.PasswordReset || mongoose.model("PasswordReset", schema);
