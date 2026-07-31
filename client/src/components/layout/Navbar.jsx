import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Add Ride", path: "/add-ride" },
    { name: "History", path: "/history" },
    { name: "AI Assistant", path: "/chat" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B1220]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        <Link to="/" className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-xl shadow-lg shadow-green-500/30">
            <ShieldCheck size={22} color="white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">VeroPay</h1>
            <p className="text-xs text-gray-400">AI Worker Companion</p>
          </div>
        </Link>

        <div className="flex items-center gap-10">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative text-gray-300 hover:text-white transition"
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-green-500"
                />
              )}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="relative text-gray-300 hover:text-white transition"
            >
              Login
              {location.pathname === "/login" && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-green-500"
                />
              )}
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
