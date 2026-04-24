const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ================= GET ALL PRODUCTS =================
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ================= GET SINGLE PRODUCT =================
exports.getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

// ================= CREATE PRODUCT (Admin Only + Image Upload) =================
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || !price || !category || !stock) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Product image is required");
  }

  // Upload image to Cloudinary using stream
  const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ecommerce-products" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  };

  const result = await uploadFromBuffer(req.file.buffer);

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    image: result.secure_url,
    user: req.user._id,
  });

  res.status(201).json(product);
});

// ================= UPDATE PRODUCT =================
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedProduct);
});

// ================= DELETE PRODUCT =================
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({ message: "Product removed successfully" });
});
