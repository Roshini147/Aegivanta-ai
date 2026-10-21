import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Plus,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { SafetyPlan, TaskItem } from '../types';
import { api } from '../services/api';

interface PlanModalProps {
  plan: SafetyPlan | null;
  tasks: TaskItem[];
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated: (updatedPlan: SafetyPlan) => void;
  onRefreshTasks: () => void;
  theme?: 'dark' | 'light';
}

export const PlanModal: React.FC<PlanModalProps> = ({
  plan,
  tasks,
  isOpen,
  onClose,
  onPlanUpdated,
  onRefreshTasks,
  theme = 'dark'
}) => {
  if (!isOpen || !plan) return null;

  const isDark = theme === 'dark';

  // Form states
  const [title, setTitle] = useState(plan.title);
  const [userRequest, setUserRequest] = useState(plan.user_request);
  const [durationDays, setDurationDays] = useState(plan.duration_days);
  const [destination, setDestination] = useState('Chennai');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New task inline addition
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setUserRequest(plan.user_request);
      setDurationDays(plan.duration_days);
      try {
        const parsed = JSON.parse(plan.household_context || '{}');
        if (parsed.destination) setDestination(parsed.destination);
      } catch {
        setDestination('Chennai');
      }
      setStatusMessage(null);
    }
  }, [plan]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Plan title cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated = await api.updatePlan(plan.id, {
        title: title.trim(),
        duration_days: Number(durationDays) || 14,
        user_request: userRequest.trim(),
        household_context: JSON.stringify({
          destination: destination.trim(),
          duration: `${durationDays} days`
        })
      });
      setStatusMessage({ type: 'success', text: 'Plan configuration saved successfully!' });
      onPlanUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save plan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      await api.createTask({
        plan_id: plan.id,
        title: newTaskTitle.trim(),
        description: 'Plan checklist item.',
        category: 'Perimeter Security',
        priority: 'HIGH',
        status: 'PENDING'
      });
      setNewTaskTitle('');
      onRefreshTasks();
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      onRefreshTasks();
    } catch (err: any) {
      alert(`Error removing task: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#071C34] border-[#163E63] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b flex items-center justify-between ${
            isDark ? 'border-[#163E63] bg-[#06172B]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2FE5D0]/15 border border-[#2FE5D0]/30 flex items-center justify-center text-[#2FE5D0]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Plan Configuration & Setup</h3>
              <p className="text-xs text-slate-400">View and update home departure plan details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form id="plan-form" onSubmit={handleSave} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
              />
            </div>

            {/* Destination & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Destination / Travel Purpose
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                  Duration (Days)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
                  />
                </div>
              </div>
            </div>

            {/* Description / User Request */}
            <div>
              <label className="block text-xs font-semibold text-[#B7CBE5] mb-1">
                Household Scenario & Preparation Instructions
              </label>
              <textarea
                rows={3}
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Details about your travel, pets, plants, or special instructions..."
                className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#2FE5D0]"
              />
            </div>
          </form>

          {/* Included Checklist Tasks */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B7CBE5]">
                Plan Checklist Tasks ({tasks.length})
              </h4>
            </div>

            {/* Quick Add Task */}
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                placeholder="Add checklist item to this plan..."
                className="flex-1 bg-[#08213D] border border-[#163E63] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2FE5D0]"
              />
              <button
                type="button"
                onClick={handleAddTask}
                disabled={isAddingTask || !newTaskTitle.trim()}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Tasks list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#08213D] border border-[#163E63] text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2FE5D0] flex-shrink-0" />
                    <span className="truncate text-slate-200">{t.title}</span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#071C34]">
                      {t.priority}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-2"
                    title="Remove task from plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-5 border-t flex items-center justify-between ${
            isDark ? 'border-[#163E63] bg-[#06172B]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500">
            Changes persist to local SQLite database
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="plan-form"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] text-xs font-bold shadow-md shadow-[#2FE5D0]/20 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
