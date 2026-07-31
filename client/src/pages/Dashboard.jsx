import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import StatCard from "../components/cards/StatCard";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../api/dashboard";
import { getJobs } from "../api/jobs";

import {
  Wallet,
  Car,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getJobs()])
      .then(([dashRes, jobsRes]) => {
        setStats(dashRes.data);
        setJobs(jobsRes.data);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data from real jobs — cumulative fare by date
  const chartData = (() => {
    if (!jobs.length) return [];
    const byDate = {};
    [...jobs].reverse().forEach((job) => {
      const label = job.ride_date || job.created_at?.slice(0, 10) || "—";
      byDate[label] = (byDate[label] || 0) + job.fare;
    });
    let cumulative = 0;
    return Object.entries(byDate).map(([date, amount]) => {
      cumulative += amount;
      return { date, earnings: Math.round(cumulative) };
    });
  })();

  const flaggedJobs = jobs.filter((j) => j.is_flagged);
  const fairJobs = jobs.filter((j) => !j.is_flagged);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-gray-400 mb-2">Welcome back{user ? `, ${user.name}` : ""}</p>
          <h1 className="text-4xl font-bold">Your work, made smarter.</h1>
          <p className="text-gray-400 mt-3">Here's how your shift is looking today.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-4">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#131C2E] rounded-2xl p-6 border border-white/5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
              <StatCard
                title="Today's Earnings"
                value={stats ? `₹${stats.today_earnings.toFixed(0)}` : "—"}
                icon={<Wallet size={34} />}
              />
              <StatCard
                title="Total Rides Today"
                value={stats ? stats.ride_count : "—"}
                icon={<Car size={34} />}
              />
              <StatCard
                title="Avg Fairness Score"
                value={stats?.average_fairness != null ? `${stats.average_fairness.toFixed(0)}%` : "N/A"}
                icon={<ShieldCheck size={34} />}
                color="text-green-400"
              />
              <StatCard
                title="Potential Lost"
                value={stats ? `₹${stats.potential_lost_earnings.toFixed(0)}` : "—"}
                icon={<TrendingDown size={34} />}
                color="text-red-400"
              />
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-3 gap-8 mt-8">

              {/* Earnings Chart */}
              <div className="lg:col-span-2 bg-[#131C2E] rounded-2xl p-8 border border-white/5">
                <div className="mb-8">
                  <p className="text-gray-400 text-sm">Performance</p>
                  <h2 className="text-xl font-bold mt-1">Earnings Overview</h2>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0B1220", border: "1px solid #ffffff15", borderRadius: "12px", color: "#fff" }}
                          formatter={(v) => [`₹${v}`, "Earnings"]}
                        />
                        <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={3} fill="url(#earningsGradient)" animationDuration={1200} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No ride data yet. Add your first ride to see earnings.
                  </div>
                )}
              </div>

              {/* Fair Pay Summary */}
              <div className="bg-[#131C2E] rounded-2xl p-8 border border-white/5">
                <p className="text-gray-400 text-sm">Protection</p>
                <h2 className="text-xl font-bold mt-1 mb-8">Fair Pay Summary</h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Fair rides</span>
                      <span className="font-semibold">{fairJobs.length}</span>
                    </div>
                    <div className="h-2 bg-[#1B263B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: jobs.length ? `${(fairJobs.length / jobs.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Possible underpayments</span>
                      <span className="font-semibold text-red-400">{flaggedJobs.length}</span>
                    </div>
                    <div className="h-2 bg-[#1B263B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: jobs.length ? `${(flaggedJobs.length / jobs.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 rounded-xl bg-green-500/5 border border-green-500/10">
                  <div className="flex gap-3">
                    <ShieldCheck size={22} className="text-green-400 shrink-0" />
                    <p className="text-sm text-gray-400 leading-6">
                      VeroPay analyzed{" "}
                      <span className="text-white font-semibold">{jobs.length} rides</span> and detected approximately{" "}
                      <span className="text-white font-semibold">
                        ₹{stats?.potential_lost_earnings?.toFixed(0) ?? 0}
                      </span>{" "}
                      in potential lost earnings.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </Layout>
  );
}

export default Dashboard;
