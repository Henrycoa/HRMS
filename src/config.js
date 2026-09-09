// frontend/src/config.js
// =========================================================
//  🔧 CHANGE THIS ONE LINE TO SWITCH ENVIRONMENTS
// =========================================================

// For Vercel Production (with InfinityFree backend)
const API_BASE_URL = "/backend";
// const API_BASE_URL = "http://localhost/Lord%20help/backend";
// const API_BASE_URL = "https://hrms1231.infy.click/backend";

// =========================================================
//  📡 ALL API ENDPOINTS
// =========================================================
const API = {
  // =========================================================
  //  🔐 AUTHENTICATION
  // =========================================================
  LOGIN: `${API_BASE_URL}/auth-file/login.php`,
  REGISTER: `${API_BASE_URL}/auth-file/register.php`,
  LOGOUT: `${API_BASE_URL}/auth-file/logout.php`,
  CHECK_AUTH: `${API_BASE_URL}/auth-file/check.php`,
  VERIFY_2FA: `${API_BASE_URL}/auth-file/verify-2fa.php`,
  ENABLE_2FA: `${API_BASE_URL}/auth-file/enable-2fa.php`,
  DISABLE_2FA: `${API_BASE_URL}/auth-file/disable-2fa.php`,
  RESEND_2FA: `${API_BASE_URL}/auth-file/resend-2fa.php`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth-file/forgot-password.php`,
  RESET_PASSWORD: `${API_BASE_URL}/auth-file/reset-password.php`,
  GET_SESSIONS: `${API_BASE_URL}/auth-file/sessions.php`,
  REVOKE_SESSION: (sessionId) =>
    `${API_BASE_URL}/auth-file/sessions.php?action=revoke&id=${sessionId}`,
  REVOKE_ALL_SESSIONS: `${API_BASE_URL}/auth-file/sessions.php?action=revoke-all`,
  UPDATE_IP_RESTRICTIONS: `${API_BASE_URL}/auth-file/ip-restrictions.php`,

  // =========================================================
  //  👥 EMPLOYEES
  // =========================================================
  EMPLOYEES: `${API_BASE_URL}/api/employees.php`,
  EMPLOYEE_SINGLE: (id) => `${API_BASE_URL}/api/employees.php?id=${id}`,
  EMPLOYEE_CREATE: `${API_BASE_URL}/api/employees.php`,
  EMPLOYEE_UPDATE: (id) => `${API_BASE_URL}/api/employees.php?id=${id}`,
  EMPLOYEE_DELETE: (id) => `${API_BASE_URL}/api/employees.php?id=${id}`,
  EMPLOYEE_DOCUMENTS: `${API_BASE_URL}/api/employee-documents.php`,
  EMPLOYEE_PHOTO: `${API_BASE_URL}/api/employee-photo.php`,
  IMPORT_EMPLOYEES: `${API_BASE_URL}/api/import-employees.php`,
  EXPORT_EMPLOYEES: `${API_BASE_URL}/api/export-employees.php`,

  // =========================================================
  //  🏢 DEPARTMENTS & POSITIONS
  // =========================================================
  DEPARTMENTS: `${API_BASE_URL}/api/departments.php`,
  POSITIONS: `${API_BASE_URL}/api/positions.php`,
  ORG_CHART: `${API_BASE_URL}/api/org-chart.php`,

  // =========================================================
  //  🕐 ATTENDANCE
  // =========================================================
  ATTENDANCE: `${API_BASE_URL}/api/attendance.php`,
  ATTENDANCE_TODAY: `${API_BASE_URL}/api/attendance.php?today=1`,
  ATTENDANCE_EXPORT: (dateFrom, dateTo) =>
    `${API_BASE_URL}/api/attendance.php?export=1&date_from=${dateFrom}&date_to=${dateTo}`,
  ATTENDANCE_MANUAL: `${API_BASE_URL}/api/attendance.php`,
  ATTENDANCE_REPORT: `${API_BASE_URL}/api/attendance.php?report=1`,

  // =========================================================
  //  📋 LEAVE MANAGEMENT
  // =========================================================
  LEAVE_TYPES: `${API_BASE_URL}/api/leaves.php?types=1`,
  LEAVES: `${API_BASE_URL}/api/leaves.php`,
  LEAVE_SINGLE: (id) => `${API_BASE_URL}/api/leaves.php?id=${id}`,
  LEAVE_BALANCE: (employeeId, year) =>
    `${API_BASE_URL}/api/leaves.php?balance=1&employee_id=${employeeId}&year=${year || new Date().getFullYear()}`,
  LEAVE_CALENDAR: (month, year) =>
    `${API_BASE_URL}/api/leaves.php?calendar=1&month=${month}&year=${year}`,
  LEAVE_EXPORT: (dateFrom, dateTo) =>
    `${API_BASE_URL}/api/leaves.php?export=1&date_from=${dateFrom}&date_to=${dateTo}`,
  LEAVE_REQUEST: `${API_BASE_URL}/api/leaves.php`,
  LEAVE_APPROVE: (id) => `${API_BASE_URL}/api/leaves.php?id=${id}`,
  LEAVE_REJECT: (id) => `${API_BASE_URL}/api/leaves.php?id=${id}`,
  LEAVE_CANCEL: (id) => `${API_BASE_URL}/api/leaves.php?id=${id}`,
  LEAVE_BULK_APPROVE: `${API_BASE_URL}/api/leaves.php`,
  LEAVE_CREATE_TYPE: `${API_BASE_URL}/api/leaves.php`,

  // =========================================================
  //  📊 PERFORMANCE MANAGEMENT
  // =========================================================
  PERFORMANCE: `${API_BASE_URL}/api/performance.php`,
  PERFORMANCE_COMPETENCIES: `${API_BASE_URL}/api/performance.php?competencies=1`,
  PERFORMANCE_REVIEWS: `${API_BASE_URL}/api/performance.php?reviews=1`,
  PERFORMANCE_REVIEW_SINGLE: (id) =>
    `${API_BASE_URL}/api/performance.php?id=${id}`,
  PERFORMANCE_GOALS: `${API_BASE_URL}/api/performance.php?goals=1`,
  PERFORMANCE_GOAL_SINGLE: (id) =>
    `${API_BASE_URL}/api/performance.php?id=${id}`,
  PERFORMANCE_KPIS: `${API_BASE_URL}/api/performance.php?kpis=1`,
  PERFORMANCE_KPI_SINGLE: (id) =>
    `${API_BASE_URL}/api/performance.php?id=${id}`,
  PERFORMANCE_DASHBOARD: `${API_BASE_URL}/api/performance.php?dashboard=1`,
  PERFORMANCE_CREATE_REVIEW: `${API_BASE_URL}/api/performance.php`,
  PERFORMANCE_SUBMIT_REVIEW: `${API_BASE_URL}/api/performance.php`,
  PERFORMANCE_CREATE_GOAL: `${API_BASE_URL}/api/performance.php`,
  PERFORMANCE_CREATE_KPI: `${API_BASE_URL}/api/performance.php`,
  PERFORMANCE_GOAL_DELETE: (id) =>
    `${API_BASE_URL}/api/performance.php?id=${id}&type=goal`,
  PERFORMANCE_KPI_DELETE: (id) =>
    `${API_BASE_URL}/api/performance.php?id=${id}&type=kpi`,

  // =========================================================
  //  💰 PAYROLL
  // =========================================================
  PAYROLL: `${API_BASE_URL}/api/payroll.php`,
  PAYROLL_SINGLE: (id) => `${API_BASE_URL}/api/payroll.php?id=${id}`,
  PAYROLL_REPORT: `${API_BASE_URL}/api/payroll.php?report=1`,

  // =========================================================
  //  🎯 RECRUITMENT
  // =========================================================
  RECRUITMENT: `${API_BASE_URL}/api/recruitment.php`,
  RECRUITMENT_JOB_POSTINGS: `${API_BASE_URL}/api/recruitment.php?job_postings=1`,
  RECRUITMENT_APPLICANTS: `${API_BASE_URL}/api/recruitment.php?applicants=1`,
  RECRUITMENT_SINGLE: (id) => `${API_BASE_URL}/api/recruitment.php?id=${id}`,

  // =========================================================
  //  📚 TRAINING & DEVELOPMENT
  // =========================================================
  TRAINING: `${API_BASE_URL}/api/training.php`,
  TRAINING_PROGRAMS: `${API_BASE_URL}/api/training.php?programs=1`,
  TRAINING_SESSIONS: `${API_BASE_URL}/api/training.php?sessions=1`,
  TRAINING_SESSION: (id) => `${API_BASE_URL}/api/training.php?sessions=1&session_id=${id}`,
  TRAINING_TRAINERS: `${API_BASE_URL}/api/training.php?trainers=1`,
  TRAINING_MATERIALS: (sessionId) => `${API_BASE_URL}/api/training.php?materials=1&session_id=${sessionId}`,
  TRAINING_ENROLLMENTS: `${API_BASE_URL}/api/training.php?enrollments=1`,
  TRAINING_HISTORY: (employeeId) => `${API_BASE_URL}/api/training.php?history=1&employee_id=${employeeId}`,
  TRAINING_BUDGET: (programId, year) => `${API_BASE_URL}/api/training.php?budget=1&program_id=${programId}&year=${year || new Date().getFullYear()}`,
  TRAINING_SKILL_GAP: (employeeId) => `${API_BASE_URL}/api/training.php?skill-gap=1&employee_id=${employeeId}`,
  TRAINING_REPORT: (type, year) => `${API_BASE_URL}/api/training.php?report=1&type=${type}&year=${year || new Date().getFullYear()}`,
  TRAINING_CREATE_PROGRAM: `${API_BASE_URL}/api/training.php`,
  TRAINING_CREATE_SESSION: `${API_BASE_URL}/api/training.php`,
  TRAINING_ENROLL: `${API_BASE_URL}/api/training.php`,
  TRAINING_UPLOAD_MATERIAL: `${API_BASE_URL}/api/training.php`,
  TRAINING_UPDATE_ENROLLMENT: `${API_BASE_URL}/api/training.php`,
  TRAINING_CREATE_SKILL_GAP: `${API_BASE_URL}/api/training.php`,
  TRAINING_UPDATE_PROGRAM: (id) => `${API_BASE_URL}/api/training.php?id=${id}`,
  TRAINING_UPDATE_SESSION: (id) => `${API_BASE_URL}/api/training.php?id=${id}`,
  TRAINING_DELETE: (id, type) => `${API_BASE_URL}/api/training.php?id=${id}&type=${type}`,

  // =========================================================
  //  📢 NOTIFICATIONS & ANNOUNCEMENTS
  // =========================================================
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications.php`,
  NOTIFICATIONS_LIST: `${API_BASE_URL}/api/notifications.php?notifications=1`,
  NOTIFICATIONS_UNREAD: `${API_BASE_URL}/api/notifications.php?unread-count=1`,
  NOTIFICATIONS_PREFERENCES: `${API_BASE_URL}/api/notifications.php?preferences=1`,
  ANNOUNCEMENTS: `${API_BASE_URL}/api/notifications.php?announcements=1`,
  NOTIFICATION_MARK_READ: `${API_BASE_URL}/api/notifications.php`,
  NOTIFICATION_MARK_ALL_READ: `${API_BASE_URL}/api/notifications.php`,
  NOTIFICATION_ARCHIVE: `${API_BASE_URL}/api/notifications.php`,
  NOTIFICATION_PREFERENCES_UPDATE: `${API_BASE_URL}/api/notifications.php`,
  ANNOUNCEMENT_CREATE: `${API_BASE_URL}/api/notifications.php`,
  ANNOUNCEMENT_UPDATE: (id) => `${API_BASE_URL}/api/notifications.php?id=${id}`,
  ANNOUNCEMENT_DELETE: (id) => `${API_BASE_URL}/api/notifications.php?id=${id}&type=announcement`,
  NOTIFICATION_DELETE: (id) => `${API_BASE_URL}/api/notifications.php?id=${id}&type=notification`,

  // =========================================================
  //  📊 REPORTS & ANALYTICS
  // =========================================================
  REPORTS: `${API_BASE_URL}/api/reports.php`,
  REPORTS_EMPLOYEE: (reportType) => `${API_BASE_URL}/api/reports.php?type=employee&report_type=${reportType}`,
  REPORTS_ATTENDANCE: (period, month, year) => `${API_BASE_URL}/api/reports.php?type=attendance&period=${period}&month=${month}&year=${year}`,
  REPORTS_LEAVE: (year) => `${API_BASE_URL}/api/reports.php?type=leave&year=${year}`,
  REPORTS_PAYROLL: (month, year) => `${API_BASE_URL}/api/reports.php?type=payroll&month=${month}&year=${year}`,
  REPORTS_PERFORMANCE: (year) => `${API_BASE_URL}/api/reports.php?type=performance&year=${year}`,
  REPORTS_TRAINING: (year) => `${API_BASE_URL}/api/reports.php?type=training&year=${year}`,
  REPORTS_RECRUITMENT: (year) => `${API_BASE_URL}/api/reports.php?type=recruitment&year=${year}`,
  REPORTS_DASHBOARD: `${API_BASE_URL}/api/reports.php?type=dashboard`,
  REPORTS_CUSTOM: `${API_BASE_URL}/api/reports.php?type=custom`,
  REPORTS_EXPORT: (type, format, month, year) => `${API_BASE_URL}/api/reports.php?export=1&type=${type}&format=${format}&month=${month}&year=${year}`,

  // =========================================================
  //  🔧 SYSTEM SETTINGS
  // =========================================================
  SETTINGS: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_COMPANY: `${API_BASE_URL}/api/settings.php?company=1`,
  SETTINGS_GET: (group) => `${API_BASE_URL}/api/settings.php?settings=1&group=${group}`,
  SETTINGS_EMAIL: `${API_BASE_URL}/api/settings.php?email=1`,
  SETTINGS_ROLES: `${API_BASE_URL}/api/settings.php?roles=1`,
  SETTINGS_AUDIT: `${API_BASE_URL}/api/settings.php?audit=1`,
  SETTINGS_USERS: `${API_BASE_URL}/api/settings.php?users=1`,
  SETTINGS_UPDATES: `${API_BASE_URL}/api/settings.php?updates=1`,
  SETTINGS_UPDATE_COMPANY: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_UPDATE_SETTINGS: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_UPDATE_EMAIL: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_SAVE_ROLE: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_DELETE_ROLE: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_UPDATE_USER_ROLE: `${API_BASE_URL}/api/settings.php`,
  SETTINGS_BACKUP: `${API_BASE_URL}/api/settings.php`,

  // =========================================================
  //  📈 DASHBOARD
  // =========================================================
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard.php`,

  // =========================================================
  //  ⚙️ SYSTEM
  // =========================================================
  SYSTEM_INFO: `${API_BASE_URL}/api/system.php`,
  SYSTEM_HEALTH: `${API_BASE_URL}/api/health.php`,
};

// =========================================================
//  🌐 APP CONFIGURATION
// =========================================================
const APP_CONFIG = {
  appUrl: API_BASE_URL.replace("/backend", ""),
  env: API_BASE_URL.includes("localhost")
    ? "local"
    : API_BASE_URL.includes("infinityfree") || API_BASE_URL.includes("infy.click")
      ? "production"
      : API_BASE_URL.includes("staging")
        ? "staging"
        : "production",
  debug: false,
  version: "1.0.0",
  defaults: {
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm",
    currency: "PHP",
    itemsPerPage: 10,
  },
  features: {
    attendance: true,
    leaveManagement: true,
    performanceManagement: true,
    payroll: true,
    recruitment: true,
    training: true,
    notifications: true,
    reports: true,
    settings: true,
    twoFactorAuth: true,
    sessionManagement: true,
    ipRestriction: false,
  },
};

// =========================================================
//  📦 EXPORT
// =========================================================
export { API_BASE_URL, API, APP_CONFIG };
export default API;
