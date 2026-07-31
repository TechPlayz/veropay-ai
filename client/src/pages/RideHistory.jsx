import { useState } from "react";
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
} from "lucide-react";

import Layout from "../components/layout/Layout";

const rides = [
  {
    id: "VR-1048",
    platform: "Zomato",
    time: "Today, 4:18 PM",
    fare: 142,
    distance: 11.2,
    duration: 38,
    fairness: 76,
    difference: -44,
    status: "Underpaid",
  },
  {
    id: "VR-1047",
    platform: "Swiggy",
    time: "Today, 3:42 PM",
    fare: 186,
    distance: 8.4,
    duration: 29,
    fairness: 96,
    difference: 0,
    status: "Fair",
  },
  {
    id: "VR-1046",
    platform: "Zomato",
    time: "Today, 2:56 PM",
    fare: 118,
    distance: 6.1,
    duration: 24,
    fairness: 91,
    difference: 0,
    status: "Fair",
  },
  {
    id: "VR-1045",
    platform: "Swiggy",
    time: "Today, 1:35 PM",
    fare: 164,
    distance: 10.7,
    duration: 41,
    fairness: 81,
    difference: -26,
    status: "Underpaid",
  },
  {
    id: "VR-1044",
    platform: "Zomato",
    time: "Today, 12:48 PM",
    fare: 215,
    distance: 12.6,
    duration: 43,
    fairness: 98,
    difference: 0,
    status: "Fair",
  },
  {
    id: "VR-1043",
    platform: "Swiggy",
    time: "Yesterday, 8:17 PM",
    fare: 96,
    distance: 7.8,
    duration: 31,
    fairness: 73,
    difference: -31,
    status: "Underpaid",
  },
];

function RideHistory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.platform.toLowerCase().includes(search.toLowerCase()) ||
      ride.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || ride.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <Bike size={18} />

              <span className="text-sm font-semibold">
                RIDE ACTIVITY
              </span>
            </div>

            <h1 className="text-4xl font-bold">
              Ride history
            </h1>

            <p className="text-gray-400 mt-3">
              Review your rides, payouts and VeroPay fairness analysis.
            </p>
          </div>

          <Link
            to="/add-ride"
            className="
              bg-green-500
              hover:bg-green-400
              text-[#07110B]
              font-bold
              px-5
              py-3
              rounded-xl
              transition
              flex
              items-center
              justify-center
              gap-2
            "
          >
            Analyze New Ride
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Bike size={17} />
              Rides analyzed
            </div>

            <p className="text-3xl font-bold mt-4">
              18
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Today
            </p>
          </div>

          <div className="bg-[#131C2E] border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <TrendingDown
                size={17}
                className="text-red-400"
              />
              Possible lost earnings
            </div>

            <p className="text-3xl font-bold text-red-400 mt-4">
              ₹186
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Across 3 flagged rides
            </p>
          </div>

          <div className="bg-[#131C2E] border border-green-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ShieldCheck
                size={17}
                className="text-green-400"
              />
              Average fairness
            </div>

            <p className="text-3xl font-bold text-green-400 mt-4">
              92%
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Across today's rides
            </p>
          </div>

        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-5">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by platform or ride ID..."
              className="
                w-full
                bg-[#131C2E]
                border
                border-white/5
                focus:border-green-500/40
                rounded-xl
                pl-11
                pr-4
                py-3.5
                outline-none
                text-white
                placeholder:text-gray-600
                transition
              "
            />

          </div>

          <div
            className="
              flex
              items-center
              gap-2
              bg-[#131C2E]
              border
              border-white/5
              rounded-xl
              px-4
            "
          >
            <SlidersHorizontal
              size={17}
              className="text-gray-500"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="
                bg-transparent
                text-white
                py-3.5
                outline-none
                cursor-pointer
              "
            >
              <option className="bg-[#131C2E]">
                All
              </option>

              <option className="bg-[#131C2E]">
                Fair
              </option>

              <option className="bg-[#131C2E]">
                Underpaid
              </option>
            </select>
          </div>

        </div>

        {/* Ride Table */}
        <div
          className="
            bg-[#131C2E]
            border
            border-white/5
            rounded-2xl
            overflow-hidden
          "
        >

          {/* Table Header */}
          <div
            className="
              hidden
              md:grid
              grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.2fr_60px]
              gap-4
              px-6
              py-4
              border-b
              border-white/5
              text-xs
              text-gray-500
              uppercase
              tracking-wide
            "
          >
            <span>Ride</span>
            <span>Payout</span>
            <span>Distance</span>
            <span>Duration</span>
            <span>Fairness</span>
            <span>Status</span>
            <span />
          </div>

          {/* Rides */}
          {filteredRides.length > 0 ? (
            filteredRides.map((ride, index) => (

              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.04,
                }}
                className="
                  md:grid
                  md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.2fr_60px]
                  gap-4
                  items-center
                  px-6
                  py-5
                  border-b
                  border-white/5
                  last:border-b-0
                  hover:bg-white/[0.02]
                  transition
                "
              >

                {/* Ride */}
                <div>
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10
                        h-10
                        bg-[#1B263B]
                        rounded-xl
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Bike
                        size={18}
                        className="text-green-400"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {ride.platform}
                      </p>

                      <p className="text-gray-500 text-xs mt-1">
                        {ride.id} · {ride.time}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Payout */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">
                    PAYOUT
                  </p>

                  <div className="flex items-center gap-1 font-semibold">
                    <IndianRupee size={14} />
                    {ride.fare}
                  </div>
                </div>

                {/* Distance */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">
                    DISTANCE
                  </p>

                  <p className="text-gray-300">
                    {ride.distance} km
                  </p>
                </div>

                {/* Duration */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">
                    DURATION
                  </p>

                  <p className="text-gray-300">
                    {ride.duration} min
                  </p>
                </div>

                {/* Fairness */}
                <div className="mt-4 md:mt-0">
                  <p className="md:hidden text-gray-500 text-xs mb-1">
                    FAIRNESS
                  </p>

                  <span
                    className={
                      ride.fairness >= 90
                        ? "font-bold text-green-400"
                        : ride.fairness >= 80
                        ? "font-bold text-yellow-400"
                        : "font-bold text-red-400"
                    }
                  >
                    {ride.fairness}%
                  </span>
                </div>

                {/* Status */}
                <div className="mt-4 md:mt-0">

                  {ride.status === "Fair" ? (

                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-2 rounded-full">
                      <CheckCircle2 size={14} />
                      Fair payment
                    </div>

                  ) : (

                    <div>
                      <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs font-semibold px-3 py-2 rounded-full">
                        <ShieldAlert size={14} />
                        Underpaid
                      </div>

                      <p className="text-red-400 text-xs mt-2">
                        {ride.difference < 0
                          ? `₹${Math.abs(ride.difference)} below estimate`
                          : ""}
                      </p>
                    </div>

                  )}

                </div>

                {/* View */}
                <div className="mt-4 md:mt-0 md:text-right">

                  <Link
                    to="/analysis"
                    className="
                      inline-flex
                      w-9
                      h-9
                      rounded-lg
                      items-center
                      justify-center
                      text-gray-500
                      hover:text-green-400
                      hover:bg-green-500/10
                      transition
                    "
                    title="View analysis"
                  >
                    <ArrowRight size={18} />
                  </Link>

                </div>

              </motion.div>

            ))
          ) : (

            <div className="py-16 text-center">

              <Search
                size={30}
                className="text-gray-600 mx-auto mb-4"
              />

              <p className="font-semibold">
                No rides found
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Try changing your search or filter.
              </p>

            </div>

          )}

        </div>

        <p className="text-gray-600 text-xs text-center mt-5">
          VeroPay's fairness estimates are intended to help identify
          potential payment discrepancies.
        </p>

      </div>
    </Layout>
  );
}

export default RideHistory;