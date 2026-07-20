import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiMessageCircle,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiChevronLeft,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import LogoMaxy from "../assets/images/logo_maxy.png";

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome size={20} /> },
    ...(user?.role === "SUPERADMIN"
      ? [
          {
            name: "Manajemen Akun",
            path: "/dashboard/accounts",
            icon: <FiShield size={20} />,
          },
        ]
      : []),
    {
      name: "Manajemen Leads",
      path: "/dashboard/leads",
      icon: <FiMessageCircle size={20} />,
    },
    {
      name: "Data Pelanggan",
      path: "/dashboard/customers",
      icon: <FiUsers size={20} />,
    },
  ];

  const bottomNavItems = [
    {
      name: "Pengaturan Profil",
      path: "/dashboard/profile",
      icon: <FiSettings size={20} />,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={LogoMaxy} alt="Maxy Logo" className="w-8 h-8 shrink-0" />
            {!isCollapsed && (
              <span className="font-bold text-lg text-brand-dark dark:text-brand-white whitespace-nowrap">
                MaxyBot
              </span>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 p-1.5 rounded-lg transition-colors absolute -right-3 border border-gray-200 dark:border-slate-600 cursor-pointer"
          >
            {isCollapsed ? (
              <FiChevronRight size={16} />
            ) : (
              <FiChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex min-h-11 min-w-11 items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isCollapsed ? "justify-center" : "justify-start"} ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-brand-dark dark:hover:text-brand-white"
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.name}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
          {/* Pengaturan Profil */}
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-11 min-w-11 items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isCollapsed ? "justify-center" : "justify-start"} ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-brand-dark dark:hover:text-brand-white"
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.name}</span>
              )}
            </NavLink>
          ))}

          {/* User Profile and Logout */}
          <div
            className={`flex items-center bg-gray-50 dark:bg-slate-800 p-2 rounded-lg mt-2  ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : user?.full_name ? (
                  user.full_name.charAt(0).toUpperCase()
                ) : (
                  "A"
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-brand-dark dark:text-white truncate w-28">
                    {user?.username || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role === "SUPERADMIN" ? "Superadmin" : "Admin"}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-2 text-gray-500 min-h-11 min-w-11 flex items-center justify-center hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Keluar"
              >
                <FiLogOut size={18} />
              </button>
            )}
          </div>

          {/* Logout Button When Collapsed */}
          {isCollapsed && (
            <button
              onClick={logout}
              className="w-full flex justify-center items-center min-h-11 min-w-11 p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors mt-1 cursor-pointer"
              title="Keluar"
            >
              <FiLogOut size={18} />
            </button>
          )}

          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
