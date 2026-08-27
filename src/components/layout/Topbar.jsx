// frontend/src/components/layout/Topbar.jsx - Logo Section
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBars, FaBell, FaUser, FaSignOutAlt, 
    FaSearch, FaCog, FaChevronDown, FaMoon, FaSun,
    FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationBell from '../common/NotificationBell';

const Topbar = ({ onMenuClick, onToggleSidebar, isCollapsed }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const goToProfile = () => {
        setShowDropdown(false);
        navigate('/profile');
    };

    const goToSettings = () => {
        setShowDropdown(false);
        navigate('/settings');
    };

    const goToDashboard = () => {
        setShowDropdown(false);
        navigate('/dashboard');
    };

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

    const getFullName = () => {
        if (!user) return 'User';
        return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();
    };

    const getPageTitle = () => {
        const path = window.location.pathname;
        const titles = {
            '/dashboard': 'Dashboard',
            '/employees': 'Employees',
            '/profile': 'My Profile',
            '/settings': 'Settings',
            '/attendance': 'Attendance',
            '/leaves': 'Leave Requests',
            '/reports': 'Reports',
            '/payroll': 'Payroll',
            '/recruitment': 'Recruitment',
            '/performance': 'Performance',
            '/company': 'Company Structure',
            '/training': 'Training & Development',
            '/employee-dashboard': 'My Dashboard',
            '/notifications': 'Notifications',
            '/my-profile': 'My Profile',
        };
        return titles[path] || 'Page';
    };

    return (
        <header className={`
            sticky top-0 z-30 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8
            border-b border-slate-200 dark:border-slate-700
            ${isDark 
                ? 'bg-slate-900' 
                : 'bg-white/80 backdrop-blur-md shadow-sm'
            }
        `}>
            {/* Left Section */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Hamburger Menu Button */}
                <button 
                    onClick={onToggleSidebar}
                    className={`
                        p-2 rounded-xl transition-all duration-300
                        ${isDark 
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }
                    `}
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 448 512" 
                        className="text-xl"
                        height="1em" 
                        width="1em" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
                    </svg>
                </button>

                {/* Mobile menu button (for small screens) */}
                <button 
                    onClick={onMenuClick}
                    className={`lg:hidden p-2 rounded-xl transition ${
                        isDark 
                            ? 'text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700' 
                            : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                    <FaBars className="text-lg" />
                </button>

                {/* 👈 PINAGANDA AT INIMPROVE NA LOGO SECTION */}
                <div 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 cursor-pointer group py-1 px-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                    {/* Modern Gradient Icon Container with Glow */}
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                        {/* Subtly animated pulse ring effect */}
                        <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping pointer-events-none"></div>
                        <FaBuilding className="text-lg" />
                    </div>
                    
                    {/* Typography Stack with Professional Hierarchy */}
                    <div className="hidden sm:block">
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
                </div>

                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                <div className="hidden sm:block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Workspace
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                        {getPageTitle()}
                    </h2>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button className={`
                    p-2 rounded-xl transition
                    ${isDark 
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }
                `}>
                    <FaSearch className="text-sm sm:text-base" />
                </button>

                <button 
                    onClick={toggleTheme}
                    className={`
                        p-2 rounded-xl transition
                        ${isDark 
                            ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }
                    `}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? <FaSun className="text-sm sm:text-base text-yellow-400" /> : <FaMoon className="text-sm sm:text-base" />}
                </button>

                <NotificationBell />

                <span className={`hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${getRoleBadge()}`}>
                    {getRoleLabel()}
                </span>

                {/* User Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`
                            flex items-center gap-2 p-1.5 rounded-xl transition border border-transparent
                            ${isDark 
                                ? 'hover:bg-slate-800 hover:border-slate-700' 
                                : 'hover:bg-slate-50 hover:border-slate-200'
                            }
                        `}
                    >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                            {getInitials()}
                        </div>
                        <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {getFullName()}
                        </span>
                        <FaChevronDown className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg py-2 z-50">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{getFullName()}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadge()}`}>
                                    {getRoleLabel()}
                                </span>
                            </div>
                            
                            <button 
                                onClick={goToDashboard}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                <FaBars className="text-slate-400 dark:text-slate-500" /> Dashboard
                            </button>
                            
                            <button 
                                onClick={goToProfile}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                <FaUser className="text-slate-400 dark:text-slate-500" /> My Profile
                            </button>
                            
                            <button 
                                onClick={goToSettings}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                <FaCog className="text-slate-400 dark:text-slate-500" /> Settings
                            </button>
                            
                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleLogout}
                    className={`
                        sm:hidden p-2 rounded-xl transition
                        ${isDark 
                            ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' 
                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        }
                    `}
                >
                    <FaSignOutAlt className="text-sm" />
                </button>
            </div>
        </header>
    );
};

export default Topbar;