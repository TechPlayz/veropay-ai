import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CloudSun,
} from "lucide-react";
import Layout from "../components/layout/Layout";

const API_URL = "http://127.0.0.1:8000";

const PLATFORMS = ["Swiggy", "Zomato", "Uber", "Rapido", "Blinkit", "Porter", "Other"];
const TRAFFIC_LEVELS = ["Low", "Medium", "High", "Very High"];
const WEATHER_OPTIONS = ["Sunny", "Rain", "Storm", "Extreme Heat"];

const inputClass =
  "w-full bg-[#1B263B] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition";

function AddRide() {
  const navigate = useNavigate();
  const vehicleInputRef = useRef(null);

  const [form, setForm] = useState({
    pickup: "",
    dropoff: "",
    platform: "Swiggy",
    vehicle_id: "1",
    offered_fare: "",
    distance_km: "",
    duration_minutes: "",
    traffic_level: "Medium",
    weather: "Sunny",
    fuel_price: "103",
    city: "",
  });

  const [routeLoading, setRouteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchRouteInfo = async () => {
    if (!form.pickup.trim() || !form.dropoff.trim()) {
      setError("Enter both pickup and drop locations first.");
      return;
    }
    setError("");
    setRouteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/route-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup: form.pickup, dropoff: form.dropoff }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not fetch route info.");
      setRouteInfo(data);
      setForm((prev) => ({
        ...prev,
        distance_km: String(data.distance_km),
        duration_minutes: String(data.duration_minutes),
        weather: data.weather,
        city: data.pickup_display.split(",").slice(-2).join(",").trim(),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/rides/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: parseInt(form.vehicle_id),
          platform: form.platform,
          city: form.city || form.pickup,
          offered_fare: parseFloat(form.offered_fare),
          distance_km: parseFloat(form.distance_km),
          duration_minutes: parseInt(form.duration_minutes),
          traffic_level: form.traffic_level,
          weather: form.weather,
          fuel_price: parseFloat(form.fuel_price),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to analyze ride.");
      navigate(`/ride-analysis/${data.id}`, { state: { ride: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-green-400 mb-3">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">REAL-TIME RIDE ANALYSIS</span>
          </div>
          <h1 className="text-4xl font-bold">Analyze a ride</h1>
          <p className="text-gray-400 mt-3">
            Enter pickup and drop locations — VeroPay will fetch the real road distance,
            duration and live weather automatically.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Location Card */}
          <div className="bg-[#131C2E] rounded-2xl p-7 border border-white/5 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MapPin size={18} className="text-green-400" />
              Pickup &amp; Drop
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Pickup location</label>
              <input
                name="pickup"
                value={form.pickup}
                onChange={handleChange}
                placeholder="e.g. Koramangala, Bangalore"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Drop location</label>
              <input
                name="dropoff"
                value={form.dropoff}
                onChange={handleChange}
                placeholder="e.g. Indiranagar, Bangalore"
                className={inputClass}
                required
              />
            </div>

            <button
              type="button"
              onClick={fetchRouteInfo}
              disabled={routeLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-semibold py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {routeLoading ? (
                <><Loader2 size={17} className="animate-spin" /> Fetching route &amp; weather…</>
              ) : (
                <><Navigation size={17} /> Get Distance, Duration &amp; Weather</>
              )}
            </button>

            {/* Route result pill */}
            {routeInfo && (
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-[#1B263B] rounded-xl py-3 px-2">
                  <p className="text-gray-500 text-xs mb-1">Distance</p>
                  <p className="font-bold text-white">{routeInfo.distance_km} km</p>
                </div>
                <div className="bg-[#1B263B] rounded-xl py-3 px-2">
                  <p className="text-gray-500 text-xs mb-1">Duration</p>
                  <p className="font-bold text-white">{routeInfo.duration_minutes} min</p>
                </div>
                <div className="bg-[#1B263B] rounded-xl py-3 px-2">
                  <p className="text-gray-500 text-xs mb-1 flex items-center justify-center gap-1">
                    <CloudSun size={12} /> Weather
                  </p>
                  <p className="font-bold text-green-400">{routeInfo.weather}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ride Details Card */}
          <div className="bg-[#131C2E] rounded-2xl p-7 border border-white/5 space-y-5">
            <h2 className="font-semibold text-lg">Ride details</h2>

            {/* Platform + Vehicle */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className={inputClass}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle</label>
                <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} className={inputClass}>
                  <option value="1">Honda Activa 6G</option>
                  <option value="2">TVS Jupiter</option>
                  <option value="3">Suzuki Access 125</option>
                  <option value="4">Hero Splendor Plus</option>
                  <option value="5">Honda Shine</option>
                  <option value="6">Bajaj Pulsar 150</option>
                </select>
              </div>
            </div>

            {/* Fare */}
            <div>
              <label className="block text-sm font-medium mb-2">Fare offered by platform</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number" name="offered_fare" value={form.offered_fare}
                  onChange={handleChange} min="0" step="0.01" placeholder="0"
                  required className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Distance + Duration — auto-filled but editable */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Distance
                  <span className="text-gray-500 font-normal ml-1">(auto-filled)</span>
                </label>
                <div className="relative">
                  <input
                    type="number" name="distance_km" value={form.distance_km}
                    onChange={handleChange} min="0" step="0.1" placeholder="0.0"
                    required className={`${inputClass} pr-14`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration
                  <span className="text-gray-500 font-normal ml-1">(auto-filled)</span>
                </label>
                <div className="relative">
                  <input
                    type="number" name="duration_minutes" value={form.duration_minutes}
                    onChange={handleChange} min="0" placeholder="0"
                    required className={`${inputClass} pr-20`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
                </div>
              </div>
            </div>

            {/* Traffic + Weather */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Traffic level</label>
                <select name="traffic_level" value={form.traffic_level} onChange={handleChange} className={inputClass}>
                  {TRAFFIC_LEVELS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Weather
                  <span className="text-gray-500 font-normal ml-1">(auto-filled)</span>
                </label>
                <select name="weather" value={form.weather} onChange={handleChange} className={inputClass}>
                  {WEATHER_OPTIONS.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* Fuel price */}
            <div>
              <label className="block text-sm font-medium mb-2">Current fuel price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number" name="fuel_price" value={form.fuel_price}
                  onChange={handleChange} min="0" step="0.01" placeholder="103"
                  required className={`${inputClass} pl-9`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/L</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-[#07110B] font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-500/10"
          >
            {submitting ? "Analyzing…" : "Analyze Ride"}
            {!submitting && <ArrowRight size={19} />}
          </button>

          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm pb-6">
            <ShieldCheck size={15} />
            <span>VeroPay uses real road distance and live weather for accurate fare analysis.</span>
          </div>

        </form>
      </div>
    </Layout>
  );
}

export default AddRide;
