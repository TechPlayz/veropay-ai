import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Upload,
  Image,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

import Layout from "../components/layout/Layout";

function AddRide() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend integration will come later.
    // For now, navigate to the mocked AI analysis page.
    navigate("/analysis");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">

          <div className="flex items-center gap-2 text-green-400 mb-3">
            <Sparkles size={18} />

            <span className="text-sm font-semibold">
              AI Ride Analysis
            </span>
          </div>

          <h1 className="text-4xl font-bold">
            Analyze a ride
          </h1>

          <p className="text-gray-400 mt-3">
            Upload an earnings screenshot or enter the ride details
            manually. VeroPay will analyze whether you were paid fairly.
          </p>

        </div>


        {/* Screenshot Upload */}
        <div className="bg-[#131C2E] rounded-2xl p-8 border border-white/5">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-green-500/10 p-3 rounded-xl">
              <Image
                size={24}
                className="text-green-400"
              />
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                Upload earnings screenshot
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Let AI extract your ride details automatically.
              </p>
            </div>

          </div>


          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />


          {!selectedFile ? (

            /* Upload Area */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                w-full
                border-2
                border-dashed
                border-gray-700
                hover:border-green-500/70
                rounded-2xl
                py-12
                transition
                group
                cursor-pointer
              "
            >

              <div className="flex flex-col items-center">

                <div
                  className="
                    bg-[#1B263B]
                    group-hover:bg-green-500/10
                    p-4
                    rounded-2xl
                    transition
                  "
                >

                  <Upload
                    size={30}
                    className="
                      text-gray-400
                      group-hover:text-green-400
                      transition
                    "
                  />

                </div>

                <p className="font-semibold mt-5">
                  Drop your screenshot here
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  or click to browse
                </p>

                <p className="text-gray-600 text-xs mt-4">
                  PNG, JPG or WEBP
                </p>

              </div>

            </button>

          ) : (

            /* Selected Screenshot */
            <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="bg-green-500/10 p-3 rounded-xl">

                    <Image
                      size={22}
                      className="text-green-400"
                    />

                  </div>

                  <div>

                    <p className="font-semibold">
                      {selectedFile.name}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-400 transition cursor-pointer"
                >
                  <X size={22} />
                </button>

              </div>

            </div>

          )}


          {/* AI Notice */}
          <div className="flex items-center gap-3 mt-5 text-sm text-gray-400">

            <ShieldCheck
              size={17}
              className="text-green-400"
            />

            <span>
              AI will extract fare, distance and duration from your screenshot.
            </span>

          </div>

        </div>


        {/* Divider */}
        <div className="flex items-center gap-5 my-8">

          <div className="h-px bg-white/10 flex-1" />

          <span className="text-gray-500 text-sm font-medium">
            OR ENTER MANUALLY
          </span>

          <div className="h-px bg-white/10 flex-1" />

        </div>


        {/* Manual Ride Form */}
        <div className="bg-[#131C2E] rounded-2xl p-8 border border-white/5">

          <div className="mb-7">

            <h2 className="text-xl font-semibold">
              Ride details
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Enter the information from your completed ride.
            </p>

          </div>


          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >

            {/* Platform */}
            <div>

              <label className="block text-sm font-medium mb-2">
                Platform
              </label>

              <select
                className="
                  w-full
                  bg-[#1B263B]
                  border
                  border-gray-700
                  rounded-xl
                  px-4
                  py-3.5
                  text-white
                  outline-none
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-500/10
                  transition
                "
              >
                <option>Swiggy</option>
                <option>Zomato</option>
                <option>Uber</option>
                <option>Rapido</option>
                <option>Blinkit</option>
                <option>Other</option>
              </select>

            </div>


            {/* Fare + Distance */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Fare */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Fare received
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="
                      w-full
                      bg-[#1B263B]
                      border
                      border-gray-700
                      rounded-xl
                      pl-9
                      pr-4
                      py-3.5
                      text-white
                      placeholder:text-gray-600
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-500/10
                      transition
                    "
                  />

                </div>

              </div>


              {/* Distance */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Distance
                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                    className="
                      w-full
                      bg-[#1B263B]
                      border
                      border-gray-700
                      rounded-xl
                      px-4
                      pr-14
                      py-3.5
                      text-white
                      placeholder:text-gray-600
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-500/10
                      transition
                    "
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    km
                  </span>

                </div>

              </div>

            </div>


            {/* Duration */}
            <div>

              <label className="block text-sm font-medium mb-2">
                Ride duration
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="
                    w-full
                    bg-[#1B263B]
                    border
                    border-gray-700
                    rounded-xl
                    px-4
                    pr-20
                    py-3.5
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-500/10
                    transition
                  "
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  minutes
                </span>

              </div>

            </div>


            {/* Analyze Button */}
            <button
              type="submit"
              className="
                w-full
                bg-green-500
                hover:bg-green-400
                text-[#07110B]
                font-bold
                py-4
                rounded-xl
                transition
                flex
                items-center
                justify-center
                gap-2
                cursor-pointer
                shadow-lg
                shadow-green-500/10
              "
            >

              Analyze Ride

              <ArrowRight size={19} />

            </button>

          </form>

        </div>


        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">

          <ShieldCheck size={15} />

          <span>
            VeroPay helps identify potential pay discrepancies using AI.
          </span>

        </div>

      </div>
    </Layout>
  );
}

export default AddRide;