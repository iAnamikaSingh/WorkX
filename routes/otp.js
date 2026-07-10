import express from "express";
import crypto from "crypto";
import Otp from "../models/otp.js";
import transporter from "../utils/mailer.js";
const router = express.Router();

//API to send otp
router.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    // generate 6-digit otp
    const otp = crypto.randomInt(100000, 1000000);

    // delete the previous otp for the same email
    await Otp.deleteOne({ email: normalizedEmail });

    //save otp
    await Otp.create({
      email: normalizedEmail,
      otp: otp.toString(),
    });

    //send otp to email
    await transporter.sendMail({
      from: '"WorkX" <workx.noreply@gmail.com>',
      to: normalizedEmail,
      subject: "Verify Your Email - WorkX",
      html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
              <!-- Header -->
              <div style="background: #4F46E5; color: white; text-align: center; padding: 20px;">
                <h1 style="margin: 0;">WorkX</h1>
              </div>
      
              <!-- Body -->
              <div style="padding: 30px; color: #333;">
                <h2>Hello 👋</h2>
      
                <p>
                  Thank you for registering with <strong>WorkX</strong>.
                  Please use the following One-Time Password (OTP) to verify your email address.
                </p>
      
                <div style="
                  margin: 30px auto;
                  width: fit-content;
                  background: #F3F4F6;
                  border: 2px dashed #4F46E5;
                  padding: 15px 30px;
                  border-radius: 8px;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #4F46E5;
                ">
                  ${otp}
                </div>
      
                <p>
                  This OTP is valid for <strong>5 minutes</strong>.
                </p>
      
                <p>
                  If you did not request this email, you can safely ignore it.
                </p>
      
                <hr style="margin: 30px 0;">
      
                <p style="font-size: 13px; color: #777;">
                  This is an automated email. Please do not reply.
                </p>
              </div>
      
            </div>
          </div>
        `,
    });
    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// verify otp
router.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    // check otp
    const otpDoc = await Otp.findOne({ email: normalizedEmail });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }
    //  Check expiry
    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ email: normalizedEmail });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }
    // compare OTP

    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    req.session.verifiedEmail = normalizedEmail;
    // remove otp
    await Otp.deleteOne({ email: normalizedEmail });
    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Invalid OTP",
    });
  }
});
export default router;
