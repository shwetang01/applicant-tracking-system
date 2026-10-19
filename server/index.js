import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me"; // ponytail: set JWT_SECRET in prod

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

const app = express();
app.use(cors());
app.use(express.json());

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wrap = (fn) => (req, res) => fn(req, res).catch((e) =>
  res.status(e.code === 11000 ? 409 : e.name === "ValidationError" || e.name === "CastError" ? 400 : 500)
    .json({ error: e.code === 11000 ? "Email already exists" : e.message }));
const pick = ({ name, email, phone, position, skills, notes, stage }) =>
  ({ name, email, phone, position, skills, notes, stage });
const toSkills = (b) => (typeof b.skills === "string" ? { ...b, skills: b.skills.split(",").map((s) => s.trim()).filter(Boolean) } : b);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  })
);
const sign = (u) => ({ token: jwt.sign({ id: u._id }, SECRET, { expiresIn: "7d" }), email: u.email });

app.post("/api/auth/register", wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: "Password must be 6+ characters" });
  res.status(201).json(sign(await User.create({ email, password: await bcrypt.hash(password, 10) })));
}));

app.post("/api/auth/login", wrap(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || "").toLowerCase() });
  if (!u || !(await bcrypt.compare(String(req.body.password || ""), u.password)))
    return res.status(401).json({ error: "Invalid email or password" });
  res.json(sign(u));
}));

const auth = (req, res, next) => {
  try {
    jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
app.use(["/api/candidates", "/api/stats"], auth);

app.get("/api/candidates", wrap(async (req, res) => {
  const { q, stage } = req.query;
  const f = {};
  if (STAGES.includes(stage)) f.stage = stage;
  if (q) {
    const r = new RegExp(esc(String(q)), "i");
    f.$or = [{ name: r }, { email: r }, { position: r }, { skills: r }];
  }
  res.json(await Candidate.find(f).sort({ createdAt: -1 }));
}));

app.post("/api/candidates", wrap(async (req, res) =>
  res.status(201).json(await Candidate.create(pick(toSkills(req.body))))));

app.put("/api/candidates/:id", wrap(async (req, res) => {
  const c = await Candidate.findByIdAndUpdate(req.params.id, pick(toSkills(req.body)), { new: true, runValidators: true, omitUndefined: true });
  c ? res.json(c) : res.status(404).json({ error: "Not found" });
}));

app.delete("/api/candidates/:id", wrap(async (req, res) => {
  const c = await Candidate.findByIdAndDelete(req.params.id);
  c ? res.status(204).end() : res.status(404).json({ error: "Not found" });
}));

app.get("/api/stats", wrap(async (_req, res) => {
  const [byStage, byPosition, recent] = await Promise.all([
    Candidate.aggregate([{ $group: { _id: "$stage", n: { $sum: 1 } } }]),
    Candidate.aggregate([{ $group: { _id: "$position", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 5 }]),
    Candidate.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 864e5) } }),
  ]);
  const stages = Object.fromEntries(STAGES.map((s) => [s, 0]));
  byStage.forEach((x) => (stages[x._id] = x.n));
  const total = Object.values(stages).reduce((a, b) => a + b, 0);
  res.json({ total, stages, topPositions: byPosition.map((x) => ({ position: x._id, n: x.n })), last7Days: recent,
    joinRate: total ? Math.round((stages.Joined / total) * 100) : 0 });
}));

app.get("/api/health", (_q, r) => r.json({ ok: true }));

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ats");
app.listen(process.env.PORT || 5000, () => console.log("API up"));
