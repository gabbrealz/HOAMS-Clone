import { useState, useEffect } from "react";

const REVIEW_WINDOW_MS = 24 * 60 * 60 * 1000; 

function formatDuration(ms) {
  if (ms <= 0) return "0h 0m 0s";

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h}h ${m}m ${s}s`;
}

function formatClock(date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ApplicationStatus({
  status = "pending",
  rejection = "", //ADMIN REJECTION MESSAGE
  onProceed,
  onRetry,
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center sm:py-20">
      <h2 className="mt-5 text-2xl font-black tracking-tight text-[#1A1A2E] sm:text-3xl">
        {status === "approved" && "Registration Confirmed!"}
        {status === "rejected" && "Registration Denied"}
      </h2>

      {status === "approved" && (
        <>
          <p className="mt-4 text-sm text-[#1A1A2E]/60">
            Your account has been successfully verified. Welcome to the community!
          </p>
          <div className="mt-8 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2E3192]/20 border-t-[#2E3192]" />
            <span className="ml-3 text-sm font-semibold text-[#2E3192]">Redirecting to dashboard...</span>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="mt-8 w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 sm:w-auto"
          >
            Go to Dashboard Now
          </button>
        </>
      )}

      {status === "rejected" && (
        <div className="mt-6 flex w-full flex-col items-center text-left">
          <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="mt-1 text-sm text-rose-600">{rejection}</p>
          </div>

          <div className="mt-6 w-full px-2">
            <h3 className="text-sm font-bold text-[#1A1A2E]">Steps to Re-register:</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-[#1A1A2E]/70">
              <li>Prepare a clear, unblurred photo of a valid government ID.</li>
              <li>Double-check that your inputted Block & Lot number matches your documents exactly.</li>
              <li>Submit a new application for administrative review.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="mt-10 w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 sm:w-auto"
          >
            Start Re-registration
          </button>
        </div>
      )}
    </div>
  );
}