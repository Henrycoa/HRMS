// frontend/src/components/layout/Sidebar.jsx - Logo Section
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBuilding, FaHome, FaUsers, FaClock, 
    FaCalendar, FaFileAlt, FaCog, FaSignOutAlt,
    FaUser, FaTimes, FaSitemap, FaMoneyBill, 
    FaBriefcase, FaChartLine, FaGraduationCap, FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark } = useTheme();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        if (onClose) onClose();
    };

    const menuItems = [
        { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
    ];

    if (user?.user_type === 'super_admin' || user?.user_type === 'hr_manager' || user?.user_type === 'department_head') {
        menuItems.push(
            { icon: <FaUsers />, label: 'Employees', path: '/employees' },
            { icon: <FaSitemap />, label: 'Company Structure', path: '/company' },
            { icon: <FaClock />, label: 'Attendance', path: '/attendance' },
            { icon: <FaCalendar />, label: 'Leave Requests', path: '/leaves' },
            { icon: <FaMoneyBill />, label: 'Payroll', path: '/payroll' },
            { icon: <FaBriefcase />, label: 'Recruitment', path: '/recruitment' },
            { icon: <FaChartLine />, label: 'Performance', path: '/performance' },
            { icon: <FaGraduationCap />, label: 'Training', path: '/training' },
            { icon: <FaFileAlt />, label: 'Reports', path: '/reports' },
        );
    }

    if (user?.user_type === 'employee') {
        menuItems.push(
            { icon: <FaUserCircle />, label: 'My Dashboard', path: '/employee-dashboard' },
            { icon: <FaCalendar />, label: 'Leave Requests', path: '/leaves' },
            { icon: <FaClock />, label: 'Attendance', path: '/attendance' },
            { icon: <FaGraduationCap />, label: 'Training', path: '/training' },
            { icon: <FaUser />, label: 'My Profile', path: '/my-profile' },
        );
    }

    menuItems.push(
        { icon: <FaCog />, label: 'Settings', path: '/settings' },
    );

    const getRoleBadge = () => {
        const badges = {
            super_admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
            hr_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            department_head: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            employee: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
        return badges[user?.user_type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    };

    const getRoleLabel = () => {
        const labels = {
            super_admin: 'Super Admin',
            hr_manager: 'HR Manager',
            department_head: 'Department Head',
            employee: 'Employee',
        };
        return labels[user?.user_type] || user?.user_type || 'User';
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();
    };

    const getFullName = () => {
        if (!user) return 'User';
        return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 
                ${isDark 
                    ? 'bg-slate-900 border-r border-slate-700' 
                    : 'bg-white border-r border-slate-200/80 shadow-lg'
                }
                transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isCollapsed ? 'w-20' : 'w-64'}
                flex flex-col
                overflow-hidden
            `}>
                
                {/* 👈 PINAGANDA AT INIMPROVE NA LOGO SECTION */}
                <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    
                    <div 
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-3 cursor-pointer group py-1 px-1 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {/* Modern Gradient Icon Container with Glow */}
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                            {/* Subtly animated pulse ring effect */}
                            <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping pointer-events-none"></div>
                            <FaBuilding className="text-lg" />
                        </div>
                        
                        {!isCollapsed && (
                            <div>
                                <div className="flex items-center gap-1.5 leading-none">
                                    <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                        HRMS
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-bold rounded tracking-wide">
                                        PRO
                                    </span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mt-0.5">
                                    Enterprise Suite
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button 
                            onClick={onClose} 
                            className={`lg:hidden ${isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'} p-1 rounded-lg transition`}
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    {!isCollapsed && (
                        <p className={`px-3 text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-3`}>
                            Main Menu
                        </p>
                    )}
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (onClose) onClose();
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all
                                    ${window.location.pathname === item.path 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' 
                                        : isDark 
                                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* User Profile Section */}
                <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isCollapsed ? 'justify-center' : ''} ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                            {getInitials()}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'} truncate`}>
                                        {getFullName()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadge()}`}>
                                            {getRoleLabel()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className={`${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'} transition-colors p-1.5 rounded-lg`}
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="text-sm" />
                                </button>
                            </>
                        )}
                        {isCollapsed && (
                            <button
                                onClick={handleLogout}
                                className={`${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'} transition-colors p-1.5 rounded-lg`}
                                title="Logout"
                            >
                                <FaSignOutAlt className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;