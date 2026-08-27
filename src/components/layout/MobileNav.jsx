// frontend/src/components/layout/MobileNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    FaHome, FaUsers, FaClock, FaCalendar, FaUser,
    FaMoneyBill, FaChartLine, FaCog, FaGraduationCap,
    FaBriefcase, FaFileAlt, FaUserCircle
} from 'react-icons/fa';

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Get menu items based on user role
    const getMenuItems = () => {
        const items = [];
        
        // Dashboard - for all users
        items.push({ icon: <FaHome />, label: 'Home', path: '/dashboard' });

        if (user?.user_type === 'employee') {
            items.push(
                { icon: <FaUserCircle />, label: 'My Dashboard', path: '/employee-dashboard' },
                { icon: <FaClock />, label: 'Attendance', path: '/attendance' },
                { icon: <FaCalendar />, label: 'Leave', path: '/leaves' },
                { icon: <FaUser />, label: 'Profile', path: '/profile' },
            );
        } else {
            items.push(
                { icon: <FaUsers />, label: 'Employees', path: '/employees' },
                { icon: <FaClock />, label: 'Attendance', path: '/attendance' },
                { icon: <FaCalendar />, label: 'Leave', path: '/leaves' },
                { icon: <FaMoneyBill />, label: 'Payroll', path: '/payroll' },
                { icon: <FaBriefcase />, label: 'Recruitment', path: '/recruitment' },
                { icon: <FaChartLine />, label: 'Performance', path: '/performance' },
                { icon: <FaGraduationCap />, label: 'Training', path: '/training' },
                { icon: <FaFileAlt />, label: 'Reports', path: '/reports' },
                { icon: <FaCog />, label: 'Settings', path: '/settings' },
            );
        }

        return items;
    };

    const menuItems = getMenuItems();

    // Only show first 4 items + Profile at the end
    const visibleItems = menuItems.slice(0, 4);
    const profileItem = { icon: <FaUser />, label: 'Profile', path: '/profile' };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 shadow-lg pb-safe">
            <div className="flex items-center justify-around h-16">
                {visibleItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center text-xs transition-colors relative ${
                            location.pathname === item.path 
                                ? 'text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] mt-0.5">{item.label}</span>
                        {location.pathname === item.path && (
                            <span className="absolute -top-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        )}
                    </button>
                ))}
                
                {/* Profile - always visible */}
                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center justify-center text-xs transition-colors ${
                        location.pathname === '/profile' 
                            ? 'text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span className="text-lg">{profileItem.icon}</span>
                    <span className="text-[10px] mt-0.5">{profileItem.label}</span>
                </button>
            </div>
        </nav>
    );
};

export default MobileNav;