import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });
schema.plugin(passportLocalMongoose.default || passportLocalMongoose);
export default mongoose.models.User || mongoose.model("User", schema);