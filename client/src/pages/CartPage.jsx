import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Increment / Decrement properly
  const updateQuantity = async (productId, type) => {
    if (type === "inc") {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });
    }

    if (type === "dec") {
      await api.post("/cart", {
        productId,
        quantity: -1,
      });
    }

    fetchCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    fetchCart();
  };

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <p className="text-lg mb-4">Your cart is empty 🛒</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white p-6 rounded-xl shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                    <img
                      src="https://via.placeholder.com/100"
                      alt={item.product.name}
                      className="h-full object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-lg">{item.product.name}</h2>
                    <p className="text-gray-600">₹{item.product.price}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        disabled={item.quantity === 1}
                        onClick={() => updateQuantity(item.product._id, "dec")}
                        className={`px-3 py-1 rounded ${
                          item.quantity === 1
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      >
                        -
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.product._id, "inc")}
                        className="bg-gray-300 px-3 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.product._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="flex justify-between mb-3">
              <span>Total Items</span>
              <span>
                {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between mb-4 font-bold text-lg">
              <span>Total Price</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
