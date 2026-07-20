import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiMessageCircle,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";
import { dashboardService } from "../services/api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

const Customers = () => {
  const { user: accountUser } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch Data and Cities
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cityRes = await dashboardService.getCities();
        setCities(cityRes.data);
      } catch (error) {
        console.error("Gagal memuat kota", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await dashboardService.getLeads(params);
        let data = response.data;

        if (cityFilter !== "all") {
          data = data.filter((c) => c.city === cityFilter);
        }

        setCustomers(data);
        setCurrentPage(1);
      } catch (error) {
        toast.error("Gagal memuat data pelanggan");
        console.error("Gagal memuat data pelanggan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [debouncedSearch, cityFilter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  // Export to CSV Logic
  const exportToCSV = () => {
    if (customers.length === 0)
      return toast.error("Tidak ada data untuk diekspor");

    const headers = [
      "No",
      "Nama Lengkap",
      "Nomor HP",
      "Kota",
      "Universitas",
      "Status Pekerjaan",
      "IPK",
      "Interaksi Terakhir",
    ];

    const csvRows = customers.map((c, index) => [
      index + 1,
      `"${c.name || "Anonim"}"`,
      `"${c.phone_number}"`,
      `"${c.city || "-"}"`,
      `"${c.university || "-"}"`,
      `"${c.employement_status || "-"}"`,
      `"${c.ipk || "-"}"`,
      `"${c.lastInteractionAt ? format(new Date(c.lastInteractionAt), "yyyy-MM-dd HH:mm") : "-"}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((e) => e.join(",")),
    ].join("\n");

    // download document
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Data_Pelanggan_MaxyBot_${format(new Date(), "ddMMyyyy")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV berhasil diunduh");
  };

  const openDetail = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleChatWA = async (phoneNumber) => {
    try {
      await dashboardService.updateHandling(phoneNumber, {
        action: "takeover",
        accountId: accountUser?._id || null,
      });

      window.open(`https://wa.me/${phoneNumber}`, "_blank");

      setIsModalOpen(false);
      toast.success("Membuka WhatsApp dan mengaktifkan antrean");
      // fetchCustomer();
    } catch (error) {
      toast.error("Gagal memulai obrolan");
      console.error("Chat WA Error:", error);
    }
  };
  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
            Master Data Pelanggan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Basis data lengkap seluruh pengguna yang terdaftar pada sistem AI
            Chatbot
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-2 bg-brand-yellow/90 hover:bg-yellow-400 text-dark px-4 py-2.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer"
        >
          <FiDownload size={18} />
          <span>Export ke CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col flex-1 overflow-hidden transition-colors">
        {/* Toolbar: Search and Filter */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau no HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-11 pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white text-sm transition-colors"
            />
          </div>

          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full min-h-11 pl-10 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white text-sm appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Kota</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <FiChevronDown />
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
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Pelanggan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Kota
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Interaksi Terakhir
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
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((customer, index) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 flex flex-col justify-center items-center whitespace-nowrap">
                      <div className="text-sm font-medium text-brand-dark dark:text-white">
                        {customer.name || "Anonim"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {customer.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
                      {customer.city || "-"}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
                      {customer.lastInteractionAt
                        ? format(
                            new Date(customer.lastInteractionAt),
                            "dd MMM yyyy, HH:mm",
                            { locale: id },
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetail(customer)}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white cursor-pointer transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye size={20} />
                        </button>
                        <button
                          onClick={() => handleChatWA(customer.phone_number)}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white cursor-pointer transition-colors"
                          title="Chat via WhatsApp"
                        >
                          <FiMessageCircle size={20} />
                        </button>
                      </div>
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

      {/* Modal Detail Customer */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-brand-dark dark:text-white">
                Detail Pelanggan
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Nama</span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.name || "Anonim"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  No. WhatsApp
                </span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.phone_number}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Kota</span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.city || "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Universitas
                </span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.university || "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-slate-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Pekerjaan
                </span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.employement_status || "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">IPK</span>
                <span className="colspan-2 font-medium text-brand-dark dark:text-white">
                  {selectedCustomer.ipk || "-"}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => handleChatWA(selectedCustomer.phone_number)}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                <FiMessageCircle size={18} />
                Mulai Obrolan WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
