import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT || 8000);
const required = ["MONGO_URL", "SESSION_SECRET", "BREVO_API_KEY", "BREVO_SENDER_EMAIL", "CLIENT_URL", "OTP_SECRET"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);

await mongoose.connect(process.env.MONGO_URL);
console.log("WorkX database connected");
app.listen(port, "0.0.0.0", () => console.log(`WorkX API listening on ${port}`));