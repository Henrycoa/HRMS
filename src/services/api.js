// frontend/src/services/api.js
import axios from "axios";

const API_URL = "/backend";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (username, password) =>
    api.post("/auth-file/login.php", { username, password }),
  register: (userData) => api.post("/auth-file/register.php", userData),
  logout: () => api.post("/auth-file/logout.php"),
  me: () => api.get("/auth-file/me.php"),
};

// ============================================
// EMPLOYEE API - COMPLETE
// ============================================
export const employeeAPI = {
  // CRUD
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/employees.php?${query}`);
  },
  getById: (id) => api.get(`/api/employees.php?id=${id}`),
  create: (data) => api.post("/api/employees.php", data),
  update: (id, data) => api.put(`/api/employees.php?id=${id}`, data),
  delete: (id) => api.delete(`/api/employees.php?id=${id}`),

  // ✅ PHOTO UPLOAD - Complete
  uploadPhoto: (employeeId, file) => {
    const formData = new FormData();
    formData.append("employee_id", employeeId);
    formData.append("photo", file);
    return api.post("/api/employee-photo.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get photo
  getPhoto: (employeeId) =>
    api.get(`/api/employee-photo.php?employee_id=${employeeId}`),

  // Delete photo
  deletePhoto: (employeeId) =>
    api.delete(`/api/employee-photo.php?employee_id=${employeeId}`),

  // Documents
  uploadDocument: (employeeId, file, documentName) => {
    const formData = new FormData();
    formData.append("employee_id", employeeId);
    formData.append("document", file);
    formData.append("document_name", documentName || file.name);
    return api.post("/api/employee-documents.php", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getDocuments: (employeeId) =>
    api.get(`/api/employee-documents.php?employee_id=${employeeId}`),
  deleteDocument: (documentId) =>
    api.delete(`/api/employee-documents.php?id=${documentId}`),

  // Import / Export
  importEmployees: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/import-employees.php", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  exportEmployees: (format = "csv") =>
    api.get(`/api/export-employees.php?format=${format}`, {
      responseType: "blob",
    }),
};

export default api;
