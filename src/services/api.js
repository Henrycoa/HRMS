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
  (error) => Promise.reject(error)
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
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// =========================================================
//  EXPORT API INSTANCE
// =========================================================
export default api;

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

// =========================================================
//  LEAVE API
// =========================================================
export const leaveAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/leaves.php?${query}`);
  },
  getTypes: () => api.get("/api/leaves.php?types=1"),
  getBalance: (employeeId, year) =>
    api.get(`/api/leaves.php?balance=1&employee_id=${employeeId}&year=${year || new Date().getFullYear()}`),
  getCalendar: (month, year) =>
    api.get(`/api/leaves.php?calendar=1&month=${month}&year=${year}`),
  create: (data) => api.post("/api/leaves.php", { action: "request", ...data }),
  approve: (id, data) => api.put(`/api/leaves.php?id=${id}`, data),
  reject: (id, data) => api.put(`/api/leaves.php?id=${id}`, data),
  cancel: (id) => api.delete(`/api/leaves.php?id=${id}`),
  bulkApprove: (data) => api.post("/api/leaves.php", { action: "bulk", ...data }),
  export: (dateFrom, dateTo) =>
    api.get(`/api/leaves.php?export=1&date_from=${dateFrom}&date_to=${dateTo}`, {
      responseType: "blob",
    }),
};

// =========================================================
//  PERFORMANCE API
// =========================================================
export const performanceAPI = {
  getCompetencies: () => api.get("/api/performance.php?competencies=1"),
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/performance.php?reviews=1&${query}`);
  },
  getReview: (id) => api.get(`/api/performance.php?id=${id}`),
  getGoals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/performance.php?goals=1&${query}`);
  },
  getKpis: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/performance.php?kpis=1&${query}`);
  },
  getDashboard: () => api.get("/api/performance.php?dashboard=1"),
  createReview: (data) => api.post("/api/performance.php", { action: "create_review", ...data }),
  submitReview: (data) => api.post("/api/performance.php", { action: "submit_review", ...data }),
  createGoal: (data) => api.post("/api/performance.php", { action: "create_goal", ...data }),
  createKpi: (data) => api.post("/api/performance.php", { action: "create_kpi", ...data }),
  updateGoalProgress: (id, progress) =>
    api.put(`/api/performance.php?id=${id}`, { goal_progress: progress }),
  deleteGoal: (id) => api.delete(`/api/performance.php?id=${id}&type=goal`),
  deleteKpi: (id) => api.delete(`/api/performance.php?id=${id}&type=kpi`),
  finalizeReview: (id, data) =>
    api.put(`/api/performance.php?id=${id}`, { finalize_review: true, ...data }),
};

// =========================================================
//  ATTENDANCE API
// =========================================================
export const attendanceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/attendance.php?${query}`);
  },
  getToday: () => api.get("/api/attendance.php?today=1"),
  clockIn: (employeeId) =>
    api.post("/api/attendance.php", { action: "clock_in", employee_id: employeeId }),
  clockOut: (employeeId) =>
    api.post("/api/attendance.php", { action: "clock_out", employee_id: employeeId }),
  break: (employeeId, action) =>
    api.post("/api/attendance.php", { action: "break", break_action: action, employee_id: employeeId }),
  manualEntry: (data) =>
    api.post("/api/attendance.php", { action: "manual_entry", ...data }),
  export: (dateFrom, dateTo) =>
    api.get(`/api/attendance.php?export=1&date_from=${dateFrom}&date_to=${dateTo}`, {
      responseType: "blob",
    }),
  getReport: () => api.get("/api/attendance.php?report=1"),
};

// =========================================================
//  PAYROLL API
// =========================================================
export const payrollAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/payroll.php?${query}`);
  },
  getById: (id) => api.get(`/api/payroll.php?id=${id}`),
  run: (periodStart, periodEnd, generatedBy) =>
    api.get(`/api/payroll.php?run=1&period_start=${periodStart}&period_end=${periodEnd}&generated_by=${generatedBy}`),
  updateStatus: (payrollId, action, userId) =>
    api.post("/api/payroll.php", { action, payroll_id: payrollId, user_id: userId }),
  updateSalary: (data) => api.put("/api/payroll.php", data),
  getReport: () => api.get("/api/payroll.php?report=1"),
  export: (periodStart, periodEnd) =>
    api.get(`/api/payroll.php?export=1&period_start=${periodStart}&period_end=${periodEnd}`, {
      responseType: "blob",
    }),
};

// =========================================================
//  RECRUITMENT API
// =========================================================
export const recruitmentAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/recruitment.php?${query}`);
  },
  getJobPostings: () => api.get("/api/recruitment.php?job_postings=1"),
  getApplicants: () => api.get("/api/recruitment.php?applicants=1"),
  getById: (id) => api.get(`/api/recruitment.php?id=${id}`),
  create: (data) => api.post("/api/recruitment.php", data),
  update: (id, data) => api.put(`/api/recruitment.php?id=${id}`, data),
  delete: (id) => api.delete(`/api/recruitment.php?id=${id}`),
};

// =========================================================
//  TRAINING API
// =========================================================
export const trainingAPI = {
  getPrograms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/training.php?programs=1&${query}`);
  },
  getSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/training.php?sessions=1&${query}`);
  },
  getSession: (id) => api.get(`/api/training.php?sessions=1&session_id=${id}`),
  getTrainers: () => api.get("/api/training.php?trainers=1"),
  getMaterials: (sessionId) =>
    api.get(`/api/training.php?materials=1&session_id=${sessionId}`),
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/training.php?enrollments=1&${query}`);
  },
  getHistory: (employeeId) =>
    api.get(`/api/training.php?history=1&employee_id=${employeeId}`),
  getBudget: (programId, year) =>
    api.get(`/api/training.php?budget=1&program_id=${programId}&year=${year || new Date().getFullYear()}`),
  getSkillGap: (employeeId) =>
    api.get(`/api/training.php?skill-gap=1&employee_id=${employeeId}`),
  getReport: (type, year) =>
    api.get(`/api/training.php?report=1&type=${type}&year=${year || new Date().getFullYear()}`),
  createProgram: (data) => api.post("/api/training.php", { action: "create_program", ...data }),
  createSession: (data) => api.post("/api/training.php", { action: "create_session", ...data }),
  enroll: (data) => api.post("/api/training.php", { action: "enroll", ...data }),
  updateEnrollment: (data) => api.post("/api/training.php", { action: "update_enrollment", ...data }),
  createSkillGap: (data) => api.post("/api/training.php", { action: "create_skill_gap", ...data }),
  updateProgram: (id, data) => api.put(`/api/training.php?id=${id}`, { update_program: true, ...data }),
  updateSession: (id, data) => api.put(`/api/training.php?id=${id}`, { update_session: true, ...data }),
  delete: (id, type) => api.delete(`/api/training.php?id=${id}&type=${type}`),
};

// =========================================================
//  COMPANY API
// =========================================================
export const companyAPI = {
  getDepartments: () => api.get("/api/departments.php"),
  createDepartment: (data) => api.post("/api/departments.php", data),
  updateDepartment: (id, data) => api.put(`/api/departments.php?id=${id}`, data),
  deleteDepartment: (id) => api.delete(`/api/departments.php?id=${id}`),
  getPositions: () => api.get("/api/positions.php"),
  createPosition: (data) => api.post("/api/positions.php", data),
  updatePosition: (id, data) => api.put(`/api/positions.php?id=${id}`, data),
  deletePosition: (id) => api.delete(`/api/positions.php?id=${id}`),
  getOrgChart: () => api.get("/api/org-chart.php"),
};

// =========================================================
//  NOTIFICATIONS API
// =========================================================
export const notificationAPI = {
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/notifications.php?notifications=1&${query}`);
  },
  getUnreadCount: () => api.get("/api/notifications.php?unread-count=1"),
  getPreferences: () => api.get("/api/notifications.php?preferences=1"),
  getAnnouncements: () => api.get("/api/notifications.php?announcements=1"),
  markRead: (notificationId) =>
    api.post("/api/notifications.php", { action: "mark_read", notification_id: notificationId }),
  markAllRead: () =>
    api.post("/api/notifications.php", { action: "mark_all_read" }),
  archive: (notificationId) =>
    api.post("/api/notifications.php", { action: "archive", notification_id: notificationId }),
  updatePreferences: (preferences) =>
    api.post("/api/notifications.php", { action: "update_preferences", preferences }),
  createAnnouncement: (data) =>
    api.post("/api/notifications.php", { action: "create_announcement", ...data }),
  updateAnnouncement: (id, data) =>
    api.put(`/api/notifications.php?id=${id}`, { update_announcement: true, ...data }),
  deleteAnnouncement: (id) =>
    api.delete(`/api/notifications.php?id=${id}&type=announcement`),
  deleteNotification: (id) =>
    api.delete(`/api/notifications.php?id=${id}&type=notification`),
};

// =========================================================
//  REPORTS API
// =========================================================
export const reportsAPI = {
  getEmployeeReport: (reportType) =>
    api.get(`/api/reports.php?type=employee&report_type=${reportType}`),
  getAttendanceReport: (period, month, year) =>
    api.get(`/api/reports.php?type=attendance&period=${period}&month=${month}&year=${year}`),
  getLeaveReport: (year) =>
    api.get(`/api/reports.php?type=leave&year=${year}`),
  getPayrollReport: (month, year) =>
    api.get(`/api/reports.php?type=payroll&month=${month}&year=${year}`),
  getPerformanceReport: (year) =>
    api.get(`/api/reports.php?type=performance&year=${year}`),
  getTrainingReport: (year) =>
    api.get(`/api/reports.php?type=training&year=${year}`),
  getRecruitmentReport: (year) =>
    api.get(`/api/reports.php?type=recruitment&year=${year}`),
  getDashboardStats: () =>
    api.get(`/api/reports.php?type=dashboard`),
  getCustomReport: (data) =>
    api.post(`/api/reports.php?type=custom`, data),
  exportReport: (type, format, month, year) =>
    api.get(`/api/reports.php?export=1&type=${type}&format=${format}&month=${month}&year=${year}`, {
      responseType: "blob",
    }),
};

// =========================================================
//  SETTINGS API
// =========================================================
export const settingsAPI = {
  getCompany: () => api.get("/api/settings.php?company=1"),
  getSettings: (group) =>
    api.get(`/api/settings.php?settings=1&group=${group}`),
  getEmailSettings: () => api.get("/api/settings.php?email=1"),
  getRoles: () => api.get("/api/settings.php?roles=1"),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/settings.php?audit=1&${query}`);
  },
  getUsers: () => api.get("/api/settings.php?users=1"),
  getUpdates: () => api.get("/api/settings.php?updates=1"),
  updateCompany: (data) =>
    api.post("/api/settings.php", { action: "update_company", ...data }),
  updateSettings: (settings) =>
    api.post("/api/settings.php", { action: "update_settings", settings }),
  updateEmailSettings: (data) =>
    api.post("/api/settings.php", { action: "update_email", ...data }),
  saveRole: (data) =>
    api.post("/api/settings.php", { action: "save_role", ...data }),
  deleteRole: (roleId) =>
    api.post("/api/settings.php", { action: "delete_role", role_id: roleId }),
  updateUserRole: (userId, userType, userStatus) =>
    api.post("/api/settings.php", { action: "update_user_role", user_id: userId, user_type: userType, user_status: userStatus }),
  backup: () => api.post("/api/settings.php", { action: "backup" }),
};

// =========================================================
//  DASHBOARD API
// =========================================================
export const dashboardAPI = {
  getStats: () => api.get("/api/dashboard.php"),
};

// =========================================================
//  SYSTEM API
// =========================================================
export const systemAPI = {
  getInfo: () => api.get("/api/system.php"),
  getHealth: () => api.get("/api/health.php"),
};
