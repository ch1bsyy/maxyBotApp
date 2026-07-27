import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiX,
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus panduan ini?")) {
      try {
        await guideService.delete(id);
        toast.success("Panduan dihapus");
        fetchGuides();
      } catch (error) {
        console.error("Error Delete Data:", error);
        toast.error("Gagal menghapus panduan");
      }
    }
  };

  if (loading)
    return <div className="text-center py-10">Memuat panduan...</div>;

  return (
    <div className="space-y-6 flex flex-col h-full animate-fade-in-up">
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
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <FiPlus size={18} /> Tambah Panduan
          </button>
        )}
      </div>

      <div className="space-y-4">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => toggleExpand(guide.id)}
            >
              <h3 className="font-bold text-brand-dark dark:text-white pr-4">
                {guide.question}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                {isSuperAdmin && (
                  <div
                    className="flex items-center gap-2 mr-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openModal(guide)}
                      className="p-2 text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full hidden sm:block">
                  {guide.category}
                </span>
                {expandedId === guide.id ? (
                  <FiChevronUp className="text-gray-400" />
                ) : (
                  <FiChevronDown className="text-gray-400" />
                )}
              </div>
            </div>

            {expandedId === guide.id && (
              <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30 text-gray-600 dark:text-gray-300">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {guide.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold dark:text-white">
                {editingId ? "Edit Panduan" : "Tambah Panduan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={24} />
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
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Jawaban / Solusi
                </label>
                <textarea
                  required
                  rows="5"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGuide;
