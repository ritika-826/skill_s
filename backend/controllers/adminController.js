const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Material = require("../models/Material");


// ADMIN DASHBOARD
const getDashboardStats = async (req, res, next) => {
  try {
    const users = await User.countDocuments();

    const quizzes = await Quiz.countDocuments();

    const results = await Result.countDocuments();

    const materials = await Material.countDocuments();

    res.json({
      stats: {
        users,
        quizzes,
        results,
        materials,
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET ALL USERS
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      users,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE USER
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getDashboardStats,
  getUsers,
  deleteUser,
};