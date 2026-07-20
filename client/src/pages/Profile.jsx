import { useState, useRef } from "react";
import {
  FiUpload,
  FiSave,
  FiLock,
  FiUser,
  FiX,
  FiEye,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { accountService } from "../services/api";

const Profile = () => {
  const { user, updateLocalUser } = useAuth();

  // Profile State
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    profile_picture: user?.profile_picture || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Image Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Modal Confirmation State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
  });

  const fileInputRef = useRef(null);

  // Cloudinary Preset
  const CLOUDINARY_UPLOAD_PRESET = "maxybot";
  const CLOUDINARY_CLOUD_NAME = "drlpc9ipc";

  // Handler Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Ukuran gambar maksimal 2MB");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      const data = await response.json();
      if (data.secure_url) {
        setProfileData((prev) => ({
          ...prev,
          profile_picture: data.secure_url,
        }));
        toast.success("Foto berhasil diunggah! Jangan lupa klik Simpan.");
      }
    } catch (error) {
      toast.error("Gagal mengunggah gambar");
      console.error("Gagal mengunggah foto profil", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger Modal
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileData.username || !profileData.full_name) {
      return toast.error("Username dan Nama Lengkap wajib diisi!");
    }
    setConfirmModal({ isOpen: true, type: "profile" });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Semua kolom kata sandi harus diisi!");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi kata sandi baru tidak cocok!");
    }
    if (newPassword.length < 6) {
      return toast.error("Kata sandi baru minimal 6 karakter!");
    }
    setConfirmModal({ isOpen: true, type: "password" });
  };

  // Execute API after confirm
  const executeSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const payload = {
        accountId: user._id,
        username: profileData.username,
        full_name: profileData.full_name,
        profile_picture: profileData.profile_picture,
      };

      const res = await accountService.updateProfile(payload);
      updateLocalUser(res.data.data);
      toast.success("Profil berhasil diperbarui");
      setConfirmModal({ isOpen: false, type: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const executeSavePassword = async () => {
    setIsSavingPassword(true);
    const { oldPassword, newPassword } = passwordData;
    try {
      await accountService.changePassword({
        accountId: user._id,
        oldPassword,
        newPassword,
      });
      toast.success("Kata sandi berhasil diubah!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setConfirmModal({ isOpen: false, type: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah kata sandi");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
          Pengaturan Profil
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi akun dan pengaturan keamanan di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-brand-dark dark:text-white border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
              Informasi Akun
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Picture Area */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={() =>
                    profileData.profile_picture && setIsPreviewOpen(true)
                  }
                  title={profileData.profile_picture ? "Lihat Foto" : ""}
                >
                  <div className="w-24 h-24 rounded-full bg-brand-yellow flex items-center justify-center text-4xl text-white font-bold overflow-hidden shrink-0 border-4 border-white dark:border-slate-800 shadow-md relative">
                    {profileData.profile_picture ? (
                      <>
                        <img
                          src={profileData.profile_picture}
                          alt="Profile"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {/* Dark Overlay when Hover */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <FiEye className="text-white text-2xl" />
                        </div>
                      </>
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase() || <FiUser />
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-dark dark:text-white">
                    Foto Profil
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Format JPG, PNG max 2MB.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="inline-flex min-h-11 min-w-11 items-center gap-2 px-4 py-2 border border-yellow-300 bg-brand-yellow hover:bg-yellow-400 hover:scale-105 rounded-lg text-sm font-medium text-brand-dark transition-all cursor-pointer"
                  >
                    {isUploading ? (
                      "Mengunggah..."
                    ) : (
                      <>
                        <FiUpload size={16} /> Pilih Foto
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Input Profil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                    Peran (Role)
                  </label>
                  <input
                    type="text"
                    value={`${user.role === "SUPERADMIN" ? "Superadmin" : "Administrator"}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex min-h-11 min-w-11 items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <FiSave size={20} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Change Password */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-brand-dark dark:text-white border-b border-gray-200 dark:border-slate-700 pb-4 mb-6 flex items-center gap-2">
              <FiLock /> Keamanan
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-brand-dark dark:text-gray-300">
                  Konfirmasi Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50 dark:bg-slate-700 text-brand-dark dark:text-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-11 min-w-11 inline-flex justify-center items-center gap-2 bg-slate-800 dark:bg-brand-blue hover:bg-slate-700 dark:hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors mt-4 cursor-pointer"
              >
                <FiLock size={20} />
                Perbarui Kata Sandi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Profile Picture Preview */}
      {isPreviewOpen && profileData.profile_picture && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPreviewOpen(false);
              }}
              className="absolute -top-2 min-w-11 min-h-11 inline-flex items-center justify-center right-0 md:-right-1 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
            >
              <FiX size={24} />
            </button>
            <img
              src={profileData.profile_picture}
              alt="Profile Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-brand-yellow text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                  Konfirmasi Perubahan
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  {confirmModal.type === "profile"
                    ? "Apakah Anda yakin ingin menyimpan perubahan informasi profil ini?"
                    : "Apakah Anda yakin ingin memperbarui kata sandi Anda sekarang?"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null })}
                disabled={isSavingProfile || isSavingPassword}
                className="px-5 py-2.5 rounded-lg min-h-11 min-w-11 font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "profile") executeSaveProfile();
                  if (confirmModal.type === "password") executeSavePassword();
                }}
                disabled={isSavingProfile || isSavingPassword}
                className="px-5 py-2.5 rounded-lg min-h-11 min-w-11 font-medium text-white bg-brand-blue hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {(isSavingProfile || isSavingPassword) && (
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

export default Profile;
