const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


// REGISTER
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ["student", "recruiter"];
    const userRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "student";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Auto-seed Demo Accounts for easy testing
    if (!user) {
      if (cleanEmail === "recruiter@demo.com" || cleanEmail.startsWith("recruiter@")) {
        const hashedPassword = await bcrypt.hash(password || "recruiter123", 10);
        user = await User.create({
          name: "Talent Recruiter",
          email: cleanEmail,
          password: hashedPassword,
          role: "recruiter",
        });
      } else if (cleanEmail === "candidate@demo.com") {
        const hashedPassword = await bcrypt.hash(password || "candidate123", 10);
        user = await User.create({
          name: "Sample Candidate",
          email: cleanEmail,
          password: hashedPassword,
          role: "student",
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  register,
  login,
  getMe,
};