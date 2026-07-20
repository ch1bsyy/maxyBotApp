import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import DashboardLayout from "../components/DashboardLayout";
import Overview from "../pages/Overview";
import Leads from "../pages/Leads";
import DetailLead from "../pages/DetailLead";
import Customers from "../pages/Customers";
import Profile from "../pages/Profile";
import Accounts from "../pages/Accounts";
import LogoMaxy from "../assets/images/logo_maxy.png";

// Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-24 h-24 bg-brand-blue/20 rounded-full animate-pulse"></div>
          <img
            src={LogoMaxy}
            alt="Loading..."
            className="w-20 relative z-10 animate-pulse"
          />
        </div>
        <p className="mt-6 text-brand-dark dark:text-gray-300 font-medium tracking-wide animate-pulse">
          Memuat ruang kerja...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="fixed inset-0 z-100 flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-24 h-24 bg-brand-blue/20 rounded-full animate-ping"></div>
          <img
            src={LogoMaxy}
            alt="Loading..."
            className="w-16 md:w-20 relative z-10 animate-pulse"
          />
        </div>
        <p className="mt-6 text-brand-dark dark:text-gray-300 font-medium tracking-wide animate-pulse">
          Memuat ruang kerja...
        </p>
      </div>
    );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />

          <Route path="leads" element={<Leads />} />

          <Route path="leads/:phone_number" element={<DetailLead />} />

          <Route path="customers" element={<Customers />} />

          <Route path="profile" element={<Profile />} />

          <Route path="accounts" element={<Accounts />} />
        </Route>

        {/* Redirect Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
