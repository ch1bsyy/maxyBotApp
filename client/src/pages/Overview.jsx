import { useState, useEffect, useCallback } from "react";
import {
  FiMessageSquare,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiAward,
  FiRefreshCw,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Overview = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalChatToday: 0,
    hotLeads: 0,
    generalLeads: 0,
    completedLeads: 0,
    chartData: [],
    adminRanking: [],
  });

  const [recentLeads, setRecentLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);

    try {
      const [metricRes, leadRes] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getLeads({ leadType: "hot", isLeadActive: true }),
      ]);

      setMetrics(metricRes.data);
      setRecentLeads(leadRes.data.slice(0, 5));
    } catch (error) {
      if (!isSilent) toast.error("Gagal memuat data dashboard");
      console.error("Dashboard Fetch Error:", error);
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);

    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 30000); // 30000 ms = 30 detik

    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  // Handler for Refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(true);
  };

  // Sub-Component
  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
      <div className={`p-4 rounded-xl ${colorClass} text-white shrink-0`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-brand-dark dark:text-brand-white mt-1">
          {isLoading ? "-" : value}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
            Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Pantau aktivitas AI <i>Chatbot</i> dan ringkasan prospek (
            <i>leads</i>) hari ini.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          className="min-h-11 min-w-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <FiRefreshCw
            className={`${isRefreshing ? "animate-spin" : ""} text-brand-blue dark:text-blue-400`}
          />
          <span className="inline">Segarkan Data</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Chat Hari Ini"
          value={metrics.totalChatToday}
          icon={FiMessageSquare}
          colorClass="bg-brand-blue"
        />
        <StatCard
          title="Total Hot Leads"
          value={metrics.hotLeads}
          icon={FiTrendingUp}
          colorClass="bg-red-500"
        />
        <StatCard
          title="Total General Leads"
          value={metrics.generalLeads}
          icon={FiUsers}
          colorClass="bg-brand-yellow"
        />
        <StatCard
          title={
            user?.role === "SUPERADMIN"
              ? "Total Leads Diselesaikan"
              : "Leads Anda Selesaikan"
          }
          value={metrics.completedLeads}
          icon={FiCheckCircle}
          colorClass="bg-green-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Grafik */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-6">
            Statistik Chat Mingguan
          </h2>
          <div className="flex-1 min-h-75 w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <span className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat grafik...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(100, 116, 139, 0.1)" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#001233" }}
                  />
                  <Bar dataKey="chat" fill="#0066ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Table New Hot Leads */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-brand-dark dark:text-white">
                Hot Leads Terbaru
              </h2>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <span className="text-gray-500 text-sm">Memuat data...</span>
                </div>
              ) : recentLeads.length > 0 ? (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600/80 transition-colors"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <p className="font-semibold text-brand-dark dark:text-white text-sm truncate">
                          {lead.name || "Anonim"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lead.phone_number}
                        </p>
                      </div>

                      <Link
                        to={`/dashboard/leads/${lead.phone_number}`}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors shrink-0 ml-2"
                        title="Lihat Detail"
                      >
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-600">
                  Belum ada Hot Leads Terbaru
                </div>
              )}
            </div>
          </div>

          {/* Ranking Staf */}
          {user?.role === "SUPERADMIN" && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <FiAward className="text-brand-yellow" /> Peringkat Kinerja
                </h2>
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <span className="text-gray text-sm">
                      Memuat peringkat...
                    </span>
                  </div>
                ) : metrics.adminRanking && metrics.adminRanking.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.adminRanking.map((admin, idx) => {
                      let rankBadgeClass =
                        "bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-gray-300";
                      if (idx === 0)
                        rankBadgeClass =
                          "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200";
                      if (idx === 1)
                        rankBadgeClass =
                          "bg-slate-200 text-slate-500 dark:bg-slate-500/30 dark:text-slate-300 border-slate-300";
                      if (idx === 2)
                        rankBadgeClass =
                          "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200";

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${rankBadgeClass}`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <p className="font-semibold text-brand-dark dark:text-white text-sm">
                                {admin.adminName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                @{admin.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm md:text-base font-bold text-brand-blue dark:text-blue-300">
                              {admin.totalResolved}
                            </span>
                            <span className="text-[10px] md:text-[11px] text-gray-400">
                              Selesai
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-8 bg-gray-50  dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-600">
                    Belum ada data penyelesaian
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
