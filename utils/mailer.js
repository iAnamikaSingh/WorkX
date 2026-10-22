import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
  throw new Error(
    "BREVO_API_KEY is required for email sending.",
  );
}

const apiInstance = new BrevoClient({ apiKey });

export default apiInstance;
