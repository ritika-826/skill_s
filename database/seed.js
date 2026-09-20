const path = require("path");

// Load environment variables
require("dotenv").config({
  path: path.join(__dirname, "../backend/.env"),
});

// Use backend's mongoose
const mongoose = require("../backend/node_modules/mongoose");

const Question = require("../backend/models/Question");

const questions = [
  {
    questionText: "What is the time complexity of binary search?",
    options: [
      "O(n)",
      "O(log n)",
      "O(n log n)",
      "O(1)",
    ],
    correctAnswer: "O(log n)",
    topic: "dsa",
    difficulty: "easy",
    explanation:
      "Binary search repeatedly divides the search space in half.",
  },

  {
    questionText: "Which data structure follows LIFO?",
    options: [
      "Queue",
      "Stack",
      "Linked List",
      "Tree",
    ],
    correctAnswer: "Stack",
    topic: "dsa",
    difficulty: "easy",
    explanation:
      "A stack follows Last In First Out.",
  },

  {
    questionText: "Which data structure is commonly used for BFS?",
    options: [
      "Stack",
      "Queue",
      "Heap",
      "HashMap",
    ],
    correctAnswer: "Queue",
    topic: "dsa",
    difficulty: "medium",
    explanation:
      "Breadth First Search uses a queue.",
  },

  {
    questionText:
      "What is the average time complexity of searching in a hash table?",
    options: [
      "O(1)",
      "O(n)",
      "O(log n)",
      "O(n log n)",
    ],
    correctAnswer: "O(1)",
    topic: "dsa",
    difficulty: "medium",
    explanation:
      "Hash table lookup is O(1) on average.",
  },

  {
    questionText:
      "Which traversal of a BST gives sorted order?",
    options: [
      "Preorder",
      "Postorder",
      "Inorder",
      "Level order",
    ],
    correctAnswer: "Inorder",
    topic: "dsa",
    difficulty: "medium",
    explanation:
      "Inorder traversal of a Binary Search Tree visits values in sorted order.",
  },
];

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    console.log("MONGO_URI found");
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    console.log("Deleting old questions...");

    await Question.deleteMany({});

    console.log("Old questions deleted");

    console.log("Inserting questions...");

    const result = await Question.insertMany(questions);

    console.log(`${result.length} questions inserted successfully`);

    // Verify
    const count = await Question.countDocuments();

    console.log(`Questions currently in database: ${count}`);

    const data = await Question.find();

    console.log("Questions:");
    console.log(data);

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("SEEDING FAILED:");
    console.error(error);
  }
}

seedDatabase();