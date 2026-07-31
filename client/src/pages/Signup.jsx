import { useState } from "react";
import { Link } from "react-router-dom";

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
} from "lucide-react";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [rcFile, setRcFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setRcFile(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    /*
      BACKEND TODO

      POST /api/auth/register

      Because RC is a file, send this using FormData.

      const data = new FormData();

      data.append("name", form.name);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("password", form.password);
      data.append("rc", rcFile);

      Then POST data to the backend.
    */

    console.log({
      ...form,
      rcFile,
    });
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/5 relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">

              <ShieldCheck
                size={24}
                className="text-[#07110B]"
              />

            </div>

            <div>
              <h1 className="text-xl font-bold">
                VeroPay
              </h1>

              <p className="text-xs text-gray-500">
                AI Worker Companion
              </p>
            </div>

          </Link>


          {/* Copy */}
          <div className="max-w-lg">

            <p className="text-green-400 text-sm font-semibold mb-4">
              BUILT FOR GIG WORKERS
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Your work.
              <br />

              <span className="text-green-400">
                Your earnings.
              </span>

              <br />
              Your data.
            </h2>

            <p className="text-gray-400 text-lg leading-8 mt-6">
              Create your VeroPay account to track rides,
              understand your earnings and identify potential
              payment discrepancies.
            </p>

          </div>


          <div className="flex items-center gap-2 text-gray-600 text-xs">

            <ShieldCheck size={14} />

            Your documents should be securely handled by the
            backend and never exposed publicly.

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex justify-center overflow-y-auto">

        <div className="w-full max-w-lg px-6 py-12 lg:py-14">

          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-3 mb-10"
          >

            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">

              <ShieldCheck
                size={22}
                className="text-[#07110B]"
              />

            </div>

            <span className="font-bold text-xl">
              VeroPay
            </span>

          </Link>


          {/* Header */}
          <div className="mb-8">

            <h1 className="text-4xl font-bold">
              Create your account
            </h1>

            <p className="text-gray-400 mt-3">
              Set up your worker profile to get started.
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}
            <div>

              <label className="text-sm font-semibold block mb-2">
                Full name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="
                    w-full
                    bg-[#131C2E]
                    border
                    border-white/10
                    focus:border-green-500/50
                    rounded-xl
                    pl-12
                    pr-4
                    py-4
                    outline-none
                    transition
                    placeholder:text-gray-600
                  "
                />

              </div>

            </div>


            {/* EMAIL */}
            <div>

              <label className="text-sm font-semibold block mb-2">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="
                    w-full
                    bg-[#131C2E]
                    border
                    border-white/10
                    focus:border-green-500/50
                    rounded-xl
                    pl-12
                    pr-4
                    py-4
                    outline-none
                    transition
                    placeholder:text-gray-600
                  "
                />

              </div>

            </div>


            {/* PHONE */}
            <div>

              <label className="text-sm font-semibold block mb-2">
                Phone number
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                  className="
                    w-full
                    bg-[#131C2E]
                    border
                    border-white/10
                    focus:border-green-500/50
                    rounded-xl
                    pl-12
                    pr-4
                    py-4
                    outline-none
                    transition
                    placeholder:text-gray-600
                  "
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div>

              <label className="text-sm font-semibold block mb-2">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  className="
                    w-full
                    bg-[#131C2E]
                    border
                    border-white/10
                    focus:border-green-500/50
                    rounded-xl
                    pl-12
                    pr-12
                    py-4
                    outline-none
                    transition
                    placeholder:text-gray-600
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-white
                    cursor-pointer
                  "
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}
            <div>

              <label className="text-sm font-semibold block mb-2">
                Confirm password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Re-enter your password"
                  className="
                    w-full
                    bg-[#131C2E]
                    border
                    border-white/10
                    focus:border-green-500/50
                    rounded-xl
                    pl-12
                    pr-12
                    py-4
                    outline-none
                    transition
                    placeholder:text-gray-600
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-white
                    cursor-pointer
                  "
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* RC UPLOAD */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-semibold">
                  Vehicle RC
                </label>

                <span className="text-xs text-gray-500">
                  PDF, JPG or PNG
                </span>

              </div>


              {!rcFile ? (

                <label
                  className="
                    border
                    border-dashed
                    border-white/15
                    hover:border-green-500/40
                    bg-[#131C2E]
                    rounded-xl
                    px-5
                    py-7
                    flex
                    flex-col
                    items-center
                    justify-center
                    cursor-pointer
                    transition
                  "
                >

                  <div
                    className="
                      w-11
                      h-11
                      bg-green-500/10
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      mb-3
                    "
                  >

                    <Upload
                      size={20}
                      className="text-green-400"
                    />

                  </div>

                  <p className="font-semibold text-sm">
                    Upload Registration Certificate
                  </p>

                  <p className="text-gray-500 text-xs mt-2">
                    Click to select your vehicle RC
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />

                </label>

              ) : (

                <div
                  className="
                    bg-green-500/5
                    border
                    border-green-500/20
                    rounded-xl
                    p-4
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="bg-green-500/10 p-3 rounded-xl">

                      <FileText
                        size={19}
                        className="text-green-400"
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-sm truncate">
                        {rcFile.name}
                      </p>

                      <div className="flex items-center gap-1 text-green-400 text-xs mt-1">

                        <Check size={13} />

                        Ready to upload

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => setRcFile(null)}
                    className="
                      text-gray-500
                      hover:text-red-400
                      transition
                      cursor-pointer
                      shrink-0
                    "
                  >
                    <X size={19} />
                  </button>

                </div>

              )}

            </div>


            {/* SUBMIT */}
            <button
              type="submit"
              className="
                w-full
                bg-green-500
                hover:bg-green-400
                text-[#07110B]
                font-bold
                rounded-xl
                py-4
                flex
                items-center
                justify-center
                gap-2
                transition
                cursor-pointer
              "
            >

              Create Account

              <ArrowRight size={18} />

            </button>

          </form>


          {/* LOGIN */}
          <p className="text-center text-gray-500 text-sm mt-7">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;