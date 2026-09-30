import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks/pageTitle";
import { Mail, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { login } from "../../api/users";
import { getDashboardPath } from "../../utils/navigation.js";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      setUser(res.user || null);
      navigate(getDashboardPath(res.user || { roles: [] }));
    } catch (err) {
      console.error("Login failed", err);

      // Extract Django REST framework / API error messages gracefully
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid email or password. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-12">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
        style={{
          backgroundImage: "url('/assets/magallanes-village.jpg')",
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-[#17184A]/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F2266]/70 via-[#2E3192]/50 to-[#4B4FC4]/40" />

      {/* Decorative Glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#F5D000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1A1A2E]/40 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-[#1A1A2E]/60 sm:left-6 sm:top-6 sm:gap-2 sm:rounded-xl sm:bg-white/10 sm:px-4 sm:py-2 sm:text-xs sm:hover:bg-white/20"
      >
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Back to Home
      </button>

      {/* Main Card */}
      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="rounded-[2.5rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-12 w-auto">
              <img
                src="/assets/logo_1.png"
                alt="HOAMS Logo"
                className="h-full w-auto object-contain"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#1A1A2E]">
              Resident Login
            </h1>

            <p className="mt-1.5 text-xs text-[#1A1A2E]/60">
              Access your HOAMS dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            {/* Failure / Error Banner */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600 animate-in fade-in zoom-in-95">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1A1A2E]"
              >
                Email Address
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#2E3192]/40">
                  <Mail size={18} />
                </span>

                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={form.email}
                  onChange={(e) => {
                    if (error) setError("");
                    setForm({ ...form, email: e.target.value });
                  }}
                  className="w-full rounded-2xl border border-[#2E3192]/20 bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A2E] outline-none transition-all duration-200 placeholder:text-[#1A1A2E]/30 focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10 disabled:bg-gray-50 disabled:opacity-60"
                  placeholder="resident@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1A1A2E]"
              >
                Password
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#2E3192]/40">
                  <Lock size={18} />
                </span>

                <input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  value={form.password}
                  onChange={(e) => {
                    if (error) setError("");
                    setForm({ ...form, password: e.target.value });
                  }}
                  className="w-full rounded-2xl border border-[#2E3192]/20 bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A2E] outline-none transition-all duration-200 placeholder:text-[#1A1A2E]/30 focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10 disabled:bg-gray-50 disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 font-medium text-[#1A1A2E]/80">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#2E3192]/30 accent-[#2E3192] disabled:opacity-50"
                />
                Remember me
              </label>

              <a
                href="#forgot"
                className="font-semibold text-[#2E3192] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button with Spinner */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E3192] py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Registration Redirect */}
            <div className="pt-2 text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/register")}
                className="text-xs font-medium text-[#1A1A2E]/70 hover:text-[#1A1A2E] disabled:opacity-50"
              >
                Don't have an account yet?{" "}
                <span className="font-bold text-[#2E3192] underline underline-offset-2">
                  Register here
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}