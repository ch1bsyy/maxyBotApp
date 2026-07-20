import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBook,
  FiCheck,
  FiMessageCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import toast from "react-hot-toast";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DetailLead = () => {
  const { phone_number } = useParams();
  const navigate = useNavigate();
  const { user: accountUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await dashboardService.getChatHistory(phone_number);
        setUserData(response.data.user);
        setMessages(response.data.messages);
      } catch (error) {
        toast.error("Gagal memuat detail lead");
        console.error("Error", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [phone_number]);

  // Auto-Scroll if load
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Finish Hot or General Leads
  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await dashboardService.updateHandling(phone_number, {
        action: "complete",
      });
      toast.success("Lead berhasil ditandai selesai");
      setIsConfirmModalOpen(false);
      navigate("/dashboard/leads");
    } catch (error) {
      toast.error("Gagal memperbarui status");
      console.error("Error Update Status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reply by WA Logic
  const handleReplyWA = async () => {
    setIsUpdating(true);
    try {
      await dashboardService.updateHandling(phone_number, {
        action: "takeover",
        accountId: accountUser?._id || null,
      });

      window.open(`https://wa.me/${phone_number}`, "_blank");

      // Update UI Locale
      setUserData((prev) => ({
        ...prev,
        handlingMode: "manual",
        handledBy: accountUser,
      }));
      toast.success("Percakapan diambil alih. Membuka WhatsApp...");
    } catch (error) {
      toast.error("Gagal mengambil alih percakapan");
      console.error("Error Redirect to WhatsApp", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Memuat data...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center text-gray-500 py-10">
        Data tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
          to="/dashboard/leads"
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
            Detail Lead
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            {userData.handlingMode === "manual" && userData.handledBy
              ? `Sedang ditangani oleh ${userData.handledBy.full_name}`
              : userData.handlingMode === "manual"
                ? "Sedang ditangani manual (Admin belum teridentifikasi)"
                : "Ditangani oleh AI Chatbot"}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Card Profil */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center text-2xl text-white font-bold shrink-0">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-dark dark:text-white">
                  {userData.name || "Anonim"}
                </h2>
                <span
                  className={`inline-block px-2 py-1 mt-1 rounded text-xs font-bold uppercase ${userData.leadType === "hot" ? "bg-red-500/10 text-red-500" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"}`}
                >
                  {userData.leadType} LEAD
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-500">
                  <FiPhone size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nomor HP
                  </p>
                  <p className="font-medium text-brand-dark dark:text-white">
                    {userData.phone_number}
                  </p>
                </div>
              </div>
              {userData.university && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-500">
                    <FiBook size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Universitas
                    </p>
                    <p className="font-medium text-brand-dark dark:text-white">
                      {userData.university}
                    </p>
                  </div>
                </div>
              )}
              {userData.city && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-500">
                    <FiMapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kota
                    </p>
                    <p className="font-medium text-brand-dark dark:text-white">
                      {userData.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {userData.isLeadActive && (
            <div className="flex flex-col gap-3">
              {userData.handlingMode === "bot" ? (
                <button
                  onClick={handleReplyWA}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  <FiMessageCircle size={18} /> Ambil Alih dan Balas (WA)
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReplyWA}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    <FiMessageCircle size={18} />
                    Balas via WhatsApp
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 text-brand-dark dark:text-white py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    <FiCheck size={18} />
                    Tandai Selesai
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <FiMessageCircle /> Riwayat Percakapan AI
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-10">
                Belum ada riwayat percakapan.
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender === "user"
                        ? "bg-gray-100 dark:bg-slate-700 text-brand-dark dark:text-gray-100 rounded-tl-sm"
                        : "bg-brand-blue text-white rounded-tr-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 mx-1">
                    {format(new Date(msg.timestamp), "HH:mm", {
                      locale: localeID,
                    })}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-brand-blue text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                  Konfirmasi Penyelesaian
                </h3>
                <p className="text-sm md:text-base dark:text-white">
                  Apakah Anda yakin ingin menandai lead ini sebagai Selesai?
                  Penanganan akan dikembalikan sepenuhnya ke AI Chatbot.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isUpdating}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleComplete}
                disabled={isUpdating}
                className="px-5 py-2.5 min-h-11 min-w-11 rounded-lg font-medium text-white bg-brand-blue hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdating && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}
                Ya, Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailLead;
