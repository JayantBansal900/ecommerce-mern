import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Paid</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="p-4">{order._id}</td>
                <td className="p-4">{order.user?.name}</td>
                <td className="p-4">₹{order.totalPrice}</td>
                <td className="p-4">{order.isPaid ? "Yes" : "No"}</td>
                <td className="p-4">{order.orderStatus}</td>
                <td className="p-4 space-x-2">
                  {order.orderStatus === "Processing" && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, "Shipped")}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Ship
                      </button>

                      <button
                        onClick={() => updateStatus(order._id, "Cancelled")}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.orderStatus === "Shipped" && (
                    <button
                      onClick={() => updateStatus(order._id, "Delivered")}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Deliver
                    </button>
                  )}

                  {(order.orderStatus === "Delivered" ||
                    order.orderStatus === "Cancelled") && (
                    <span className="text-gray-500 font-semibold">
                      No Actions
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
