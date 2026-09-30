import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import LoadingScreen from "./loading";
import ApplicationStatus from "./status";
import { usePageTitle } from "../../hooks/pageTitle";

import { getClaimableUnits, submitApplication } from "../../api/registrations.js";

const STEPS = ["Basic Info", "Set Password", "ID Validation", "Verification"];

/* ---------------- Step indicator ---------------- */

function StepIndicator({ current }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-3 px-2 sm:gap-x-3">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className="flex shrink-0 items-center gap-1.5 sm:gap-3"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs ${
                i < current
                  ? "bg-[#F5D000] text-[#1A1A2E]"
                  : i === current
                  ? "bg-[#2E3192] text-white shadow-md"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </div>

            <span
              className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-300 sm:text-sm ${
                i <= current ? "text-[#1A1A2E]" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>

          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-3 shrink-0 transition-colors duration-300 sm:w-10 ${
                i < current ? "bg-[#F5D000]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Card Header ---------------- */

function RegisterHeader({ current }) {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <div className="mb-4 h-12 w-auto">
        <img
          src="/assets/logo_1.png"
          alt="HOAMS Logo"
          className="h-full w-auto object-contain"
        />
      </div>
      <h1 className="mb-6 text-3xl font-black tracking-tight text-[#1A1A2E]">
        Register Account
      </h1>
      <StepIndicator current={current} />
    </div>
  );
}

/* ---------------- Shared fields ---------------- */

function Field({ label, value, onChange, className = "", type = "text", disabled = false, placeholder = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200 ${
          disabled
            ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            : "border-[#2E3192]/20 bg-white text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10"
        }`}
      />
    </div>
  );
}

function SearchDropdownField({ label, displayValue, onSelectUnit, options, className = "", placeholder = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter options based on block_and_lot query
  const filteredOptions = options.filter((unit) =>
    (unit.block_and_lot || "").toLowerCase().includes((displayValue || "").toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
          {label}
        </label>
      )}

      <input
        type="text"
        value={displayValue}
        placeholder={placeholder}
        data-dropdown-field
        onChange={(e) => {
          onSelectUnit({ id: null, block_and_lot: e.target.value });
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="w-full rounded-2xl border border-[#2E3192]/20 bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition-all duration-200 placeholder:text-[#1A1A2E]/30 focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10"
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-black/5">
          {filteredOptions.map((unit) => (
            <li
              key={unit.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectUnit(unit);
                setIsOpen(false);
              }}
              className="cursor-pointer px-4 py-2.5 text-sm text-[#1A1A2E] transition-colors hover:bg-[#2E3192]/5"
            >
              {unit.block_and_lot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Step 1: Basic Info ---------------- */

function BasicInfoStep({ data, setData, onNext, onGoToLogin, onGoToCheckStatus }) {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const claimableUnits = await getClaimableUnits();
        if (Array.isArray(claimableUnits)) {
          setUnits(claimableUnits);
        }
      } catch (err) {
        console.error("Failed to load claimable units:", err);
      }
    };
    fetchData();
  }, []);

  const handleUnitSelect = (selectedUnit) => {
    setData({
      ...data,
      unitId: selectedUnit.id,
      blockLot: selectedUnit.block_and_lot,
    });
  };

  const isStepValid = data.firstName && data.lastName && data.unitId && data.email;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-5 text-lg font-bold text-[#1A1A2E]">Personal Info</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field
              className="min-w-0 flex-1"
              label="First Name"
              value={data.firstName}
              placeholder="e.g. Juan"
              onChange={(v) => setData({ ...data, firstName: v })}
            />
            <Field
              className="min-w-0 flex-1"
              label="Last Name"
              value={data.lastName}
              placeholder="e.g. Dela Cruz"
              onChange={(v) => setData({ ...data, lastName: v })}
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field
              className="w-full sm:w-32"
              label="M.I."
              value={data.middleInitial}
              placeholder="e.g. A"
              onChange={(v) => setData({ ...data, middleInitial: v })}
            />
            <SearchDropdownField
              className="min-w-0 flex-1"
              label="Block & Lot No."
              displayValue={data.blockLot}
              placeholder="Select your property unit"
              onSelectUnit={handleUnitSelect}
              options={units}
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-[#2E3192]/10" />

      <div>
        <h2 className="mb-5 text-lg font-bold text-[#1A1A2E]">Contact Info</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            className="min-w-0 flex-1"
            type="email"
            label="Email Address"
            value={data.email}
            placeholder="name@example.com"
            onChange={(v) => setData({ ...data, email: v })}
          />
          <Field
            className="min-w-0 flex-1"
            type="tel"
            label="Phone Number"
            value={data.phone}
            placeholder="0912 345 6789"
            onChange={(v) => setData({ ...data, phone: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row sm:gap-6">
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-xs font-medium text-[#1A1A2E]/70 hover:text-[#1A1A2E]"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#2E3192] underline underline-offset-2">
              Login here
            </span>
          </button>

          <button
            type="button"
            onClick={onGoToCheckStatus}
            className="text-xs font-medium text-[#1A1A2E]/70 hover:text-[#1A1A2E]"
          >
            Already registered an account?{" "}
            <span className="font-bold text-[#2E3192] underline underline-offset-2">
              Check status here
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className="w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 2: Add Password ---------------- */

function PasswordStep({ data, setData, onNext, onBack, isPasswordLocked }) {
  const isPasswordValid = data.password && data.password === data.confirmPassword;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Set Your Password</h2>
      <p className="mt-2 text-sm text-[#1A1A2E]/60">
        {isPasswordLocked 
          ? "Your password has already been set and is securely locked for your application review."
          : "Create a secure password to protect your account and sign in later."}
      </p>

      <div className="mt-8 flex w-full flex-col gap-4 text-left">
        <Field
          label="Password"
          type="password"
          value={data.password}
          placeholder="Enter a secure password"
          disabled={isPasswordLocked}
          onChange={(v) => setData({ ...data, password: v })}
        />
        <Field
          label="Confirm Password"
          type="password"
          value={data.confirmPassword}
          placeholder="Re-enter your password"
          disabled={isPasswordLocked}
          onChange={(v) => setData({ ...data, confirmPassword: v })}
        />
        {!isPasswordLocked && data.confirmPassword && data.password !== data.confirmPassword && (
          <p className="text-xs font-medium text-rose-500">
            Passwords do not match.
          </p>
        )}
      </div>

      <div className="mt-10 flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 sm:w-auto"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isPasswordValid}
          className="w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 3: ID Validation ---------------- */

function IDValidationStep({ data, setData, onNext, onBack }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({ ...data, idFile: file });
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <h2 className="text-xl font-bold text-[#1A1A2E]">ID Verification</h2>
      <p className="mt-2 text-sm text-[#1A1A2E]/60">
        Upload a clear photo of a valid government ID.
      </p>

      <label className="mt-8 w-full cursor-pointer">
        <span className="inline-block w-full rounded-2xl border border-[#2E3192]/20 bg-gray-50 px-8 py-3.5 text-sm font-bold text-[#1A1A2E] transition-colors duration-200 hover:bg-gray-100">
          Choose Image
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </label>

      <div className="mt-4 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#2E3192]/10 bg-gray-50">
        {data.idFile ? (
          <img
            src={URL.createObjectURL(data.idFile)}
            alt="ID preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-4 text-xs font-medium text-gray-400">
            No file attached yet
          </span>
        )}
      </div>

      <div className="mt-10 flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 sm:w-auto"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!data.idFile}
          className="w-full rounded-2xl bg-[#2E3192] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1F2266] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 4: Verification / status ---------------- */

function VerificationStep({ data, onProceedToDashboard, onRetryRegistration }) {
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState("pending");
  const [referenceNo, setReferenceNo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function processSubmission() {
      try {
        setVerifying(true);
        setErrorMessage("");

        const formData = new FormData();
        formData.append("first_name", data.firstName);
        formData.append("last_name", data.lastName);
        formData.append("middle_initial", data.middleInitial || "");
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("phone", data.phone || "");
        formData.append("unit", data.unitId); // Submits unit Primary Key (PK)

        if (data.idFile) {
          formData.append("id_document", data.idFile);
        }

        const response = await submitApplication(formData);

        if (isMounted) {
          setStatus(response?.status || "pending");
          setReferenceNo(response?.reference_no || "");
          setVerifying(false);
        }
      } catch (err) {
        if (isMounted) {
          setVerifying(false);
          setStatus("rejected");
          setErrorMessage(
            err.response?.data?.detail ||
              err.message ||
              "An application for this email is already pending review."
          );
        }
      }
    }

    processSubmission();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const handleCopyReference = () => {
    if (referenceNo) {
      navigator.clipboard.writeText(referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (verifying) {
    return (
      <div className="py-12">
        <LoadingScreen
          message="Submitting your registration..."
          subMessage="Hang tight while we send your details for review."
        />
      </div>
    );
  }

  return (
    <div className="-my-6 flex flex-col gap-6">
      {/* Reference Number Banner */}
      {referenceNo && (
        <div className="rounded-2xl border border-[#2E3192]/20 bg-[#2E3192]/5 p-5 text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">
            Application Reference Number
          </span>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-2xl font-black tracking-widest text-[#1A1A2E]">
              {referenceNo}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="flex items-center gap-1.5 rounded-xl border border-[#2E3192]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#2E3192] shadow-sm transition-all hover:bg-gray-50 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-[#1A1A2E]/60">
            Please save this reference number to check your registration status later.
          </p>
        </div>
      )}

      <ApplicationStatus
        status={status}
        referenceNo={referenceNo}
        errorMessage={errorMessage}
        onProceed={onProceedToDashboard}
        onRetry={onRetryRegistration}
      />
    </div>
  );
}

/* ---------------- Flow controller ---------------- */

export default function RegisterFlow() {
  usePageTitle("Register");
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [isPasswordLocked, setIsPasswordLocked] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    unitId: null, // Stores Property PK
    blockLot: "", // Displays human-readable Block and Lot
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idFile: null,
  });

  const handleEnterKey = (e) => {
    if (e.key !== "Enter") return;

    if (e.target.closest("[data-dropdown-field]")) return;

    e.preventDefault();

    if (step === 0) {
      if (data.firstName && data.lastName && data.unitId && data.email) {
        setStep(1);
      }
    } else if (step === 1) {
      const isPasswordValid = data.password && data.password === data.confirmPassword;
      if (isPasswordValid) setStep(2);
    } else if (step === 2) {
      if (data.idFile) setStep(3);
    }
  };

  return (
    <div
      onKeyDown={handleEnterKey}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-12"
    >
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: "url('/assets/magallanes-village.jpg')",
        }}
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

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="rounded-[2.5rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20 sm:p-12">
          <RegisterHeader current={step} />

          <main>
            {step === 0 && (
              <BasicInfoStep
                data={data}
                setData={setData}
                onNext={() => setStep(1)}
                onGoToLogin={() => navigate("/login")}
                onGoToCheckStatus={() => navigate("/registration-status")}
              />
            )}

            {step === 1 && (
              <PasswordStep
                data={data}
                setData={setData}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
                isPasswordLocked={isPasswordLocked}
              />
            )}

            {step === 2 && (
              <IDValidationStep
                data={data}
                setData={setData}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <VerificationStep
                data={data}
                onProceedToDashboard={() => navigate("/resident-dashboard")}
                onRetryRegistration={() => {
                  setIsPasswordLocked(true);
                  setStep(0);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}