import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); // prevent card click navigation

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });

      alert("Added to cart");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-6">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="block"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer">
              {/* Product Image */}
              <div className="h-56 bg-gray-200 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h2 className="text-lg font-bold mb-2">{product.name}</h2>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <p className="text-xl font-bold text-blue-600 mb-3">
                  ₹{product.price}
                </p>

                <p className="text-sm mb-4">
                  Stock:{" "}
                  <span
                    className={`font-semibold ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? product.stock : "Out of Stock"}
                  </span>
                </p>

                <button
                  disabled={product.stock === 0}
                  onClick={(e) => handleAddToCart(e, product._id)}
                  className={`w-full py-2 rounded text-white ${
                    product.stock > 0
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
