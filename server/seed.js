import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Candidate = mongoose.model(
  "Candidate",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, unique: true },
      phone: String,
      position: { type: String, required: true },
      skills: [String],
      notes: String,
      stage: { type: String, default: "Sourced" },
    },
    { timestamps: true }
  )
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  })
);

const sampleCandidates = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    position: "Senior Fullstack Engineer",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    notes: "Strong system design background. Built real-time analytics engine at previous startup.",
    stage: "Interview",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98220 12345",
    position: "Frontend Developer",
    skills: ["React", "Next.js", "CSS", "Tailwind"],
    notes: "Portfolio has stunning micro-interactions. Excellent cultural fit.",
    stage: "Offer",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+91 97110 56789",
    position: "Backend Engineer",
    skills: ["Go", "Kubernetes", "MongoDB", "gRPC"],
    notes: "Accepted offer letter! Starting next Monday.",
    stage: "Joined",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 99001 98765",
    position: "Product Manager",
    skills: ["Roadmapping", "Agile", "User Research", "SQL"],
    notes: "Initial phone screen cleared. Moving to panel interview.",
    stage: "Screening",
  },
  {
    name: "Devendra Kulkarni",
    email: "devendra.k@example.com",
    phone: "+91 98450 33445",
    position: "Senior Fullstack Engineer",
    skills: ["MERN", "Docker", "AWS", "GraphQL"],
    notes: "Shortlisted from referral. High match on mandate skills.",
    stage: "Shortlisted",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 97401 22334",
    position: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Prototyping"],
    notes: "Sourced via LinkedIn recruiter search.",
    stage: "Sourced",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 98111 67890",
    position: "DevOps Engineer",
    skills: ["Terraform", "CI/CD", "AWS", "Linux"],
    notes: "Looking for remote-only roles; our mandate is hybrid.",
    stage: "Rejected",
  },
  {
    name: "Kavya Nair",
    email: "kavya.nair@example.com",
    phone: "+91 98330 45678",
    position: "Backend Engineer",
    skills: ["Node.js", "Express", "MongoDB", "Redis"],
    notes: "Submitted take-home coding challenge. High code quality.",
    stage: "Interview",
  },
];

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ats";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);

  // Clear existing
  await Candidate.deleteMany({});
  await User.deleteMany({});

  // Seed demo recruiter
  const hashedPassword = await bcrypt.hash("password123", 10);
  await User.create({
    email: "recruiter@earlyjobs.ai",
    password: hashedPassword,
  });

  // Seed candidates
  await Candidate.insertMany(sampleCandidates);

  console.log(` Seeded 1 recruiter user:`);
  console.log(`   Email: recruiter@earlyjobs.ai`);
  console.log(`   Password: password123`);
  console.log(` Seeded ${sampleCandidates.length} candidate profiles across stages.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
