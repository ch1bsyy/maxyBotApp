import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ isCollapsed }) => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`w-full min-h-11 min-w-11 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
      title="Toggle Tema"
    >
      {darkMode ? (
        <FiSun size={20} className="text-brand-yellow shrink-0" />
      ) : (
        <FiMoon size={20} className="shrink-0" />
      )}
      {!isCollapsed && (
        <span className="whitespace-nowrap">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
