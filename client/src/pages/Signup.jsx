import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  User,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { extractVehicleOcr } from "../api/ocr";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [vehicle, setVehicle] = useState({
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    fuel_type: "",
    mileage: "",
  });

  const [rcFile, setRcFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRcFile(file);
    setOcrLoading(true);
    try {
      const res = await extractVehicleOcr(file);
      const data = res.data;
      setVehicle({
        vehicle_make: data.vehicle_make || "",
        vehicle_model: data.vehicle_model || "",
        vehicle_year: data.vehicle_year ?? "",
        fuel_type: data.fuel_type || "",
        mileage: data.mileage ?? "",
      });
    } catch {
      // OCR failed silently — user can fill manually
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!rcFile) {
      setError("Please upload your vehicle RC.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("password", form.password);
      data.append("rc", rcFile);
      if (vehicle.vehicle_make) data.append("vehicle_make", vehicle.vehicle_make);
      if (vehicle.vehicle_model) data.append("vehicle_model", vehicle.vehicle_model);
      if (vehicle.vehicle_year) data.append("vehicle_year", vehicle.vehicle_year);
      if (vehicle.fuel_type) data.append("fuel_type", vehicle.fuel_type);
      if (vehicle.mileage) data.append("mileage", vehicle.mileage);

      await register(data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white flex">

      {/* LEFT SIDE */}
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
            <p className="text-green-400 text-sm font-semibold mb-4">BUILT FOR GIG WORKERS</p>
            <h2 className="text-5xl font-bold leading-tight">
              Your work.<br />
              <span className="text-green-400">Your earnings.</span><br />
              Your data.
            </h2>
            <p className="text-gray-400 text-lg leading-8 mt-6">
              Create your VeroPay account to track rides, understand your
              earnings and identify potential payment discrepancies.
            </p>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <ShieldCheck size={14} />
            Your documents are securely handled and never exposed publicly.
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex justify-center overflow-y-auto">
        <div className="w-full max-w-lg px-6 py-12 lg:py-14">

          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} className="text-[#07110B]" />
            </div>
            <span className="font-bold text-xl">VeroPay</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold">Create your account</h1>
            <p className="text-gray-400 mt-3">Set up your worker profile to get started.</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="text-sm font-semibold block mb-2">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  required placeholder="Enter your full name"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-4 py-4 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold block mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-4 py-4 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-semibold block mb-2">Phone number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  required placeholder="+91 98765 43210"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-4 py-4 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-semibold block mb-2">Password</label>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"} name="password"
                  value={form.password} onChange={handleChange}
                  required minLength={6} placeholder="Create a password"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-12 py-4 outline-none transition placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-sm font-semibold block mb-2">Confirm password</label>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  required minLength={6} placeholder="Re-enter your password"
                  className="w-full bg-[#131C2E] border border-white/10 focus:border-green-500/50 rounded-xl pl-12 pr-12 py-4 outline-none transition placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* RC UPLOAD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Vehicle RC</label>
                <span className="text-xs text-gray-500">PDF, JPG or PNG</span>
              </div>

              {!rcFile ? (
                <label className="border border-dashed border-white/15 hover:border-green-500/40 bg-[#131C2E] rounded-xl px-5 py-7 flex flex-col items-center justify-center cursor-pointer transition">
                  <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
                    <Upload size={20} className="text-green-400" />
                  </div>
                  <p className="font-semibold text-sm">Upload Registration Certificate</p>
                  <p className="text-gray-500 text-xs mt-2">Click to select your vehicle RC</p>
                  <input
                    type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange} className="hidden" required
                  />
                </label>
              ) : (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-green-500/10 p-3 rounded-xl">
                      {ocrLoading
                        ? <Loader2 size={19} className="text-green-400 animate-spin" />
                        : <FileText size={19} className="text-green-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{rcFile.name}</p>
                      <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                        {ocrLoading ? (
                          <span className="text-gray-400">Extracting vehicle info…</span>
                        ) : (
                          <><Check size={13} /> Ready to upload</>
                        )}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRcFile(null)}
                    className="text-gray-500 hover:text-red-400 transition cursor-pointer shrink-0">
                    <X size={19} />
                  </button>
                </div>
              )}
            </div>

            {/* VEHICLE FIELDS — shown after OCR or always editable */}
            {rcFile && (
              <div className="bg-[#131C2E] border border-white/5 rounded-xl p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-300">
                  Vehicle details{" "}
                  <span className="text-gray-500 font-normal">(confirm or edit)</span>
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Make</label>
                    <input name="vehicle_make" value={vehicle.vehicle_make}
                      onChange={handleVehicleChange} placeholder="e.g. Honda"
                      className="w-full bg-[#1B263B] border border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Model</label>
                    <input name="vehicle_model" value={vehicle.vehicle_model}
                      onChange={handleVehicleChange} placeholder="e.g. Activa"
                      className="w-full bg-[#1B263B] border border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Year</label>
                    <input name="vehicle_year" value={vehicle.vehicle_year}
                      onChange={handleVehicleChange} placeholder="e.g. 2021" type="number"
                      className="w-full bg-[#1B263B] border border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Fuel type</label>
                    <input name="fuel_type" value={vehicle.fuel_type}
                      onChange={handleVehicleChange} placeholder="e.g. Petrol"
                      className="w-full bg-[#1B263B] border border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition placeholder:text-gray-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Mileage (km/l)</label>
                    <input name="mileage" value={vehicle.mileage}
                      onChange={handleVehicleChange} placeholder="e.g. 45" type="number" step="0.1"
                      className="w-full bg-[#1B263B] border border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit" disabled={loading || ocrLoading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-[#07110B] font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? "Creating account…" : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <p className="text-center text-gray-500 text-sm mt-7">
            Already have an account?{" "}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Signup;
