const express = require("express");

const {
  getDashboardStats,
  getUsers,
  deleteUser,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get(
  "/dashboard",
  getDashboardStats
);

router.get(
  "/users",
  getUsers
);

router.delete(
  "/users/:id",
  deleteUser
);

module.exports = router;