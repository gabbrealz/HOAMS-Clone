import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Bell, CheckCircle2 } from "lucide-react";
import Sidebar from "../../components/admin_board/sidebar-admin";
import { usePageTitle } from "../../hooks/pageTitle";
import { useAuth } from "../../context/AuthContext.jsx";

const ANNOUNCEMENTS = [
  {
    id: 1,
    category: "Community",
    date: "May 05, 2026",
    title: "Water interruption schedule for Phase 15",
    body: "Lorem ipsumin dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  },
  {
    id: 2,
    category: "Maintenance",
    date: "May 03, 2026",
    title: "Elevator maintenance in Building C",
    body: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  },
  {
    id: 3,
    category: "Events",
    date: "Apr 28, 2026",
    title: "Homeowners' general assembly",
    body: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  },
];

const ACTIVITY = [
  { id: 1, label: "Renter documents received", time: "Today, 9:14 AM" },
  { id: 2, label: "Complaint submitted", time: "Today, 9:14 AM" },
  { id: 3, label: "Complaint solved", time: "Today, 9:14 AM" },
  { id: 4, label: "Renter documents received", time: "Today, 9:14 AM" },
  { id: 5, label: "Complaint submitted", time: "Today, 9:14 AM" },
  { id: 6, label: "Complaint solved", time: "Today, 9:14 AM" },
];

const UNITS = [
  { id: 1, name: "Blk 3 Lot 5 - Phase 15", status: "Owner-occupied" },
  { id: 2, name: "Blk 3 Lot 5 - Phase 17", status: "For rent" },
  { id: 3, name: "Blk 3 Lot 5 - Phase 19", status: "Owner-occupied" },
];

const CONCERNS = [
  {
    id: "1-001",
    name: "Leaking pipe",
    date: "May 01, 2026",
    priority: "High",
    status: "Done",
  },
  {
    id: "1-002",
    name: "Noisy neighbor",
    date: "Apr 27, 2026",
    priority: "Low",
    status: "In Progress",
  },
  {
    id: "1-003",
    name: "Broken gate",
    date: "Apr 20, 2026",
    priority: "Mid",
    status: "Cancelled",
  },
  {
    id: "1-004",
    name: "Streetlight out",
    date: "Apr 15, 2026",
    priority: "High",
    status: "Done",
  },
];

const STATUS_STYLES = {
  Done: "bg-[#E7F3EE] text-[#287A5A]",
  "In Progress": "bg-[#FFF5D6] text-[#8A6A00]",
  Cancelled: "bg-[#EEF0F7] text-gray-500",
};

const PRIORITY_STYLES = {
  High: "bg-[#FBE8E8] text-[#A33A3A]",
  Mid: "bg-[#FFF5D6] text-[#8A6A00]",
  Low: "bg-[#E8EEF9] text-[#365A9B]",
};



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
        aria-label="Notifications"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF0F7] text-[#2E3192] transition-colors hover:bg-[#E4E7F2]"
      >
        <Bell size={20} strokeWidth={1.75} />

        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}



function AnnouncementsCard() {
  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#1A1A2E]">
          Recent Announcements
        </h2>

        <button className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#2E3192] shadow-sm transition-colors hover:bg-[#E4E7F2]">
          Read More
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {ANNOUNCEMENTS.map((a) => (
          <div
            key={a.id}
            className="flex gap-3 rounded-2xl bg-white/70 p-3 sm:gap-4"
          >
            <div className="h-16 w-16 shrink-0 rounded-xl bg-[#D6D8E5] sm:h-16 sm:w-20" />

            <div className="min-w-0">
              <p className="text-[11px] text-[#B69A00] sm:text-xs">
                {a.category} | {a.date}
              </p>

              <p className="truncate text-sm font-medium text-[#1A1A2E] underline decoration-[#D6D8E5] underline-offset-2">
                {a.title}
              </p>

              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-500">
                {a.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-[#1A1A2E]">
        Recent Activity
      </h2>

      <ul className="flex max-h-[330px] flex-col overflow-y-auto pr-2">
        {ACTIVITY.map((item, i) => (
          <li key={item.id}>
            <div className="flex items-start gap-3 py-3">
              <CheckCircle2
                size={16}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-[#2E3192]"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1A1A2E] underline decoration-[#D6D8E5] underline-offset-2">
                  {item.label}
                </p>

                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>

            {i < ACTIVITY.length - 1 && (
              <div className="h-px bg-[#D6D8E5]" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MyUnitsCard() {
  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#1A1A2E]">
        My Units
      </h2>

      <div className="flex flex-col gap-4">
        {UNITS.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2E3192]">
              <Home size={16} strokeWidth={1.75} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1A1A2E]">
                {u.name}
              </p>

              <p className="text-xs text-gray-500">{u.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConcernsCard() {
  return (
    <div className="rounded-3xl bg-[#EEF0F7] p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#1A1A2E]">
        Concerns
      </h2>

      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#2E3192] text-xs uppercase tracking-wide text-white">
              <th className="px-4 py-3 font-medium">Report #</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Date Submitted</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {CONCERNS.map((c, i) => (
              <tr
                key={c.id}
                className={
                  i % 2 === 0
                    ? "bg-white"
                    : "bg-[#F8F9FC]"
                }
              >
                <td className="px-4 py-3 text-gray-500">{c.id}</td>

                <td className="px-4 py-3 text-[#1A1A2E]">
                  {c.name}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {c.date}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[c.priority]}`}
                  >
                    {c.priority}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



export default function AdminDashboard() {
  const { user } = useAuth();
  usePageTitle("Admin");

  const [active, setActive] = useState("dashboard");

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-3 sm:p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(23, 24, 74, 0.72), rgba(23, 24, 74, 0.72)), url('/assets/magallanes-village.jpg')",
      }}
    >
      <div className="flex gap-3 sm:gap-4">
        <Sidebar active={active} onChange={setActive} />

        <motion.main 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header adminName={user.first_name} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <AnnouncementsCard />
            </div>

            <div className="min-w-0">
              <ActivityCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="min-w-0">
              <MyUnitsCard />
            </div>

            <div className="min-w-0 lg:col-span-2">
              <ConcernsCard />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}