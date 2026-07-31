import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  CircleIndianRupee,
  Clock3,
  MapPin,
  MessageSquareText,
  Save,
  ShieldAlert,
  Sparkles,
  TrendingDown,
} from "lucide-react";

import Layout from "../components/layout/Layout";


function RideAnalysis() {
  return (
    <Layout>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >

        {/* Back */}
        <Link
          to="/add-ride"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-7"
        >
          <ArrowLeft size={17} />
          Back to ride entry
        </Link>


        {/* Header */}
        <div className="mb-8">

          <div className="flex items-center gap-2 text-green-400 mb-3">
            <Sparkles size={18} />

            <span className="text-sm font-semibold">
              VeroPay AI Analysis
            </span>
          </div>

          <h1 className="text-4xl font-bold">
            Ride analysis
          </h1>

          <p className="text-gray-400 mt-3">
            VeroPay analyzed your payout, distance and working time.
          </p>

        </div>


        {/* Main Warning */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 mb-6">

          <div className="flex items-start justify-between gap-8">

            <div className="flex items-start gap-5">

              <div className="bg-red-500/10 p-4 rounded-2xl">

                <ShieldAlert
                  size={30}
                  className="text-red-400"
                />

              </div>

              <div>

                <div className="flex items-center gap-3 mb-3">

                  <span className="text-red-400 text-sm font-semibold">
                    POSSIBLE UNDERPAYMENT
                  </span>

                  <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full">
                    AI DETECTED
                  </span>

                </div>

                <h2 className="text-3xl font-bold">
                  You may have lost ₹44
                </h2>

                <p className="text-gray-400 mt-3 max-w-2xl leading-7">
                  This ride paid approximately 23.7% below VeroPay's
                  estimated fair compensation based on its distance,
                  duration and payout.
                </p>

              </div>

            </div>


            {/* Score */}
            <div className="hidden md:block text-right shrink-0">

              <p className="text-gray-500 text-sm">
                Fairness Score
              </p>

              <p className="text-4xl font-bold text-yellow-400 mt-2">
                76
              </p>

              <p className="text-gray-500 text-sm">
                / 100
              </p>

            </div>

          </div>

        </div>


        {/* Payment Stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">

          <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-6">

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CircleIndianRupee size={17} />
              Actual payout
            </div>

            <p className="text-3xl font-bold mt-4">
              ₹142
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Amount received
            </p>

          </div>


          <div className="bg-[#131C2E] border border-green-500/10 rounded-2xl p-6">

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Check size={17} className="text-green-400" />
              Estimated fair pay
            </div>

            <p className="text-3xl font-bold text-green-400 mt-4">
              ₹186
            </p>

            <p className="text-gray-500 text-sm mt-2">
              VeroPay estimate
            </p>

          </div>


          <div className="bg-[#131C2E] border border-red-500/10 rounded-2xl p-6">

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <TrendingDown size={17} className="text-red-400" />
              Pay difference
            </div>

            <p className="text-3xl font-bold text-red-400 mt-4">
              -₹44
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Potential lost earnings
            </p>

          </div>

        </div>


        {/* Ride Details */}
        <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-7 mb-6">

          <p className="text-gray-400 text-sm mb-5">
            RIDE DETAILS
          </p>

          <div className="grid md:grid-cols-4 gap-6">

            <div>
              <p className="text-gray-500 text-sm">
                Platform
              </p>

              <p className="font-semibold mt-2">
                Zomato
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={15} />
                Distance
              </div>

              <p className="font-semibold mt-2">
                11.2 km
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock3 size={15} />
                Duration
              </div>

              <p className="font-semibold mt-2">
                38 minutes
              </p>
            </div>


            <div>
              <p className="text-gray-500 text-sm">
                Effective rate
              </p>

              <p className="font-semibold mt-2">
                ₹12.68/km
              </p>
            </div>

          </div>

        </div>


        {/* AI Explanation */}
        <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-8 mb-6">

          <div className="flex items-start gap-5">

            <div className="bg-green-500/10 p-3 rounded-xl shrink-0">

              <Bot
                size={25}
                className="text-green-400"
              />

            </div>

            <div>

              <div className="flex items-center gap-3 mb-3">

                <h2 className="text-xl font-bold">
                  VeroPay AI explains
                </h2>

                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full">
                  AI
                </span>

              </div>

              <p className="text-gray-300 leading-8">
                Your payout appears lower than expected for a ride of
                this distance and duration. You earned approximately
                ₹12.68 per kilometre, while VeroPay estimates that fair
                compensation for this ride would be around ₹16.60 per
                kilometre.
              </p>

              <p className="text-gray-400 leading-8 mt-4">
                The longer ride duration also reduced your effective
                hourly earnings. Based on these factors, we estimate
                that you may have been underpaid by approximately ₹44.
              </p>

            </div>

          </div>

        </div>


        {/* AI Recommendation */}
        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-7 mb-8">

          <div className="flex gap-4">

            <AlertTriangle
              size={23}
              className="text-green-400 shrink-0 mt-1"
            />

            <div>

              <p className="font-semibold text-green-400">
                VeroPay Recommendation
              </p>

              <p className="text-gray-300 mt-2 leading-7">
                Keep a record of this ride and consider raising a
                payment review request with the platform. VeroPay can
                generate a professional complaint using your ride
                details.
              </p>

            </div>

          </div>

        </div>


        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-4 pb-10">

          <button
            className="
              bg-green-500
              hover:bg-green-400
              text-[#07110B]
              font-bold
              py-4
              px-5
              rounded-xl
              transition
              flex
              items-center
              justify-center
              gap-2
              cursor-pointer
            "
          >
            <MessageSquareText size={19} />
            Generate Complaint
          </button>


          <Link
            to="/chat"
            className="
              bg-[#131C2E]
              hover:bg-[#19253A]
              border
              border-white/10
              font-semibold
              py-4
              px-5
              rounded-xl
              transition
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Bot size={19} />
            Ask VeroPay AI
          </Link>


          <button
            className="
              bg-[#131C2E]
              hover:bg-[#19253A]
              border
              border-white/10
              font-semibold
              py-4
              px-5
              rounded-xl
              transition
              flex
              items-center
              justify-center
              gap-2
              cursor-pointer
            "
          >
            <Save size={19} />
            Save Analysis
          </button>

        </div>

      </motion.div>

    </Layout>
  );
}

export default RideAnalysis;