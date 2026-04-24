const asyncHandler = require("../middleware/asyncHandler");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

// ================= CREATE RAZORPAY ORDER =================
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const options = {
    amount: order.totalPrice * 100, // in paise
    currency: "INR",
    receipt: order._id.toString(),
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// ================= VERIFY PAYMENT =================
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  const order = await Order.findById(orderId);

  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();

  res.json({ message: "Payment verified and order marked as paid" });
});
