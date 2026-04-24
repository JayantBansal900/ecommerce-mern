const express = require("express");
const router = express.Router();

const { getAdminStats, getMonthlyRevenue } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/monthly-revenue", protect, adminOnly, getMonthlyRevenue);
module.exports = router;
