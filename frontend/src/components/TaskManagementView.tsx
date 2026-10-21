import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  ArrowUpDown,
  FileCheck
} from 'lucide-react';
import { TaskItem } from '../types';
import { api } from '../services/api';

interface TaskManagementViewProps {
  tasks: TaskItem[];
  planId?: string | null;
  onRefreshTasks: () => void;
  onOpenEvidenceModal: (task: TaskItem) => void;
  onRequestConfirmation: (task: TaskItem) => void;
  theme?: 'dark' | 'light';
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  planId,
  onRefreshTasks,
  onOpenEvidenceModal,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'status' | 'updated'>('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Actions Dropdown
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [viewTask, setViewTask] = useState<TaskItem | null>(null);
  const [deleteTaskCandidate, setDeleteTaskCandidate] = useState<TaskItem | null>(null);

  // Form states for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Perimeter Security');
  const [formPriority, setFormPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [formStatus, setFormStatus] = useState<string>('PENDING');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Perimeter Security');
    setFormPriority('HIGH');
    setFormStatus('PENDING');
    setFormNotes('');
    setFormError(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal with prefilled values
  const handleOpenEdit = (task: TaskItem) => {
    setOpenActionId(null);
    setEditTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormNotes(task.completion_notes || '');
    setFormError(null);
  };

  // Submit Create Task
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTask({
        plan_id: planId || (tasks.length > 0 ? tasks[0].plan_id : 'default-plan'),
        title: formTitle.trim(),
        description: formDescription.trim() || 'Custom home safeguard task.',
        category: formCategory,
        priority: formPriority,
        status: formStatus
      });
      setShowCreateModal(false);
      onRefreshTasks();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Task
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    if (!formTitle.trim()) {
      setFormError('Task title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateTask(editTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        completion_notes: formNotes
      });
      setEditTask(null);
      onRefreshTasks();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and execute delete task
  const handleConfirmDelete = async () => {
    if (!deleteTaskCandidate) return;
    try {
      await api.deleteTask(deleteTaskCandidate.id);
      setDeleteTaskCandidate(null);
      onRefreshTasks();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Filter and Sort Logic
  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ATTENTION' && (t.status === 'ACTION_REQUIRED' || t.status === 'UNABLE_TO_VERIFY')) ||
      t.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
            Low
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
            {priority}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2FE5D0]/15 text-[#2FE5D0] border border-[#2FE5D0]/30">
            <ShieldCheck className="w-3 h-3 mr-0.5" />
            <span>Verified</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            <span>Completed</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-0.5" />
            <span>Pending</span>
          </span>
        );
      case 'ACTION_REQUIRED':
      case 'UNABLE_TO_VERIFY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 mr-0.5" />
            <span>Attention</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Top Filter and Search Bar matching Reference Image 2 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search home preparation tasks..."
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs border focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#08213D] border-[#163E63] text-slate-100 placeholder-slate-500 focus:border-[#2FE5D0]'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
            }`}
          />
        </div>

        {/* Filter Dropdowns and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none rounded-xl pl-3 pr-8 py-2.5 text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-[#B7CBE5]'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="ALL">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="ATTENTION">Attention</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`appearance-none rounded-xl pl-3 pr-8 py-2.5 text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-[#B7CBE5]'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`appearance-none rounded-xl pl-3 pr-8 py-2.5 text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-[#B7CBE5]'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="updated">Sort by Updated</option>
              <option value="title">Sort by Name</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add New Task Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] font-bold text-xs shadow-md shadow-[#2FE5D0]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#041226]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks Table Card */}
      <div
        className={`rounded-2xl border shadow-xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#071C34] border-[#163E63]'
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? 'border-[#163E63] bg-[#06172B]/80 text-[#B7CBE5]'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <th className="py-3.5 px-6">Task</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? 'divide-[#163E63]/60' : 'divide-slate-100'
              }`}
            >
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No tasks match your filters</p>
                    <p className="text-xs mt-1 text-slate-500">
                      Try clearing filters or search terms to see all tasks.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isDark ? 'hover:bg-[#08213D]/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Task Title & Category */}
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.status === 'VERIFIED'
                              ? 'bg-[#2FE5D0]/15 text-[#2FE5D0] border border-[#2FE5D0]/30'
                              : item.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-6">{getPriorityBadge(item.priority)}</td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>

                    {/* Last Updated */}
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                      {new Date(item.updated_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}{' '}
                      {new Date(item.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-slate-400 hover:text-white hover:bg-[#08213D]'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openActionId === item.id && (
                        <div
                          className={`absolute right-6 mt-1 w-52 rounded-xl border shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 text-left ${
                            isDark
                              ? 'bg-[#071C34] border-[#163E63]'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              setViewTask(item);
                            }}
                            className={`w-full flex items-center space-x-2 px-3.5 py-2 text-xs transition-colors ${
                              isDark ? 'text-slate-300 hover:bg-[#08213D]' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-[#25C8F0]" />
                            <span>View Task Details</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className={`w-full flex items-center space-x-2 px-3.5 py-2 text-xs transition-colors ${
                              isDark ? 'text-slate-300 hover:bg-[#08213D]' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Task</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onOpenEvidenceModal(item);
                            }}
                            className={`w-full flex items-center space-x-2 px-3.5 py-2 text-xs transition-colors ${
                              isDark ? 'text-slate-300 hover:bg-[#08213D]' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#2FE5D0]" />
                            <span>Record Verification Evidence</span>
                          </button>

                          <button
                            onClick={async () => {
                              setOpenActionId(null);
                              try {
                                await api.updateTaskStatus(
                                  item.id,
                                  'COMPLETED',
                                  'manual_user_attestation',
                                  'Marked completed by homeowner'
                                );
                                onRefreshTasks();
                              } catch (err: any) {
                                alert(err.message || 'Status update failed.');
                              }
                            }}
                            className={`w-full flex items-center space-x-2 px-3.5 py-2 text-xs transition-colors ${
                              isDark ? 'text-slate-300 hover:bg-[#08213D]' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Mark as Completed</span>
                          </button>

                          <div className={`my-1 border-t ${isDark ? 'border-[#163E63]' : 'border-slate-100'}`} />

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              setDeleteTaskCandidate(item);
                            }}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Task</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination */}
        <div
          className={`py-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
            isDark
              ? 'border-[#163E63] bg-[#06172B]/50 text-slate-400'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} tasks
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-slate-300 hover:bg-[#0b2b4f]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-[#2FE5D0] text-[#041226] font-extrabold shadow-sm'
                    : isDark
                    ? 'bg-[#08213D] border border-[#163E63] text-slate-300 hover:bg-[#0b2b4f]'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-slate-300 hover:bg-[#0b2b4f]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add New Safety Task</h3>
            <p className="text-xs text-slate-400 mb-6">
              Create an additional checkpoint for your home preparation schedule.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="E.g. Check kitchen gas shutoff valve"
                  className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2FE5D0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Specific safeguarding steps or inspection points..."
                  className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2FE5D0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  >
                    <option value="Perimeter Security">Perimeter Security</option>
                    <option value="Windows & Latches">Windows & Latches</option>
                    <option value="Fire & Electrical">Fire & Electrical</option>
                    <option value="Water & Plumbing">Water & Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Household">Household</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e: any) => setFormPriority(e.target.value)}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#163E63]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#08213D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setEditTask(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Edit Safety Task</h3>
            <p className="text-xs text-slate-400 mb-6">
              Update task title, priority, status, or completion notes.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e: any) => setFormPriority(e.target.value)}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="ACTION_REQUIRED">Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Completion Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add verification or inspection notes..."
                  className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2FE5D0]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#163E63]">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#08213D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TASK DETAILS MODAL */}
      {viewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setViewTask(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-2">
              {getStatusBadge(viewTask.status)}
              {getPriorityBadge(viewTask.priority)}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{viewTask.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {viewTask.description}
            </p>

            <div className="p-4 rounded-xl bg-[#08213D] border border-[#163E63] space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white">{viewTask.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Evidence Count:</span>
                <span className="font-semibold text-[#2FE5D0]">{viewTask.evidence_count} record(s)</span>
              </div>
              {viewTask.completion_source && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Attestation Source:</span>
                  <span className="font-semibold text-white">{viewTask.completion_source}</span>
                </div>
              )}
              {viewTask.completion_notes && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Notes:</span>
                  <span className="font-semibold text-white">{viewTask.completion_notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  const taskToEdit = viewTask;
                  setViewTask(null);
                  handleOpenEdit(taskToEdit);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
              >
                Edit Details
              </button>
              <button
                onClick={() => {
                  const taskForEv = viewTask;
                  setViewTask(null);
                  onOpenEvidenceModal(taskForEv);
                }}
                className="px-4 py-2 rounded-xl bg-[#2FE5D0] text-[#041226] font-bold text-xs hover:bg-[#25C8F0]"
              >
                Manage Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTaskCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-white mb-1">Delete Safety Task?</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteTaskCandidate.title}"</span>? This will remove the task, historical events, and all verification records from the database.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteTaskCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
