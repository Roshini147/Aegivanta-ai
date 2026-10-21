import React from 'react';
import { ShieldCheck, Cpu, Terminal, FileText, CheckSquare, LayoutDashboard, Sparkles, Bell } from 'lucide-react';
import { SafetyPlan } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  plans: SafetyPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  pendingConfirmationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  plans,
  selectedPlanId,
  onSelectPlan,
  pendingConfirmationsCount
}) => {
  return (
    <header className="bg-[#090d16] border-b border-[#24324f] sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">Aegivanta AI</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Alexa+ Track
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligence That Acts. Safety You Can Verify.</p>
            </div>
          </div>

          {/* Plan Selector */}
          <div className="flex items-center space-x-3">
            {plans.length > 0 && (
              <div className="flex items-center space-x-2 bg-[#141e33] border border-[#24324f] rounded-lg px-3 py-1.5">
                <span className="text-xs text-slate-400 font-medium">Plan:</span>
                <select
                  value={selectedPlanId || ''}
                  onChange={(e) => onSelectPlan(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0f172a] text-slate-200">
                      {p.title} ({p.duration_days}d)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* MCP Protocol Badge */}
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-3 py-1.5 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono">MCP: Streamable HTTP (2025-11-25)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 border-t border-[#1c2942] py-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'planner'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Planning Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Task Management</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Center</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'report'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Safety Report</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'mcp'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141e33]'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>MCP Dev Panel</span>
          </button>

          {pendingConfirmationsCount > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingConfirmationsCount} Action Required</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
