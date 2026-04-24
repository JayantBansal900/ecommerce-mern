import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.address ||
      !formData.city ||
      !formData.postalCode ||
      !formData.country
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/orders", {
        shippingAddress: formData,
      });

      navigate(`/payment/${data._id}`);
    } catch (error) {
      alert("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-3xl">

        <h2 className="text-3xl font-bold mb-8 text-center">
          Shipping Address
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

          <div className="col-span-2">
            <label className="block mb-2 font-semibold">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Postal Code"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-semibold">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Country"
            />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
