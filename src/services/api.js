// frontend/src/services/api.js
import axios from "axios";
import { API_BASE_URL } from "../config";

// =========================================================
//  CREATE AXIOS INSTANCE
// =========================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// =========================================================
//  REQUEST INTERCEPTOR
// =========================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// =========================================================
//  RESPONSE INTERCEPTOR
// =========================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee_id");
      
      if (window.location.pathname !== "/login" && 
          window.location.pathname !== "/register" &&
          window.location.pathname !== "/forgot-password" &&
          window.location.pathname !== "/reset-password") {
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 403) {
      console.warn('⚠️ [API] Forbidden - Insufficient permissions');
    }
    
    if (error.response?.status >= 500) {
      console.error('❌ [API] Server Error:', error.response.data);
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ [API] Network Error - Please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// =========================================================
//  API HELPERS
// =========================================================
api.getWithParams = (url, params = {}) => {
  return api.get(url, { params });
};

api.postFormData = (url, formData) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

api.putFormData = (url, formData) => {
  return api.put(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// =========================================================
//  AUTH API
// =========================================================
export const authAPI = {
  login: (username, password) =>
    api.post("/auth-file/login.php", { username, password }),
  register: (userData) => api.post("/auth-file/register.php", userData),
  logout: () => api.post("/auth-file/logout.php"),
  me: () => api.get("/auth-file/me.php"),
};

// =========================================================
//  EMPLOYEE API
// =========================================================
export const employeeAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/employees.php?${query}`);
  },
  getById: (id) => api.get(`/api/employees.php?id=${id}`),
  create: (data) => api.post("/api/employees.php", data),
  update: (id, data) => api.put(`/api/employees.php?id=${id}`, data),
  delete: (id) => api.delete(`/api/employees.php?id=${id}`),
  uploadPhoto: (employeeId, file) => {
    const formData = new FormData();
    formData.append("employee_id", employeeId);
    formData.append("photo", file);
    return api.post("/api/employee-photo.php", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getPhoto: (employeeId) =>
    api.get(`/api/employee-photo.php?employee_id=${employeeId}`),
  deletePhoto: (employeeId) =>
    api.delete(`/api/employee-photo.php?employee_id=${employeeId}`),
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
