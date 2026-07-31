import Layout from "../components/layout/Layout";
import StatCard from "../components/cards/StatCard";

import {
  Wallet,
  Car,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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


const earningsData = [
  { time: "9 AM", earnings: 120 },
  { time: "10 AM", earnings: 260 },
  { time: "11 AM", earnings: 390 },
  { time: "12 PM", earnings: 610 },
  { time: "1 PM", earnings: 830 },
  { time: "2 PM", earnings: 980 },
  { time: "3 PM", earnings: 1080 },
  { time: "4 PM", earnings: 1240 },
];


function Dashboard() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-gray-400 mb-2">
            Welcome back
          </p>

          <h1 className="text-4xl font-bold">
            Your work, made smarter.
          </h1>

          <p className="text-gray-400 mt-3">
            Here's how your shift is looking today.
          </p>
        </div>


        {/* Stats */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">

          <StatCard
            title="Today's Earnings"
            value="₹1,240"
            icon={<Wallet size={34} />}
          />

          <StatCard
            title="Total Rides"
            value="18"
            icon={<Car size={34} />}
          />

          <StatCard
            title="Hours Worked"
            value="6.5h"
            icon={<Clock3 size={34} />}
            color="text-blue-400"
          />

          <StatCard
            title="Fairness Score"
            value="92%"
            icon={<ShieldCheck size={34} />}
            color="text-green-400"
          />

        </div>


        {/* AI Insight */}
        <div className="mt-8 bg-[#131C2E] rounded-2xl p-8 border border-white/5">

          <div className="flex items-start gap-5">

            <div className="bg-green-500/10 p-3 rounded-xl">
              <Sparkles
                className="text-green-400"
                size={26}
              />
            </div>

            <div className="flex-1">

              <div className="flex items-center gap-2 mb-3">

                <p className="text-green-400 font-semibold">
                  AI Daily Insight
                </p>

                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                  LIVE
                </span>

              </div>

              <h2 className="text-2xl font-bold mb-4">
                You're performing better than yesterday.
              </h2>

              <p className="text-gray-400 leading-7 max-w-4xl">
                Most of today's earnings came during lunch hours.
                Three rides appear to have been underpaid. Your
                average earnings also dropped by 21% after 9 PM,
                so ending your shift earlier may improve your
                hourly earnings.
              </p>

            </div>

          </div>

        </div>


        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">

          {/* Earnings Chart */}
          <div className="lg:col-span-2 bg-[#131C2E] rounded-2xl p-8 border border-white/5">

            <div className="flex items-center justify-between mb-8">

              <div>

                <p className="text-gray-400 text-sm">
                  Performance
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Earnings Overview
                </h2>

              </div>

              <div className="flex items-center gap-2 text-green-400">

                <TrendingUp size={18} />

                <span className="font-semibold">
                  +18.2%
                </span>

              </div>

            </div>


            {/* Real Earnings Chart */}
            <div className="h-64 w-full">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart
                  data={earningsData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  {/* Gradient */}
                  <defs>

                    <linearGradient
                      id="earningsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  {/* Grid */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />


                  {/* X Axis */}
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />


                  {/* Y Axis */}
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />


                  {/* Hover Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1220",
                      border: "1px solid #ffffff15",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `₹${value}`,
                      "Earnings",
                    ]}
                  />


                  {/* Earnings Line */}
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fill="url(#earningsGradient)"
                    animationDuration={1200}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* Fair Pay Summary */}
          <div className="bg-[#131C2E] rounded-2xl p-8 border border-white/5">

            <p className="text-gray-400 text-sm">
              AI Protection
            </p>

            <h2 className="text-xl font-bold mt-1 mb-8">
              Fair Pay Summary
            </h2>


            <div className="space-y-6">

              {/* Fair Rides */}
              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-400">
                    Fair rides
                  </span>

                  <span className="font-semibold">
                    15
                  </span>

                </div>

                <div className="h-2 bg-[#1B263B] rounded-full overflow-hidden">

                  <div className="h-full bg-green-500 w-[83%] rounded-full" />

                </div>

              </div>


              {/* Underpaid Rides */}
              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-gray-400">
                    Possible underpayments
                  </span>

                  <span className="font-semibold text-red-400">
                    3
                  </span>

                </div>

                <div className="h-2 bg-[#1B263B] rounded-full overflow-hidden">

                  <div className="h-full bg-red-400 w-[17%] rounded-full" />

                </div>

              </div>

            </div>


            {/* Protection Insight */}
            <div className="mt-8 p-5 rounded-xl bg-green-500/5 border border-green-500/10">

              <div className="flex gap-3">

                <ShieldCheck
                  size={22}
                  className="text-green-400 shrink-0"
                />

                <p className="text-sm text-gray-400 leading-6">

                  VeroPay analyzed all 18 rides and detected
                  approximately{" "}

                  <span className="text-white font-semibold">
                    ₹186
                  </span>{" "}

                  in potential lost earnings.

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;