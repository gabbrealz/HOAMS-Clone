import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  X,
  ShieldCheck,
  UserRound,
  Bell,
  LayoutGrid,
  Loader2,
} from "lucide-react";

import Sidebar from "../../components/user_admin/sidebar-user";
import { usePageTitle } from "../../hooks/pageTitle";
import { listUsers, updateRole } from "../../api/users";
import { useAuth } from "../../context/AuthContext.jsx";

const AVATAR_COLORS = ["#2E3192", "#B69A00", "#4B4FC4"];

function getFullName(resident) {
  return [resident.fname, resident.mi, resident.lname]
    .filter(Boolean)
    .join(" ");
}

function initials(resident) {
  return `${resident.fname?.[0] || ""}${resident.lname?.[0] || ""}`.toUpperCase();
}

function Header({ adminName = "Admin" }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <img
          src="/assets/profile.jpg"
          alt={`${adminName}'s profile`}
          className="h-16 w-16 shrink-0 rounded-full border-2 border-[#B69A00] object-cover sm:h-20 sm:w-20"
        />

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-[#B69A00] sm:text-2xl">
            Hi, <b>{adminName}</b>!
          </h1>

          <p className="text-xs text-white sm:text-sm">{today}</p>
        </div>
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

/* ---------------- Role Badges ---------------- */

function RoleBadges({ roles = [], isEditing, onClick, isUpdating }) {
  const rawRoles = Array.isArray(roles) ? roles : [roles];
  const normalizedRoles = Array.from(new Set(rawRoles));

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isUpdating}
      className="group flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 transition-all hover:border-[#2E3192]/40 disabled:opacity-50"
    >
      <div className="flex flex-wrap items-center gap-1">
        {isUpdating ? (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            <Loader2 size={11} className="animate-spin" /> Updating...
          </span>
        ) : (
          normalizedRoles.map((role) => {
            const isBoard = role === "board_member" || role === "board";
            const isAdmin = role === "administrative_staff" || role === "admin";

            return (
              <span
                key={role}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  isBoard
                    ? "border-[#FBBF24] bg-[#FEF3C7] text-[#92400E]"
                    : isAdmin
                    ? "border-[#D8D9F2] bg-[#F0F1FB] text-[#2E3192]"
                    : "border-[#E1E3E8] bg-[#F7F8FA] text-gray-600"
                }`}
              >
                {isBoard ? (
                  <LayoutGrid size={11} strokeWidth={1.8} />
                ) : isAdmin ? (
                  <ShieldCheck size={11} strokeWidth={1.8} />
                ) : (
                  <UserRound size={11} strokeWidth={1.8} />
                )}
                {isBoard ? "Board" : isAdmin ? "Admin" : "Resident"}
              </span>
            );
          })
        )}
      </div>

      <ChevronDown
        size={12}
        strokeWidth={2}
        className={`ml-1 text-gray-400 transition-transform ${
          isEditing ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

/* ---------------- Multi-Role Dropdown ---------------- */

function MultiRoleDropdown({ currentRoles = [], onSave, onClose, dropUp = false, isUpdating = false }) {
  const rawRoles = Array.isArray(currentRoles) ? currentRoles : [currentRoles];
  const [selectedRoles, setSelectedRoles] = useState(
    Array.from(new Set(rawRoles))
  );

  const availableRoles = [
    {
      value: "resident",
      label: "Resident",
      description: "Standard resident access",
      icon: <UserRound size={14} />,
      iconClass: "bg-gray-100 text-gray-500",
    },
    {
      value: "board_member",
      label: "Board Member",
      description: "HOA Board duties",
      icon: <LayoutGrid size={14} />,
      iconClass: "bg-[#FEF3C7] text-[#92400E]",
    },
    {
      value: "administrative_staff",
      label: "Administrative Staff",
      description: "System administration",
      icon: <ShieldCheck size={14} />,
      iconClass: "bg-[#EEF0FA] text-[#2E3192]",
    },
  ];

  const handleToggleRole = (roleValue) => {
    setSelectedRoles((prev) => {
      let updated;
      if (prev.includes(roleValue)) {
        updated = prev.filter((r) => r !== roleValue);
        if (updated.length === 0) updated = ["resident"];
      } else {
        updated = [...prev, roleValue];
        if (roleValue === "board_member") {
          updated = updated.filter(
            (r) => r !== "administrative_staff" && r !== "admin"
          );
        } else if (roleValue === "administrative_staff") {
          updated = updated.filter(
            (r) => r !== "board_member" && r !== "board"
          );
        }
      }
      return Array.from(new Set(updated));
    });
  };

  return (
    <div
      className={`absolute left-0 z-30 w-60 overflow-hidden rounded-2xl border border-[#D9DBE5] bg-white p-2 shadow-xl ${
        dropUp ? "bottom-full mb-2" : "top-full mt-2"
      }`}
    >
      <div className="mb-1.5 px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        Assign Roles
      </div>

      <div className="space-y-1">
        {availableRoles.map((role) => {
          const isChecked = selectedRoles.includes(role.value);

          return (
            <div
              key={role.value}
              onClick={() => !isUpdating && handleToggleRole(role.value)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 transition-colors ${
                isChecked
                  ? "bg-[#2E3192]/5 text-[#1A1A2E]"
                  : "text-gray-600 hover:bg-[#F7F8FA]"
              } ${isUpdating ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${role.iconClass}`}
                >
                  {role.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none">{role.label}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{role.description}</p>
                </div>
              </div>

              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  isChecked
                    ? "border-[#2E3192] bg-[#2E3192] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isChecked && <Check size={12} strokeWidth={2.5} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 px-1">
        <span className="text-[10px] italic text-amber-600">
          *Board & Admin are mutually exclusive
        </span>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onSave(selectedRoles)}
          className="flex items-center gap-1.5 rounded-lg bg-[#2E3192] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[#1F2266] disabled:opacity-50"
        >
          {isUpdating && <Loader2 size={12} className="animate-spin" />}
          Apply
        </button>
      </div>
    </div>
  );
}

/* ---------------- Modals ---------------- */

function EditResidentModal({ resident, onClose, onSave }) {
  const [form, setForm] = useState({
    fname: resident.fname || "",
    mi: resident.mi || "",
    lname: resident.lname || "",
    email: resident.email || "",
    phone: resident.phone || "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...resident,
      ...form,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Edit Resident</h3>
              <p className="mt-1 text-xs text-gray-500">
                Update the resident's account information.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#1A1A2E]">
                  Resident Name
                </label>
                <div className="grid grid-cols-[1fr_90px_1fr] gap-2">
                  <div>
                    <input
                      type="text"
                      value={form.fname}
                      onChange={(e) => handleChange("fname", e.target.value)}
                      placeholder="First name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                    />
                    <p className="mt-1.5 px-1 text-[10px] text-gray-400">First Name</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={form.mi}
                      onChange={(e) => handleChange("mi", e.target.value)}
                      placeholder="M.I."
                      maxLength={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                    />
                    <p className="mt-1.5 px-1 text-[10px] text-gray-400">M.I.</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={form.lname}
                      onChange={(e) => handleChange("lname", e.target.value)}
                      placeholder="Last name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                    />
                    <p className="mt-1.5 px-1 text-[10px] text-gray-400">Last Name</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#1A1A2E]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="resident@email.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#1A1A2E]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+63 917 000 0000"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white px-4 py-2.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#2E3192] px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#252879]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DeleteResidentModal({ resident, onClose, onDelete }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 size={21} strokeWidth={1.8} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#1A1A2E]">
              Delete Resident?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#1A1A2E]">
                {getFullName(resident)}
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-full bg-rose-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- Residents Panel ---------------- */

function ResidentsPanel() {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const [editingResident, setEditingResident] = useState(null);
  const [deletingResident, setDeletingResident] = useState(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await listUsers(params);

      const dataList = Array.isArray(response)
        ? response
        : response?.results || [];

      const normalized = dataList.map((user) => {
        const rawRoles = Array.isArray(user.roles)
          ? user.roles
          : user.role
          ? Array.isArray(user.role)
            ? user.role
            : [user.role]
          : ["resident"];

        return {
          id: user.id,
          fname: user.first_name || user.fname || "",
          mi: user.middle_initial || user.mi || "",
          lname: user.last_name || user.lname || "",
          email: user.email || "",
          phone: user.phone || user.phone_number || "N/A",
          roles: Array.from(new Set(rawRoles)),
        };
      });

      setResidents(normalized);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setErrorMessage(
        err.response?.data?.detail || err.message || "Failed to load users from server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(residents.length / rowsPerPage));
  const paginatedData = residents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((resident) => selected.includes(resident.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !paginatedData.some((res) => res.id === id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...paginatedData.map((res) => res.id)]),
      ]);
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Connected updateRoles function using the backend updateRole API helper
  const updateRoles = async (residentId, newRoles) => {
    try {
      setUpdatingRoleId(residentId);
      const updatedUser = await updateRole(residentId, newRoles);

      // Extract updated roles from backend response or fall back to requested newRoles
      const returnedRoles =
        updatedUser?.roles || updatedUser?.role || newRoles;
      const normalizedRoles = Array.isArray(returnedRoles)
        ? returnedRoles
        : [returnedRoles];

      setResidents((prev) =>
        prev.map((resident) =>
          resident.id === residentId
            ? { ...resident, roles: Array.from(new Set(normalizedRoles)) }
            : resident
        )
      );
      setEditingRoleId(null);
    } catch (err) {
      console.error("Failed to update user roles:", err);
      const apiError =
        err.response?.data?.roles?.[0] ||
        err.response?.data?.roles ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update user roles.";
      alert(typeof apiError === "string" ? apiError : JSON.stringify(apiError));
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const updateResident = (updatedResident) => {
    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === updatedResident.id ? updatedResident : resident
      )
    );
    setEditingResident(null);
  };

  const deleteResident = (residentId) => {
    setResidents((prev) =>
      prev.filter((resident) => resident.id !== residentId)
    );
    setSelected((prev) => prev.filter((id) => id !== residentId));
    setDeletingResident(null);

    if (paginatedData.length === 1 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    setSelected([]);
  };

  const columns = [
    "FULL NAME",
    "EMAIL",
    "PHONE",
    "ROLE",
    "ACTION",
  ];

  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#1A1A2E]">Users</h2>
        <p className="mt-1 text-xs text-gray-500">
          Manage registered users, grant multi-role privileges, and review account records.
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="residents-panel"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* SEARCH & FILTER */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-xs text-[#1A1A2E] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2E3192]/10 sm:w-64"
                />
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs text-gray-500 shadow-sm hover:bg-gray-50"
              >
                Last 30 days
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#2E3192] text-xs uppercase tracking-wide text-white">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded accent-[#F5D000]"
                    />
                  </th>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="bg-white py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-[#2E3192]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading user directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="bg-white py-8 text-center text-rose-600 text-sm">
                      {errorMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((resident, i) => {
                    const isSelected = selected.includes(resident.id);
                    const isEditingRole = editingRoleId === resident.id;
                    const isUpdatingRole = updatingRoleId === resident.id;
                    const shouldDropUp = i >= paginatedData.length - 3;

                    return (
                      <motion.tr
                        key={resident.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#E4E7F2]"
                            : i % 2 === 0
                            ? "bg-white"
                            : "bg-[#F8F9FC]"
                        }`}
                      >
                        {/* CHECKBOX */}
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(resident.id)}
                            className="h-4 w-4 rounded accent-[#2E3192]"
                          />
                        </td>

                        {/* NAME */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                              style={{
                                backgroundColor:
                                  AVATAR_COLORS[i % AVATAR_COLORS.length],
                              }}
                            >
                              {initials(resident)}
                            </div>
                            <span className="whitespace-nowrap font-medium text-[#1A1A2E]">
                              {getFullName(resident)}
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {resident.email}
                        </td>

                        {/* PHONE */}
                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {resident.phone}
                        </td>

                        {/* MULTI-ROLE DROPDOWN */}
                        <td className="relative px-3 py-3.5">
                          <RoleBadges
                            roles={resident.roles}
                            isEditing={isEditingRole}
                            isUpdating={isUpdatingRole}
                            onClick={() =>
                              setEditingRoleId(
                                isEditingRole ? null : resident.id
                              )
                            }
                          />

                          {isEditingRole && (
                            <MultiRoleDropdown
                              currentRoles={resident.roles}
                              isUpdating={isUpdatingRole}
                              onSave={(newRoles) =>
                                updateRoles(resident.id, newRoles)
                              }
                              onClose={() => setEditingRoleId(null)}
                              dropUp={shouldDropUp}
                            />
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-3 text-gray-400">
                            <button
                              type="button"
                              aria-label="Delete"
                              onClick={() => setDeletingResident(resident)}
                              className="transition-colors hover:text-rose-600"
                            >
                              <Trash2 size={16} strokeWidth={1.75} />
                            </button>

                            <button
                              type="button"
                              aria-label="Edit"
                              onClick={() => setEditingResident(resident)}
                              className="transition-colors hover:text-[#2E3192]"
                            >
                              <Pencil size={16} strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}
          {!isLoading && !errorMessage && residents.length === 0 && (
            <div className="rounded-2xl bg-white py-12 text-center">
              <p className="text-sm font-medium text-[#1A1A2E]">No accounts found</p>
              <p className="mt-1 text-xs text-gray-500">
                {search
                  ? "Try searching with a different name, email, or phone number."
                  : "There are currently no registered users."}
              </p>
            </div>
          )}

          {/* PAGINATION */}
          {!isLoading && residents.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      page === n
                        ? "bg-[#2E3192] text-white"
                        : "text-gray-500 hover:bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-1.5 self-end rounded-full bg-white px-3.5 py-2 text-xs text-gray-500 shadow-sm hover:bg-gray-50 sm:self-auto"
              >
                10 / page
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* EDIT MODAL */}
      {editingResident && (
        <EditResidentModal
          resident={editingResident}
          onClose={() => setEditingResident(null)}
          onSave={updateResident}
        />
      )}

      {/* DELETE MODAL */}
      {deletingResident && (
        <DeleteResidentModal
          resident={deletingResident}
          onClose={() => setDeletingResident(null)}
          onDelete={() => deleteResident(deletingResident.id)}
        />
      )}
    </div>
  );
}

export default function ResidentsListPage_User() {
  const { user } = useAuth();
  usePageTitle("Admin");

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
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6"
        >
          <Header adminName={user.first_name} />
          <ResidentsPanel />
        </motion.main>
      </div>
    </div>
  );
}