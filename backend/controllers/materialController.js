const Material = require("../models/Material");


// CREATE MATERIAL
const createMaterial = async (req, res, next) => {
  try {
    const {
      title,
      description,
      content,
      fileName,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const material = await Material.create({
      title,
      description,
      content,
      fileName,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({
      message: "Material uploaded successfully",
      material,
    });
  } catch (error) {
    next(error);
  }
};


// GET MATERIALS
const getMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      materials,
    });
  } catch (error) {
    next(error);
  }
};


// GET ONE MATERIAL
const getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(
      req.params.id
    ).populate("uploadedBy", "name email");

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    res.json({
      material,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE MATERIAL
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByIdAndDelete(
      req.params.id
    );

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    res.json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
};