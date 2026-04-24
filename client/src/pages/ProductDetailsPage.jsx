import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await api.post("/cart", {
        productId: product._id,
        quantity,
      });
      alert("Added to cart");
    } catch (error) {
      console.error(error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6">
      <div className="grid md:grid-cols-2 gap-10 bg-white p-8 rounded-xl shadow-md">
        
        <div className="h-96 bg-gray-200 flex items-center justify-center">
          <img
            src="https://via.placeholder.com/400"
            alt={product.name}
            className="h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-4">
            {product.description}
          </p>

          <p className="text-2xl font-bold text-blue-600 mb-4">
            ₹{product.price}
          </p>

          <p className="mb-4">
            Stock:{" "}
            <span className="font-semibold">
              {product.stock}
            </span>
          </p>

          <div className="mb-4">
            <label className="mr-3 font-semibold">
              Quantity:
            </label>
            <select
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="border p-2 rounded"
            >
              {[...Array(product.stock).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  {x + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
