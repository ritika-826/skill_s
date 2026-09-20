const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    isCustomRole: {
      type: Boolean,
      default: false,
    },

    // Scores
    score: {
      type: Number,
      required: true, // Total correct / points (for compatibility)
    },

    mcqScore: {
      type: Number,
      default: 0,
    },

    codingScore: {
      type: Number,
      default: 0,
    },

    overallScore: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      required: true,
      index: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    attemptedCount: {
      type: Number,
      default: 0,
    },

    skippedCount: {
      type: Number,
      default: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
    },

    incorrectCount: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number, // Seconds
      default: 0,
      index: true,
    },

    topicPerformance: [
      {
        topic: String,
        correct: Number,
        total: Number,
        percentage: Number,
      },
    ],

    difficultyPerformance: [
      {
        difficulty: String,
        correct: Number,
        total: Number,
        percentage: Number,
      },
    ],

    strengths: [String],

    weaknesses: [String],

    recommendations: [String],

    // Detailed answers
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedAnswer: {
          type: String,
          default: "",
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        // For coding questions
        code: {
          type: String,
          default: "",
        },
        language: {
          type: String,
          default: "javascript",
        },
        codingScore: {
          type: Number,
          default: 0,
        },
        testCasesPassed: {
          type: Number,
          default: 0,
        },
        totalTestCases: {
          type: Number,
          default: 0,
        },
        executionStatus: {
          type: String,
          default: "unattempted",
        },
      },
    ],

    // Webcam & Proctoring Integrity Events
    monitoringEvents: [
      {
        type: {
          type: String, // e.g. "TAB_SWITCH", "tab_switch", "camera_disconnected", "multiple_faces_detected", "face_not_detected", "window_blur"
        },
        eventType: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        duration: {
          type: Number,
          default: 0, // duration in seconds if applicable
        },
        details: {
          type: String,
          default: "",
        },
      },
    ],

    monitoringSummary: {
      tabSwitches: { type: Number, default: 0 },
      focusLostCount: { type: Number, default: 0 },
      cameraDisconnections: { type: Number, default: 0 },
      multipleFacesCount: { type: Number, default: 0 },
      noFaceCount: { type: Number, default: 0 },
      integrityStatus: { type: String, default: "NO_ISSUES" }, // "NO_ISSUES" | "REVIEW_REQUIRED"
      integrityScore: { type: Number, default: 100 },
      flagCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ user: 1, createdAt: -1 });
resultSchema.index({ role: 1, percentage: -1 });
resultSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Result", resultSchema);