/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiPlus,
  FiPower,
  FiShield,
  FiUser,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { managementAccountService } from "../services/api";
import Pagination from "../components/Pagination";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    full_name: "",
    password: "",
    role: "ADMIN",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    isActive: null,
  });
  const [isToggling, setIsToggling] = useState(false);

  // Debounced Effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch Data
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.isActive = statusFilter;

      const res = await managementAccountService.getAccounts(params);
      setAccounts(res.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Gagal memuat data akun");
      console.error("Fetch Accounts Error:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [debouncedSearch, statusFilter]);

  // Handler Open Modal
  const handleOpenModal = (mode, data = null) => {
    setModalMode(mode);
    if (mode === "edit" && data) {
      setFormData({
        id: data._id,
        username: data.username,
        full_name: data.full_name,
        password: "",
        role: data.role,
      });
    } else {
      setFormData({
        id: "",
        username: "",
        full_name: "",
        password: "",
        role: "ADMIN",
      });
    }
    setIsModalOpen(true);
  };

  // Handler Save Data
  const handleSaveForm = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.full_name.trim()) {
      return toast.error("Username dan Nama Lengkap wajib diisi!");
    }
    if (modalMode === "create" && !formData.password.trim()) {
      return toast.error("Kata sandi wajib diisi untuk akun baru!");
    }
    if (formData.password && formData.password.length < 6) {
      return toast.error("Kata sandi minimal 6 karakter!");
    }

    setIsSaving(true);
    try {
      if (modalMode === "create") {
        await managementAccountService.createAccount(formData);
        toast.success("Akun berhasil ditambahkan!");
      } else {
        await managementAccountService.updateAccount(formData.id, formData);
        toast.success("Data akun berhasil diperbarui!");
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan!");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Toggle Status
  const handleToggleStatusClick = (id, currentStatus) => {
    setConfirmModal({ isOpen: true, id, isActive: currentStatus });
  };

  const executeToggleStatus = async () => {
    setIsToggling(true);
    try {
      const res = await managementAccountService.toggleStatusAccount(
        confirmModal.id,
      );
      toast.success(res.data.message);
      setConfirmModal({ isOpen: false, id: null, isActive: null });
      fetchAccounts();
    } catch (error) {
      toast.error("Gagal mengubah status akun");
      console.error("Change Status Error:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(accounts.length / itemsPerPage);

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
            Manajemen Akun
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola data staf, pengaturan peran (<i>role</i>), dan hak akses
            sistem.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="inline-flex min-h-11 min-w-11 px-5 py-2.5 rounded-xl font-bold shadow-md justify-center items-center gap-2 bg-brand-dark hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-brand-dark transition-all cursor-pointer"
        >
          <FiPlus size={18} />
          <span>Tambah Admin Baru</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col flex-1 overflow-hidden transition-colors">
        {/* Search and Filter */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau username..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-h-11 pl-10 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white text-sm appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <FiChevronDown />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
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
                  Identitas
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Role
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
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      <span className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></span>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data akun yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((acc, index) => (
                  <tr
                    key={acc._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold shrink-0">
                          {acc.profile_picture ? (
                            <img
                              src={acc.profile_picture}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FiUser size={18} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm md:text-[15px] font-bold text-brand-dark dark:text-white">
                            {acc.full_name}
                          </div>
                          <div className="text-xs md:text-[13px] text-gray-500 dark:text-gray-400">
                            {acc.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider ${acc.role === "SUPERADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"}`}
                      >
                        {acc.role === "SUPERADMIN" && <FiShield size={12} />}
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider ${acc.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}
                      >
                        {acc.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal("edit", acc)}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-brand-dark hover:text-white dark:hover:bg-white dark:hover:text-brand-dark transition-colors cursor-pointer"
                          title="Edit Akun"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatusClick(acc._id, acc.isActive)
                          }
                          className={`inline-flex min-h-11 min-w-11 items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${acc.isActive ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-500/10" : "bg-green-50 text-green-500 hover:bg-green-500 hover:text-white dark:bg-green-500/10"}`}
                          title={
                            acc.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"
                          }
                        >
                          <FiPower size={18} />
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
      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-brand-dark dark:text-white">
                {modalMode === "create"
                  ? "Tambah Akun Staf Baru"
                  : "Edit Data Akun"}
              </h3>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Masukkan username unik"
                  className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Role (Peran Akses)
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gra-50 dark:bg-slate-700 text-brand-dark dark:text-white cursor-pointer appearance-none transition-colors"
                  >
                    <option value="ADMIN">ADMIN (Staf Layanan)</option>
                    <option value="SUPERADMIN">SUPERADMIN (Manajerial)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                    <FiChevronDown />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  {modalMode === "create" ? "Kata Sandi" : "Kata Sandi Baru"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    modalMode === "edit"
                      ? "Kosongkan jika tidak ingin mengubah sandi"
                      : "Minimal 6 karakter"
                  }
                  className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-white bg-brand-dark hover:bg-black dark:bg-brand-blue dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  )}
                  {modalMode === "create" ? "Simpan Akun" : "Perbarui Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Toggle Status */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${confirmModal.isActive ? "bg-red-100 dark:bg-red-500/20" : "bg-green-100 dark:bg-green-500/20"}`}
              >
                <FiAlertCircle
                  className={`text-2xl ${confirmModal.isActive ? "text-red-500" : "text-green-500"}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                  Konfirmasi Status Akun
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Apakah Anda yakin ingin{" "}
                  <span className="font-bold">
                    {confirmModal.isActive ? "menonaktifkan" : "mengaktifkan"}
                  </span>{" "}
                  akses akun ini?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, id: null, isActive: null })
                }
                disabled={isToggling}
                className="min-h-11 min-w-11 px-5 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeToggleStatus}
                disabled={isToggling}
                className={`min-h-11 min-w-11 px-5 py-2.5 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 cursor-pointer ${confirmModal.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
              >
                {isToggling && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
