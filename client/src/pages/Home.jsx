import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Layout from "../components/layout/Layout";

function Home() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <section className="min-h-[72vh] flex items-center justify-center py-16">

          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                bg-green-500/10
                border
                border-green-500/20
                text-green-400
                text-sm
                font-semibold
                mb-7
              "
            >
              <Sparkles size={15} />
              AI-POWERED WORKER COMPANION
            </div>

            {/* Heading */}
            <h1
              className="
                text-5xl
                md:text-7xl
                font-extrabold
                tracking-tight
                leading-[1.05]
                text-white
              "
            >
              Know Your Worth.
              <br />

              <span className="text-green-400">
                Every Ride.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mt-7
                text-lg
                md:text-xl
                text-slate-400
                max-w-2xl
                mx-auto
                leading-relaxed
              "
            >
              VeroPay analyzes your rides, identifies potential
              underpayments and helps you make smarter decisions
              about your gig work.
            </p>

            {/* CTA */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                justify-center
                items-center
                gap-4
                mt-9
              "
            >
              <Link
                to="/signup"
                className="
                  bg-green-500
                  hover:bg-green-400
                  text-[#07110B]
                  px-7
                  py-3.5
                  rounded-xl
                  font-bold
                  flex
                  items-center
                  gap-2
                  transition
                  shadow-lg
                  shadow-green-500/10
                "
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="
                  border
                  border-white/10
                  hover:border-green-500/40
                  hover:bg-green-500/5
                  text-white
                  px-7
                  py-3.5
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Sign In
              </Link>
            </div>

            {/* Trust line */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                mt-7
                text-xs
                text-slate-500
              "
            >
              <ShieldCheck
                size={14}
                className="text-green-500"
              />

              Built to help gig workers understand their earnings.
            </div>

          </div>

        </section>


        {/* FEATURES */}
        <section className="pb-20">

          <div className="grid md:grid-cols-3 gap-5">

            {/* Fair Pay */}
            <div
              className="
                bg-[#131C2E]
                border
                border-white/5
                rounded-2xl
                p-6
                hover:border-green-500/20
                transition
              "
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-green-500/10
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <ShieldCheck
                  size={21}
                  className="text-green-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                Fair Pay Analysis
              </h3>

              <p className="text-slate-400 text-sm leading-6 mt-2">
                Analyze each ride and identify potential differences
                between your payout and VeroPay's estimated fair
                compensation.
              </p>
            </div>


            {/* Earnings */}
            <div
              className="
                bg-[#131C2E]
                border
                border-white/5
                rounded-2xl
                p-6
                hover:border-green-500/20
                transition
              "
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-green-500/10
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <ChartNoAxesCombined
                  size={21}
                  className="text-green-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                Earnings Intelligence
              </h3>

              <p className="text-slate-400 text-sm leading-6 mt-2">
                Understand your earnings patterns, working hours and
                ride history through a single worker-focused
                dashboard.
              </p>
            </div>


            {/* AI */}
            <div
              className="
                bg-[#131C2E]
                border
                border-white/5
                rounded-2xl
                p-6
                hover:border-green-500/20
                transition
              "
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-green-500/10
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <Bot
                  size={21}
                  className="text-green-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                VeroPay AI
              </h3>

              <p className="text-slate-400 text-sm leading-6 mt-2">
                Ask questions about your rides, understand possible
                underpayments and get actionable insights from your
                work data.
              </p>
            </div>

          </div>

        </section>

      </div>
    </Layout>
  );
}

export default Home;