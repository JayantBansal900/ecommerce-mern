const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// PUBLIC ROUTES
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

// ADMIN ROUTES
router.post("/", protect, adminOnly,upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
