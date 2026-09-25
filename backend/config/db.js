const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/skill_specific";
    const connection = await mongoose.connect(mongoURI);

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = connectDB;