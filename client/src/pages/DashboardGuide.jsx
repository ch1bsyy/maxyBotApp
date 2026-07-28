import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiX,
  FiFilter,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { guideService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DashboardGuide = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Umum",
  });

  const fetchGuides = async () => {
    try {
      const res = await guideService.getAll();
      setGuides(res.data);
    } catch (error) {
      console.error("Error Fetching Data:", error);
      toast.error("Gagal memuat panduan sistem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Extraction Category
  const categories = ["Semua", ...new Set(guides.map((g) => g.category))];

  // Filter data by selected category
  const filteredGuides =
    selectedCategory === "Semua"
      ? guides
      : guides.filter((g) => g.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openModal = (guide = null) => {
    if (guide) {
      setEditingId(guide.id);
      setFormData({
        question: guide.question,
        answer: guide.answer,
        category: guide.category,
      });
    } else {
      setEditingId(null);
      setFormData({ question: "", answer: "", category: "Umum" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await guideService.update(editingId, formData);
        toast.success("Panduan diperbarui");
      } else {
        await guideService.create(formData);
        toast.success("Panduan ditambahkan");
      }
      setIsModalOpen(false);
      fetchGuides();
    } catch (error) {
      console.error("Error Save Data:", error);
      toast.error("Gagal menyimpan panduan");
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await guideService.delete(deletingId);
      toast.success("Panduan dihapus");
      fetchGuides();
    } catch (error) {
      console.error("Error Delete Data:", error);
      toast.error("Gagal menghapus panduan");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  if (loading)
    return <div className="text-center py-10">Memuat panduan...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-10 animate-fade-in-up pt-2 px-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <FiBookOpen /> Panduan Sistem (SOP)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Pertanyaan dan jawaban seputar operasional dashboard MaxyBot.
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 bg-brand-yellow hover:bg-yellow-500 text-brand-dark hover:text-black px-4 py-2.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer"
            >
              <FiPlus size={18} /> Tambah Panduan
            </button>
          )}
        </div>

        {/* Filter Category */}
        {guides.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            <FiFilter
              size={18}
              className="text-gray-500 dark:text-gray-400 shrink-0"
            />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 min-h-11 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* List Panduan (Accordion) */}
        <div className="space-y-4">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada panduan untuk kategori ini.
              </p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-200"
              >
                <div
                  className="p-4 sm:p-5 cursor-pointer flex items-start sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gap-4"
                  onClick={() => toggleExpand(guide.id)}
                >
                  <h3 className="font-bold text-brand-dark dark:text-white flex-1 leading-relaxed">
                    {guide.question}
                  </h3>
                  <div className="flex items-center gap-3 shrink-0 mt-1 sm:mt-0">
                    {isSuperAdmin && (
                      <div
                        className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4 border-r border-gray-200 dark:border-slate-600 pr-3 sm:pr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openModal(guide)}
                          className="min-h-11 min-w-11 p-2 inline-flex items-center justify-center text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(guide.id)}
                          className="min-h-11 min-w-11 p-2 inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                    <span className="text-xs sm:text-[13px] font-medium px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full hidden sm:block">
                      {guide.category}
                    </span>
                    <div className="p-1 bg-gray-100 dark:bg-slate-700 rounded-full">
                      {expandedId === guide.id ? (
                        <FiChevronUp
                          className="text-gray-500 dark:text-gray-300"
                          size={18}
                        />
                      ) : (
                        <FiChevronDown
                          className="text-gray-500 dark:text-gray-300"
                          size={18}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === guide.id && (
                  <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30 text-gray-600 dark:text-gray-300 animate-fade-in-up">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {guide.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold dark:text-white">
                {editingId ? "Edit Panduan" : "Tambah Panduan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-red-50 p-2 rounded-full cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Pertanyaan
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:bg-slate-700 border-gray-300 dark:border-slate-600 dark:text-white"
                  placeholder="Contoh: Bagaimana cara mengubah password?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:bg-slate-700 border-gray-300 dark:border-slate-600 dark:text-white"
                  placeholder="Contoh: Akun & Profil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Jawaban / Solusi
                </label>
                <textarea
                  required
                  rows="6"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:bg-slate-700 border-gray-300 dark:border-slate-600 dark:text-white resize-none custom-scrollbar"
                  placeholder="Tuliskan langkah-langkah solusi di sini..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-11 min-w-11 px-5 py-2.5 text-sm sm:text-[15px] font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-11 min-w-11 px-5 py-2.5 text-sm sm:text-[15px] font-medium text-white bg-brand-blue hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Panduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 animate-fade-in-up text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-red-500 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                  Konfirmasi Hapus
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Apakah Anda yakin ingin menghapus panduan ini? Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                }}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGuide;
