import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpLogin = process.env.BREVO_SMTP_LOGIN;
const smtpKey = process.env.BREVO_SMTP_KEY;

if (!smtpLogin || !smtpKey) {
  throw new Error(
    "BREVO_SMTP_LOGIN and BREVO_SMTP_KEY environment variables are required for email sending.",
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 45_000,
  auth: {
    user: smtpLogin,
    pass: smtpKey,
  },
});
transporter.verify((error) => {
  if (error) {
    console.error("Brevo SMTP verification failed:", error);
  } else {
    console.log("Brevo SMTP server is ready");
  }
});

export default transporter;
