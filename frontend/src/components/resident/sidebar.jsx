import { useState } from "react";
import {
  LayoutGrid,
  MessageSquareWarning,
  IdCard,
  Home,
  UserPen,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

export const DEFAULT_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/resident-dashboard" },
  { id: "concerns", label: "Concerns", icon: MessageSquareWarning, path: "#" },
  { id: "announcement", label: "Announcements", icon: IdCard, path: "#" },
  { id: "units", label: "My Units", icon: Home, path: "#" },
];

function SidebarButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "flex h-12 w-12 md:h-11 md:w-11 items-center justify-center rounded-2xl transition-all duration-150",
        active
          ? "bg-[#4652A3] text-white"
          : "text-neutral-500 hover:bg-[#E9EBF7] hover:text-[#303873]",
      ].join(" ")}
    >
      <Icon size={20} strokeWidth={1.75} />
    </button>
  );
}

export default function Sidebar({ items = DEFAULT_NAV_ITEMS }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { handleLogout } = useAuth();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside
        className="
            fixed bottom-4 left-1/2 -translate-x-1/2
            z-50

            flex flex-row items-center justify-center
            w-fit
            rounded-full
            bg-[#F4F5FA]
            px-4 py-3
            shadow-lg

            md:sticky md:top-[80px]
            md:left-auto md:bottom-auto
            md:translate-x-0
            md:flex-col
            md:w-18
            md:h-full
            md:rounded-full
            md:px-0 md:py-6
            md:shadow-none
        "
    >

      <nav className="flex flex-row items-center gap-2 md:flex-col md:gap-3">
        {items.map((item) => (
          <SidebarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <div className="hidden md:flex flex-col items-center gap-3 mt-44">
        <SidebarButton
          icon={Settings}
          label="Settings"
          active={isActive("/settings")}
          onClick={() => navigate("#")}
        />
        <SidebarButton
          icon={LogOut}
          label="Log out"
          active={false}
          onClick={handleLogout}
        />

        <button
        aria-label="Profile"
        title="Profile"
        onClick={() => navigate("#")}
        className={[
            "flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150",
            isActive("/admin/profile")
              ? "bg-[#4652A3] text-white"
              : "bg-neutral-300/70 text-neutral-600 hover:bg-neutral-300",
        ].join(" ")}
        >
        <User size={18} strokeWidth={1.75} />
        </button>

        </div>
    </aside>
  );
}