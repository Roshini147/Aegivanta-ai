import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  HelpCircle,
  FileText,
  Printer,
  Sparkles,
  Home,
  Check
} from 'lucide-react';
import { SafetyPlan, TaskItem } from '../types';

interface ReportViewProps {
  planId: string | null;
  plan?: SafetyPlan | null;
  tasks?: TaskItem[];
  theme?: 'dark' | 'light';
}

export const ReportView: React.FC<ReportViewProps> = ({
  planId,
  plan,
  tasks = [],
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic Metrics derived directly from active tasks
  const totalTasks = tasks.length;
  const verifiedCount = tasks.filter((t) => t.status === 'VERIFIED').length;
  const completedUnverifiedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const completedTotal = verifiedCount + completedUnverifiedCount;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const attentionCount = tasks.filter(
    (t) => t.status === 'ACTION_REQUIRED' || t.status === 'UNABLE_TO_VERIFY'
  ).length;

  const progressPercent = totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;

  // Key dynamic recommendations
  const dynamicRecommendations: string[] = [];
  const attentionItems = tasks.filter(
    (t) => t.status === 'ACTION_REQUIRED' || t.status === 'UNABLE_TO_VERIFY'
  );
  if (attentionItems.length > 0) {
    dynamicRecommendations.push(
      `Inspect and verify flagged items: ${attentionItems.map((t) => t.title).slice(0, 2).join(', ')}.`
    );
  }
  if (pendingCount > 0) {
    dynamicRecommendations.push(
      `Complete remaining ${pendingCount} pending task(s) prior to departure time.`
    );
  }
  if (tasks.some((t) => t.category === 'Fire & Electrical' && t.status !== 'VERIFIED')) {
    dynamicRecommendations.push('Confirm appliance safety and smoke alarm telemetry before leaving.');
  }
  if (dynamicRecommendations.length === 0) {
    dynamicRecommendations.push(
      'All safeguards are verified. Engage away mode on your primary smart lock and depart safely!'
    );
  }

  const handleDownloadReport = () => {
    // Generate actual printable and downloadable report
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    window.print();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none font-sans print:p-0">
      <div
        className={`rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 border ${
          isDark
            ? 'bg-[#071C34] border-[#163E63] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}
      >
        {/* Top Header Row with Download Button */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4 ${
            isDark ? 'border-[#163E63]' : 'border-slate-200'
          }`}
        >
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F5F8FF]">
              {plan?.title || 'Trip to Chennai'}
            </h3>
            <p className="text-xs text-[#B7CBE5] font-medium mt-1">
              Oct 25, 2026 - Nov 8, 2026 ({plan?.duration_days || 14} days)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {downloadSuccess && (
              <span className="text-xs text-[#2FE5D0] flex items-center space-x-1 font-semibold animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Export Generated</span>
              </span>
            )}
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] text-[#041226] font-bold text-xs shadow-lg shadow-[#2FE5D0]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Completion Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completion Overview
            </h4>
            <span className="text-sm font-black text-[#2FE5D0]">{progressPercent}%</span>
          </div>

          {/* Dynamic Progress Bar */}
          <div
            className={`w-full h-3 rounded-full overflow-hidden p-0.5 ${
              isDark ? 'bg-[#08213D]' : 'bg-slate-100'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] transition-all duration-700 shadow-md shadow-[#2FE5D0]/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Status Metric Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#25C8F0]/15 text-[#25C8F0] border border-[#25C8F0]/30">
              Completed &bull; {completedTotal}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2FE5D0]/15 text-[#2FE5D0] border border-[#2FE5D0]/30">
              Verified &bull; {verifiedCount}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Pending &bull; {pendingCount}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Attention &bull; {attentionCount}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700/30 text-slate-400 border border-slate-700/50">
              Unverified &bull; 0
            </span>
          </div>
        </div>

        {/* Two Columns: Task Breakdown & Key Recommendations */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t ${
            isDark ? 'border-[#163E63]' : 'border-slate-200'
          }`}
        >
          {/* Left Column: Task Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Task Breakdown
            </h4>
            <div className="space-y-3">
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-[#2FE5D0]" />
                  <span className="text-xs font-medium text-slate-200">Completed & Verified</span>
                </div>
                <span className="text-xs font-bold text-white">{verifiedCount}</span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-[#25C8F0]" />
                  <span className="text-xs font-medium text-slate-200">
                    Completed (Not Verified)
                  </span>
                </div>
                <span className="text-xs font-bold text-white">{completedUnverifiedCount}</span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-200">Pending</span>
                </div>
                <span className="text-xs font-bold text-white">{pendingCount}</span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-medium text-slate-200">Requires Attention</span>
                </div>
                <span className="text-xs font-bold text-white">{attentionCount}</span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-[#08213D] border-[#163E63]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">Unable to Verify</span>
                </div>
                <span className="text-xs font-bold text-slate-400">0</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Recommendations */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Recommendations
              </h4>
              <div className="space-y-2.5">
                {dynamicRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FE5D0] mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-[11px] leading-relaxed text-slate-400 mt-4 ${
                isDark ? 'bg-[#06172B] border-[#163E63]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              This report is based on your checklist and available evidence. A checklist does not guarantee home safety. Continuous AI Sentinel verification remains active throughout your departure.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
