const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  removeFromCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes are protected
router.get("/", protect, getCart);

// Add / Update quantity
router.post("/", protect, addToCart);

// Remove specific product
router.delete("/:productId", protect, removeFromCart);

module.exports = router;
