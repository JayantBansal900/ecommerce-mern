const asyncHandler = require("../middleware/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// ================= ADMIN STATS =================
exports.getAdminStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();

  const paidOrders = await Order.countDocuments({ isPaid: true });
  const unpaidOrders = await Order.countDocuments({ isPaid: false });

  const revenueData = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue =
    revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.json({
    totalOrders,
    totalProducts,
    totalUsers,
    paidOrders,
    unpaidOrders,
    totalRevenue,
  });
});
// ================= MONTHLY REVENUE =================
exports.getMonthlyRevenue = asyncHandler(async (req, res) => {
  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const monthNames = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formattedData = monthlyRevenue.map((item) => ({
    month: monthNames[item._id],
    revenue: item.revenue,
  }));

  res.json(formattedData);
});