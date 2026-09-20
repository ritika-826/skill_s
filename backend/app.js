const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const resultRoutes = require("./routes/resultRoutes");
const materialRoutes = require("./routes/materialRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Skill Specific Backend is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/admin", adminRoutes);

const questionRoutes = require("./routes/questionRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");

app.use("/api/questions", questionRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin/recruiter", recruiterRoutes);

// Error middleware
app.use(errorMiddleware);

module.exports = app;