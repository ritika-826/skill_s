const express = require("express");

const router = express.Router();

const {
  createQuiz,
  getQuizzes,
  getQuiz,
  getRolesConfig,
  getCustomRoleConfig,
  startQuiz,
  runCode,
  submitCode,
  submitQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET ROLES AND SKILLS MAPPING
// =====================================================
router.get("/roles", getRolesConfig);

// =====================================================
// CUSTOM ROLE SUGGESTIONS
// =====================================================
router.post("/custom-role", getCustomRoleConfig);

// =====================================================
// CODE EXECUTION & EVALUATION
// =====================================================
router.post("/code/run", authMiddleware, runCode);
router.post("/run-code", authMiddleware, runCode);
router.post("/code/submit", authMiddleware, submitCode);
router.post("/submit-code", authMiddleware, submitCode);

// =====================================================
// CREATE / START ASSESSMENT
// =====================================================
router.post("/", authMiddleware, createQuiz);
router.post("/start", authMiddleware, startQuiz);

// =====================================================
// GET ALL QUIZZES
// =====================================================
router.get("/", authMiddleware, getQuizzes);

// =====================================================
// GET ONE QUIZ
// =====================================================
router.get("/:id", authMiddleware, getQuiz);

// =====================================================
// SUBMIT QUIZ
// =====================================================
router.post("/:id/submit", authMiddleware, submitQuiz);
router.post("/submit", authMiddleware, (req, res, next) => {
  if (req.body.quizId) {
    req.params.id = req.body.quizId;
  }
  return submitQuiz(req, res, next);
});

// =====================================================
// DELETE QUIZ
// =====================================================
router.delete("/:id", authMiddleware, deleteQuiz);

module.exports = router;