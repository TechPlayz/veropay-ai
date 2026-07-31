import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <ShieldCheck size={24} className="text-[#07110B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VeroPay</h1>
              <p className="text-xs text-gray-500">AI Worker Companion</p>
            </div>
          </Link>

          <div className="max-w-lg">
            <p className="text-green-400 text-sm font-semibold mb-4">KNOW YOUR WORTH</p>
            <h2 className="text-5xl font-bold leading-tight">
              Fair work deserves
              <span className="text-green-400"> fair pay.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-8 mt-6">
              Track your earnings, identify potential underpayments and make
              smarter decisions about your gig work.
            </p>
          </div>

          <p className="text-gray-600 text-xs">
            VeroPay uses AI-assisted estimates to identify potential payment discrepancies.
          </p>

        </div>
      </div>

      {/* Login side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} className="text-[#07110B]" />
            </div>
            <span className="font-bold text-xl">VeroPay</span>
          </Link>

          <div className="mb-9">
            <h1 className="text-4xl font-bold">Welcome back</h1>
            <p className="text-gray-400 mt-3">Sign in to access your VeroPay dashboard.</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-sm font-semibold block mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-4 py-4 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold">Password</label>
              </div>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-12 py-4 outline-none transition placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-[#07110B] font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <p className="text-center text-gray-500 text-sm mt-7">
            New to VeroPay?{" "}
            <Link to="/signup" className="text-green-400 hover:text-green-300 font-semibold">
              Create an account
            </Link>
          </p>

          <div className="mt-10 border-t border-white/5 pt-6">
            <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
              <ShieldCheck size={14} />
              Secure authentication
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
