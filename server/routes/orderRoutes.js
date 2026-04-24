const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderAsPaid,
  cancelOrder,
  getOrderById,   // ✅ ADD THIS
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// User routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);   // ✅ after /myorders

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/pay", protect, adminOnly, markOrderAsPaid);
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
