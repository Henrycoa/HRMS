// frontend/src/components/layout/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true); // 👈 Default: open sa desktop
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 👈 Para sa collapse/expand

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} 
                isCollapsed={sidebarCollapsed}
                onClose={() => setSidebarOpen(false)} 
                onToggle={toggleSidebar}
            />

            {/* Main Content */}
            <div className={`
                flex-1 flex flex-col min-w-0 pb-16 lg:pb-0
                transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
            `}>
                {/* Topbar with hamburger menu */}
                <Topbar 
                    onMenuClick={() => setSidebarOpen(true)} 
                    onToggleSidebar={toggleSidebar}
                    isCollapsed={sidebarCollapsed}
                />

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
};

export default Layout;