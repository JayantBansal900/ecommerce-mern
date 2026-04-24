import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found.
      </div>
    );
  }

  const statusSteps = ["Processing", "Shipped", "Delivered"];

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Order Details</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">

          <div>
            <p className="text-gray-500 text-sm">Order ID</p>
            <p className="font-semibold break-words">{order._id}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Date</p>
            <p className="font-semibold">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Payment</p>
            <span
              className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                order.isPaid ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {order.isPaid ? "Paid" : "Not Paid"}
            </span>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="mt-6 flex justify-between items-center">
          {statusSteps.map((step, index) => {
            const currentIndex = statusSteps.indexOf(order.orderStatus);
            const isActive = index <= currentIndex;

            return (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    isActive ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </div>
                <p
                  className={`mt-2 text-sm ${
                    isActive ? "font-semibold text-blue-600" : "text-gray-400"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <p>{order.shippingAddress.address}</p>
        <p>
          {order.shippingAddress.city},{" "}
          {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Order Items</h2>

        <div className="space-y-6">
          {order.orderItems.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                  <img
                    src="https://via.placeholder.com/100"
                    alt={item.product.name}
                    className="h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    ₹{item.product.price} × {item.quantity}
                  </p>
                </div>
              </div>

              <p className="font-bold text-lg">
                ₹{item.product.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8 text-xl font-bold">
          <span>Total</span>
          <span>₹{order.totalPrice}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
