import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/myorders");
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  // Filter + Search Logic
  useEffect(() => {
    let updated = [...orders];

    if (statusFilter !== "All") {
      updated = updated.filter(
        (order) => order.orderStatus === statusFilter
      );
    }

    if (searchTerm) {
      updated = updated.filter((order) =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(updated);
  }, [statusFilter, searchTerm, orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  const statuses = [
    "All",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="max-w-7xl mx-auto mt-10 px-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        {/* Status Buttons */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-72"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="bg-white shadow-md rounded-xl p-5 border hover:shadow-xl transition duration-300 cursor-pointer"
            >
              <p className="text-sm text-gray-500 mb-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p className="text-xs text-gray-400 break-words mb-3">
                {order._id}
              </p>

              <p className="text-lg font-bold mb-3">
                ₹{order.totalPrice}
              </p>

              <div className="flex flex-col gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full text-white w-fit ${
                    order.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Not Paid"}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full text-white w-fit ${
                    order.orderStatus === "Processing"
                      ? "bg-yellow-500"
                      : order.orderStatus === "Shipped"
                      ? "bg-blue-500"
                      : order.orderStatus === "Delivered"
                      ? "bg-green-600"
                      : order.orderStatus === "Cancelled"
                      ? "bg-red-600"
                      : "bg-gray-500"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
