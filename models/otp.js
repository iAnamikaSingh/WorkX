import mongoose from "mongoose";

// Expiration after 10 min 
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + OTP_EXPIRY_MS),
    expires: 0, // delete the doc when expiresAt is reached
  },
});
const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
