const express = require("express");
const {
  getDashboardStats,
  getStudents,
  getStudentById,
  getAssessments,
  getAssessmentById,
  getAnalytics,
} = require("../controllers/recruiterController");

const authMiddleware = require("../middleware/authMiddleware");
const recruiterMiddleware = require("../middleware/recruiterMiddleware");

const router = express.Router();

// Enforce authentication and recruiter role on all recruiter endpoints
router.use(authMiddleware);
router.use(recruiterMiddleware);

// Recruiter Dashboard Overview
router.get("/dashboard", getDashboardStats);

// Candidates / Students Management
router.get("/students", getStudents);
router.get("/students/:studentId", getStudentById);

// Assessments Activity & Details
router.get("/assessments", getAssessments);
router.get("/assessments/:assessmentId", getAssessmentById);

// Advanced Recruitment Analytics
router.get("/analytics", getAnalytics);

// Aliases for modular fetch
router.get("/top-students", getDashboardStats);
router.get("/recent-activity", getDashboardStats);
router.get("/results", getAssessments);

module.exports = router;
