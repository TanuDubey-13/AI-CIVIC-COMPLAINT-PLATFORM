const crypto = require("crypto");
const { generateToken } = require("../config/jwtUtility");
const User = require("../models/User");

// Placeholder email sender for enterprise integration.
// Replace with your preferred mail service in production.
const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body: ${html}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, confirmPassword, and phone.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
      role: role || "citizen",
      emailVerificationToken: verificationToken,
      emailVerificationExpire: verificationExpire,
    });

    const token = generateToken(user._id);

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};

const getMe = getProfile;

// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpire = Date.now() + 15 * 60 * 1000;

      user.passwordResetToken = resetToken;
      user.passwordResetExpire = resetExpire;
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: "Password reset request",
        html: `<p>Hi ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while processing password reset request.",
    });
  }
};

// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, newPassword, and confirmPassword are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const verificationToken = req.params.token;

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired email verification token.",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while verifying email.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getMe,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};