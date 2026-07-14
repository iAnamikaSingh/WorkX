import express from "express";
import crypto from "crypto";
import Otp from "../models/otp.js";
import transporter from "../utils/mailer.js";
const router = express.Router();

//API to send otp
router.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body || {};
    
    if (!email || typeof normalizedEmail !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid email is required",
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
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="width:100%;  max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
              <!-- Header -->
              <div style="background:rgb(59, 184, 206); color: white; text-align: center; padding: 16px;">
                <h1 style="margin: 0;">WorkX</h1>
              </div>
      
              <!-- Body -->
              <div style="padding: 20px; line-height:1.6; color: #333; word-break: break-word;">
                <h2 style="margin-top: 0">Hello,</h2>
      
                <p>
                  Here is your One-Time Password (OTP) for email verification on <strong>WorkX</strong>.
                </p>
                
                <div style="text-align:center;">
                  <div style="
                  border: 2px dashed rgb(59, 184, 206);
                  border-radius:4px;
                  padding:6px 16px;
                  font-size:24px;
                  color:rgb(59, 184, 206);
                  display:inline-block;
                  letter-spacing:4px;
                  background-color:rgb(240, 248, 255);
                  ">
                  ${otp}
                </div>
                </div>
                
                <p>
                  This OTP will be valid for next <strong>10 minutes</strong>.
                </P>
                <p>
                  If you did not request this verification, you can safely ignore this email.
                </p>
      
                <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Team WorkX</strong>
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
      message: "OTP sent to email (Valid for 10 min)",
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
