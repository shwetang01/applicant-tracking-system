import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

export const STAGES = ["Sourced", "Shortlisted", "Screening", "Interview", "Offer", "Joined", "Rejected"];

const Candidate = mongoose.model(
  "Candidate",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true, unique: true },
      phone: { type: String, trim: true },
      position: { type: String, required: true, trim: true },
      skills: [String],
      notes: String,
      stage: { type: String, enum: STAGES, default: "Sourced" },
    },
    { timestamps: true }
  )
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  })
);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ats");
app.listen(process.env.PORT || 5000, () => console.log("API up"));
