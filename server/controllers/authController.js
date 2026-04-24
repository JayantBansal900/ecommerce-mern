const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// 🔐 Strong Password Validator
const validatePassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return strongPasswordRegex.test(password);
};

// 🔑 Generate Access Token (15 Minutes)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// 🔑 Generate Refresh Token (7 Days)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must include uppercase, lowercase, number & special character",
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
});

// ================= LOGIN =================
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide credentials" });
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
});

// ================= REFRESH TOKEN =================
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const newAccessToken = generateAccessToken(decoded.id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

// ================= PROFILE =================
exports.getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// ================= LOGOUT =================
exports.logoutUser = asyncHandler(async (req, res) => {
  res
    .cookie("accessToken", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: false,
    })
    .cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: false,
    });

  res.json({ message: "Logged out successfully" });
});

// ================= FORGOT PASSWORD =================
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `
    <h2>Password Reset Request</h2>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.json({ message: "Reset email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: "Email failed" });
  }
});

// ================= RESET PASSWORD =================
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  if (!validatePassword(req.body.password)) {
    return res.status(400).json({
      message:
        "Password must include uppercase, lowercase, number & special character",
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});