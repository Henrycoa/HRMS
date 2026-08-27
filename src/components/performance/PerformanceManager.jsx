// frontend/src/components/performance/PerformanceManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaChartBar, FaStar, FaCheckCircle, FaTimesCircle, 
    FaPlus, FaEdit, FaTrash, FaEye, FaUser, FaBullseye,
    FaChartLine, FaTrophy, FaClipboardList, FaUsers,
    FaSpinner, FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PerformanceManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('reviews');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [competencies, setCompetencies] = useState([]);
    
    // Review States
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        employee_id: '',
        review_type: 'self',
        period_start: new Date().getFullYear() + '-01-01',
        period_end: new Date().getFullYear() + '-12-31'
    });

    // Rating states for filling out review
    const [ratings, setRatings] = useState([]);
    const [reviewTexts, setReviewTexts] = useState({
        strengths: '',
        improvements: '',
        achievements: '',
        development_plan: '',
        promotion_recommended: 0
    });

    // Goal States
    const [goals, setGoals] = useState([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalForm, setGoalForm] = useState({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
    });

    // KPI States
    const [kpis, setKpis] = useState([]);
    const [showKpiModal, setShowKpiModal] = useState(false);
    const [kpiForm, setKpiForm] = useState({
        name: '',
        target: 100,
        current: 0,
        unit: '%',
        period: new Date().getFullYear() + ' Q' + Math.ceil((new Date().getMonth() + 1) / 3)
    });

    // Dashboard Stats
    const [dashboardStats, setDashboardStats] = useState({
        total_reviews: 0,
        avg_rating: 0,
        goal_completion_rate: 0,
        promotion_recommendations: 0
    });

    const isHR = () => ['super_admin', 'hr_manager'].includes(user?.user_type);
    const isManager = () => ['super_admin', 'hr_manager', 'department_head'].includes(user?.user_type);

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchEmployees();
        fetchCompetencies();
        if (activeTab === 'reviews') fetchReviews();
        if (activeTab === 'goals') fetchGoals();
        if (activeTab === 'kpis') fetchKpis();
        if (activeTab === 'dashboard') fetchDashboard();
    }, [activeTab, user]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees.php');
            if (res.data.status === 1) setEmployees(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchCompetencies = async () => {
        try {
            const res = await api.get('/api/performance.php?competencies=1');
            if (res.data.status === 1) setCompetencies(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ reviews: 1 });
            if (!isHR() && user?.id) {
                // Server will handle filtering by employee_id or reviewer_id
            }
            const res = await api.get(`/api/performance.php?${params}`);
            if (res.data.status === 1) setReviews(res.data.data || []);
        } catch (e) { toast.error('Failed to load reviews'); }
        setLoading(false);
    };

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ goals: 1 });
            const res = await api.get(`/api/performance.php?${params}`);
            if (res.data.status === 1) setGoals(res.data.data || []);
        } catch (e) { toast.error('Failed to load goals'); }
        setLoading(false);
    };

    const fetchKpis = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ kpis: 1 });
            const res = await api.get(`/api/performance.php?${params}`);
            if (res.data.status === 1) setKpis(res.data.data || []);
        } catch (e) { toast.error('Failed to load KPIs'); }
        setLoading(false);
    };

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/api/performance.php?dashboard=1');
            if (res.data.status === 1) setDashboardStats(res.data.data);
        } catch (e) { console.error(e); }
    };

    // ============================================
    // REVIEW CRUD
    // ============================================
    const handleCreateReview = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/performance.php', { action: 'create_review', ...reviewForm });
            if (res.data.status === 1) {
                toast.success('Review created!');
                setShowReviewModal(false);
                fetchReviews();
                setReviewForm({ employee_id: '', review_type: 'self', period_start: '', period_end: '' });
            } else {
                toast.error(res.data.message);
            }
        } catch (e) { toast.error('Failed to create review'); }
        setLoading(false);
    };

    const handleSubmitReview = async (reviewId) => {
        // First, open the modal to fill ratings
        setSelectedReview(reviews.find(r => r.review_id === reviewId));
        // Load existing ratings if any
        try {
            const res = await api.get(`/api/performance.php?id=${reviewId}`);
            if (res.data.status === 1) {
                const data = res.data.data;
                setReviewTexts({
                    strengths: data.review.strengths || '',
                    improvements: data.review.improvements || '',
                    achievements: data.review.achievements || '',
                    development_plan: data.review.development_plan || '',
                    promotion_recommended: data.review.promotion_recommended || 0
                });
                // Map ratings
                const existing = data.ratings || [];
                const compMap = {};
                existing.forEach(r => compMap[r.comp_id] = { rating_value: r.rating_value, comments: r.comments || '' });
                
                const initialRatings = competencies.map(c => ({
                    comp_id: c.comp_id,
                    rating_value: compMap[c.comp_id]?.rating_value || 0,
                    comments: compMap[c.comp_id]?.comments || ''
                }));
                setRatings(initialRatings);
            }
        } catch (e) { toast.error('Failed to load review data'); }
        setShowReviewModal(true); // Reuse modal but for editing
    };

    const saveReviewRatings = async () => {
        if (!selectedReview) return;
        setLoading(true);
        try {
            const payload = {
                action: 'submit_review',
                review_id: selectedReview.review_id,
                ...reviewTexts,
                ratings: ratings
            };
            const res = await api.post('/api/performance.php', payload);
            if (res.data.status === 1) {
                toast.success('Review submitted!');
                setShowReviewModal(false);
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (e) { toast.error('Failed to save'); }
        setLoading(false);
    };

    const handleFinalizeReview = async (id, status = 'completed') => {
        const comments = prompt('Enter manager comments (optional):');
        try {
            await api.put(`/api/performance.php?id=${id}`, { finalize_review: true, status, reviewer_comments: comments });
            toast.success('Review finalized!');
            fetchReviews();
        } catch (e) { toast.error('Failed to finalize'); }
    };

    // ============================================
    // GOALS CRUD
    // ============================================
    const handleCreateGoal = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/performance.php', { action: 'create_goal', ...goalForm });
            if (res.data.status === 1) {
                toast.success('Goal created!');
                setShowGoalModal(false);
                fetchGoals();
                setGoalForm({ title: '', description: '', start_date: '', end_date: '' });
            }
        } catch (e) { toast.error('Failed to create goal'); }
        setLoading(false);
    };

    const handleUpdateGoalProgress = async (goalId, progress) => {
        try {
            await api.put(`/api/performance.php?id=${goalId}`, { goal_progress: progress });
            fetchGoals();
            toast.success('Progress updated');
        } catch (e) { toast.error('Update failed'); }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('Delete this goal?')) return;
        try {
            await api.delete(`/api/performance.php?id=${id}&type=goal`);
            toast.success('Goal deleted');
            fetchGoals();
        } catch (e) { toast.error('Delete failed'); }
    };

    // ============================================
    // KPIs CRUD
    // ============================================
    const handleCreateKpi = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/performance.php', { action: 'create_kpi', ...kpiForm });
            if (res.data.status === 1) {
                toast.success('KPI created!');
                setShowKpiModal(false);
                fetchKpis();
                setKpiForm({ name: '', target: 100, current: 0, unit: '%', period: '' });
            }
        } catch (e) { toast.error('Failed to create KPI'); }
        setLoading(false);
    };

    const handleUpdateKpi = async (kpiId, current, target) => {
        try {
            await api.put(`/api/performance.php?id=${kpiId}`, { kpi_current: current, kpi_target: target });
            fetchKpis();
            toast.success('KPI updated');
        } catch (e) { toast.error('Update failed'); }
    };

    // ============================================
    // RENDER HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const map = {
            'draft': 'bg-gray-100 text-gray-600',
            'pending_self': 'bg-yellow-100 text-yellow-600',
            'pending_manager': 'bg-blue-100 text-blue-600',
            'completed': 'bg-green-100 text-green-600',
            'cancelled': 'bg-red-100 text-red-600'
        };
        return map[status] || map.draft;
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 60) return 'bg-blue-500';
        if (progress >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // ============================================
    // MAIN RENDER
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaChartBar className="text-blue-600" /> Performance Management
                            </h1>
                            <p className="text-sm text-gray-500">Manage reviews, goals, and KPIs</p>
                        </div>
                        <div className="flex gap-2">
                            {activeTab === 'reviews' && (isHR() || isManager()) && (
                                <button onClick={() => setShowReviewModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> New Review
                                </button>
                            )}
                            {activeTab === 'goals' && (
                                <button onClick={() => setShowGoalModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> New Goal
                                </button>
                            )}
                            {activeTab === 'kpis' && (
                                <button onClick={() => setShowKpiModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    <FaPlus /> New KPI
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-gray-200 bg-white rounded-t-2xl overflow-hidden">
                    {['reviews', 'goals', 'kpis', 'dashboard'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium capitalize transition ${
                                activeTab === tab 
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab === 'reviews' && <FaClipboardList className="inline mr-2" />}
                            {tab === 'goals' && <FaBullseye className="inline mr-2" />}
                            {tab === 'kpis' && <FaChartLine className="inline mr-2" />}
                            {tab === 'dashboard' && <FaTrophy className="inline mr-2" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* =========================================================
                    TAB: REVIEWS
                ========================================================= */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {loading ? <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        : reviews.length === 0 ? <div className="text-center py-12 text-gray-500">No reviews found</div>
                        : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b">
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                                        <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {reviews.map(r => (
                                            <tr key={r.review_id} className="border-b hover:bg-gray-50">
                                                <td className="py-3">{r.employee_name || 'N/A'}</td>
                                                <td className="py-3"><span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">{r.review_type}</span></td>
                                                <td className="py-3 text-sm">{r.period_start} → {r.period_end}</td>
                                                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(r.status)}`}>{r.status.replace('_', ' ')}</span></td>
                                                <td className="py-3 font-bold">{r.overall_rating || '-'}</td>
                                                <td className="py-3 text-right space-x-2">
                                                    {r.status === 'pending_self' && (
                                                        <button onClick={() => handleSubmitReview(r.review_id)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">Self-Assess</button>
                                                    )}
                                                    {r.status === 'pending_manager' && isManager() && (
                                                        <button onClick={() => handleFinalizeReview(r.review_id, 'completed')} className="text-green-600 hover:bg-green-50 p-1 rounded">Finalize</button>
                                                    )}
                                                    {r.status !== 'completed' && isHR() && (
                                                        <button onClick={() => handleFinalizeReview(r.review_id, 'cancelled')} className="text-red-600 hover:bg-red-50 p-1 rounded"><FaTimesCircle /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: GOALS
                ========================================================= */}
                {activeTab === 'goals' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {loading ? <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        : goals.length === 0 ? <div className="text-center py-12 text-gray-500">No goals set</div>
                        : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {goals.map(g => (
                                    <div key={g.goal_id} className="border rounded-xl p-4 hover:shadow transition">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-gray-800">{g.title}</h4>
                                            <button onClick={() => handleDeleteGoal(g.goal_id)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                                        </div>
                                        <p className="text-sm text-gray-500 my-2">{g.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{g.start_date} → {g.end_date}</span>
                                            <span className={`px-2 py-0.5 rounded-full ${getStatusBadge(g.status)}`}>{g.status}</span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{g.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${getProgressColor(g.progress)}`} style={{ width: `${g.progress}%` }}></div>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" value={g.progress}
                                                onChange={(e) => handleUpdateGoalProgress(g.goal_id, parseInt(e.target.value))}
                                                className="w-full mt-2 accent-blue-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: KPIs
                ========================================================= */}
                {activeTab === 'kpis' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        {loading ? <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" /></div>
                        : kpis.length === 0 ? <div className="text-center py-12 text-gray-500">No KPIs tracked</div>
                        : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {kpis.map(k => {
                                    const progress = k.target > 0 ? (k.current / k.target) * 100 : 0;
                                    return (
                                        <div key={k.kpi_id} className="border rounded-xl p-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-gray-800">{k.name}</h4>
                                                <span className="text-sm text-gray-400">{k.period}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-2xl font-bold">{k.current}</span>
                                                <span className="text-sm text-gray-500 ml-1">{k.unit}</span>
                                                <span className="text-sm text-gray-400 ml-2">/ Target: {k.target}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs font-medium">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <input type="number" className="border rounded-lg px-2 py-1 w-20 text-sm" value={k.current}
                                                    onChange={(e) => handleUpdateKpi(k.kpi_id, parseFloat(e.target.value), k.target)} />
                                                <button className="text-xs text-blue-600">Update</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: DASHBOARD
                ========================================================= */}
                {activeTab === 'dashboard' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-6">Performance Dashboard</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-200">
                                <div className="text-3xl font-bold text-blue-600">{dashboardStats.total_reviews}</div>
                                <div className="text-sm text-gray-500">Total Reviews</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200">
                                <div className="text-3xl font-bold text-green-600">{dashboardStats.avg_rating}</div>
                                <div className="text-sm text-gray-500">Avg Rating</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl text-center border border-purple-200">
                                <div className="text-3xl font-bold text-purple-600">{dashboardStats.goal_completion_rate}%</div>
                                <div className="text-sm text-gray-500">Goals Completed</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200">
                                <div className="text-3xl font-bold text-orange-600">{dashboardStats.promotion_recommendations}</div>
                                <div className="text-sm text-gray-500">Promo Recs</div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
                            📊 Visual charts (using Recharts/Chart.js) can be added here for detailed analytics.
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================
                MODAL: Create Review
            ========================================================= */}
            {showReviewModal && !selectedReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Create New Review</h3>
                        <form onSubmit={handleCreateReview}>
                            <div className="space-y-3">
                                {isHR() && (
                                    <select className="w-full p-2 border rounded-lg" value={reviewForm.employee_id} onChange={(e) => setReviewForm({...reviewForm, employee_id: e.target.value})} required>
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</option>)}
                                    </select>
                                )}
                                <select className="w-full p-2 border rounded-lg" value={reviewForm.review_type} onChange={(e) => setReviewForm({...reviewForm, review_type: e.target.value})}>
                                    <option value="self">Self Assessment</option>
                                    <option value="manager">Manager Review</option>
                                </select>
                                <input type="date" className="w-full p-2 border rounded-lg" value={reviewForm.period_start} onChange={(e) => setReviewForm({...reviewForm, period_start: e.target.value})} />
                                <input type="date" className="w-full p-2 border rounded-lg" value={reviewForm.period_end} onChange={(e) => setReviewForm({...reviewForm, period_end: e.target.value})} />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create</button>
                                <button type="button" onClick={() => {setShowReviewModal(false); setSelectedReview(null);}} className="px-4 border rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL: Fill out Review (Ratings)
            ========================================================= */}
            {showReviewModal && selectedReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
                        <h3 className="text-lg font-bold mb-2">Review: {selectedReview.employee_name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Rate each competency below</p>
                        
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {competencies.map((c, idx) => (
                                <div key={c.comp_id} className="border-b pb-3">
                                    <div className="flex justify-between items-center">
                                        <label className="font-medium text-sm">{c.name} <span className="text-xs text-gray-400">({c.category})</span></label>
                                        <select className="border rounded-lg p-1 w-20" value={ratings[idx]?.rating_value || 0} onChange={(e) => {
                                            const newRatings = [...ratings];
                                            newRatings[idx] = { ...newRatings[idx], comp_id: c.comp_id, rating_value: parseFloat(e.target.value) };
                                            setRatings(newRatings);
                                        }}>
                                            {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <input type="text" placeholder="Comments..." className="w-full mt-1 border rounded-lg p-1 text-sm" value={ratings[idx]?.comments || ''} onChange={(e) => {
                                        const newRatings = [...ratings];
                                        newRatings[idx] = { ...newRatings[idx], comp_id: c.comp_id, comments: e.target.value };
                                        setRatings(newRatings);
                                    }} />
                                </div>
                            ))}
                            
                            <div className="mt-4 border-t pt-4 space-y-3">
                                <textarea className="w-full p-2 border rounded-lg" rows="2" placeholder="Strengths" value={reviewTexts.strengths} onChange={(e) => setReviewTexts({...reviewTexts, strengths: e.target.value})} />
                                <textarea className="w-full p-2 border rounded-lg" rows="2" placeholder="Areas for Improvement" value={reviewTexts.improvements} onChange={(e) => setReviewTexts({...reviewTexts, improvements: e.target.value})} />
                                <textarea className="w-full p-2 border rounded-lg" rows="2" placeholder="Achievements" value={reviewTexts.achievements} onChange={(e) => setReviewTexts({...reviewTexts, achievements: e.target.value})} />
                                <textarea className="w-full p-2 border rounded-lg" rows="2" placeholder="Development Plan" value={reviewTexts.development_plan} onChange={(e) => setReviewTexts({...reviewTexts, development_plan: e.target.value})} />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={reviewTexts.promotion_recommended === 1} onChange={(e) => setReviewTexts({...reviewTexts, promotion_recommended: e.target.checked ? 1 : 0})} />
                                    <label className="text-sm">Recommend for Promotion (8.13)</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button onClick={saveReviewRatings} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Submit Review</button>
                            <button type="button" onClick={() => {setShowReviewModal(false); setSelectedReview(null);}} className="px-4 border rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL: Create Goal
            ========================================================= */}
            {showGoalModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Create SMART Goal</h3>
                        <form onSubmit={handleCreateGoal}>
                            <div className="space-y-3">
                                <input className="w-full p-2 border rounded-lg" placeholder="Title" value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} required />
                                <textarea className="w-full p-2 border rounded-lg" placeholder="Description (Specific, Measurable...)" rows="3" value={goalForm.description} onChange={(e) => setGoalForm({...goalForm, description: e.target.value})} />
                                <input type="date" className="w-full p-2 border rounded-lg" value={goalForm.start_date} onChange={(e) => setGoalForm({...goalForm, start_date: e.target.value})} />
                                <input type="date" className="w-full p-2 border rounded-lg" value={goalForm.end_date} onChange={(e) => setGoalForm({...goalForm, end_date: e.target.value})} />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create</button>
                                <button type="button" onClick={() => setShowGoalModal(false)} className="px-4 border rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL: Create KPI
            ========================================================= */}
            {showKpiModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Create KPI</h3>
                        <form onSubmit={handleCreateKpi}>
                            <div className="space-y-3">
                                <input className="w-full p-2 border rounded-lg" placeholder="KPI Name" value={kpiForm.name} onChange={(e) => setKpiForm({...kpiForm, name: e.target.value})} required />
                                <input type="number" className="w-full p-2 border rounded-lg" placeholder="Target" value={kpiForm.target} onChange={(e) => setKpiForm({...kpiForm, target: parseFloat(e.target.value)})} />
                                <input type="number" className="w-full p-2 border rounded-lg" placeholder="Current" value={kpiForm.current} onChange={(e) => setKpiForm({...kpiForm, current: parseFloat(e.target.value)})} />
                                <input className="w-full p-2 border rounded-lg" placeholder="Unit (e.g. %, units, $)" value={kpiForm.unit} onChange={(e) => setKpiForm({...kpiForm, unit: e.target.value})} />
                                <input className="w-full p-2 border rounded-lg" placeholder="Period (e.g. Q1 2026)" value={kpiForm.period} onChange={(e) => setKpiForm({...kpiForm, period: e.target.value})} />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create</button>
                                <button type="button" onClick={() => setShowKpiModal(false)} className="px-4 border rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PerformanceManager;