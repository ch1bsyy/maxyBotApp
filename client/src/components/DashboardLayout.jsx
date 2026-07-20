import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import LogoMaxy from "../assets/images/logo_maxy.png";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white dark:bg-brand-dark h-16 px-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <img src={LogoMaxy} alt="Maxy Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-brand-dark dark:text-brand-white">
              Maxy Bot
            </span>
          </div>
          <button
            onClick={() => {
              setIsMobileOpen(true);
            }}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <FiMenu size={24} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
