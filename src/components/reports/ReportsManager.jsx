// frontend/src/components/reports/ReportsManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaChartBar, FaDownload, FaFileExcel, FaFilePdf, FaFileCsv,
    FaUsers, FaClock, FaCalendar, FaMoneyBill, FaChartLine,
    FaGraduationCap, FaBriefcase, FaSpinner, FaSync,
    FaEye, FaFilter, FaPrint
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ReportsManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('employee');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        period: 'monthly',
        report_type: 'headcount'
    });
    const [exportFormat, setExportFormat] = useState('csv');

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canViewReports = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head'].includes(user.user_type);
    };

    // ============================================
    // FETCH REPORTS
    // ============================================
    useEffect(() => {
        if (canViewReports()) {
            fetchReport();
        }
    }, [activeTab, filters]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = '';
            const { year, month, period, report_type } = filters;

            switch (activeTab) {
                case 'employee':
                    url = `/api/reports.php?type=employee&report_type=${report_type}`;
                    break;
                case 'attendance':
                    url = `/api/reports.php?type=attendance&period=${period}&month=${month}&year=${year}`;
                    break;
                case 'leave':
                    url = `/api/reports.php?type=leave&year=${year}`;
                    break;
                case 'payroll':
                    url = `/api/reports.php?type=payroll&month=${month}&year=${year}`;
                    break;
                case 'performance':
                    url = `/api/reports.php?type=performance&year=${year}`;
                    break;
                case 'training':
                    url = `/api/reports.php?type=training&year=${year}`;
                    break;
                case 'recruitment':
                    url = `/api/reports.php?type=recruitment&year=${year}`;
                    break;
                case 'dashboard':
                    url = `/api/reports.php?type=dashboard`;
                    break;
                default:
                    return;
            }

            const res = await api.get(url);
            if (res.data.status === 1) {
                setReportData(res.data.data || res.data);
            } else {
                toast.error(res.data.message || 'Failed to load report');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to load report');
        }
        setLoading(false);
    };

    // ============================================
    // EXPORT REPORT
    // ============================================
    const handleExport = () => {
        const { year, month } = filters;
        const url = `/api/reports.php?export=1&type=${activeTab}&format=${exportFormat}&month=${month}&year=${year}`;
        window.open(url, '_blank');
        toast.success(`Exporting ${activeTab} report as ${exportFormat.toUpperCase()}`);
    };

    // ============================================
    // HELPERS
    // ============================================
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNumber = (num) => {
        return Number(num).toLocaleString();
    };

    const getMonthName = (month) => {
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return names[month - 1] || '';
    };

    // ============================================
    // RENDER: EMPLOYEE REPORTS
    // ============================================
    const renderEmployeeReport = () => {
        if (!reportData) return null;
        
        return (
            <div className="space-y-6">
                <div className="flex gap-3 mb-4">
                    <select 
                        value={filters.report_type}
                        onChange={(e) => setFilters({...filters, report_type: e.target.value})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        <option value="headcount">Headcount by Department</option>
                        <option value="demographics">Demographics</option>
                        <option value="turnover">Turnover</option>
                    </select>
                </div>

                {filters.report_type === 'headcount' && (
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Headcount by Department</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">Total Employees: <strong className="text-gray-800">{formatNumber(reportData.total)}</strong></span>
                            </div>
                            <div className="space-y-2">
                                {reportData.data?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-32 text-gray-700">{item.department_name}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div 
                                                className={`h-4 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'}`}
                                                style={{ width: `${reportData.total > 0 ? (item.count / reportData.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-10 text-gray-700">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {filters.report_type === 'demographics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Gender Distribution</h4>
                            {reportData.data?.gender?.map((g, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium w-20 text-gray-700 capitalize">{g.gender || 'Other'}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div className="h-3 bg-blue-500 rounded-full" style={{ width: `${(g.count / reportData.data.gender.reduce((sum, g) => sum + g.count, 0)) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium w-10 text-gray-700">{g.count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Employment Type</h4>
                            {reportData.data?.employment_type?.map((e, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium w-24 text-gray-700 capitalize">{e.employment_type || 'N/A'}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div className={`h-3 ${i % 2 === 0 ? 'bg-green-500' : 'bg-green-400'} rounded-full`} style={{ width: `${(e.count / reportData.data.employment_type.reduce((sum, e) => sum + e.count, 0)) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium w-10 text-gray-700">{e.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filters.report_type === 'turnover' && (
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Turnover Report ({filters.year})</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                                <p className="text-2xl font-bold text-green-600">
                                    {reportData.data?.hires?.reduce((sum, h) => sum + h.count, 0) || 0}
                                </p>
                                <p className="text-sm text-gray-500">Total Hires</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                                <p className="text-2xl font-bold text-red-600">
                                    {reportData.data?.terminations?.reduce((sum, t) => sum + t.count, 0) || 0}
                                </p>
                                <p className="text-sm text-gray-500">Total Terminations</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="grid grid-cols-12 gap-1 text-center text-xs text-gray-500 mb-2">
                                {Array.from({length: 12}, (_, i) => (
                                    <div key={i} className="font-medium">{getMonthName(i + 1)}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-12 gap-1 text-center">
                                {Array.from({length: 12}, (_, i) => {
                                    const month = i + 1;
                                    const hires = reportData.data?.hires?.find(h => h.month === month)?.count || 0;
                                    const terms = reportData.data?.terminations?.find(t => t.month === month)?.count || 0;
                                    return (
                                        <div key={i} className="text-xs">
                                            <span className="text-green-600 block">+{hires}</span>
                                            <span className="text-red-600 block">-{terms}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ============================================
    // RENDER: ATTENDANCE REPORTS
    // ============================================
    const renderAttendanceReport = () => {
        if (!reportData) return null;
        
        return (
            <div>
                <div className="flex flex-wrap gap-3 mb-4">
                    <select 
                        value={filters.period}
                        onChange={(e) => setFilters({...filters, period: e.target.value})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="summary">Summary</option>
                    </select>
                    <select 
                        value={filters.month}
                        onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {Array.from({length: 12}, (_, i) => (
                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                        ))}
                    </select>
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {filters.period === 'summary' && reportData.data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                            <p className="text-2xl font-bold text-green-600">{formatNumber(reportData.data.present || 0)}</p>
                            <p className="text-sm text-gray-500">Present</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                            <p className="text-2xl font-bold text-red-600">{formatNumber(reportData.data.absent || 0)}</p>
                            <p className="text-sm text-gray-500">Absent</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl text-center border border-yellow-200">
                            <p className="text-2xl font-bold text-yellow-600">{formatNumber(reportData.data.late || 0)}</p>
                            <p className="text-sm text-gray-500">Late</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
                            <p className="text-2xl font-bold text-orange-600">{formatNumber(reportData.data.half_day || 0)}</p>
                            <p className="text-sm text-gray-500">Half Day</p>
                        </div>
                    </div>
                )}

                {filters.period === 'monthly' && reportData.data && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-2 px-3 text-gray-500">Day</th>
                                        <th className="text-right py-2 px-3 text-gray-500">Present</th>
                                        <th className="text-right py-2 px-3 text-gray-500">Absent</th>
                                        <th className="text-right py-2 px-3 text-gray-500">Late</th>
                                        <th className="text-right py-2 px-3 text-gray-500">Half Day</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data.map((item) => (
                                        <tr key={item.day} className="border-b border-gray-200">
                                            <td className="py-2 px-3 font-medium">{item.day}</td>
                                            <td className="py-2 px-3 text-right text-green-600">{item.present || 0}</td>
                                            <td className="py-2 px-3 text-right text-red-600">{item.absent || 0}</td>
                                            <td className="py-2 px-3 text-right text-yellow-600">{item.late || 0}</td>
                                            <td className="py-2 px-3 text-right text-orange-600">{item.half_day || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ============================================
    // RENDER: LEAVE REPORTS
    // ============================================
    const renderLeaveReport = () => {
        if (!reportData?.data) return null;
        
        return (
            <div>
                <div className="flex gap-3 mb-4">
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-2 px-3 text-gray-500">Leave Type</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Total</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Approved</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Rejected</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Pending</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Days Used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.data.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-medium">{item.leave_type || 'N/A'}</td>
                                        <td className="py-2 px-3 text-right">{item.total_requests || 0}</td>
                                        <td className="py-2 px-3 text-right text-green-600">{item.approved || 0}</td>
                                        <td className="py-2 px-3 text-right text-red-600">{item.rejected || 0}</td>
                                        <td className="py-2 px-3 text-right text-yellow-600">{item.pending || 0}</td>
                                        <td className="py-2 px-3 text-right font-medium">{item.total_days || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: PAYROLL REPORTS
    // ============================================
    const renderPayrollReport = () => {
        if (!reportData?.data) return null;
        
        const data = reportData.data;
        return (
            <div>
                <div className="flex flex-wrap gap-3 mb-4">
                    <select 
                        value={filters.month}
                        onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {Array.from({length: 12}, (_, i) => (
                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                        ))}
                    </select>
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.total_gross)}</p>
                        <p className="text-sm text-gray-500">Total Gross</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(data.total_net)}</p>
                        <p className="text-sm text-gray-500">Total Net</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">{formatNumber(data.employee_count)}</p>
                        <p className="text-sm text-gray-500">Employees Paid</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-700">{formatCurrency(data.total_sss || 0)}</p>
                        <p className="text-xs text-gray-500">SSS</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-700">{formatCurrency(data.total_philhealth || 0)}</p>
                        <p className="text-xs text-gray-500">PhilHealth</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-700">{formatCurrency(data.total_pagibig || 0)}</p>
                        <p className="text-xs text-gray-500">Pag-IBIG</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-700">{formatCurrency(data.total_tax || 0)}</p>
                        <p className="text-xs text-gray-500">Tax</p>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: PERFORMANCE REPORTS
    // ============================================
    const renderPerformanceReport = () => {
        if (!reportData?.data) return null;
        
        return (
            <div>
                <div className="flex gap-3 mb-4">
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Rating Distribution</h4>
                        {reportData.data.distribution?.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium w-20 text-gray-700">
                                    {item.overall_rating || 'N/A'}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className={`h-3 ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`} 
                                         style={{ width: `${(item.count / reportData.data.distribution.reduce((sum, d) => sum + d.count, 0)) * 100}%` }}></div>
                                </div>
                                <span className="text-sm font-medium w-10 text-gray-700">{item.count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">By Department</h4>
                        {reportData.data.by_department?.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium w-28 text-gray-700 truncate">{item.department_name || 'N/A'}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className={`h-3 ${index % 2 === 0 ? 'bg-green-500' : 'bg-teal-500'} rounded-full`} 
                                         style={{ width: `${(item.avg_rating / 5) * 100}%` }}></div>
                                </div>
                                <span className="text-sm font-medium w-8 text-gray-700">{item.avg_rating?.toFixed(1) || '0.0'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: TRAINING REPORTS
    // ============================================
    const renderTrainingReport = () => {
        if (!reportData?.data) return null;
        
        return (
            <div>
                <div className="flex gap-3 mb-4">
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-2 px-3 text-gray-500">Program</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Enrollments</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Completed</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Rate</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Avg Rating</th>
                                    <th className="text-right py-2 px-3 text-gray-500">Certificates</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.data.map((item, index) => {
                                    const rate = item.enrollments > 0 ? Math.round((item.completed / item.enrollments) * 100) : 0;
                                    return (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="py-2 px-3 font-medium">{item.program_name || 'N/A'}</td>
                                            <td className="py-2 px-3 text-right">{item.enrollments || 0}</td>
                                            <td className="py-2 px-3 text-right text-green-600">{item.completed || 0}</td>
                                            <td className="py-2 px-3 text-right font-medium">{rate}%</td>
                                            <td className="py-2 px-3 text-right">{item.avg_rating?.toFixed(1) || '0.0'}</td>
                                            <td className="py-2 px-3 text-right text-purple-600">{item.certificates_issued || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: RECRUITMENT REPORTS
    // ============================================
    const renderRecruitmentReport = () => {
        if (!reportData?.data) return null;
        
        const data = reportData.data;
        return (
            <div>
                <div className="flex gap-3 mb-4">
                    <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{formatNumber(data.total_applicants || 0)}</p>
                        <p className="text-sm text-gray-500">Total Applicants</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{formatNumber(data.hired || 0)}</p>
                        <p className="text-sm text-gray-500">Hired</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                        <p className="text-2xl font-bold text-red-600">{formatNumber(data.rejected || 0)}</p>
                        <p className="text-sm text-gray-500">Rejected</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">{formatNumber(data.avg_days_to_hire || 0)}</p>
                        <p className="text-sm text-gray-500">Avg Days to Hire</p>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: DASHBOARD ANALYTICS
    // ============================================
    const renderDashboardAnalytics = () => {
        if (!reportData?.data) return null;
        
        const data = reportData.data;
        return (
            <div>
                <h4 className="font-semibold text-gray-700 mb-4">HR Dashboard Analytics</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                        <p className="text-3xl font-bold text-blue-600">{formatNumber(data.total_employees || 0)}</p>
                        <p className="text-sm text-gray-500">Total Employees</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                        <p className="text-3xl font-bold text-green-600">{formatNumber(data.today_present || 0)}</p>
                        <p className="text-sm text-gray-500">Present Today</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl text-center border border-yellow-200">
                        <p className="text-3xl font-bold text-yellow-600">{formatNumber(data.pending_leaves || 0)}</p>
                        <p className="text-sm text-gray-500">Pending Leaves</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                        <p className="text-3xl font-bold text-purple-600">{formatNumber(data.open_positions || 0)}</p>
                        <p className="text-sm text-gray-500">Open Positions</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
                        <p className="text-3xl font-bold text-orange-600">{formatNumber(data.recent_hires || 0)}</p>
                        <p className="text-sm text-gray-500">Hired This Month</p>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // MAIN RENDER
    // ============================================
    if (!canViewReports()) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⛔</div>
                        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
                        <p className="text-gray-500 mt-2">You don't have permission to view reports.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FaChartBar /> Reports & Analytics
                            </h1>
                            <p className="text-blue-100">View and export comprehensive HR reports</p>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="px-3 py-2 bg-white/20 rounded-xl text-white text-sm border border-white/30 focus:outline-none"
                            >
                                <option value="csv">CSV</option>
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                            <button 
                                onClick={handleExport}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-sm font-medium flex items-center gap-2"
                            >
                                <FaDownload /> Export
                            </button>
                            <button 
                                onClick={fetchReport}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-sm font-medium flex items-center gap-2"
                            >
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 border-b-2 border-gray-200">
                    {[
                        { id: 'employee', icon: <FaUsers />, label: 'Employees' },
                        { id: 'attendance', icon: <FaClock />, label: 'Attendance' },
                        { id: 'leave', icon: <FaCalendar />, label: 'Leave' },
                        { id: 'payroll', icon: <FaMoneyBill />, label: 'Payroll' },
                        { id: 'performance', icon: <FaChartLine />, label: 'Performance' },
                        { id: 'training', icon: <FaGraduationCap />, label: 'Training' },
                        { id: 'recruitment', icon: <FaBriefcase />, label: 'Recruitment' },
                        { id: 'dashboard', icon: <FaChartBar />, label: 'Dashboard' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-[2px] ${
                                activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-lg' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
                            }`}
                        >
                            <span className="mr-1.5">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-500">Loading report...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'employee' && renderEmployeeReport()}
                            {activeTab === 'attendance' && renderAttendanceReport()}
                            {activeTab === 'leave' && renderLeaveReport()}
                            {activeTab === 'payroll' && renderPayrollReport()}
                            {activeTab === 'performance' && renderPerformanceReport()}
                            {activeTab === 'training' && renderTrainingReport()}
                            {activeTab === 'recruitment' && renderRecruitmentReport()}
                            {activeTab === 'dashboard' && renderDashboardAnalytics()}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ReportsManager;