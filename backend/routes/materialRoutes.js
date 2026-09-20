const express = require("express");

const {
  createMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getMaterials
);

router.get(
  "/:id",
  authMiddleware,
  getMaterial
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createMaterial
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteMaterial
);

module.exports = router;