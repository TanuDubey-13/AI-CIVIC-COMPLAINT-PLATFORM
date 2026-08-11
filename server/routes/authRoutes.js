const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/logout
router.post("/logout", logoutUser);

// @route   GET /api/auth/profile
router.get("/profile", protect, getProfile);

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @route   PUT /api/auth/reset-password/:token
router.put("/reset-password/:token", resetPassword);

// @route   GET /api/auth/verify-email/:token
router.get("/verify-email/:token", verifyEmail);

module.exports = router;