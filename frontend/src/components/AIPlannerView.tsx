import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Send,
  Edit3,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { SafetyPlan, TaskItem } from '../types';
import { api } from '../services/api';

interface AIPlannerViewProps {
  onPlanCreated: (plan: SafetyPlan) => void;
  onNavigateTab: (tab: string) => void;
  currentPlan?: SafetyPlan | null;
  tasks?: TaskItem[];
  onOpenEditPlanModal?: () => void;
  theme?: 'dark' | 'light';
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  onPlanCreated,
  onNavigateTab,
  currentPlan,
  tasks = [],
  onOpenEditPlanModal,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const suggestedPrompts = [
    "I'm going on a vacation for 2 weeks",
    "Just a weekend trip",
    "I'm moving to a new home",
    "Help me prepare for severe weather",
    "Help me review my home safety tasks"
  ];

  const handleGenerate = async (queryText?: string) => {
    const text = queryText || prompt;
    if (!text.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      // Determine destination or trip label from prompt
      let dest = 'Chennai';
      if (text.toLowerCase().includes('weekend')) dest = 'Weekend Getaway';
      else if (text.toLowerCase().includes('weather')) dest = 'Storm Preparedness';
      else if (text.toLowerCase().includes('moving')) dest = 'New Residence Transition';
      else if (text.toLowerCase().includes('vacation')) dest = 'Annual Vacation';

      const plan = await api.createPlan({
        user_query: text,
        destination: dest,
        departure_date: '2026-10-25',
        return_date: '2026-11-08'
      });
      onPlanCreated(plan);
    } catch (err: any) {
      console.error('Failed to create plan:', err);
      setErrorMessage(err.message || 'AI planning service encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Compute breakdown from current tasks
  const highTasks = tasks.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;
  const mediumTasks = tasks.filter(t => t.priority === 'MEDIUM').length;
  const lowTasks = tasks.filter(t => t.priority === 'LOW').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto select-none font-sans">
      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Box Card */}
      <div
        className={`rounded-2xl p-5 shadow-xl border ${
          isDark
            ? 'bg-[#071C34] border-[#163E63] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}
      >
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#2FE5D0]">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder='Example: "I&apos;m leaving home for two weeks. Help me prepare my home safely."'
            className={`w-full rounded-xl pl-12 pr-14 py-3.5 text-sm focus:outline-none transition-all shadow-inner border ${
              isDark
                ? 'bg-[#08213D] border-[#163E63] text-slate-100 placeholder-slate-500 focus:border-[#2FE5D0]'
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
            }`}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="absolute right-2.5 w-9 h-9 rounded-lg bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] flex items-center justify-center font-bold transition-all shadow-md shadow-[#2FE5D0]/20 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#041226]" />
            ) : (
              <Send className="w-4 h-4 text-[#041226]" />
            )}
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Suggested prompts:</span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleGenerate(p);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-[#08213D] hover:bg-[#0c2e54] border-[#163E63] hover:border-[#2FE5D0]/40 text-[#B7CBE5]'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Plan Section matching Reference Image 2 */}
      <div
        className={`rounded-2xl p-6 shadow-xl space-y-6 border ${
          isDark
            ? 'bg-[#071C34] border-[#163E63] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}
      >
        {/* Header of Generated Plan */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
            isDark ? 'border-[#163E63]' : 'border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AI Generated
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-1 text-[#F5F8FF]">
              {currentPlan?.title || 'Trip to Chennai'}
            </h3>
            <p className="text-xs text-[#B7CBE5] font-medium">
              {currentPlan?.duration_days || 14} days &bull; Oct 25, 2026 - Nov 8, 2026
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenEditPlanModal) {
                onOpenEditPlanModal();
              } else {
                onNavigateTab('tasks');
              }
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm cursor-pointer ${
              isDark
                ? 'bg-[#08213D] hover:bg-[#0c2e54] border-[#163E63] text-[#2FE5D0]'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#2FE5D0]" />
            <span>Review & Edit</span>
          </button>
        </div>

        {/* Content: Suggested Tasks (Left) + Plan Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suggested Tasks List (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Suggested Tasks ({tasks.length})
            </h4>
            <div className="space-y-2.5">
              {tasks.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-[#08213D] border-[#163E63]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Circle className="w-4 h-4 text-[#2FE5D0] flex-shrink-0" />
                    <span className="text-xs font-semibold truncate text-[#F5F8FF]">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'HIGH' || item.priority === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : item.priority === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-bold text-[#2FE5D0] hover:underline flex items-center space-x-1"
              >
                <span>View all {tasks.length} tasks in Task Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Plan Summary Card (span 1) */}
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Plan Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This plan covers key safety areas based on your trip details. You can edit the tasks, adjust priorities, or add additional items.
              </p>
            </div>

            <div
              className={`space-y-3 pt-3 border-t text-xs ${
                isDark ? 'border-[#163E63]' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-slate-300">High Priority</span>
                </div>
                <span className="font-bold text-white">{highTasks || 2}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Medium Priority</span>
                </div>
                <span className="font-bold text-white">{mediumTasks || 3}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="text-slate-300">Low Priority</span>
                </div>
                <span className="font-bold text-white">{lowTasks || 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
