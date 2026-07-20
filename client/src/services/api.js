import axios from "axios";

// Initialiation with backend
const api = axios.create({
  baseURL: "https://maxy-bot-app.vercel.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
// const api = axios.create({
//   baseURL: "https://2f57-114-8-223-184.ngrok-free.app/api/v1",
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
// });

// Interceptor: send token every request in backend
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const dashboardService = {
  getMetrics: () => api.get("/dashboard/metrics"),
  getLeads: (params) => api.get("/dashboard/leads", { params }),
  getChatHistory: (phone_number) =>
    api.get(`/dashboard/chat-history/${phone_number}`),
  updateHandling: (phone_number, data) =>
    api.put(`/dashboard/update-handling/${phone_number}`, data),
  getCities: () => api.get("/dashboard/cities"),
};

export const accountService = {
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const managementAccountService = {
  getAccounts: (params) => api.get("/accounts", { params }),
  createAccount: (data) => api.post("/accounts", data),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  toggleStatusAccount: (id) => api.patch(`/accounts/${id}/toggle-status`),
};

export default api;
