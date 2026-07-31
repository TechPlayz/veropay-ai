import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Bike,
  IndianRupee,
  TrendingDown,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import Layout from "../components/layout/Layout";
import { getJobs, deleteJob } from "../api/jobs";

function RideHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchJobs = () => {
    setLoading(true);
    getJobs()
      .then((res) => setJobs(res.data))
      .catch(() => setError("Failed to load ride history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      setError("Failed to delete ride.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.platform.toLowerCase().includes(search.toLowerCase());
    const isFlagged = job.is_flagged;
    const matchesFilter =
      filter === "All" ||
      (filter === "Fair" && !isFlagged) ||
      (filter === "Underpaid" && isFlagged);
    return matchesSearch && matchesFilter;
  });

  const flaggedJobs = jobs.filter((j) => j.is_flagged);
  const potentialLost = jobs.reduce((sum, j) => sum + (j.difference > 0 ? j.difference : 0), 0);
  const avgFairness = jobs.length
    ? jobs.filter((j) => j.fairness_score != null).reduce((s, j) => s + j.fairness_score, 0) /
      (jobs.filter((j) => j.fairness_score != null).length || 1)
    : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <Bike size={18} />
              <span className="text-sm font-semibold">RIDE ACTIVITY</span>
            </div>
            <h1 className="text-4xl font-bold">Ride history</h1>
            <p className="text-gray-400 mt-3">Review your rides and payouts.</p>
          </div>

          <Link
            to="/add-ride"
            className="bg-green-500 hover:bg-green-400 text-[#07110B] font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            Add New Ride
            <ArrowRight size={17} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-4">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Bike size={17} /> Rides logged
            </div>
            <p className="text-3xl font-bold mt-4">{loading ? "—" : jobs.length}</p>
            <p className="text-gray-500 text-sm mt-2">Total</p>
          </div>

          <div className="bg-[#131C2E] border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <TrendingDown size={17} className="text-red-400" /> Possible lost earnings
            </div>
            <p className="text-3xl font-bold text-red-400 mt-4">
              {loading ? "—" : `₹${potentialLost.toFixed(0)}`}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Across {flaggedJobs.length} flagged ride{flaggedJobs.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-[#131C2E] border border-green-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ShieldCheck size={17} className="text-green-400" /> Average fairness
            </div>
            <p className="text-3xl font-bold text-green-400 mt-4">
              {loading ? "—" : avgFairness != null ? `${avgFairness.toFixed(0)}%` : "N/A"}
            </p>
            <p className="text-gray-500 text-sm mt-2">Across all rides</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by platform…"
              className="w-full bg-[#131C2E] border border-white/5 focus:border-green-500/40 rounded-xl pl-11 pr-4 py-3.5 outline-none text-white placeholder:text-gray-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#131C2E] border border-white/5 rounded-xl px-4">
            <SlidersHorizontal size={17} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-white py-3.5 outline-none cursor-pointer"
            >
              <option className="bg-[#131C2E]">All</option>
              <option className="bg-[#131C2E]">Fair</option>
              <option className="bg-[#131C2E]">Underpaid</option>
            </select>
          </div>
        </div>

        {/* Ride Table */}
        <div className="bg-[#131C2E] border border-white/5 rounded-2xl overflow-hidden">

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_60px] gap-4 px-6 py-4 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wide">
            <span>Ride</span>
            <span>Payout</span>
            <span>Distance</span>
            <span>Duration</span>
            <span>Status</span>
            <span />
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-3 text-gray-500">
              <Loader2 size={22} className="animate-spin" />
              Loading rides…
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_60px] gap-4 items-center px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition"
              >
                {/* Ride */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B263B] rounded-xl flex items-center justify-center">
                    <Bike size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{job.platform}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      #{job.id} · {job.ride_date || job.created_at?.slice(0, 10)}
                    </p>
                  </div>
                </div>

                {/* Payout */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">PAYOUT</p>
                  <div className="flex items-center gap-1 font-semibold">
                    <IndianRupee size={14} />
                    {job.fare}
                  </div>
                </div>

                {/* Distance */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">DISTANCE</p>
                  <p className="text-gray-300">{job.distance} km</p>
                </div>

                {/* Duration */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">DURATION</p>
                  <p className="text-gray-300">{job.duration} min</p>
                </div>

                {/* Status */}
                <div className="mt-4 md:mt-0">
                  {job.is_flagged ? (
                    <div>
                      <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs font-semibold px-3 py-2 rounded-full">
                        <ShieldAlert size={14} /> Underpaid
                      </div>
                      {job.difference > 0 && (
                        <p className="text-red-400 text-xs mt-2">₹{job.difference.toFixed(0)} below estimate</p>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-2 rounded-full">
                      <CheckCircle2 size={14} /> Fair payment
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="mt-4 md:mt-0 md:text-right">
                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                    className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-40"
                    title="Delete ride"
                  >
                    {deletingId === job.id
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Trash2 size={16} />
                    }
                  </button>
                </div>

              </motion.div>
            ))
          ) : (
            <div className="py-16 text-center">
              <Search size={30} className="text-gray-600 mx-auto mb-4" />
              <p className="font-semibold">
                {jobs.length === 0 ? "No rides yet" : "No rides found"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {jobs.length === 0
                  ? "Add your first ride to get started."
                  : "Try changing your search or filter."}
              </p>
            </div>
          )}

        </div>

        <p className="text-gray-600 text-xs text-center mt-5">
          VeroPay's fairness estimates are intended to help identify potential payment discrepancies.
        </p>

      </div>
    </Layout>
  );
}

export default RideHistory;
