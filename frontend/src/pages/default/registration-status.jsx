import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import { usePageTitle } from "../../hooks/pageTitle";
import { checkApplicationStatus } from "../../api/registrations.js";

/* ---------------- Shared field ---------------- */
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#2E3192]/20 bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition-all duration-200 placeholder:text-[#1A1A2E]/30 focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10"
      />
    </div>
  );
}

export default function RegistrationStatus() {
  usePageTitle("Check Status");
  const navigate = useNavigate();

  const [referenceNo, setReferenceNo] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [statusResult, setStatusResult] = useState(null); // stores backend response object
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    const trimmedRef = referenceNo.trim();
    if (!trimmedRef) return;

    setIsChecking(true);
    setErrorMessage("");
    setStatusResult(null);

    try {
      const response = await checkApplicationStatus(trimmedRef);
      setStatusResult(response);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
          err.message ||
          "No application found matching this reference number. Please verify and try again."
      );
    } finally {
      setIsChecking(false);
    }
  };

  const resetSearch = () => {
    setStatusResult(null);
    setErrorMessage("");
    setReferenceNo("");
  };

  // Determine normalized status key from backend response
  const currentStatus = (statusResult?.status || "").toLowerCase();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-12">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/public/assets/magallanes-village.jpg')" }}
      />
      <div className="absolute inset-0 bg-[#17184A]/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F2266]/70 via-[#2E3192]/50 to-[#4B4FC4]/40" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#F5D000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <button
        onClick={() => navigate("/")}
        className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1A1A2E]/40 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-[#1A1A2E]/60 sm:left-6 sm:top-6 sm:gap-2 sm:rounded-xl sm:bg-white/10 sm:px-4 sm:py-2 sm:text-xs sm:hover:bg-white/20"
      >
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Back to Home
      </button>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="rounded-[2.5rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20 sm:p-10">
          
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 h-12 w-auto">
              <img
                src="/public/assets/logo_1.png"
                alt="HOAMS Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1A1A2E]">
              Application Status
            </h1>
            {!statusResult && (
              <p className="mt-2 text-sm text-[#1A1A2E]/60">
                Enter your reference number below to check the current status of your registration.
              </p>
            )}
          </div>

          <main>
            {!statusResult && (
              <form onSubmit={handleCheckStatus} className="flex flex-col gap-5">
                <Field
                  label="Reference Number"
                  placeholder="e.g. REG-2026-XXXXX"
                  value={referenceNo}
                  onChange={setReferenceNo}
                />

                {errorMessage && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-600">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!referenceNo.trim() || isChecking}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isChecking ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Checking records...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Check Status
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Status Results Views */}
            {currentStatus === "pending" && (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E]">Under Review</h3>
                <p className="mt-2 text-sm text-[#1A1A2E]/70">
                  Your application is currently being reviewed by the HOA administration. This process typically takes 1-2 business days.
                </p>
                <button
                  type="button"
                  onClick={resetSearch}
                  className="mt-8 text-sm font-bold text-[#2E3192] hover:underline"
                >
                  Check another application
                </button>
              </div>
            )}

            {currentStatus === "approved" && (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E]">Approved!</h3>
                <p className="mt-2 text-sm text-[#1A1A2E]/70">
                  Your residency application has been approved. You can now log in to access the resident dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-8 w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95"
                >
                  Proceed to Login
                </button>
              </div>
            )}

            {currentStatus === "rejected" && (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <XCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E]">Application Denied</h3>
                <div className="mt-4 w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left">
                  <p className="text-sm text-rose-600">
                    {statusResult?.rejection_reason ||
                      "Your application could not be verified. Please review your submitted details and ensure your uploaded ID photo is clear and valid."}
                  </p>
                </div>
                <div className="mt-6 flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95"
                  >
                    Submit New Application
                  </button>
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700"
                  >
                    Check another application
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}