/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { knowledgeService } from "../services/api";

const tableConfigs = {
  bootcamps: {
    title: "Program Bootcamp",
    fields: [
      { name: "title", label: "Nama Program", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "price", label: "Harga", type: "text" },
      { name: "duration", label: "Durasi", type: "text" },
      { name: "is_active", label: "Status Aktif", type: "checkbox" },
    ],
  },
  universities: {
    title: "Mitra Kampus (Universitas)",
    fields: [
      { name: "name", label: "Nama Kampus", type: "text" },
      {
        name: "partnership_status",
        label: "Status Mitra",
        type: "select",
        options: ["active", "inactive"],
      },
      { name: "benefits", label: "Detail Benefit/Diskon", type: "textarea" },
    ],
  },
  payments: {
    title: "Instruksi Pembayaran",
    fields: [
      { name: "method_name", label: "Metode Pembayaran", type: "text" },
      { name: "account_number", label: "Nomor Rekening", type: "text" },
      { name: "account_holder", label: "Atas Nama", type: "text" },
      { name: "instructions", label: "Instruksi", type: "textarea" },
    ],
  },
  internships: {
    title: "Lowongan Magang",
    fields: [
      { name: "position", label: "Posisi Magang", type: "text" },
      { name: "department", label: "Departemen", type: "text" },
      { name: "requirements", label: "Kualifikasi", type: "textarea" },
      { name: "is_open", label: "Status Buka", type: "checkbox" },
    ],
  },
};

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState("bootcamps");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await knowledgeService.getAll(activeTab);
      setData(res.data);
    } catch (error) {
      console.error("Error Fetching data:", error);
      toast.error(`Gagal memuat data ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Modal Handlers
  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (mode === "edit" && item) {
      setFormData(item);
    } else {
      const emptyState = {};
      tableConfigs[activeTab].fields.forEach((field) => {
        emptyState[field.name] =
          field.type === "checkbox"
            ? true
            : field.type === "select"
              ? field.options[0]
              : "";
      });
      setFormData(emptyState);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e, field) => {
    const value = field.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === "create") {
        await knowledgeService.create(activeTab, formData);
        toast.success("Data berhasil ditambahkan!");
      } else {
        await knowledgeService.update(activeTab, formData.id, formData);
        toast.success("Data berhasil diperbarui!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(`Error ${modalMode} data:`, error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await knowledgeService.delete(activeTab, itemToDelete);
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error Delete Data:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const currentConfig = tableConfigs[activeTab];

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
            Knowledge base AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola basis pengetahuan (Knowledge Base) yang akan dibaca oleh AI
            Chatbot.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="inline-flex items-center justify-center min-h-11 min-w-11 gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md bg-brand-dark hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-brand-dark transition-all cursor-pointer"
        >
          <FiPlus size={18} />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col flex-1 overflow-hidden transition-colors">
        {/* Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex gap-2 overflow-x-auto custom-scrollbar">
          {Object.keys(tableConfigs).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 min-h-11 min-w-11 font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${activeTab === tabKey ? "bg-brand-blue text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
            >
              {tableConfigs[tabKey].title}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  No
                </th>
                {currentConfig.fields.map((field, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={currentConfig.fields.length + 2}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentConfig.fields.length + 2}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Belum ada data pada kategori ini.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {index + 1}
                    </td>

                    {currentConfig.fields.map((field, idx) => (
                      <td
                        key={idx}
                        className="px-6 py-4 text-sm text-center text-brand-dark dark:text-gray-300 max-w-xs truncate"
                      >
                        {field.type === "checkbox" ? (
                          <span
                            className={`px-3 py-1.5 rounded text-xs font-bold ${item[field.name] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {item[field.name] ? "Aktif" : "Nonaktif"}
                          </span>
                        ) : (
                          item[field.name] || "-"
                        )}
                      </td>
                    ))}

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal("edit", item)}
                          className="w-8 h-8 min-h-11 min-w-11 rounded-lg bg-gray-100 text-gray-600 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="w-8 h-8 min-h-11 min-w-11 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-brand-dark dark:text-white">
                {modalMode === "create" ? "Tambah" : "Edit"} Data{" "}
                {currentConfig.title}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {currentConfig.fields.map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                    {field.label}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white"
                    />
                  ) : field.type === "select" ? (
                    <div className="relative">
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(e, field)}
                        className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white cursor-pointer appearance-none transition-colors"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        <FiChevronDown />
                      </div>
                    </div>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) => handleChange(e, field)}
                        className="w-5 h-5 cursor-pointer accent-brand-blue"
                      />
                      <span className="text-sm text-gray-500">
                        Tandai jika aktif/tersedia
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full min-h-11 min-w-11 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium bg-brand-blue text-white hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-red-500 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                  Konfirmasi Hapus Data
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Apakah Anda yakin ingin menghapus data ini secara permanen?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
