import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Eye,
  Check,
  X,
  ShieldCheck,
  UserRound,
  Loader2,
} from "lucide-react";
import Sidebar from "../../components/admin_board/sidebar-admin";
import { usePageTitle } from "../../hooks/pageTitle";
import { listResidents } from "../../api/residents.js";
import {
  listApplications,
  getApplicationIdImage,
  approveApplication,
  rejectApplication,
} from "../../api/registrations.js";
import { getNormalizedDate } from "../../utils/date.js";

const AVATAR_COLORS = ["#2E3192", "#B69A00", "#4B4FC4"];

function getFullName(resident) {
  return `${resident.first_name} ${resident.middle_initial} ${resident.last_name}`;
}

function initials(resident) {
  return `${resident.first_name?.[0] || ""}${resident.last_name?.[0] || ""}`.toUpperCase();
}

function RoleBadge({ role }) {
  const isAdmin = role === "administrative_staff";
  const isBoard = role === "board_member";

  return (
    <div
      className={`flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        isAdmin
          ? "border-[#D8D9F2] bg-[#F0F1FB] text-[#2E3192]"
          : isBoard
          ? "border-[#E8D98A] bg-[#FFF9D9] text-[#6F5B00]"
          : "border-[#E1E3E8] bg-[#F7F8FA] text-gray-600"
      }`}
    >
      {isAdmin || isBoard ? (
        <ShieldCheck size={12} strokeWidth={1.8} />
      ) : (
        <UserRound size={12} strokeWidth={1.8} />
      )}

      <span>{isAdmin ? "Admin" : isBoard ? "Board" : "Resident"}</span>
    </div>
  );
}

function TableSkeleton({ columnsCount = 8, rowsCount = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rowsCount }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#F8F9FC]"}
        >
          <td className="px-5 py-3.5">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="px-3 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-2 w-20 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </td>
          {Array.from({ length: columnsCount - 2 }).map((_, colIndex) => (
            <td key={colIndex} className="px-3 py-3.5">
              <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function ResidentsPanel() {
  const [residents, setResidents] = useState([]);
  const [pendingResidents, setPendingResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("residents");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [reviewingResident, setReviewingResident] = useState(null);
  const [viewingImage, setViewingImage] = useState(false);

  const [editingResident, setEditingResident] = useState(null);
  const [deletingResident, setDeletingResident] = useState(null);

  // Reject remark popup
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [rejectError, setRejectError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const residentsData = await listResidents();
        setResidents(residentsData);

        const applications = await listApplications("pending");
        setPendingResidents(applications);
      } catch (error) {
        console.error("Failed to load resident data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [editForm, setEditForm] = useState({
    first_name: "",
    middle_initial: "",
    last_name: "",
    email: "",
    block_and_lot: "",
    address: "",
    registered: "",
    phone: "",
  });

  const currentData = activeTab === "pending" ? pendingResidents : residents;

  const allSelected =
    currentData.length > 0 && selected.length === currentData.length;

  const toggleAll = () => {
    setSelected(
      allSelected ? [] : currentData.map((resident) => resident.id)
    );
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const acceptResident = () => {
    if (!reviewingResident) return;

    approveApplication(reviewingResident.id);

    setResidents((prev) => [
      ...prev,
      {
        ...reviewingResident,
        roles: reviewingResident.roles || ["resident"],
      },
    ]);

    setPendingResidents((prev) =>
      prev.filter((resident) => resident.id !== reviewingResident.id)
    );

    setSelected((prev) => prev.filter((id) => id !== reviewingResident.id));

    setReviewingResident(null);
    setViewingImage(false);
  };

  const openRejectModal = () => {
    setRejectRemark("");
    setRejectError(false);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectRemark("");
    setRejectError(false);
  };

  const rejectResident = async () => {
    if (!reviewingResident) return;

    const remark = rejectRemark.trim();

    if (!remark) {
      setRejectError(true);
      return;
    }

    await rejectApplication(reviewingResident.id, remark);

    setPendingResidents((prev) =>
      prev.filter((resident) => resident.id !== reviewingResident.id)
    );

    setSelected((prev) => prev.filter((id) => id !== reviewingResident.id));

    closeRejectModal();
    setReviewingResident(null);
    setViewingImage(false);
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setSelected([]);
    setPage(1);
  };

  const openEdit = (resident) => {
    setEditingResident(resident);

    setEditForm({
      first_name: resident.first_name,
      middle_initial: resident.middle_initial,
      last_name: resident.last_name,
      email: resident.email,
      block_and_lot: resident.unit?.block_and_lot || "",
      address: resident.unit?.address || "",
      registered: getNormalizedDate(resident.created_at),
      phone: resident.phone,
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = () => {
    if (!editingResident) return;

    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === editingResident.id
          ? {
              ...resident,
              ...editForm,
            }
          : resident
      )
    );

    setEditingResident(null);
  };

  const confirmDelete = () => {
    if (!deletingResident) return;

    setResidents((prev) =>
      prev.filter((resident) => resident.id !== deletingResident.id)
    );

    setSelected((prev) => prev.filter((id) => id !== deletingResident.id));

    setDeletingResident(null);
  };

  const columns = [
    "RESIDENT NAME",
    "EMAIL ADDRESS",
    "UNIT NO.",
    "ADDRESS",
    "DATE REGISTERED",
    "PHONE",
    "ROLE",
    "ACTION",
  ];

  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#1A1A2E]">Residents</h2>

        <p className="mt-1 text-xs text-gray-500">
          Manage registered residents and review new account applications.
        </p>
      </div>

      <div className="mb-5 flex w-full overflow-x-auto border-b border-[#D6D8E5]">
        <button
          type="button"
          onClick={() => handleTabChange("residents")}
          className={`relative shrink-0 px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "residents"
              ? "text-[#2E3192]"
              : "text-gray-500 hover:text-[#2E3192]"
          }`}
        >
          All Residents
          {activeTab === "residents" && (
            <motion.span
              layoutId="residentTabIndicator"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
              }}
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#2E3192]"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("pending")}
          className={`relative flex shrink-0 items-center gap-2 px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "pending"
              ? "text-[#2E3192]"
              : "text-gray-500 hover:text-[#2E3192]"
          }`}
        >
          Pending Review
          <span
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors ${
              activeTab === "pending"
                ? "bg-[#2E3192] text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {pendingResidents.length}
          </span>
          {activeTab === "pending" && (
            <motion.span
              layoutId="residentTabIndicator"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
              }}
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#2E3192]"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            x: activeTab === "pending" ? 12 : -12,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: activeTab === "pending" ? -12 : 12,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search by name or unit"
                  className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-xs text-[#1A1A2E] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2E3192]/10 sm:w-56"
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

          {activeTab === "pending" && (
            <div className="mb-4 rounded-2xl border border-[#F5D000]/40 bg-[#FFF9D9] px-4 py-3">
              <p className="text-xs leading-5 text-[#6F5B00]">
                These accounts are waiting for admin review. Check the applicant's
                information and submitted documents before approving the account.
              </p>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
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

              {loading ? (
                <TableSkeleton columnsCount={columns.length} rowsCount={5} />
              ) : (
                <tbody>
                  {currentData.map((resident, i) => {
                    const isSelected = selected.includes(resident.id);

                    return (
                      <tr
                        key={resident.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#E4E7F2]"
                            : i % 2 === 0
                            ? "bg-white"
                            : "bg-[#F8F9FC]"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(resident.id)}
                            className="h-4 w-4 rounded accent-[#2E3192]"
                          />
                        </td>

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

                            <div className="min-w-0">
                              <span className="block whitespace-nowrap font-medium text-[#1A1A2E]">
                                {getFullName(resident)}
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {resident.first_name}{" "}
                                {resident.middle_initial}{" "}
                                {resident.last_name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {resident.email}
                        </td>

                        <td className="px-3 py-3.5 text-gray-500">
                          {resident.unit?.block_and_lot}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {resident.unit?.address}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {getNormalizedDate(
                            activeTab === "residents"
                              ? resident.created_at
                              : resident.submitted_at
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-500">
                          {resident.phone}
                        </td>

                        <td className="px-3 py-3.5">
                          <div className="flex flex-col gap-1">
                            {activeTab === "residents" ? (
                              Array.isArray(resident.roles) &&
                              resident.roles.length > 0 ? (
                                resident.roles.map((role, idx) => (
                                  <RoleBadge key={idx} role={role} />
                                ))
                              ) : (
                                <RoleBadge role="resident" />
                              )
                            ) : (
                              <RoleBadge role="resident" />
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          {activeTab === "pending" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingResident(resident);
                                setViewingImage(false);
                              }}
                              className="flex items-center gap-1.5 rounded-full bg-[#2E3192] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#252878]"
                            >
                              <Eye size={14} strokeWidth={2} />
                              Review
                            </button>
                          ) : (
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
                                onClick={() => openEdit(resident)}
                                className="transition-colors hover:text-[#2E3192]"
                              >
                                <Pencil size={16} strokeWidth={1.75} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>

          {!loading && currentData.length === 0 && (
            <div className="rounded-2xl bg-white py-12 text-center">
              <p className="text-sm font-medium text-[#1A1A2E]">
                No accounts found
              </p>

              <p className="mt-1 text-xs text-gray-500">
                There are currently no accounts in this section.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>

              {[1, 2, 3, 4, 5].map((n) => (
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

              <span className="px-1 text-gray-400">&middot;&middot;&middot;</span>

              <button
                type="button"
                onClick={() => setPage(100)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  page === 100
                    ? "bg-[#2E3192] text-white"
                    : "text-gray-500 hover:bg-white"
                }`}
              >
                100
              </button>

              <button
                type="button"
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(100, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white"
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
        </motion.div>
      </AnimatePresence>

      {/* Review modal */}
      {reviewingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E]">
                  Review Account
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Review the applicant's information before making a decision.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReviewingResident(null);
                  setViewingImage(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#F5F6FA] p-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{
                  backgroundColor:
                    AVATAR_COLORS[
                      reviewingResident.id % AVATAR_COLORS.length
                    ],
                }}
              >
                {initials(reviewingResident)}
              </div>

              <div>
                <p className="font-semibold text-[#1A1A2E]">
                  {getFullName(reviewingResident)}
                </p>

                <p className="text-xs text-gray-500">Account application</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  First Name
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.first_name}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Middle Initial
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.middle_initial}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Last Name
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.last_name}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Unit No.
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.unit?.block_and_lot}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Email Address
                </p>

                <p className="mt-1 break-all text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.email}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Date Registered
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {getNormalizedDate(reviewingResident.submitted_at)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.phone}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Address
                </p>

                <p className="mt-1 text-sm font-medium text-[#1A1A2E]">
                  {reviewingResident.unit?.address}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#D6D8E5] bg-[#F8F9FC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#1A1A2E]">
                    Submitted Document
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Review the applicant's submitted identification document.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingImage(true)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-[#2E3192] shadow-sm transition-colors hover:bg-[#EEF0F7]"
                >
                  <Eye size={14} />
                  View Image
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setReviewingResident(null);
                  setViewingImage(false);
                }}
                className="rounded-full bg-[#F1F2F6] px-5 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-[#E5E6EC]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={openRejectModal}
                className="flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
              >
                <X size={14} />
                Reject
              </button>

              <button
                type="button"
                onClick={acceptResident}
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#2E3192] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#252878]"
              >
                <Check size={14} />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted image viewer */}
      {viewingImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative flex min-h-[300px] min-w-[300px] max-h-[90vh] w-full max-w-4xl items-center justify-center rounded-3xl bg-[#111] p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setViewingImage(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X size={18} />
            </button>

            <img
              src={getApplicationIdImage(reviewingResident.id)}
              crossOrigin="use-credentials"
              alt={`Submitted document of ${getFullName(reviewingResident)}`}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Reject remark popup */}
      <AnimatePresence>
        {showRejectModal && reviewingResident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A2E]">
                    Reject Application
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Provide a reason for rejecting{" "}
                    <span className="font-medium text-[#1A1A2E]">
                      {getFullName(reviewingResident)}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Remarks
              </label>

              <textarea
                value={rejectRemark}
                onChange={(e) => {
                  setRejectRemark(e.target.value);
                  if (rejectError) setRejectError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    rejectResident();
                  }
                }}
                rows={4}
                maxLength={300}
                placeholder="e.g. The submitted ID is unclear or does not match the provided details."
                className={`mt-1 w-full resize-none rounded-xl border bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:ring-2 ${
                  rejectError
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                    : "border-[#D6D8E5] focus:border-[#2E3192] focus:ring-[#2E3192]/10"
                }`}
              />

              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-rose-600">
                  {rejectError ? "Please enter a reason for rejection." : ""}
                </p>

                <p className="text-[10px] text-gray-400">
                  {rejectRemark.length}/300
                </p>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="rounded-full bg-[#F1F2F6] px-5 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-[#E5E6EC]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={rejectResident}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-rose-700"
                >
                  <X size={14} />
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingResident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A2E]">
                    Edit Account
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Update the resident's account information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    First Name
                  </label>

                  <input
                    value={editForm.first_name}
                    onChange={(e) =>
                      handleEditChange("first_name", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Middle Initial
                  </label>

                  <input
                    value={editForm.middle_initial}
                    onChange={(e) =>
                      handleEditChange("middle_initial", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Last Name
                  </label>

                  <input
                    value={editForm.last_name}
                    onChange={(e) =>
                      handleEditChange("last_name", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Unit No.
                  </label>

                  <input
                    value={editForm.block_and_lot}
                    onChange={(e) =>
                      handleEditChange("block_and_lot", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      handleEditChange("email", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Address
                  </label>

                  <input
                    value={editForm.address}
                    onChange={(e) =>
                      handleEditChange("address", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Date Registered
                  </label>

                  <input
                    value={editForm.registered}
                    onChange={(e) =>
                      handleEditChange("registered", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Phone
                  </label>

                  <input
                    value={editForm.phone}
                    onChange={(e) =>
                      handleEditChange("phone", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#D6D8E5] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Role
                  </label>

                  <div className="mt-1 flex flex-col gap-1">
                    {Array.isArray(editingResident.roles) ? (
                      editingResident.roles.map((r, i) => (
                        <RoleBadge key={i} role={r} />
                      ))
                    ) : (
                      <RoleBadge role={editingResident.role} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="rounded-full bg-[#F1F2F6] px-5 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-[#E5E6EC]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full bg-[#2E3192] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#252878]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deletingResident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A2E]">
                    Delete Account
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    This action will permanently remove the account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeletingResident(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-2xl bg-[#F5F6FA] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{
                      backgroundColor:
                        AVATAR_COLORS[
                          deletingResident.id % AVATAR_COLORS.length
                        ],
                    }}
                  >
                    {initials(deletingResident)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1A1A2E]">
                      {getFullName(deletingResident)}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {deletingResident.email}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Are you sure you want to delete this account? The resident
                will be removed from the registered residents list.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingResident(null)}
                  className="rounded-full bg-[#F1F2F6] px-5 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-[#E5E6EC]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-rose-700"
                >
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResidentsListPage() {
  usePageTitle("Admin");

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-3 sm:p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(23, 24, 74, 0.72), rgba(23, 24, 74, 0.72)), url('/assets/magallanes-village.jpg')",
      }}
    >
      <div className="sticky flex gap-3 sm:gap-4">
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
          <ResidentsPanel />
        </motion.main>
      </div>
    </div>
  );
}