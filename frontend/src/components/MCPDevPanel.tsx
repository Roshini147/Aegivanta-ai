import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Server,
  Play,
  RotateCcw,
  Code
} from 'lucide-react';

export const MCPDevPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'console'>('tools');

  const tools = [
    { name: 'create_safety_plan', desc: 'Generate safety plan' },
    { name: 'get_tasks', desc: 'Retrieve task list' },
    { name: 'update_task_status', desc: 'Change task status' },
    { name: 'record_verification_evidence', desc: 'Record sensor proof' },
    { name: 'get_verification_evidence', desc: 'Fetch evidence chain' },
    { name: 'request_action_confirmation', desc: 'Request user approval' },
    { name: 'generate_safety_report', desc: 'Build safety report' },
  ];

  const recentCalls = [
    { tool: 'get_tasks', status: 'Success', time: '10:35 AM' },
    { tool: 'update_task_status', status: 'Success', time: '10:31 AM' },
    { tool: 'record_verification_evidence', status: 'Success', time: '10:30 AM' },
    { tool: 'generate_safety_report', status: 'Success', time: '10:28 AM' }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. MCP Connection Status Card */}
      <div className="bg-[#0d172e] border border-[#1a2d52] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          MCP Connection Status
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Status</span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400">Connected</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Server URL</span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              http://localhost:8000/mcp
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Protocol Version</span>
            <span className="text-xs font-mono text-slate-200 font-semibold">
              2026-11-05
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Transport</span>
            <span className="text-xs text-slate-200 font-semibold">
              Streamable HTTP
            </span>
          </div>
        </div>
      </div>

      {/* 2. Discovered Tools (7) Card */}
      <div className="bg-[#0d172e] border border-[#1a2d52] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Discovered Tools (7)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {tools.map((t) => (
            <div
              key={t.name}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0a1224] border border-[#16274a] hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                <span className="text-xs font-mono font-medium text-slate-200">
                  {t.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {t.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recent Tool Calls Card */}
      <div className="bg-[#0d172e] border border-[#1a2d52] rounded-2xl shadow-xl overflow-hidden">
        <div className="py-4 px-6 border-b border-[#16274a] bg-[#0a1224]/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Tool Calls
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#142340] bg-[#091022] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Tool</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142340] text-xs font-mono">
              {recentCalls.map((call, idx) => (
                <tr key={idx} className="hover:bg-[#111f3d]/50 transition-colors">
                  <td className="py-3.5 px-6 text-slate-200">
                    {call.tool}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {call.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400 text-right">
                    {call.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
