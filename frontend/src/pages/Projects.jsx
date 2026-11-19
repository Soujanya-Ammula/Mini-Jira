import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiFolder, 
  FiFolderPlus, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiX 
} from 'react-icons/fi';
import { projectsService, usersService, authService, reviewsService } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Project Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null means adding new project
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Software');
  const [formPriority, setFormPriority] = useState('medium');
  const [formOwnerId, setFormOwnerId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Project Reviews Modal State
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedProjectForReviews, setSelectedProjectForReviews] = useState(null);
  const [projectReviews, setProjectReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // Add / Edit Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [reviewReviewerId, setReviewReviewerId] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const me = await authService.getMe();
      setCurrentUser(me);

      const projData = await projectsService.getAll();
      setProjects(projData);

      // Fetch users to populate owner dropdown
      const userData = await usersService.getAll().catch(() => []);
      setUsers(userData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormKey('');
    setFormDescription('');
    setFormCategory('Software');
    setFormPriority('medium');
    setFormStartDate('');
    setFormEndDate('');
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
      setFormOwnerId(currentUser.id.toString());
    } else if (users.length > 0) {
      setFormOwnerId(users[0].id.toString());
    } else {
      setFormOwnerId('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setFormName(proj.name);
    setFormKey(proj.key);
    setFormDescription(proj.description || '');
    setFormCategory(proj.category || 'Software');
    setFormPriority(proj.priority || 'medium');
    setFormStartDate(proj.start_date ? proj.start_date.split('T')[0] : '');
    setFormEndDate(proj.end_date ? proj.end_date.split('T')[0] : '');
    setFormOwnerId(proj.owner_id.toString());
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const activeWsId = localStorage.getItem('flowtrack_current_ws_id');

    const payload = {
      name: formName,
      key: formKey ? formKey.trim().toUpperCase() : null,
      description: formDescription,
      category: formCategory,
      priority: formPriority,
      start_date: formStartDate ? new Date(formStartDate).toISOString() : null,
      end_date: formEndDate ? new Date(formEndDate).toISOString() : null,
      owner_id: parseInt(formOwnerId),
      workspace_id: activeWsId ? parseInt(activeWsId) : null,
    };

    try {
      if (editingProject) {
        await projectsService.update(editingProject.id, payload);
      } else {
        await projectsService.create(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'An error occurred saving project details');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProject = async (proj) => {
    if (window.confirm(`Are you sure you want to delete project "${proj.name}" (${proj.key})? This will permanently delete the project.`)) {
      try {
        await projectsService.delete(proj.id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  // Reviews Logic
  const handleOpenReviewsModal = async (project) => {
    setSelectedProjectForReviews(project);
    setReviewsModalOpen(true);
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewsError('');
    loadProjectReviews(project.id);
  };

  const loadProjectReviews = async (projectId) => {
    setReviewsLoading(true);
    try {
      const data = await reviewsService.getAll(projectId);
      setProjectReviews(data);
    } catch (err) {
      console.error(err);
      setReviewsError(err.message || 'Failed to load project reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleOpenNewReviewForm = () => {
    setEditingReview(null);
    setReviewTitle('');
    setReviewFeedback('');
    setReviewStatus('pending');
    setReviewDeadline('');
    setReviewReviewerId(currentUser?.id ? currentUser.id.toString() : '');
    setShowReviewForm(true);
  };

  const handleOpenEditReviewForm = (review) => {
    setEditingReview(review);
    setReviewTitle(review.title);
    setReviewFeedback(review.feedback || '');
    setReviewStatus(review.status);
    setReviewDeadline(review.deadline ? review.deadline.slice(0, 10) : '');
    setReviewReviewerId(review.reviewer_id ? review.reviewer_id.toString() : '');
    setShowReviewForm(true);
  };

  const handleReviewFormSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewsError('');

    if (!reviewDeadline) {
      setReviewsError('Please specify a review deadline date.');
      setReviewSubmitting(false);
      return;
    }

    const payload = {
      title: reviewTitle,
      feedback: reviewFeedback,
      status: reviewStatus,
      project_id: selectedProjectForReviews.id,
      deadline: new Date(reviewDeadline).toISOString(),
      reviewer_id: reviewReviewerId ? parseInt(reviewReviewerId) : null,
    };

    try {
      if (editingReview) {
        await reviewsService.update(editingReview.id, payload);
      } else {
        await reviewsService.create(payload);
      }
      setShowReviewForm(false);
      loadProjectReviews(selectedProjectForReviews.id);
    } catch (err) {
      setReviewsError(err.message || 'Failed to save review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsService.delete(reviewId);
        loadProjectReviews(selectedProjectForReviews.id);
      } catch (err) {
        alert(err.message || 'Failed to delete review');
      }
    }
  };

  const handleQuickReviewStatus = async (review, newStatus) => {
    try {
      await reviewsService.update(review.id, { status: newStatus });
      loadProjectReviews(selectedProjectForReviews.id);
    } catch (err) {
      alert(err.message || 'Failed to update review status');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0] ? parts[0][0].toUpperCase() : 'U';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatReviewDeadline = (deadlineStr, reviewStatus) => {
    if (!deadlineStr) return null;
    const d = new Date(deadlineStr);
    const now = new Date();
    d.setHours(23, 59, 59, 999);
    
    const formatted = new Date(deadlineStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });

    const isApproved = reviewStatus === 'approved';
    const isPast = d < now && !isApproved;
    const diffHours = (d - now) / (1000 * 60 * 60);
    const isDueSoon = !isPast && !isApproved && diffHours > 0 && diffHours <= 48;

    if (isApproved) {
      return {
        text: `Approved (Target was: ${formatted})`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (isPast) {
      return {
        text: `🚨 Overdue: ${formatted}`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse'
      };
    }
    if (isDueSoon) {
      return {
        text: `⏳ Due Soon: ${formatted}`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
      };
    }
    return {
      text: `📅 Review Deadline: ${formatted}`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'changes_requested':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 dark:text-slate-400 text-sm">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">📁 Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Workspace project scopes and ownership overview.</p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
          >
            <FiFolderPlus className="w-4 h-4" />
            ➕ Create Project
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-200 bg-white/70 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-xs">
            <FiFolder />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Projects</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            {isManagerOrAdmin 
              ? 'Get started by creating your first workspace project to begin organizing task streams.' 
              : 'There are currently no projects in this workspace. Ask an administrator or manager to create one.'}
          </p>
          {isManagerOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div 
              key={p.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-blue-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 text-xs font-bold uppercase tracking-wider">
                      {p.key}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {p.category || 'Software'}
                    </span>
                  </div>
                  {isManagerOrAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="✏️ Edit Project"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="🗑️ Delete Project"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{p.name}</h3>
                    {p.priority && (
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                        p.priority === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        p.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {p.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                    {p.description || 'No project description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-[10px]" title={`Owner: ${p.owner.full_name}`}>
                      {getInitials(p.owner.full_name)}
                    </div>
                    <span className="font-semibold text-slate-700">{p.owner.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-400">
                    <FiCalendar />
                    <span>{formatDate(p.created_at)}</span>
                  </div>
                </div>

                {/* Project Reviews & Deadlines Button */}
                <button
                  onClick={() => handleOpenReviewsModal(p)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-700 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FiClock className="w-3.5 h-3.5 text-blue-600" />
                    Reviews & Deadlines
                  </span>
                  <span className="text-[11px] font-extrabold text-blue-600">
                    View Reviews →
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-7 relative space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {editingProject ? '✏️ Edit Project' : '➕ Create Project'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {editingProject ? 'Modify general project details.' : 'Start a new project folder.'}
              </p>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile Banking App"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Key (Auto if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBA"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 uppercase transition"
                    maxLength={10}
                    disabled={!!editingProject}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                  >
                    <option value="Software">Software</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Project Lead / Owner
                </label>
                <select
                  value={formOwnerId}
                  onChange={(e) => setFormOwnerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                  required
                >
                  <option value="" disabled>Select Owner...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Summarize project scope, goals, or milestones..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white text-slate-900 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? '💾 Saving...' : '💾 Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Reviews & Deadlines Modal */}
      {reviewsModalOpen && selectedProjectForReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-7 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReviewsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-extrabold text-xs">
                    {selectedProjectForReviews.key}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Project Reviews & Deadlines
                  </h2>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Track reviews, milestone audits, and review completion deadlines for <span className="font-semibold text-slate-800">{selectedProjectForReviews.name}</span>
                </p>
              </div>

              {isManagerOrAdmin && !showReviewForm && (
                <button
                  onClick={handleOpenNewReviewForm}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
                >
                  <FiPlus className="w-4 h-4" />
                  Schedule Review
                </button>
              )}
            </div>

            {reviewsError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium">
                {reviewsError}
              </div>
            )}

            {/* Add / Edit Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewFormSubmit} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    {editingReview ? '✏️ Edit Review & Deadline' : '➕ Schedule New Project Review'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Review Title / Milestone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sprint 1 Code Review & Demo"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-slate-900 text-sm transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Review Deadline (Target Date) 📅
                    </label>
                    <input
                      type="date"
                      value={reviewDeadline}
                      onChange={(e) => setReviewDeadline(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-slate-900 text-sm transition font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Reviewer (Manager / Lead)
                    </label>
                    <select
                      value={reviewReviewerId}
                      onChange={(e) => setReviewReviewerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-slate-900 text-sm transition font-medium"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Review Status
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-slate-900 text-sm transition font-medium"
                    >
                      <option value="pending">⏳ Pending Review</option>
                      <option value="in_progress">⚡ In Progress</option>
                      <option value="approved">✅ Approved</option>
                      <option value="changes_requested">⚠️ Changes Requested</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Feedback / Review Notes
                  </label>
                  <textarea
                    placeholder="Enter review findings, quality notes, or required adjustments..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-slate-900 text-sm transition"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {reviewSubmitting ? '💾 Saving Review...' : '💾 Save Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Loading reviews for this project...
              </div>
            ) : projectReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
                <h4 className="text-base font-bold text-slate-800">No Reviews Scheduled</h4>
                <p className="text-slate-500 text-xs max-w-sm">
                  {isManagerOrAdmin 
                    ? 'Schedule reviews and milestone audits with deadlines for developers working on this project.' 
                    : 'There are currently no reviews scheduled for this project.'}
                </p>
                {isManagerOrAdmin && !showReviewForm && (
                  <button
                    onClick={handleOpenNewReviewForm}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Schedule First Review
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {projectReviews.map((rev) => {
                  const deadlineInfo = formatReviewDeadline(rev.deadline, rev.status);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{rev.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(rev.status)}`}>
                              {rev.status.replace('_', ' ')}
                            </span>
                            {deadlineInfo && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] ${deadlineInfo.badgeClass}`}>
                                {deadlineInfo.text}
                              </span>
                            )}
                          </div>
                        </div>

                        {isManagerOrAdmin && (
                          <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button
                              onClick={() => handleOpenEditReviewForm(rev)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Review"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Review"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {rev.feedback && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-700 block mb-0.5">Review Notes & Feedback:</span>
                          {rev.feedback}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                            {rev.reviewer ? getInitials(rev.reviewer.full_name) : '?'}
                          </div>
                          <span className="font-semibold text-slate-700">
                            Reviewer: {rev.reviewer ? rev.reviewer.full_name : 'Unassigned'}
                          </span>
                        </div>

                        {/* Quick Status Toggles */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Quick Status:</span>
                          <button
                            onClick={() => handleQuickReviewStatus(rev, 'in_progress')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              rev.status === 'in_progress' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleQuickReviewStatus(rev, 'approved')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              rev.status === 'approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            Approved
                          </button>
                          <button
                            onClick={() => handleQuickReviewStatus(rev, 'changes_requested')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              rev.status === 'changes_requested' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            Changes Req.
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
