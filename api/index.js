const app = require("../backend/app");
const mongoose = require("mongoose");

// Ensure MongoDB connection is cached for Vercel serverless environment
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/skill_specific";
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Vercel Serverless MongoDB Connected");
  } catch (err) {
    console.error("Vercel MongoDB Connection Error:", err);
  }
};

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
