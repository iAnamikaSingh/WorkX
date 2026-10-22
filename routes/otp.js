import express from "express";
import crypto from "crypto";
import Otp from "../models/otp.js";
import User from "../models/user.js";
import brevoApi from "../utils/mailer.js";

const router = express.Router();
const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim().toLowerCase();

if (!senderEmail) {
  throw new Error("BREVO_SENDER_EMAIL must be set to a verified Brevo sender.");
}

// ======================
// Send OTP
// ======================
router.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body || {};

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    //Check whether user with the same email exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
          success: false,
          message: "A user with this email already exists."
      });
  }
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Delete previous OTP (if any)
    await Otp.deleteOne({ email: normalizedEmail });

    // Save new OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
    });

    // Send email
    try {
      const delivery = await brevoApi.transactionalEmails.sendTransacEmail({
        sender: { email: senderEmail, name: "WorkX" },
        to: [{ email: normalizedEmail }],
        subject: "Verify Your Email - WorkX",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <div style="background:#3bb8ce; color:white; text-align:center; padding:16px;">
              <h1 style="margin:0;">WorkX</h1>
            </div>

            <div style="padding:20px; color:#333; line-height:1.6;">
              <h2>Hello,</h2>

              <p>
                Here is your One-Time Password (OTP) for email verification on
                <strong>WorkX</strong>.
              </p>

              <div style="text-align:center; margin:20px 0;">
                <div style="
                  display:inline-block;
                  padding:8px 18px;
                  border:2px dashed #3bb8ce;
                  border-radius:5px;
                  font-size:24px;
                  letter-spacing:4px;
                  color:#3bb8ce;
                  background:#f0f8ff;">
                  ${otp}
                </div>
              </div>

              <p>This OTP is valid for <strong>10 minutes</strong>.</p>

              <p>
                If you did not request this verification, you can safely ignore
                this email.
              </p>

              <p style="margin-top:30px;">
                Best regards,<br>
                <strong>Team WorkX</strong>
              </p>

              <hr>

              <p style="font-size:13px; color:#777;">
                This is an automated email. Please do not reply.
              </p>
            </div>

          </div>
        </div>
      `,
      });

      console.info("Brevo accepted an OTP email for delivery:", {
        messageId: delivery.messageId,
      });
    } catch (err) {
      console.error("Brevo OTP delivery failed:", err);
      await Otp.deleteOne({ email: normalizedEmail, otp });
      return res.status(502).json({
        success: false,
        message: "The email could not be sent. Please try again shortly.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message has been sent. Valid for 10 min",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================
// Verify OTP
// ======================
router.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    // Find OTP document
    const otpDoc = await Otp.findOne({ email: normalizedEmail });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired.",
      });
    }

    // Check expiry
    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ email: normalizedEmail });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // Compare OTP
    if (otpDoc.otp !== String(normalizedOtp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Store verification in session
    req.session.verifiedEmail = normalizedEmail;

    // Delete OTP after successful verification
    await Otp.deleteOne({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;