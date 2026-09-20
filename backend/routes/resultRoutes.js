const express = require("express");

const {
  submitQuiz,
  getMyResults,
  getResult,
} = require("../controllers/resultController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/submit",
  authMiddleware,
  submitQuiz
);

router.get(
  "/my",
  authMiddleware,
  getMyResults
);

router.get(
  "/my-results",
  authMiddleware,
  getMyResults
);

router.get(
  "/:id",
  authMiddleware,
  getResult
);

module.exports = router;