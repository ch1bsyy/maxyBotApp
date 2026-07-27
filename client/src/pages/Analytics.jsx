/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiPieChart,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMessageCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { analyticsService } from "../services/api";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsService.getSuperOverview();
        setData(response.data);
      } catch (error) {
        toast.error("Gagal memuat data analitik.");
        console.error("Analytics Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mr-2"></span>
        Memuat Laporan Analitik...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-10">
        Data analitik tidak tersedia.
      </div>
    );
  }

  // --- EKSTRAKSI DATA UNTUK UI ---
  const hotSummary = data.serviceSummary?.find(
    (s) => s.lead_type === "hot",
  ) || {
    waiting_unhandled: 0,
    currently_handling: 0,
    total_resolved: 0,
  };

  const generalSummary = data.serviceSummary?.find(
    (s) => s.lead_type === "general",
  ) || {
    waiting_unhandled: 0,
    currently_handling: 0,
    total_resolved: 0,
  };

  const totalActive =
    hotSummary.waiting_unhandled +
    hotSummary.currently_handling +
    generalSummary.waiting_unhandled +
    generalSummary.currently_handling;

  const totalResolved =
    hotSummary.total_resolved + generalSummary.total_resolved;

  // Data untuk Pie Chart
  const pieData = [
    { name: "Selesai (Resolved)", value: totalResolved, color: "#10B981" }, // Emerald (Hijau)
    { name: "Aktif / Menunggu", value: totalActive, color: "#F59E0B" }, // Amber (Kuning)
  ];

  return (
    // PERBAIKAN 1: Tambahkan pembatas tinggi dan overflow-y-auto agar bisa di-scroll
    <div className="space-y-6 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar animate-fade-in-up pb-10 pr-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <FiPieChart /> Laporan & Analitik (Superadmin)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pantau performa layanan dan efisiensi agen Customer Service secara
          keseluruhan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- BAGIAN 1: LAPORAN PELAYANAN CHAT (2 Kolom Kiri) --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <FiAlertCircle size={25} className="text-red-500" /> Ringkasan HOT
              Leads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {hotSummary.waiting_unhandled}
                </div>
                <div className="text-xs font-medium text-red-800 dark:text-red-300 mt-1 uppercase">
                  Menunggu Respon
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {hotSummary.currently_handling}
                </div>
                <div className="text-xs font-medium text-orange-800 dark:text-orange-300 mt-1 uppercase">
                  Sedang Ditangani
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl border border-green-100 dark:border-green-500/20">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {hotSummary.total_resolved}
                </div>
                <div className="text-xs font-medium text-green-800 dark:text-green-300 mt-1 uppercase">
                  Selesai (Resolved)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <FiMessageCircle size={25} className="text-blue-500" /> Ringkasan
              GENERAL Leads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-300">
                  {generalSummary.waiting_unhandled}
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase">
                  Menunggu Respon
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {generalSummary.currently_handling}
                </div>
                <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mt-1 uppercase">
                  Sedang Ditangani
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl border border-green-100 dark:border-green-500/20">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {generalSummary.total_resolved}
                </div>
                <div className="text-xs font-medium text-green-800 dark:text-green-300 mt-1 uppercase">
                  Selesai (Resolved)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BAGIAN 2: STATUS GLOBAL (1 Kolom Kanan) --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
            <FiCheckCircle size={25} className="text-green-500" /> Rasio
            Penyelesaian
          </h2>
          <div className="flex-1 min-h-62.5 flex items-center justify-center">
            {totalActive === 0 && totalResolved === 0 ? (
              <p className="text-gray-400 text-sm">
                Belum ada data tiket masuk.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* --- BAGIAN 3: TABEL PERFORMA ADMIN --- */}
      {/* PERBAIKAN 2: Hapus atribut "flex-1" yang membuat tabel ini kegencet */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-2">
          <FiUsers size={25} className="text-brand-dark dark:text-white" />
          <h3 className="font-bold text-brand-dark dark:text-white">
            Performa Agen (Customer Service)
          </h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-white dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Agen
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tiket Diselesaikan
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rata-rata Waktu (Menit)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700/50">
              {data.adminPerformance?.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Belum ada data performa agen.
                  </td>
                </tr>
              ) : (
                data.adminPerformance?.map((cs) => (
                  <tr
                    key={cs.admin_id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-dark dark:text-white">
                      {cs.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                      @{cs.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                        {cs.total_resolved} Tiket
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300 flex justify-center items-center gap-1">
                      <FiClock className="text-gray-400" />
                      {cs.avg_handling_time_minutes
                        ? `${cs.avg_handling_time_minutes} mnt`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
