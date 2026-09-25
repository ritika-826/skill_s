require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection warning:", error.message);
  }
};

startServer();