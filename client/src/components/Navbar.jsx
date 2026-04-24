import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-400">
        E-Commerce
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/admin" className="hover:text-blue-400">
              Admin
            </Link>
            <Link to="/cart" className="hover:text-blue-400">
              Cart
            </Link>

            <Link to="/orders" className="hover:text-blue-400">
              My Orders
            </Link>

            <span>Hello, {user.name}</span>

            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
