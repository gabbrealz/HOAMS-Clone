import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Bell,
  Loader2,
} from "lucide-react";

import Sidebar from "../../components/user_admin/sidebar-user";
import { usePageTitle } from "../../hooks/pageTitle";
import { createStaffAccount } from "../../api/users";

const generatePassword = (length = 12) => {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return password;
};

function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-[#B69A00] sm:text-2xl">
          Create Admin Account
        </h1>

        <p className="mt-1 text-xs text-white">
          Creation of admin and board member accounts
        </p>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF0F7] text-[#2E3192] transition-colors hover:bg-[#E4E7F2]"
      >
        <Bell size={20} strokeWidth={1.75} />

        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  maxLength,
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-[#1A1A2E]"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={name !== "mi"}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
        />
      </div>
    </div>
  );
}

export default function CreateAdminPage() {
  usePageTitle("Admin");

  const [form, setForm] = useState({
    email: "",
    fname: "",
    mi: "",
    lname: "",
    phone: "",
  });

  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const regeneratePassword = () => {
    setPassword(generatePassword());
    setCopied(false);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy password:", error);
    }
  };

  const resetForm = () => {
    setForm({
      email: "",
      fname: "",
      mi: "",
      lname: "",
      phone: "",
    });

    setPassword(generatePassword());
    setShowPassword(false);
    setCopied(false);
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    if (isCreating) return;

    setIsCreating(true);

    const adminData = {
      email: form.email.trim(),
      first_name: form.fname.trim(),
      middle_initial: form.mi.trim(),
      last_name: form.lname.trim(),
      fname: form.fname.trim(),
      mi: form.mi.trim(),
      lname: form.lname.trim(),
      phone: form.phone.trim(),
      phone_number: form.phone.trim(),
      password,
    };

    try {
      await createStaffAccount(adminData);

      alert("Admin account created successfully!");

      resetForm();
    } catch (error) {
      console.error("Failed to create admin account:", error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong while creating the account.";
      alert(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-3 sm:p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(23, 24, 74, 0.72), rgba(23, 24, 74, 0.72)), url('/assets/magallanes-village.jpg')",
      }}
    >
      <div className="flex gap-3 sm:gap-4">
        <Sidebar />

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6"
        >
          <Header />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6"
          >
            <form onSubmit={handleCreateAdmin}>
              <div className="grid gap-4 lg:grid-cols-2">
                {/* ACCOUNT INFORMATION */}
                <motion.section
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.05,
                  }}
                  className="rounded-2xl bg-white p-5"
                >
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#1A1A2E]">
                      Account Information
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Enter the details of the new administrator.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <InputField
                      label="Email Address"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      icon={Mail}
                      type="email"
                    />

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-[#1A1A2E]">
                        Administrator Name
                      </label>

                      <div className="grid grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)] gap-2">
                        <div>
                          <input
                            type="text"
                            name="fname"
                            value={form.fname}
                            onChange={handleChange}
                            placeholder="First name"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                          />

                          <p className="mt-1.5 px-1 text-[10px] text-gray-400">
                            First Name
                          </p>
                        </div>

                        <div>
                          <input
                            type="text"
                            name="mi"
                            value={form.mi}
                            onChange={handleChange}
                            placeholder="M.I."
                            maxLength={3}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                          />

                          <p className="mt-1.5 px-1 text-[10px] text-gray-400">
                            M.I.
                          </p>
                        </div>

                        <div>
                          <input
                            type="text"
                            name="lname"
                            value={form.lname}
                            onChange={handleChange}
                            placeholder="Last name"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                          />

                          <p className="mt-1.5 px-1 text-[10px] text-gray-400">
                            Last Name
                          </p>
                        </div>
                      </div>
                    </div>

                    <InputField
                      label="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+63 917 000 0000"
                      icon={Phone}
                      type="tel"
                    />
                  </div>
                </motion.section>

                {/* PASSWORD */}
                <motion.section
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.1,
                  }}
                  className="rounded-2xl bg-white p-5"
                >
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#1A1A2E]">
                      Initial Password
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      A secure password is automatically generated for the new
                      administrator.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#D9DBE5] bg-[#F8F9FC] p-4">
                    <label
                      htmlFor="generated-password"
                      className="mb-2 block text-xs font-semibold text-[#1A1A2E]"
                    >
                      Generated Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="generated-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        readOnly
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 font-mono text-sm text-[#1A1A2E] outline-none"
                      />

                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#2E3192]"
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={copyPassword}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#2E3192]"
                          title="Copy password"
                        >
                          {copied ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] leading-5 text-gray-500">
                        Make sure to securely provide this password to the new
                        administrator.
                      </p>

                      <button
                        type="button"
                        onClick={regeneratePassword}
                        className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#2E3192] px-3.5 py-2 text-xs font-medium text-[#2E3192] transition-colors hover:bg-[#2E3192] hover:text-white"
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* ACTIONS */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: 0.15,
                }}
                className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#2E3192] px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#252879] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Create Admin Account
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}