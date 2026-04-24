const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  refreshToken,
  getUserProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 Login Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

// ===== Routes =====
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);

// 🚨 IMPORTANT: Disable CSRF for refresh
router.post("/refresh", refreshToken);

router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/profile", protect, getUserProfile);

module.exports = router;