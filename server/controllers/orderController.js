const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const sendEmail = require("../utils/sendEmail");

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  let totalPrice = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save();

    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    })),
    shippingAddress,
    totalPrice,
  });

  cart.items = [];
  await cart.save();

  // 📩 SEND CONFIRMATION EMAIL
  try {
    await sendEmail({
      email: req.user.email,
      subject: "Order Confirmation - E-Commerce",
      message: `
        <h2>Thank you for your order!</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
        <p><strong>Status:</strong> ${order.orderStatus}</p>
        <br/>
        <p>We will notify you once shipped.</p>
      `,
    });
  } catch (err) {
    console.log("Email failed but order created:", err.message);
  }

  res.status(201).json(order);
});

// ================= GET MY ORDERS =================
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product");

  res.json(orders);
});

// ================= ADMIN GET ALL ORDERS =================
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("orderItems.product");

  res.json(orders);
});

// ================= ADMIN UPDATE ORDER STATUS (FINAL STRICT VERSION) =================
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // ❌ No update if already Delivered or Cancelled
  if (
    order.orderStatus === "Delivered" ||
    order.orderStatus === "Cancelled"
  ) {
    res.status(400);
    throw new Error("Order cannot be updated further");
  }

  const allowedTransitions = {
    Processing: ["Shipped", "Cancelled"],  // ✅ Cancel allowed here
    Shipped: ["Delivered"],                // ❌ Cancel NOT allowed after shipped
  };

  if (!allowedTransitions[order.orderStatus]?.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status transition from ${order.orderStatus} to ${status}`
    );
  }

  order.orderStatus = status;
  await order.save();

  res.json(order);
});


// ================= MARK ORDER AS PAID (STRICT) =================
exports.markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already marked as paid");
  }

  if (order.orderStatus === "Delivered") {
    res.status(400);
    throw new Error("Cannot mark delivered order as unpaid/paid again");
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  await order.save();

  res.json(order);
});

// ================= CANCEL ORDER =================
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("orderItems.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.orderStatus !== "Processing") {
    res.status(400);
    throw new Error("Only Processing orders can be cancelled");
  }

  // Restore stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product._id);
    product.stock += item.quantity;
    await product.save();
  }

  order.orderStatus = "Cancelled";
  await order.save();

  res.json({ message: "Order cancelled and stock restored", order });
});

// ================= GET ORDER BY ID =================
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("orderItems.product")
    .populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only allow owner or admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json(order);
});



