const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

/* ===========================
   MongoDB Connection
=========================== */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ===========================
   Student Schema
=========================== */
const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const Student = mongoose.model("Student", studentSchema);

/* ===========================
   Grievance Schema
=========================== */
const grievanceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: String,
    enum: ["Academic", "Hostel", "Transport", "Other"]
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending"
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }
});

const Grievance = mongoose.model("Grievance", grievanceSchema);

/* ===========================
   Auth Middleware
=========================== */
const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ===========================
   AUTH ROUTES
=========================== */

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new Student({ name, email, password: hashed });
    await user.save();

    res.json({ message: "Registered successfully" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   GRIEVANCE ROUTES
=========================== */

// Submit grievance
app.post("/api/grievances", authMiddleware, async (req, res) => {
  try {
    const grievance = new Grievance({
      ...req.body,
      studentId: req.user.id
    });

    await grievance.save();
    res.json(grievance);

  } catch {
    res.status(500).json({ message: "Error creating grievance" });
  }
});

// Get all grievances (only user's)
app.get("/api/grievances", authMiddleware, async (req, res) => {
  const data = await Grievance.find({ studentId: req.user.id });
  res.json(data);
});

// Get by ID
app.get("/api/grievances/:id", authMiddleware, async (req, res) => {
  const item = await Grievance.findById(req.params.id);
  res.json(item);
});

// Update grievance
app.put("/api/grievances/:id", authMiddleware, async (req, res) => {
  const updated = await Grievance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// Delete grievance
app.delete("/api/grievances/:id", authMiddleware, async (req, res) => {
  await Grievance.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

// Search grievance
app.get("/api/grievances/search", authMiddleware, async (req, res) => {
  const { title } = req.query;

  const result = await Grievance.find({
    title: { $regex: title, $options: "i" },
    studentId: req.user.id
  });

  res.json(result);
});

/* ===========================
   SERVER
=========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});