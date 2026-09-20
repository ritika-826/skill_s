const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionType: {
      type: String,
      enum: ["mcq", "coding"],
      default: "mcq",
    },

    questionHash: {
      type: String,
      trim: true,
      index: true,
    },

    // Common metadata
    topic: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },

    role: {
      type: String,
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    // MCQ specific fields
    questionText: {
      type: String,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: String,
      trim: true,
    },

    // Coding specific fields
    title: {
      type: String,
      trim: true,
    },

    problemStatement: {
      type: String,
      trim: true,
    },

    inputDescription: {
      type: String,
      default: "",
    },

    outputDescription: {
      type: String,
      default: "",
    },

    constraints: {
      type: String,
      default: "",
    },

    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],

    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],

    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
      c: { type: String, default: "" },
    },

    timeLimit: {
      type: Number,
      default: 2, // 2 seconds
    },

    memoryLimit: {
      type: Number,
      default: 128, // 128 MB
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ role: 1, topic: 1, difficulty: 1 });
questionSchema.index({ questionType: 1 });

module.exports = mongoose.model("Question", questionSchema);