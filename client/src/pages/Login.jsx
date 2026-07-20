import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import LogoMaxy from "../assets/images/logo_maxy.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle Change Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Show Hide Password
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Send Form Logic
  const handleLogin = async (e) => {
    e.preventDefault();

    // Empty Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      return toast.error("Username dan kata sandi wajib diisi!");
    }

    setIsLoading(true);

    try {
      await login(formData.username, formData.password, rememberMe);

      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Kredensial tidak valid atau server bermasalah";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast("Silakan hubungi Developer untuk mereset kata sandi.", {
      icon: "ℹ️",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Card Container */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={LogoMaxy} className="w-16 md:w-18" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-white">
            Dashboard MaxyBot
          </h1>
          <p className="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 mt-1">
            Silakan masuk ke akun anda
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-brand-dark dark:text-gray-300 block">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan Username"
                className="w-full text-sm sm:text-base min-h-11 min-w-11 pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-brand-dark dark:text-gray-300 block">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-sm sm:text-base min-h-11 min-w-11 pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-all"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute min-h-11 min-w-11 inset-y-0 right-0 flex justify-center items-center text-gray-400 hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-brand-blue focus:ring-brand-blue border-gray-300 bg-gray-50 dark:bg-slate-700"
              />
              <span>Ingat saya</span>
            </label>
            <a
              href="#"
              onClick={handleForgotPassword}
              className="text-brand-blue hover:text-blue-700 dark:text-blue-300 dark:hover:text-brand-yellow font-medium transition-colors"
            >
              Lupa sandi?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full min-h-11 min-w-11 py-2 px-3 md:py-3 md:px-4 flex justify-center items-center rounded-lg text-brand-white font-medium transition-all ${isLoading ? "bg-brand-blue/70 cursor-not-allowed" : "bg-brand-blue hover:bg-blue-700 cursor-pointer active:scale-[0.98]"}`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
