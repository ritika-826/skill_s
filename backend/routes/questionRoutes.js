const express = require("express");
const Question = require("../models/Question");
const { getRolesConfig, getCustomRoleConfig } = require("../controllers/quizController");

const router = express.Router();

// Get roles and skills mapping
router.get("/roles", getRolesConfig);

// Get suggested topics for custom role
router.post("/custom-role", getCustomRoleConfig);

router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch questions",
    });
  }
});

module.exports = router;