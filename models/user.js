import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema(
  
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters."],
      maxlength: [20, "Username cannot exceed 20 characters."]
  },
    email: {
      type: String,
      required: true,
      unique:true,
      lowercase:true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose.default);

const User = mongoose.model("User", userSchema);
export default User;
