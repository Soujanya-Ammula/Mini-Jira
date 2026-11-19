import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiX, 
  FiArrowLeft, 
  FiArrowRight, 
  FiMessageSquare,
  FiPaperclip,
  FiMoreHorizontal,
  FiLayers,
  FiCheckCircle
} from 'react-icons/fi';
import { tasksService, projectsService, usersService, authService } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('board'); // overview, board, timeline

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formStatus, setFormStatus] = useState('todo');
  const [formDeadline, setFormDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    setLoading(true);
    setError('');
    try {
      const me = await authService.getMe();
      setCurrentUser(me);

      const projs = await projectsService.getAll();
      setProjects(projs);

      const roster = await usersService.getAll().catch(() => []);
      setUsers(roster);

      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id.toString());
        await fetchTasks(projs[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initialize tasks board');
      setLoading(false);
    }
  };

  const fetchTasks = async (projId) => {
    try {
      const data = await tasksService.getAll(projId);
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProjectId(id);
    setLoading(true);
    fetchTasks(id);
  };

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const handleOpenAddModal = (defaultStatus = 'todo') => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormProjectId(selectedProjectId);
    setFormAssigneeId('');
    setFormPriority('medium');
    setFormStatus(defaultStatus);
    setFormDeadline('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormProjectId(task.project_id.toString());
    setFormAssigneeId(task.assignee_id ? task.assignee_id.toString() : '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        project_id: parseInt(formProjectId),
        assignee_id: formAssigneeId ? parseInt(formAssigneeId) : null,
        priority: formPriority,
        status: formStatus,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
      };

      if (editingTask) {
        await tasksService.update(editingTask.id, payload);
      } else {
        await tasksService.create(payload);
      }

      setModalOpen(false);
      fetchTasks(selectedProjectId);
    } catch (err) {
      setFormError(err.message || 'Failed to save task');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMoveStatus = async (task, newStatus) => {
    try {
      await tasksService.update(task.id, { status: newStatus });
      fetchTasks(selectedProjectId);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const selectedProject = projects.find((p) => p.id === parseInt(selectedProjectId));

  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0] ? parts[0][0].toUpperCase() : 'U';
  };

  return (
    <div className="space-y-6">
      {/* Workspace Top Banner / Breadcrumb (Matching 1st Curoky Image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {selectedProject ? selectedProject.name : 'Studio Space'}
            </h1>
            <div className="flex items-center -space-x-2">
              {users.slice(0, 4).map((u, i) => (
                <div key={u.id} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-xs" title={u.full_name}>
                  {getInitials(u.full_name)}
                </div>
              ))}
              <span className="text-xs text-slate-500 font-semibold pl-3">
                {users.length} members
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track agile tickets, sprint cycles, and cross-team dependencies.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleOpenAddModal('todo')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation (Matching 1st Image: Overview, Board, Timeline) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 pb-1 transition cursor-pointer ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'hover:text-slate-800'}`}
          >
            <FiLayers className="w-3.5 h-3.5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 pb-1 transition cursor-pointer ${activeTab === 'board' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'hover:text-slate-800'}`}
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            Board
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 pb-1 transition cursor-pointer ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'hover:text-slate-800'}`}
          >
            <FiClock className="w-3.5 h-3.5" />
            Timeline
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Sprint Cycle: <span className="font-bold text-slate-700">Active</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 3-Column Kanban Board (Matching Pattern of 1st Image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* TODO COLUMN */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-900">Todo</h3>
              <span className="text-xs font-semibold text-slate-400">
                ({getColumnTasks('todo').length})
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button onClick={() => handleOpenAddModal('todo')} className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiPlus />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiMoreHorizontal />
              </button>
            </div>
          </div>

          <div className="space-y-3.5 min-h-[400px]">
            {getColumnTasks('todo').map((t) => (
              <TaskCardItem 
                key={t.id} 
                task={t} 
                projectKey={selectedProject?.key} 
                onEdit={handleOpenEditModal}
                onMoveRight={() => handleMoveStatus(t, 'in_progress')}
                getInitials={getInitials}
              />
            ))}
          </div>

          <button
            onClick={() => handleOpenAddModal('todo')}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* ON PROGRESS COLUMN */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h3 className="text-sm font-bold text-slate-900">On Progress</h3>
              <span className="text-xs font-semibold text-slate-400">
                ({getColumnTasks('in_progress').length})
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button onClick={() => handleOpenAddModal('in_progress')} className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiPlus />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiMoreHorizontal />
              </button>
            </div>
          </div>

          <div className="space-y-3.5 min-h-[400px]">
            {getColumnTasks('in_progress').map((t) => (
              <TaskCardItem 
                key={t.id} 
                task={t} 
                projectKey={selectedProject?.key} 
                onEdit={handleOpenEditModal}
                onMoveLeft={() => handleMoveStatus(t, 'todo')}
                onMoveRight={() => handleMoveStatus(t, 'done')}
                getInitials={getInitials}
              />
            ))}
          </div>

          <button
            onClick={() => handleOpenAddModal('in_progress')}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* COMPLETED COLUMN */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-slate-900">Completed</h3>
              <span className="text-xs font-semibold text-slate-400">
                ({getColumnTasks('done').length})
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button onClick={() => handleOpenAddModal('done')} className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiPlus />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded-md transition">
                <FiMoreHorizontal />
              </button>
            </div>
          </div>

          <div className="space-y-3.5 min-h-[400px]">
            {getColumnTasks('done').map((t) => (
              <TaskCardItem 
                key={t.id} 
                task={t} 
                projectKey={selectedProject?.key} 
                onEdit={handleOpenEditModal}
                onMoveLeft={() => handleMoveStatus(t, 'in_progress')}
                getInitials={getInitials}
              />
            ))}
          </div>

          <button
            onClick={() => handleOpenAddModal('done')}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-7 relative space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Configure task title, deadline, priority, and assignees.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-based Task Prioritization"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Summarize requirements and acceptance criteria..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Priority Pattern
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Status Column
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">On Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Assignee
                  </label>
                  <select
                    value={formAssigneeId}
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white"
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Card Component matching 1st Image (High / Medium / Low badges, progress bar, avatars, stats)
function TaskCardItem({ task, projectKey, onEdit, onMoveLeft, onMoveRight, getInitials }) {
  // Completion percentage based on status
  const completionPercentage = task.status === 'done' ? 100 : task.status === 'in_progress' ? 65 : 0;

  // Pattern Priority styling matching 1st image
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
  };

  return (
    <div 
      onClick={() => onEdit(task)}
      className="bg-white border border-slate-200/80 hover:border-blue-400 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer transition-all space-y-3 group"
    >
      {/* Priority Badge */}
      <div className="flex justify-between items-center">
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold capitalize border ${getPriorityStyle(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {projectKey}-{task.id}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
          {task.title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Progress Bar Pattern matching 1st Image */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
          <span className="capitalize">{task.status.replace('_', ' ')}</span>
          <span className="text-slate-700">{completionPercentage}% completed</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              task.status === 'done' 
                ? 'bg-emerald-500' 
                : task.status === 'in_progress' 
                  ? 'bg-blue-600' 
                  : 'bg-slate-300'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom Row: Assignee Avatars, Time, Attachments & Comments */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-[9px]">
            {task.assignee ? getInitials(task.assignee.full_name) : '?'}
          </div>
          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[80px]">
            {task.assignee ? task.assignee.full_name.split(' ')[0] : 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3 text-slate-400" />
            <span>4 hrs</span>
          </span>
          <span className="flex items-center gap-1">
            <FiMessageSquare className="w-3 h-3 text-slate-400" />
            <span>2</span>
          </span>
        </div>

        {/* Move status buttons */}
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          {onMoveLeft && (
            <button onClick={onMoveLeft} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800" title="Move Back">
              <FiArrowLeft className="w-3 h-3" />
            </button>
          )}
          {onMoveRight && (
            <button onClick={onMoveRight} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800" title="Move Forward">
              <FiArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
