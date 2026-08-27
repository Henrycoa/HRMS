// frontend/src/components/settings/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // 👈 ADD THIS
import Layout from '../layout/Layout';
import { 
    FaCog, FaBuilding, FaEnvelope, FaUsers, FaShieldAlt,
    FaDatabase, FaHistory, FaLock, FaDownload, FaSync,
    FaSpinner, FaSave, FaEdit, FaTrash, FaUserPlus,
    FaCheck, FaTimes, FaKey, FaGlobe, FaPalette, // 👈 ADD FaPalette
    FaMoon, FaSun
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme(); // 👈 ADD THIS
    const [activeTab, setActiveTab] = useState('company');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Company Profile
    const [company, setCompany] = useState({
        company_name: 'HRMS Enterprise',
        address: '',
        phone: '',
        email: '',
        website: '',
        registration_number: '',
        tin: '',
        industry: '',
        timezone: 'Asia/Manila',
        date_format: 'Y-m-d',
        currency: 'PHP'
    });

    // General Settings
    const [settings, setSettings] = useState([]);
    const [settingsMap, setSettingsMap] = useState({});

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        mail_driver: 'smtp',
        mail_host: 'smtp.gmail.com',
        mail_port: 587,
        mail_username: '',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: 'noreply@hrms.com',
        mail_from_name: 'HRMS System',
        is_active: 1
    });

    // User Management
    const [users, setUsers] = useState([]);

    // Roles
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleForm, setRoleForm] = useState({
        role_id: 0,
        name: '',
        description: '',
        permissions: []
    });

    // Audit Logs
    const [auditLogs, setAuditLogs] = useState([]);

    // System Updates
    const [updates, setUpdates] = useState([]);

    const isSuperAdmin = () => user?.user_type === 'super_admin';
    const isHR = () => ['super_admin', 'hr_manager'].includes(user?.user_type);

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        if (activeTab === 'company') fetchCompany();
        if (activeTab === 'general') fetchSettings();
        if (activeTab === 'email') fetchEmailSettings();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'roles') fetchRoles();
        if (activeTab === 'audit') fetchAuditLogs();
        if (activeTab === 'updates') fetchUpdates();
    }, [activeTab]);

    const fetchCompany = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?company=1');
            if (res.data.status === 1 && res.data.data) {
                setCompany(res.data.data);
            }
        } catch (e) { toast.error('Failed to load company profile'); }
        setLoading(false);
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?settings=1');
            if (res.data.status === 1) {
                setSettings(res.data.data || []);
                const map = {};
                res.data.data.forEach(s => map[s.setting_key] = s.setting_value);
                setSettingsMap(map);
            }
        } catch (e) { toast.error('Failed to load settings'); }
        setLoading(false);
    };

    const fetchEmailSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?email=1');
            if (res.data.status === 1 && res.data.data) {
                setEmailSettings(res.data.data);
            }
        } catch (e) { toast.error('Failed to load email settings'); }
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?users=1');
            if (res.data.status === 1) setUsers(res.data.data || []);
        } catch (e) { toast.error('Failed to load users'); }
        setLoading(false);
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?roles=1');
            if (res.data.status === 1) setRoles(res.data.data || []);
        } catch (e) { toast.error('Failed to load roles'); }
        setLoading(false);
    };

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?audit=1&limit=100');
            if (res.data.status === 1) setAuditLogs(res.data.data || []);
        } catch (e) { toast.error('Failed to load audit logs'); }
        setLoading(false);
    };

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/settings.php?updates=1');
            if (res.data.status === 1) setUpdates(res.data.data || []);
        } catch (e) { toast.error('Failed to load updates'); }
        setLoading(false);
    };

    // ============================================
    // SAVE FUNCTIONS
    // ============================================
    const saveCompany = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/settings.php', {
                action: 'update_company',
                ...company
            });
            toast.success('Company profile updated!');
        } catch (e) { toast.error('Failed to update company'); }
        setSaving(false);
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/settings.php', {
                action: 'update_settings',
                settings: settingsMap
            });
            toast.success('Settings updated!');
        } catch (e) { toast.error('Failed to update settings'); }
        setSaving(false);
    };

    const saveEmailSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/settings.php', {
                action: 'update_email',
                ...emailSettings
            });
            toast.success('Email settings updated!');
        } catch (e) { toast.error('Failed to update email settings'); }
        setSaving(false);
    };

    const saveRole = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/settings.php', {
                action: 'save_role',
                ...roleForm
            });
            toast.success('Role saved!');
            setShowRoleModal(false);
            fetchRoles();
            setRoleForm({ role_id: 0, name: '', description: '', permissions: [] });
        } catch (e) { toast.error('Failed to save role'); }
        setSaving(false);
    };

    const updateUserRole = async (userId, userType, userStatus) => {
        try {
            await api.post('/api/settings.php', {
                action: 'update_user_role',
                user_id: userId,
                user_type: userType,
                user_status: userStatus
            });
            toast.success('User updated!');
            fetchUsers();
        } catch (e) { toast.error('Failed to update user'); }
    };

    const handleBackup = async () => {
        if (!window.confirm('Create a database backup?')) return;
        setLoading(true);
        try {
            const res = await api.post('/api/settings.php', { action: 'backup' });
            if (res.data.status === 1) {
                toast.success(`Backup created: ${res.data.file}`);
            } else {
                toast.error(res.data.message || 'Backup failed');
            }
        } catch (e) { toast.error('Backup failed'); }
        setLoading(false);
    };

    // ============================================
    // RENDER: APPEARANCE (Dark Mode)
    // ============================================
    const renderAppearance = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                    <FaPalette className="text-blue-600" /> Theme Settings
                </h4>
                
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center ${
                            isDark ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                                isDark ? 'translate-x-7' : 'translate-x-1'
                            }`}
                        >
                            {isDark ? (
                                <FaMoon className="text-blue-600 text-xs" />
                            ) : (
                                <FaSun className="text-yellow-500 text-xs" />
                            )}
                        </span>
                    </button>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div 
                        onClick={() => { if (isDark) toggleTheme(); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            !isDark 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaSun className="text-yellow-500" />
                            <span className="font-medium text-gray-800 dark:text-white">Light</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default bright theme</p>
                    </div>
                    
                    <div 
                        onClick={() => { if (!isDark) toggleTheme(); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            isDark 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaMoon className="text-blue-600" />
                            <span className="font-medium text-gray-800 dark:text-white">Dark</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Easy on the eyes</p>
                    </div>
                </div>
            </div>
            
            {/* Preview of theme colors */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Theme Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                        <div className="w-full h-8 bg-blue-600 rounded"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Primary</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                        <div className="w-full h-8 bg-green-600 rounded"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Success</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                        <div className="w-full h-8 bg-red-600 rounded"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Danger</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                        <div className="w-full h-8 bg-yellow-500 rounded"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Warning</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // ============================================
    // RENDER: COMPANY PROFILE
    // ============================================
    const renderCompany = () => (
        <form onSubmit={saveCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                    <input type="text" value={company.company_name} onChange={(e) => setCompany({...company, company_name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea value={company.address || ''} onChange={(e) => setCompany({...company, address: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" rows="2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input type="text" value={company.phone || ''} onChange={(e) => setCompany({...company, phone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={company.email || ''} onChange={(e) => setCompany({...company, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <input type="text" value={company.website || ''} onChange={(e) => setCompany({...company, website: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TIN</label>
                    <input type="text" value={company.tin || ''} onChange={(e) => setCompany({...company, tin: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
                    <input type="text" value={company.registration_number || ''} onChange={(e) => setCompany({...company, registration_number: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                    <input type="text" value={company.industry || ''} onChange={(e) => setCompany({...company, industry: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                    <select value={company.timezone} onChange={(e) => setCompany({...company, timezone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="Asia/Manila">Asia/Manila</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select value={company.currency} onChange={(e) => setCompany({...company, currency: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="PHP">PHP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                    <select value={company.date_format} onChange={(e) => setCompany({...company, date_format: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="Y-m-d">YYYY-MM-DD</option>
                        <option value="m/d/Y">MM/DD/YYYY</option>
                        <option value="d/m/Y">DD/MM/YYYY</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year Start</label>
                    <input type="text" value={company.fiscal_year_start || ''} onChange={(e) => setCompany({...company, fiscal_year_start: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" placeholder="01-01" />
                </div>
            </div>
            {isSuperAdmin() && (
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                    <FaSave /> {saving ? 'Saving...' : 'Save Company Profile'}
                </button>
            )}
        </form>
    );

    // ============================================
    // RENDER: GENERAL SETTINGS
    // ============================================
    const renderGeneralSettings = () => (
        <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.map((setting) => (
                    <div key={setting.setting_id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                            {setting.setting_key.replace(/_/g, ' ')}
                        </label>
                        {setting.setting_type === 'boolean' ? (
                            <select
                                value={settingsMap[setting.setting_key] || 'false'}
                                onChange={(e) => setSettingsMap({...settingsMap, [setting.setting_key]: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                            >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                        ) : setting.setting_type === 'select' ? (
                            <select
                                value={settingsMap[setting.setting_key] || ''}
                                onChange={(e) => setSettingsMap({...settingsMap, [setting.setting_key]: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                            >
                                {setting.setting_key === 'timezone' && (
                                    <>
                                        <option value="Asia/Manila">Asia/Manila</option>
                                        <option value="UTC">UTC</option>
                                    </>
                                )}
                                {setting.setting_key === 'currency' && (
                                    <>
                                        <option value="PHP">PHP</option>
                                        <option value="USD">USD</option>
                                    </>
                                )}
                                {setting.setting_key === 'date_format' && (
                                    <>
                                        <option value="Y-m-d">YYYY-MM-DD</option>
                                        <option value="m/d/Y">MM/DD/YYYY</option>
                                        <option value="d/m/Y">DD/MM/YYYY</option>
                                    </>
                                )}
                            </select>
                        ) : setting.setting_type === 'number' ? (
                            <input
                                type="number"
                                value={settingsMap[setting.setting_key] || ''}
                                onChange={(e) => setSettingsMap({...settingsMap, [setting.setting_key]: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                            />
                        ) : (
                            <input
                                type="text"
                                value={settingsMap[setting.setting_key] || ''}
                                onChange={(e) => setSettingsMap({...settingsMap, [setting.setting_key]: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                            />
                        )}
                        {setting.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{setting.description}</p>
                        )}
                    </div>
                ))}
            </div>
            {isSuperAdmin() && (
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                    <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            )}
        </form>
    );

    // ============================================
    // RENDER: EMAIL SETTINGS
    // ============================================
    const renderEmailSettings = () => (
        <form onSubmit={saveEmailSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Driver</label>
                    <select value={emailSettings.mail_driver} onChange={(e) => setEmailSettings({...emailSettings, mail_driver: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="smtp">SMTP</option>
                        <option value="sendmail">Sendmail</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Host</label>
                    <input type="text" value={emailSettings.mail_host} onChange={(e) => setEmailSettings({...emailSettings, mail_host: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Port</label>
                    <input type="number" value={emailSettings.mail_port} onChange={(e) => setEmailSettings({...emailSettings, mail_port: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Encryption</label>
                    <select value={emailSettings.mail_encryption} onChange={(e) => setEmailSettings({...emailSettings, mail_encryption: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="null">None</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Username</label>
                    <input type="text" value={emailSettings.mail_username || ''} onChange={(e) => setEmailSettings({...emailSettings, mail_username: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Password</label>
                    <input type="password" value={emailSettings.mail_password || ''} onChange={(e) => setEmailSettings({...emailSettings, mail_password: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" placeholder="••••••••" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Address</label>
                    <input type="email" value={emailSettings.mail_from_address} onChange={(e) => setEmailSettings({...emailSettings, mail_from_address: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Name</label>
                    <input type="text" value={emailSettings.mail_from_name} onChange={(e) => setEmailSettings({...emailSettings, mail_from_name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active</label>
                    <select value={emailSettings.is_active} onChange={(e) => setEmailSettings({...emailSettings, is_active: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
            </div>
            {isSuperAdmin() && (
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                    <FaSave /> {saving ? 'Saving...' : 'Save Email Settings'}
                </button>
            )}
        </form>
    );

    // ============================================
    // RENDER: USER MANAGEMENT
    // ============================================
    const renderUsers = () => (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Email</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            {isHR() && (
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.user_id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                <td className="py-3 px-4">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">{u.user_fname} {u.user_lname}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">@{u.user_name}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4 hidden md:table-cell">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{u.user_email}</span>
                                </td>
                                <td className="py-3 px-4">
                                    {isHR() ? (
                                        <select
                                            value={u.user_type}
                                            onChange={(e) => updateUserRole(u.user_id, e.target.value, u.user_status)}
                                            className="px-2 py-1 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="hr_manager">HR Manager</option>
                                            <option value="department_head">Department Head</option>
                                            <option value="employee">Employee</option>
                                        </select>
                                    ) : (
                                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{u.user_type}</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.user_status == 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                                        {u.user_status == 1 ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                {isHR() && (
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => updateUserRole(u.user_id, u.user_type, u.user_status == 1 ? 0 : 1)}
                                            className={`px-3 py-1 text-sm rounded-lg transition ${u.user_status == 1 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'}`}
                                        >
                                            {u.user_status == 1 ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Showing {users.length} users</div>
        </div>
    );

    // ============================================
    // RENDER: ROLES & PERMISSIONS
    // ============================================
    const renderRoles = () => (
        <div>
            {isSuperAdmin() && (
                <button onClick={() => { setRoleForm({ role_id: 0, name: '', description: '', permissions: [] }); setShowRoleModal(true); }} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                    <FaUserPlus /> Add Role
                </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                    <div key={role.role_id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition dark:bg-slate-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{role.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{role.description || 'No description'}</p>
                                {role.is_system == 1 && (
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">System Role</span>
                                )}
                            </div>
                            {isSuperAdmin() && role.is_system == 0 && (
                                <div className="flex gap-2">
                                    <button onClick={() => { setRoleForm(role); setShowRoleModal(true); }} className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-1 rounded"><FaEdit /></button>
                                    <button onClick={() => {
                                        if (window.confirm('Delete this role?')) {
                                            api.post('/api/settings.php', { action: 'delete_role', role_id: role.role_id }).then(() => {
                                                toast.success('Role deleted');
                                                fetchRoles();
                                            });
                                        }
                                    }} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"><FaTrash /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ============================================
    // RENDER: AUDIT LOGS
    // ============================================
    const renderAuditLogs = () => (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Action</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Module</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs.map((log) => (
                            <tr key={log.log_id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                <td className="py-3 px-4">
                                    <p className="font-medium text-gray-800 dark:text-white">{log.username || 'System'}</p>
                                </td>
                                <td className="py-3 px-4 hidden md:table-cell">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                        log.action === 'login' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                        log.action === 'delete' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                                        log.action === 'update' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="py-3 px-4 hidden lg:table-cell">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{log.module || 'N/A'}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{log.description}</span>
                                </td>
                                <td className="py-3 px-4 hidden md:table-cell">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Showing {auditLogs.length} logs</div>
        </div>
    );

    // ============================================
    // RENDER: BACKUP & SECURITY
    // ============================================
    const renderSecurity = () => (
        <div className="space-y-6">
            {/* Backup */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                    <FaDatabase className="text-blue-600" /> Database Backup
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create a backup of your database.</p>
                {isSuperAdmin() && (
                    <button onClick={handleBackup} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2">
                        <FaDownload /> {loading ? 'Creating...' : 'Create Backup'}
                    </button>
                )}
            </div>

            {/* System Updates */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                    <FaSync className="text-blue-600" /> System Updates
                </h4>
                <div className="space-y-2">
                    {updates.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No updates available.</p>
                    ) : (
                        updates.map((update) => (
                            <div key={update.update_id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">v{update.version}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{update.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                    update.status === 'installed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                    update.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                }`}>
                                    {update.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                    <FaLock className="text-blue-600" /> Security Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Password Policy</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">8+ characters</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Session Timeout</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">60 minutes</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Max Login Attempts</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">5 attempts</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // ============================================
    // MAIN RENDER
    // ============================================
    const tabs = [
        { id: 'company', icon: <FaBuilding />, label: 'Company' },
        { id: 'general', icon: <FaCog />, label: 'General' },
        { id: 'email', icon: <FaEnvelope />, label: 'Email' },
        { id: 'users', icon: <FaUsers />, label: 'Users' },
        { id: 'roles', icon: <FaShieldAlt />, label: 'Roles' },
        { id: 'audit', icon: <FaHistory />, label: 'Audit Log' },
        { id: 'security', icon: <FaLock />, label: 'Security' },
        { id: 'appearance', icon: <FaPalette />, label: 'Appearance' }, // 👈 ADDED
    ];

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FaCog /> System Settings
                            </h1>
                            <p className="text-blue-100">Manage system configuration and preferences</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 border-b-2 border-gray-200 dark:border-slate-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-[2px] ${
                                activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-t-lg'
                            }`}
                        >
                            <span className="mr-1.5">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'company' && renderCompany()}
                            {activeTab === 'general' && renderGeneralSettings()}
                            {activeTab === 'email' && renderEmailSettings()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'roles' && renderRoles()}
                            {activeTab === 'audit' && renderAuditLogs()}
                            {activeTab === 'security' && renderSecurity()}
                            {activeTab === 'appearance' && renderAppearance()}
                        </>
                    )}
                </div>
            </div>

            {/* Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            {roleForm.role_id ? 'Edit Role' : 'Add New Role'}
                        </h3>
                        <form onSubmit={saveRole}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name *</label>
                                    <input
                                        type="text"
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Save Role'}
                                </button>
                                <button type="button" onClick={() => { setShowRoleModal(false); }} className="px-4 py-2 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition dark:text-white">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Settings;