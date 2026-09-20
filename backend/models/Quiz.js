const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Skill Specific Assessment",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },

    isCustomRole: {
      type: Boolean,
      default: false,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    topics: [
      {
        type: String,
        trim: true,
      },
    ],

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },

    numberOfQuestions: {
      type: Number,
      required: true,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        // MCQ answer
        selectedAnswer: {
          type: String,
          default: "",
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        // Coding answer
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

    monitoringEnabled: {
      type: Boolean,
      default: false,
    },

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number,
      default: 1200, // 20 minutes in seconds
    },

    status: {
      type: String,
      enum: ["in-progress", "completed", "expired"],
      default: "in-progress",
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
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ user: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);