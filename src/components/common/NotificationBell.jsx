// frontend/src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/notifications.php?notifications=1&limit=20');
            if (res.data.status === 1) {
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setLoading(false);
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/api/notifications.php?unread-count=1');
            if (res.data.status === 1) {
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.post('/api/notifications.php', {
                action: 'mark_read',
                notification_id: notificationId
            });
            setNotifications(notifications.map(n => 
                n.notification_id === notificationId ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications.php', { action: 'mark_all_read' });
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const archiveNotification = async (notificationId) => {
        try {
            await api.post('/api/notifications.php', {
                action: 'archive',
                notification_id: notificationId
            });
            setNotifications(notifications.filter(n => n.notification_id !== notificationId));
        } catch (error) {
            console.error('Error archiving notification:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.notification_id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type) => {
        const icons = {
            leave: '📅',
            attendance: '⏰',
            payroll: '💰',
            training: '🎓',
            performance: '📊',
            recruitment: '💼',
            announcement: '📢',
            system: '⚙️',
            reminder: '🔔'
        };
        return icons[type] || '🔔';
    };

    const getColor = (type) => {
        const colors = {
            leave: 'text-blue-600 bg-blue-50',
            attendance: 'text-green-600 bg-green-50',
            payroll: 'text-purple-600 bg-purple-50',
            training: 'text-orange-600 bg-orange-50',
            performance: 'text-indigo-600 bg-indigo-50',
            recruitment: 'text-cyan-600 bg-cyan-50',
            announcement: 'text-red-600 bg-red-50',
            system: 'text-gray-600 bg-gray-50',
            reminder: 'text-yellow-600 bg-yellow-50'
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
            >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border-2 border-gray-200 shadow-lg z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">🔔</div>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.notification_id}
                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(notification.type)}`}>
                                            <span className="text-base">{getIcon(notification.type)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} text-gray-800`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    archiveNotification(notification.notification_id);
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-gray-200 text-center">
                        <button
                            onClick={() => {
                                navigate('/notifications');
                                setIsOpen(false);
                            }}
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;