import React from 'react';
import {
  ListChecks,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Home,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SafetyPlan, DashboardMetrics, TaskItem } from '../types';

interface DashboardViewProps {
  plan: SafetyPlan | null;
  metrics: DashboardMetrics | null;
  tasks: TaskItem[];
  onNavigateTab: (tab: string) => void;
  onSimulateTelemetry: () => void;
  isSimulating: boolean;
  onOpenPlanModal?: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plan,
  tasks,
  onNavigateTab,
  onSimulateTelemetry,
  isSimulating,
  onOpenPlanModal,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // DYNAMIC STATISTICS CALCULATION - 100% computed from current task data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
  const verifiedTasks = tasks.filter(t => t.status === 'VERIFIED').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const attentionTasks = tasks.filter(t => t.status === 'ACTION_REQUIRED' || t.status === 'UNABLE_TO_VERIFY').length;

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Circular progress calculation (radius = 42, circumference ≈ 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Top Row: Active Plan + Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Plan Card (span 2) */}
        <div
          className={`lg:col-span-2 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden border ${
            isDark
              ? 'bg-[#071C34] border-[#163E63] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2FE5D0] mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2FE5D0] animate-pulse" />
              <span>Active Plan</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              {/* House Thumbnail */}
              <div className="relative w-36 h-28 sm:w-44 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-[#163E63] shadow-lg group">
                <img
                  src="/home_dusk.jpg"
                  alt="Protected Home"
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041226]/80 via-transparent to-transparent" />
              </div>

              {/* Plan Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-xl font-bold tracking-tight">
                    {plan?.title || 'Trip to Chennai'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Active
                  </span>
                </div>

                <p className={`text-xs font-medium ${isDark ? 'text-[#B7CBE5]' : 'text-slate-500'}`}>
                  Oct 25, 2026 - Nov 8, 2026 ({plan?.duration_days || 14} days)
                </p>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {plan?.user_request || 'Preparing your home for a safe and secure trip.'}
                </p>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (onOpenPlanModal) {
                        onOpenPlanModal();
                      } else {
                        onNavigateTab('planner');
                      }
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] font-bold text-xs shadow-md shadow-[#2FE5D0]/20 transition-all cursor-pointer"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateTab('tasks')}
                    className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isDark
                        ? 'border-[#163E63] text-[#B7CBE5] hover:bg-[#08213D] hover:text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Manage Tasks ({totalTasks})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Card (span 1) */}
        <div
          className={`rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center text-center border ${
            isDark
              ? 'bg-[#071C34] border-[#163E63] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="w-full text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overall Progress
          </div>

          {/* Dynamic Circular Progress Gauge */}
          <div className="my-auto py-2 flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={isDark ? 'text-[#08213D]' : 'text-slate-100'}
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Dynamic Progress Fill */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-[#2FE5D0] transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{percentage}%</span>
              </div>
            </div>

            <p className={`text-xs mt-2 font-medium ${isDark ? 'text-[#B7CBE5]' : 'text-slate-500'}`}>
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Five Metric Stat Cards with 100% Dynamic Values */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border cursor-pointer hover:border-[#2FE5D0]/50 transition-all ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#25C8F0] flex-shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Tasks</div>
            <div className="text-xl font-black leading-tight text-[#F5F8FF]">{totalTasks}</div>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border cursor-pointer hover:border-emerald-500/50 transition-all ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Completed</div>
            <div className="text-xl font-black leading-tight text-emerald-400">{completedTasks}</div>
          </div>
        </div>

        {/* Verified */}
        <div
          onClick={() => onNavigateTab('verification')}
          className={`rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border cursor-pointer hover:border-[#2FE5D0]/50 transition-all ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#2FE5D0]/15 border border-[#2FE5D0]/30 flex items-center justify-center text-[#2FE5D0] flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Verified</div>
            <div className="text-xl font-black leading-tight text-[#2FE5D0]">{verifiedTasks}</div>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border cursor-pointer hover:border-amber-500/50 transition-all ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Pending</div>
            <div className="text-xl font-black leading-tight text-amber-400">{pendingTasks}</div>
          </div>
        </div>

        {/* Attention */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border cursor-pointer hover:border-rose-500/50 transition-all col-span-2 sm:col-span-1 ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Attention</div>
            <div className="text-xl font-black leading-tight text-rose-400">{attentionTasks}</div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Dynamic Home Safety Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Card */}
        <div
          className={`lg:col-span-2 rounded-2xl p-6 shadow-xl border ${
            isDark ? 'bg-[#071C34] border-[#163E63]' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Activity
            </div>
            <button
              onClick={() => onNavigateTab('agent-activity')}
              className="text-xs text-[#2FE5D0] hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View Agent Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {tasks.slice(0, 3).map((t, idx) => (
              <div
                key={t.id}
                className={`flex items-center justify-between py-2 border-b ${
                  isDark ? 'border-[#163E63]/60' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.status === 'VERIFIED'
                        ? 'bg-[#2FE5D0]'
                        : t.status === 'COMPLETED'
                        ? 'bg-emerald-400'
                        : t.status === 'ACTION_REQUIRED'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className={`text-xs font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {t.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#08213D] border border-[#163E63] text-slate-400 font-semibold">
                    {t.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap ml-3">
                  {idx === 0 ? 'Just now' : `${idx * 2}h ago`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Home Safety Status Card */}
        <div
          className={`rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden border ${
            attentionTasks > 0
              ? 'bg-[#1c131d] border-rose-500/40 text-rose-300'
              : percentage === 100
              ? 'bg-[#0a2323] border-emerald-500/40 text-emerald-300'
              : 'bg-[#08213D] border-[#163E63] text-slate-200'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg border bg-[#071C34] border-[#163E63]">
            {attentionTasks > 0 ? (
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            ) : percentage === 100 ? (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            ) : (
              <Home className="w-7 h-7 text-[#2FE5D0]" />
            )}
          </div>

          <h4 className="text-base font-bold tracking-tight">
            {attentionTasks > 0
              ? `${attentionTasks} Tasks Need Attention!`
              : percentage === 100
              ? 'Home Fully Protected!'
              : 'Your home is more prepared!'}
          </h4>

          <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            {attentionTasks > 0
              ? 'Review critical doors, windows, and alarm sensors flagged for verification.'
              : percentage === 100
              ? 'All 12 safety checklists and telemetry sensors confirmed active.'
              : `Completed ${completedTasks} of ${totalTasks} tasks. Keep going to finalize departure safeguards.`}
          </p>

          <button
            onClick={() => onNavigateTab(attentionTasks > 0 ? 'tasks' : 'verification')}
            className={`mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              attentionTasks > 0
                ? 'bg-rose-500 text-white border-rose-400 hover:bg-rose-600'
                : 'bg-[#2FE5D0]/15 text-[#2FE5D0] border-[#2FE5D0]/40 hover:bg-[#2FE5D0]/25'
            }`}
          >
            {attentionTasks > 0 ? 'Review Flagged Tasks' : 'Check Verification Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
};
