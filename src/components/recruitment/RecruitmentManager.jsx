// frontend/src/components/recruitment/RecruitmentManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaBriefcase, FaPlus, FaEdit, FaTrash, FaEye,
    FaCheck, FaTimes, FaClock, FaFilter, FaDownload,
    FaSearch, FaSpinner, FaUser, FaFileAlt,
    FaCheckCircle, FaTimesCircle, FaCalendar,
    FaEnvelope, FaPhone, FaMapMarker, FaMoneyBill,
    FaStar, FaStarHalf, FaRegStar
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const RecruitmentManager = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showJobForm, setShowJobForm] = useState(false);
    const [showAppModal, setShowAppModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [activeTab, setActiveTab] = useState('jobs');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobForm, setJobForm] = useState({
        title: '',
        department_id: '',
        position_id: '',
        description: '',
        requirements: '',
        responsibilities: '',
        qualifications: '',
        salary_range: '',
        employment_type: 'full-time',
        location: '',
        experience_level: 'mid',
        closing_date: '',
        status: 'draft'
    });

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canManageRecruitment = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/api/recruitment.php?jobs=1');
            if (response.data.status === 1) {
                setJobs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await api.get('/api/recruitment.php?applications=1');
            if (response.data.status === 1) {
                setApplications(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    // ============================================
    // JOB CRUD
    // ============================================
    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/recruitment.php', {
                action: 'create_job',
                ...jobForm
            });
            if (response.data.status === 1) {
                toast.success('Job posted successfully!');
                setShowJobForm(false);
                resetJobForm();
                fetchJobs();
            } else {
                toast.error(response.data.message || 'Failed to post job');
            }
        } catch (error) {
            toast.error('Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateJobStatus = async (jobId, status) => {
        try {
            const response = await api.put(`/api/recruitment.php?job_id=${jobId}`, { status });
            if (response.data.status === 1) {
                toast.success(`Job ${status}`);
                fetchJobs();
            }
        } catch (error) {
            toast.error('Failed to update job status');
        }
    };

    const resetJobForm = () => {
        setJobForm({
            title: '',
            department_id: '',
            position_id: '',
            description: '',
            requirements: '',
            responsibilities: '',
            qualifications: '',
            salary_range: '',
            employment_type: 'full-time',
            location: '',
            experience_level: 'mid',
            closing_date: '',
            status: 'draft'
        });
    };

    // ============================================
    // APPLICATION ACTIONS
    // ============================================
    const handleUpdateApplication = async (appId, status, notes = '') => {
        try {
            const response = await api.put(`/api/recruitment.php?id=${appId}`, { 
                status, 
                screening_notes: notes 
            });
            if (response.data.status === 1) {
                toast.success(`Application ${status}`);
                fetchApplications();
                if (selectedApplication) {
                    setSelectedApplication({...selectedApplication, status});
                }
            }
        } catch (error) {
            toast.error('Failed to update application');
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/recruitment.php', {
                action: 'schedule_interview',
                ...interviewData
            });
            if (response.data.status === 1) {
                toast.success('Interview scheduled!');
                setShowInterviewModal(false);
                fetchApplications();
            } else {
                toast.error(response.data.message || 'Failed to schedule interview');
            }
        } catch (error) {
            toast.error('Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    const [interviewData, setInterviewData] = useState({
        application_id: '',
        interview_type: 'video',
        scheduled_date: '',
        duration_minutes: 60,
        interviewer_id: '',
        location: '',
        meeting_link: '',
        notes: ''
    });

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            published: 'bg-blue-100 text-blue-700 border-blue-200',
            closed: 'bg-red-100 text-red-700 border-red-200',
            filled: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            screening: 'bg-purple-100 text-purple-700 border-purple-200',
            shortlisted: 'bg-blue-100 text-blue-700 border-blue-200',
            interview: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            offer: 'bg-orange-100 text-orange-700 border-orange-200',
            hired: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        };
        return badges[status] || badges.pending;
    };

    const getEmploymentTypeLabel = (type) => {
        const labels = {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship',
            'remote': 'Remote'
        };
        return labels[type] || type;
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
                                <FaBriefcase className="text-blue-600" /> Recruitment & Hiring
                            </h1>
                            <p className="text-sm text-gray-500">Manage job postings and applications</p>
                        </div>
                        {canManageRecruitment() && (
                            <button 
                                onClick={() => setShowJobForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaPlus /> Post Job
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b-2 border-gray-200">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-[2px] ${
                            activeTab === 'jobs'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaBriefcase className="inline mr-2" /> Job Postings
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-[2px] ${
                            activeTab === 'applications'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaUser className="inline mr-2" /> Applications
                    </button>
                </div>

                {/* Job Postings Tab */}
                {activeTab === 'jobs' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex-1 min-w-[200px] relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search jobs..."
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
                                <option value="closed">Closed</option>
                                <option value="filled">Filled</option>
                            </select>
                        </div>

                        {jobs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📢</div>
                                <p>No job postings yet</p>
                                {canManageRecruitment() && (
                                    <button 
                                        onClick={() => setShowJobForm(true)}
                                        className="mt-4 text-blue-600 hover:underline"
                                    >
                                        Post your first job
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.map((job) => (
                                    <div key={job.job_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{job.title}</h3>
                                                <p className="text-sm text-gray-500">{job.department_name || 'N/A'}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FaBriefcase className="text-xs" /> {getEmploymentTypeLabel(job.employment_type)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaMapMarker className="text-xs" /> {job.location || 'Remote'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaMoneyBill className="text-xs" /> {job.salary_range || 'Negotiable'}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                                            <span>{job.applications_count || 0} applications</span>
                                            <span>Posted: {new Date(job.posting_date).toLocaleDateString()}</span>
                                        </div>
                                        {canManageRecruitment() && (
                                            <div className="mt-3 flex gap-2">
                                                <button 
                                                    onClick={() => {}} 
                                                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                >
                                                    <FaEye className="inline mr-1" /> View
                                                </button>
                                                {job.status === 'draft' && (
                                                    <button 
                                                        onClick={() => handleUpdateJobStatus(job.job_id, 'published')}
                                                        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                                    >
                                                        <FaCheck className="inline mr-1" /> Publish
                                                    </button>
                                                )}
                                                {job.status === 'published' && (
                                                    <button 
                                                        onClick={() => handleUpdateJobStatus(job.job_id, 'closed')}
                                                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        <FaTimes className="inline mr-1" /> Close
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex-1 min-w-[200px] relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search applications..."
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
                                <option value="pending">Pending</option>
                                <option value="screening">Screening</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {applications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-2">📋</div>
                                <p>No applications received yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Job</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Applied</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.application_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{app.first_name} {app.last_name}</p>
                                                        <p className="text-xs text-gray-500">{app.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell">
                                                    <span className="text-sm text-gray-600">{app.job_title || 'N/A'}</span>
                                                </td>
                                                <td className="py-3 px-4 hidden lg:table-cell">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(app.applied_date).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => { setSelectedApplication(app); setShowAppModal(true); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="View"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {canManageRecruitment() && app.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateApplication(app.application_id, 'screening')}
                                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                                    title="Move to Screening"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateApplication(app.application_id, 'rejected', 'Not qualified')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RecruitmentManager;