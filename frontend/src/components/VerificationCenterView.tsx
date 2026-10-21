import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ChevronDown,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Shield,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { TaskItem } from '../types';

interface VerificationCenterViewProps {
  tasks: TaskItem[];
  onOpenEvidenceModal: (task: TaskItem) => void;
  onSimulateTelemetry?: () => void;
  isSimulating?: boolean;
  theme?: 'dark' | 'light';
}

export const VerificationCenterView: React.FC<VerificationCenterViewProps> = ({
  tasks,
  onOpenEvidenceModal,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dynamically map active tasks to verification records
  const verificationRows = tasks.map((t) => {
    let evidenceLabel = '-';
    let sourceLabel = '-';
    let timeLabel = '-';

    if (t.evidence && t.evidence.length > 0) {
      const latest = t.evidence[0];
      evidenceLabel = latest.evidence_type === 'PHOTO_REFERENCE' ? 'Photo + Sensor' : latest.evidence_type;
      sourceLabel = latest.source || (latest.is_simulated ? 'Smart Sensor (Verified)' : 'Hardware');
      timeLabel = new Date(latest.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                  new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (t.status === 'VERIFIED') {
      evidenceLabel = 'Telemetry Attestation';
      sourceLabel = t.completion_source || 'Smart Sensor (Verified)';
      timeLabel = new Date(t.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                  new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (t.status === 'COMPLETED') {
      evidenceLabel = 'User Confirmation';
      sourceLabel = t.completion_source || 'Homeowner Attestation';
      timeLabel = new Date(t.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                  new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      rawTask: t,
      id: t.id,
      task: t.title,
      status: t.status,
      evidence: evidenceLabel,
      source: sourceLabel,
      timestamp: timeLabel
    };
  });

  const filtered = verificationRows.filter((r) => {
    const matchesSearch = r.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'VERIFIED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2FE5D0]/15 text-[#2FE5D0] border border-[#2FE5D0]/30 inline-flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 mr-0.5" />
          <span>Verified</span>
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 mr-0.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'ACTION_REQUIRED' || s === 'UNABLE_TO_VERIFY') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 mr-0.5" />
          <span>Attention</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center space-x-1">
        <Clock className="w-3 h-3 mr-0.5" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Top Filter and Search Bar matching Reference Image 2 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Showing {filtered.length} verification telemetry checkpoints
        </p>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none rounded-xl px-3 py-2 pr-8 text-xs focus:outline-none transition-all cursor-pointer border ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-[#B7CBE5] focus:border-[#2FE5D0]'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="ALL">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="ACTION_REQUIRED">Attention</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-all border ${
                isDark
                  ? 'bg-[#08213D] border-[#163E63] text-slate-100 placeholder-slate-500 focus:border-[#2FE5D0]'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Table Card matching Reference Image 2 */}
      <div
        className={`rounded-2xl border shadow-xl overflow-hidden ${
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
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Evidence</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? 'divide-[#163E63]/60 text-slate-200' : 'divide-slate-100 text-slate-800'
              }`}
            >
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-[#08213D]/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-4 px-6 font-semibold">{row.task}</td>
                  <td className="py-4 px-6">{getStatusBadge(row.status)}</td>
                  <td className="py-4 px-6 font-medium text-slate-300">{row.evidence}</td>
                  <td className="py-4 px-6 text-[#B7CBE5]">{row.source}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                    {row.timestamp}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onOpenEvidenceModal(row.rawTask)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2FE5D0]/10 hover:bg-[#2FE5D0]/20 border border-[#2FE5D0]/30 text-[#2FE5D0] transition-colors cursor-pointer"
                    >
                      Record / Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Simulation Notice Banner matching Reference Image 2 */}
      <div
        className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs leading-relaxed ${
          isDark
            ? 'bg-[#08213D]/60 border-[#163E63] text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#25C8F0] flex-shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-[#2FE5D0]">
            DEMO SIMULATION — LOCAL HOME SENTINEL
          </span>
          <span className="text-[11px] text-[#B7CBE5]">
            Device data and telemetry records are evaluated through local cryptographic verification rules.
          </span>
        </div>
      </div>
    </div>
  );
};
