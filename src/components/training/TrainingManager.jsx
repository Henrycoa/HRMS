// frontend/src/components/training/TrainingManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaGraduationCap, FaPlus, FaEdit, FaTrash, FaEye,
    FaCheck, FaTimes, FaClock, FaFilter, FaDownload,
    FaSearch, FaSpinner, FaUser, FaFileAlt,
    FaCheckCircle, FaTimesCircle, FaCalendar,
    FaEnvelope, FaPhone, FaMapMarker, FaMoneyBill,
    FaStar, FaStarHalf, FaRegStar, FaSync,
    FaUsers, FaVideo, FaChalkboardTeacher, FaCertificate,
    FaChartBar, FaBook, FaClipboardList, FaLink, FaSave
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TrainingManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('programs');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Training Programs
    const [programs, setPrograms] = useState([]);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [programForm, setProgramForm] = useState({
        title: '',
        description: '',
        training_type: 'internal',
        category: '',
        provider: '',
        duration_hours: 0,
        max_participants: 0,
        cost: 0,
        budget: 0,
        status: 'draft'
    });

    // Training Sessions
    const [sessions, setSessions] = useState([]);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionForm, setSessionForm] = useState({
        program_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        meeting_link: '',
        max_participants: 0,
        trainer_id: '',
        status: 'scheduled'
    });

    // Trainers
    const [trainers, setTrainers] = useState([]);
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [trainerForm, setTrainerForm] = useState({
        employee_id: '',
        name: '',
        email: '',
        phone: '',
        specialization: '',
        bio: ''
    });

    // Enrollments
    const [enrollments, setEnrollments] = useState([]);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [enrollmentForm, setEnrollmentForm] = useState({
        session_id: '',
        employee_id: '',
        status: 'enrolled'
    });

    // Training Materials
    const [materials, setMaterials] = useState([]);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterialFile, setSelectedMaterialFile] = useState(null);
    const [materialForm, setMaterialForm] = useState({
        session_id: '',
        title: '',
        description: '',
        file_type: ''
    });

    // Budget Tracking
    const [budget, setBudget] = useState([]);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [budgetForm, setBudgetForm] = useState({
        program_id: '',
        category: '',
        allocated: 0,
        fiscal_year: new Date().getFullYear()
    });

    // Skill Gap
    const [skillGaps, setSkillGaps] = useState([]);
    const [showSkillGapModal, setShowSkillGapModal] = useState(false);
    const [skillGapForm, setSkillGapForm] = useState({
        employee_id: '',
        skill_name: '',
        current_level: 'beginner',
        required_level: 'intermediate',
        priority: 'medium',
        recommended_training: ''
    });

    // Reports
    const [reportData, setReportData] = useState({
        total_programs: 0,
        total_sessions: 0,
        total_enrollments: 0,
        completed_enrollments: 0,
        allocated_budget: 0,
        spent_budget: 0
    });

    // Employees for dropdowns
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const isHR = () => ['super_admin', 'hr_manager'].includes(user?.user_type);
    const isManager = () => ['super_admin', 'hr_manager', 'department_head'].includes(user?.user_type);

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
        fetchTrainers();
        if (activeTab === 'programs') fetchPrograms();
        if (activeTab === 'sessions') fetchSessions();
        if (activeTab === 'enrollments') fetchEnrollments();
        if (activeTab === 'budget') fetchBudget();
        if (activeTab === 'skill-gap') fetchSkillGap();
        if (activeTab === 'reports') fetchReport();
    }, [activeTab]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees.php');
            if (res.data.status === 1) setEmployees(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/departments.php');
            if (res.data.status === 1) setDepartments(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            const res = await api.get(`/api/training.php?programs=1&${params}`);
            if (res.data.status === 1) setPrograms(res.data.data || []);
        } catch (e) { toast.error('Failed to load programs'); }
        setLoading(false);
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/training.php?sessions=1');
            if (res.data.status === 1) setSessions(res.data.data || []);
        } catch (e) { toast.error('Failed to load sessions'); }
        setLoading(false);
    };

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/api/training.php?trainers=1');
            if (res.data.status === 1) setTrainers(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/training.php?enrollments=1');
            if (res.data.status === 1) setEnrollments(res.data.data || []);
        } catch (e) { toast.error('Failed to load enrollments'); }
        setLoading(false);
    };

    const fetchBudget = async () => {
        try {
            const res = await api.get('/api/training.php?budget=1');
            if (res.data.status === 1) setBudget(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchSkillGap = async () => {
        try {
            const res = await api.get('/api/training.php?skill-gap=1');
            if (res.data.status === 1) setSkillGaps(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchReport = async () => {
        try {
            const res = await api.get('/api/training.php?report=1');
            if (res.data.status === 1) setReportData(res.data.data || {});
        } catch (e) { console.error(e); }
    };

    // ============================================
    // PROGRAM CRUD
    // ============================================
    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/training.php', {
                action: 'create_program',
                ...programForm
            });
            if (res.data.status === 1) {
                toast.success('Training program created!');
                setShowProgramModal(false);
                resetProgramForm();
                fetchPrograms();
            } else {
                toast.error(res.data.message || 'Failed to create program');
            }
        } catch (e) { toast.error('Failed to create program'); }
        setLoading(false);
    };

    const handleDeleteProgram = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            const res = await api.delete(`/api/training.php?id=${id}&type=program`);
            if (res.data.status === 1) {
                toast.success('Program deleted');
                fetchPrograms();
            }
        } catch (e) { toast.error('Failed to delete'); }
    };

    const resetProgramForm = () => {
        setProgramForm({
            title: '',
            description: '',
            training_type: 'internal',
            category: '',
            provider: '',
            duration_hours: 0,
            max_participants: 0,
            cost: 0,
            budget: 0,
            status: 'draft'
        });
        setSelectedProgram(null);
    };

    // ============================================
    // SESSION CRUD
    // ============================================
    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/training.php', {
                action: 'create_session',
                ...sessionForm
            });
            if (res.data.status === 1) {
                toast.success('Training session created!');
                setShowSessionModal(false);
                resetSessionForm();
                fetchSessions();
            } else {
                toast.error(res.data.message || 'Failed to create session');
            }
        } catch (e) { toast.error('Failed to create session'); }
        setLoading(false);
    };

    const resetSessionForm = () => {
        setSessionForm({
            program_id: '',
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            location: '',
            meeting_link: '',
            max_participants: 0,
            trainer_id: '',
            status: 'scheduled'
        });
        setSelectedSession(null);
    };

    // ============================================
    // ENROLLMENT CRUD
    // ============================================
    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/training.php', {
                action: 'enroll',
                ...enrollmentForm
            });
            if (res.data.status === 1) {
                toast.success('Employee enrolled!');
                setShowEnrollmentModal(false);
                resetEnrollmentForm();
                fetchEnrollments();
            } else {
                toast.error(res.data.message || 'Failed to enroll');
            }
        } catch (e) { toast.error('Failed to enroll'); }
        setLoading(false);
    };

    const handleUpdateEnrollment = async (enrollmentId, status, attendanceStatus = null) => {
        try {
            const res = await api.post('/api/training.php', {
                action: 'update_enrollment',
                enrollment_id: enrollmentId,
                status: status,
                attendance_status: attendanceStatus,
                completion_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null
            });
            if (res.data.status === 1) {
                toast.success('Enrollment updated');
                fetchEnrollments();
            }
        } catch (e) { toast.error('Failed to update'); }
    };

    const resetEnrollmentForm = () => {
        setEnrollmentForm({
            session_id: '',
            employee_id: '',
            status: 'enrolled'
        });
    };

    // ============================================
    // SKILL GAP CRUD
    // ============================================
    const handleSkillGapSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/training.php', {
                action: 'create_skill_gap',
                ...skillGapForm
            });
            if (res.data.status === 1) {
                toast.success('Skill gap added!');
                setShowSkillGapModal(false);
                resetSkillGapForm();
                fetchSkillGap();
            } else {
                toast.error(res.data.message || 'Failed to add skill gap');
            }
        } catch (e) { toast.error('Failed to add skill gap'); }
        setLoading(false);
    };

    const resetSkillGapForm = () => {
        setSkillGapForm({
            employee_id: '',
            skill_name: '',
            current_level: 'beginner',
            required_level: 'intermediate',
            priority: 'medium',
            recommended_training: ''
        });
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            published: 'bg-blue-100 text-blue-700 border-blue-200',
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            ongoing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            enrolled: 'bg-green-100 text-green-700 border-green-200',
            waitlisted: 'bg-orange-100 text-orange-700 border-orange-200',
            dropped: 'bg-red-100 text-red-700 border-red-200',
            'not_started': 'bg-gray-100 text-gray-700 border-gray-200',
            'in_progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            absent: 'bg-red-100 text-red-700 border-red-200'
        };
        return badges[status] || badges.draft;
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: <FaClock className="text-gray-500" />,
            published: <FaCheckCircle className="text-blue-500" />,
            scheduled: <FaCalendar className="text-blue-500" />,
            ongoing: <FaClock className="text-yellow-500" />,
            completed: <FaCheckCircle className="text-green-500" />,
            cancelled: <FaTimesCircle className="text-red-500" />,
            pending: <FaClock className="text-yellow-500" />,
            enrolled: <FaCheckCircle className="text-green-500" />,
            waitlisted: <FaClock className="text-orange-500" />,
            dropped: <FaTimesCircle className="text-red-500" />
        };
        return icons[status] || icons.draft;
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.employee_id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
    };

    const getProgramTitle = (id) => {
        const prog = programs.find(p => p.program_id === id);
        return prog ? prog.title : 'N/A';
    };

    const getTrainerName = (id) => {
        const trainer = trainers.find(t => t.trainer_id === id);
        return trainer ? trainer.name : 'N/A';
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaGraduationCap className="text-blue-600" /> Training & Development
                            </h1>
                            <p className="text-sm text-gray-500">Manage training programs, sessions, and employee development</p>
                        </div>
                        <div className="flex gap-2">
                            {isHR() && activeTab === 'programs' && (
                                <button onClick={() => setShowProgramModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> New Program
                                </button>
                            )}
                            {isHR() && activeTab === 'sessions' && (
                                <button onClick={() => setShowSessionModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> New Session
                                </button>
                            )}
                            {isHR() && activeTab === 'enrollments' && (
                                <button onClick={() => setShowEnrollmentModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> Enroll Employee
                                </button>
                            )}
                            <button onClick={() => {
                                if (activeTab === 'programs') fetchPrograms();
                                else if (activeTab === 'sessions') fetchSessions();
                                else if (activeTab === 'enrollments') fetchEnrollments();
                                else if (activeTab === 'budget') fetchBudget();
                                else if (activeTab === 'skill-gap') fetchSkillGap();
                                else if (activeTab === 'reports') fetchReport();
                            }} className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm">
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 border-b-2 border-gray-200">
                    {['programs', 'sessions', 'enrollments', 'trainers', 'skill-gap', 'budget', 'reports'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium capitalize transition border-b-2 -mb-[2px] ${
                                activeTab === tab 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab === 'programs' && <FaBook className="inline mr-1.5" />}
                            {tab === 'sessions' && <FaCalendar className="inline mr-1.5" />}
                            {tab === 'enrollments' && <FaUsers className="inline mr-1.5" />}
                            {tab === 'trainers' && <FaChalkboardTeacher className="inline mr-1.5" />}
                            {tab === 'skill-gap' && <FaClipboardList className="inline mr-1.5" />}
                            {tab === 'budget' && <FaMoneyBill className="inline mr-1.5" />}
                            {tab === 'reports' && <FaChartBar className="inline mr-1.5" />}
                            {tab.replace('-', ' ')}
                            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {tab === 'programs' && programs.length}
                                {tab === 'sessions' && sessions.length}
                                {tab === 'enrollments' && enrollments.length}
                                {tab === 'trainers' && trainers.length}
                                {tab === 'skill-gap' && skillGaps.length}
                                {tab === 'budget' && budget.length}
                                {tab === 'reports' && '📊'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* TAB: PROGRAMS */}
                {activeTab === 'programs' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex-1 min-w-[200px] relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search programs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        ) : programs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📚</div>
                                <p>No training programs found</p>
                                {isHR() && (
                                    <button onClick={() => setShowProgramModal(true)} className="mt-4 text-blue-600 hover:underline">
                                        Create your first program
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programs.map((p) => (
                                    <div key={p.program_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800">{p.title}</h3>
                                                <p className="text-sm text-gray-500">{p.category || 'General'}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(p.status)}`}>
                                                {getStatusIcon(p.status)} {p.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FaBook /> {p.training_type}</span>
                                            <span className="flex items-center gap-1"><FaClock /> {p.duration_hours}h</span>
                                            <span className="flex items-center gap-1"><FaUsers /> {p.max_participants || 'Unlimited'}</span>
                                            <span className="flex items-center gap-1"><FaMoneyBill /> {formatCurrency(p.cost)}</span>
                                        </div>
                                        {isHR() && (
                                            <div className="mt-3 flex gap-2">
                                                <button onClick={() => { setSelectedProgram(p); setShowProgramModal(true); }} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                                                    <FaEdit className="inline mr-1" /> Edit
                                                </button>
                                                <button onClick={() => handleDeleteProgram(p.program_id, p.title)} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                                                    <FaTrash className="inline mr-1" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {programs.length} programs</div>
                    </div>
                )}

                {/* TAB: SESSIONS */}
                {activeTab === 'sessions' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {loading ? (
                            <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📅</div>
                                <p>No training sessions found</p>
                                {isHR() && (
                                    <button onClick={() => setShowSessionModal(true)} className="mt-4 text-blue-600 hover:underline">
                                        Schedule a session
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Session</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Program</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Trainer</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            {isHR() && (
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((s) => (
                                            <tr key={s.session_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-3 px-4"><p className="font-medium text-gray-800">{s.title}</p></td>
                                                <td className="py-3 px-4 hidden md:table-cell"><span className="text-sm text-gray-600">{s.program_title}</span></td>
                                                <td className="py-3 px-4 hidden lg:table-cell"><span className="text-sm text-gray-600">{s.trainer_name || 'N/A'}</span></td>
                                                <td className="py-3 px-4"><span className="text-sm text-gray-600">{formatDate(s.start_date)}</span></td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(s.status)}`}>
                                                        {getStatusIcon(s.status)} {s.status}
                                                    </span>
                                                </td>
                                                {isHR() && (
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => { setSelectedSession(s); setShowSessionModal(true); }} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"><FaEdit /></button>
                                                            <button onClick={() => {
                                                                if (window.confirm('Delete this session?')) {
                                                                    api.delete(`/api/training.php?id=${s.session_id}&type=session`).then(() => {
                                                                        toast.success('Session deleted');
                                                                        fetchSessions();
                                                                    });
                                                                }
                                                            }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><FaTrash /></button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {sessions.length} sessions</div>
                    </div>
                )}

                {/* TAB: ENROLLMENTS */}
                {activeTab === 'enrollments' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {loading ? (
                            <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        ) : enrollments.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📋</div>
                                <p>No enrollments yet</p>
                                {isHR() && (
                                    <button onClick={() => setShowEnrollmentModal(true)} className="mt-4 text-blue-600 hover:underline">
                                        Enroll employees
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Session</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Enrolled</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                                            {isHR() && (
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((e) => (
                                            <tr key={e.enrollment_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-3 px-4"><p className="font-medium text-gray-800">{e.employee_name || getEmployeeName(e.employee_id)}</p></td>
                                                <td className="py-3 px-4 hidden md:table-cell"><span className="text-sm text-gray-600">{e.session_title || 'N/A'}</span></td>
                                                <td className="py-3 px-4 hidden lg:table-cell"><span className="text-sm text-gray-600">{new Date(e.enrollment_date).toLocaleDateString()}</span></td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(e.status)}`}>
                                                        {getStatusIcon(e.status)} {e.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(e.attendance_status || 'not_started')}`}>
                                                        {e.attendance_status || 'Not Started'}
                                                    </span>
                                                </td>
                                                {isHR() && (
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {e.status !== 'completed' && e.status !== 'cancelled' && (
                                                                <>
                                                                    <button onClick={() => handleUpdateEnrollment(e.enrollment_id, 'completed', 'completed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Mark Complete">
                                                                        <FaCheck />
                                                                    </button>
                                                                    <button onClick={() => handleUpdateEnrollment(e.enrollment_id, 'dropped', 'absent')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Drop">
                                                                        <FaTimes />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {e.status === 'completed' && !e.certificate_issued && (
                                                                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Issue Certificate">
                                                                    <FaCertificate />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {enrollments.length} enrollments</div>
                    </div>
                )}

                {/* TAB: TRAINERS */}
                {activeTab === 'trainers' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {trainers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">👨‍🏫</div>
                                <p>No trainers found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {trainers.map((t) => (
                                    <div key={t.trainer_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800">{t.name}</h4>
                                                <p className="text-xs text-gray-500">{t.specialization || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-600">
                                            <p><FaEnvelope className="inline mr-1 text-gray-400" /> {t.email}</p>
                                            <p><FaPhone className="inline mr-1 text-gray-400" /> {t.phone || 'N/A'}</p>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1">
                                            {[1,2,3,4,5].map((star) => (
                                                <FaStar key={star} className={`text-sm ${star <= (t.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">({t.rating || 0})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {trainers.length} trainers</div>
                    </div>
                )}

                {/* TAB: SKILL GAP */}
                {activeTab === 'skill-gap' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {isHR() && (
                            <button onClick={() => setShowSkillGapModal(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                <FaPlus /> Add Skill Gap Analysis
                            </button>
                        )}
                        {skillGaps.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📊</div>
                                <p>No skill gap analysis found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Skill</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Current → Required</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gap</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {skillGaps.map((g) => (
                                            <tr key={g.gap_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-3 px-4"><p className="font-medium text-gray-800">{getEmployeeName(g.employee_id)}</p></td>
                                                <td className="py-3 px-4"><span className="text-sm text-gray-700">{g.skill_name}</span></td>
                                                <td className="py-3 px-4 hidden md:table-cell"><span className="text-sm text-gray-600">{g.current_level} → {g.required_level}</span></td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                        g.gap_level === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        g.gap_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                        {g.gap_level}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                        g.priority === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        g.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        g.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                        {g.priority}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 hidden lg:table-cell">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(g.status)}`}>
                                                        {g.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {skillGaps.length} skill gaps</div>
                    </div>
                )}

                {/* TAB: BUDGET */}
                {activeTab === 'budget' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {budget.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">💰</div>
                                <p>No budget records found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {budget.map((b) => (
                                    <div key={b.budget_id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{b.category}</h4>
                                                <p className="text-sm text-gray-500">Program: {getProgramTitle(b.program_id)}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{b.fiscal_year}</span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Allocated</span>
                                                <span className="font-medium">{formatCurrency(b.allocated)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Spent</span>
                                                <span className="font-medium text-red-600">{formatCurrency(b.spent)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Remaining</span>
                                                <span className={`font-medium ${b.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(b.remaining)}
                                                </span>
                                            </div>
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${b.spent > b.allocated ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${b.allocated > 0 ? Math.min((b.spent / b.allocated) * 100, 100) : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Showing {budget.length} budget records</div>
                    </div>
                )}

                {/* TAB: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-6">Training Summary Report</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-200">
                                <div className="text-3xl font-bold text-blue-600">{reportData.total_programs}</div>
                                <div className="text-sm text-gray-500">Total Programs</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200">
                                <div className="text-3xl font-bold text-green-600">{reportData.total_sessions}</div>
                                <div className="text-sm text-gray-500">Total Sessions</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl text-center border border-purple-200">
                                <div className="text-3xl font-bold text-purple-600">{reportData.total_enrollments}</div>
                                <div className="text-sm text-gray-500">Total Enrollments</div>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-200">
                                <div className="text-3xl font-bold text-emerald-600">{reportData.completed_enrollments}</div>
                                <div className="text-sm text-gray-500">Completed</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200">
                                <div className="text-3xl font-bold text-yellow-600">{formatCurrency(reportData.allocated_budget)}</div>
                                <div className="text-sm text-gray-500">Allocated Budget</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-200">
                                <div className="text-3xl font-bold text-red-600">{formatCurrency(reportData.spent_budget)}</div>
                                <div className="text-sm text-gray-500">Spent Budget</div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
                            📊 Detailed charts and analytics can be added here using Recharts/Chart.js
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================
                MODAL: Create/Edit Program
            ============================================ */}
            {showProgramModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {selectedProgram ? 'Edit Program' : 'New Training Program'}
                            </h3>
                            <button onClick={() => { setShowProgramModal(false); resetProgramForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleProgramSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" value={programForm.title} onChange={(e) => setProgramForm({...programForm, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={programForm.description} onChange={(e) => setProgramForm({...programForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" rows="3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                                    <select value={programForm.training_type} onChange={(e) => setProgramForm({...programForm, training_type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="internal">Internal</option><option value="external">External</option>
                                        <option value="online">Online</option><option value="blended">Blended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" value={programForm.category} onChange={(e) => setProgramForm({...programForm, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                                    <input type="text" value={programForm.provider} onChange={(e) => setProgramForm({...programForm, provider: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                                    <input type="number" value={programForm.duration_hours} onChange={(e) => setProgramForm({...programForm, duration_hours: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                                    <input type="number" value={programForm.max_participants} onChange={(e) => setProgramForm({...programForm, max_participants: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Participant</label>
                                    <input type="number" value={programForm.cost} onChange={(e) => setProgramForm({...programForm, cost: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                    <input type="number" value={programForm.budget} onChange={(e) => setProgramForm({...programForm, budget: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={programForm.status} onChange={(e) => setProgramForm({...programForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="draft">Draft</option><option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Saving...</> : (selectedProgram ? 'Update' : 'Create')}
                                </button>
                                <button type="button" onClick={() => { setShowProgramModal(false); resetProgramForm(); }} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================
                MODAL: Create/Edit Session
            ============================================ */}
            {showSessionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {selectedSession ? 'Edit Session' : 'New Training Session'}
                            </h3>
                            <button onClick={() => { setShowSessionModal(false); resetSessionForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSessionSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                                    <select value={sessionForm.program_id} onChange={(e) => setSessionForm({...sessionForm, program_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required>
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
                                    <input type="text" value={sessionForm.title} onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={sessionForm.description} onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" rows="2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time</label>
                                    <input type="datetime-local" value={sessionForm.start_date} onChange={(e) => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
                                    <input type="datetime-local" value={sessionForm.end_date} onChange={(e) => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" value={sessionForm.location} onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                    <input type="url" value={sessionForm.meeting_link} onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="https://zoom.us/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                                    <input type="number" value={sessionForm.max_participants} onChange={(e) => setSessionForm({...sessionForm, max_participants: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                                    <select value={sessionForm.trainer_id} onChange={(e) => setSessionForm({...sessionForm, trainer_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="">Select Trainer</option>
                                        {trainers.map(t => <option key={t.trainer_id} value={t.trainer_id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={sessionForm.status} onChange={(e) => setSessionForm({...sessionForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Saving...</> : (selectedSession ? 'Update' : 'Create')}
                                </button>
                                <button type="button" onClick={() => { setShowSessionModal(false); resetSessionForm(); }} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================
                MODAL: Enroll Employee
            ============================================ */}
            {showEnrollmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Enroll Employee</h3>
                        <form onSubmit={handleEnrollSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Session *</label>
                                    <select value={enrollmentForm.session_id} onChange={(e) => setEnrollmentForm({...enrollmentForm, session_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required>
                                        <option value="">Select Session</option>
                                        {sessions.filter(s => s.status === 'scheduled' || s.status === 'ongoing').map(s => (
                                            <option key={s.session_id} value={s.session_id}>{s.title} ({formatDate(s.start_date)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                    <select value={enrollmentForm.employee_id} onChange={(e) => setEnrollmentForm({...enrollmentForm, employee_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required>
                                        <option value="">Select Employee</option>
                                        {employees.filter(e => e.status === 'active').map(emp => (
                                            <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={enrollmentForm.status} onChange={(e) => setEnrollmentForm({...enrollmentForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="enrolled">Enrolled</option><option value="waitlisted">Waitlisted</option><option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Enrolling...</> : 'Enroll'}
                                </button>
                                <button type="button" onClick={() => { setShowEnrollmentModal(false); resetEnrollmentForm(); }} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================
                MODAL: Skill Gap Analysis
            ============================================ */}
            {showSkillGapModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Add Skill Gap Analysis</h3>
                        <form onSubmit={handleSkillGapSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                    <select value={skillGapForm.employee_id} onChange={(e) => setSkillGapForm({...skillGapForm, employee_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required>
                                        <option value="">Select Employee</option>
                                        {employees.filter(e => e.status === 'active').map(emp => (
                                            <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name *</label>
                                    <input type="text" value={skillGapForm.skill_name} onChange={(e) => setSkillGapForm({...skillGapForm, skill_name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
                                    <select value={skillGapForm.current_level} onChange={(e) => setSkillGapForm({...skillGapForm, current_level: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option><option value="expert">Expert</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Level</label>
                                    <select value={skillGapForm.required_level} onChange={(e) => setSkillGapForm({...skillGapForm, required_level: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option><option value="expert">Expert</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select value={skillGapForm.priority} onChange={(e) => setSkillGapForm({...skillGapForm, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                        <option value="low">Low</option><option value="medium">Medium</option>
                                        <option value="high">High</option><option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Training</label>
                                    <textarea value={skillGapForm.recommended_training} onChange={(e) => setSkillGapForm({...skillGapForm, recommended_training: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" rows="2" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Saving...</> : 'Add Skill Gap'}
                                </button>
                                <button type="button" onClick={() => { setShowSkillGapModal(false); resetSkillGapForm(); }} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TrainingManager;