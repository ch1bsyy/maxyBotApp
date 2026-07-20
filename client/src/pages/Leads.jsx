import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiEye, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";
import { dashboardService } from "../services/api";
import Pagination from "../components/Pagination";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("true");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce Logic for Search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch Data everytime filter change
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeTab !== "all") params.leadType = activeTab;
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "all") params.isLeadActive = statusFilter;

        const response = await dashboardService.getLeads(params);
        setLeads(response.data);
        setCurrentPage(1);
      } catch (error) {
        toast.error("Gagal memuat data leads");
        console.error("Fetch Leads Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [activeTab, debouncedSearch, statusFilter]);

  // Kalkulasi Pagination Client-Side
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  // Component
  const StatusBadge = ({ isBot }) => (
    <span
      className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium ${isBot ? "bg-brand-blue/10 text-blue-500" : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"}`}
    >
      {isBot ? "Bot" : "Manual"}
    </span>
  );

  const TypeBadge = ({ type }) => (
    <span
      className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider ${type === "hot" ? "bg-red-500/10 text-red-500" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"}`}
    >
      {type}
    </span>
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
          Manajemen Leads
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Kelola dan pantau seluruh prospek pelanggan yang berinteraksi dengan
          AI <i>Chatbot</i>.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col flex-1 overflow-hidden transition-colors">
        {/* Toolbar: Tabs, Search, and Filter */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 space-y-4 md:space-y-0 md:space-x-4 md:flex md:items-center md:justify-between">
          {/* Tab Button */}
          <div className="flex flex-wrap gap-x-2 gap-y-2 md:gap-x-0 md:gap-y-0 items-center justify-center md:space-x-2 bg-white dark:bg-slate-800 md:bg-gray-100 dark:md:bg-slate-700 p-1 rounded-lg self-start transition-all">
            {["all", "hot", "general"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 min-h-11 min-w-11 text-sm font-medium rounded-md capitalize transition-colors cursor-pointer ${activeTab === tab ? "bg-brand-yellow dark:bg-yellow-500 text-brand-dark shadow-" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
              >
                {tab === "all" ? "Semua Leads" : `${tab} Leads`}
              </button>
            ))}
          </div>

          {/* Search & Filter Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama atau no HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-11 min-w-11 sm:w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white text-sm transition-all"
              ></input>
            </div>
            {/* Filter Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full  min-h-11 min-w-11 sm:w-auto pl-10 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="true">Antrean Aktif</option>
                <option value="false">Selesai</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <FiChevronDown />
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Nama Pelanggan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  No Handphone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Waktu Masuk
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tipe Lead
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-brand-blue"
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
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data leads yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((lead, index) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brand-dark dark:text-white">
                        {lead.name || "Anonim"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {lead.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {lead.lastInteractionAt
                        ? format(
                            new Date(lead.lastInteractionAt),
                            "dd MMM yyyy, HH:mm",
                            { locale: id },
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <TypeBadge type={lead.leadType} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge isBot={lead.handlingMode === "bot"} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        to={`/dashboard/leads/${lead.phone_number}`}
                        className="inline-flex min-h-11 min-w-11 items-center gap-2 px-5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-brand-blue hover:bg-brand-blue hover:text-white dark:text-blue-300 transition-colors"
                      >
                        <FiEye size={20} />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Leads;
