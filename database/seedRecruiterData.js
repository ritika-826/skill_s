const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../backend/.env"),
});

const mongoose = require("../backend/node_modules/mongoose");
const bcrypt = require("../backend/node_modules/bcryptjs");
const User = require("../backend/models/User");

async function seedRecruiterData() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/adaptiq";
    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    // Ensure default Recruiter Account exists (NO fake students)
    const defaultPassword = await bcrypt.hash("password123", 10);

    let recruiter = await User.findOne({ email: "recruiter@skillspecific.com" });
    if (!recruiter) {
      recruiter = await User.create({
        name: "Recruiter Admin",
        email: "recruiter@skillspecific.com",
        password: defaultPassword,
        role: "recruiter",
      });
      console.log("Created Recruiter Account: recruiter@skillspecific.com / password123");
    } else {
      recruiter.role = "recruiter";
      await recruiter.save();
      console.log("Verified Recruiter Account: recruiter@skillspecific.com");
    }

    console.log("Recruiter initialized with ZERO mock/fake students.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("SEEDING ERROR:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedRecruiterData();
}

module.exports = seedRecruiterData;
