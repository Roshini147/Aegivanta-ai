import React, { useState } from 'react';
import {
  Activity,
  Terminal,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AgentActivityView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('update_task_status');

  const activityFeed = [
    {
      tool: 'create_safety_plan',
      desc: 'Created plan with 6 tasks',
      time: '10:24 AM',
      status: 'success'
    },
    {
      tool: 'get_tasks',
      desc: 'Retrieved 6 tasks for plan',
      time: '10:27 AM',
      status: 'success'
    },
    {
      tool: 'update_task_status',
      desc: 'Marked task 1 as completed',
      time: '10:30 AM',
      status: 'success'
    },
    {
      tool: 'record_verification_evidence',
      desc: 'Added photo evidence for task 1',
      time: '10:31 AM',
      status: 'success'
    },
    {
      tool: 'request_action_confirmation',
      desc: 'Requested confirmation for appliance check',
      time: '10:32 AM',
      status: 'success'
    },
    {
      tool: 'generate_safety_report',
      desc: 'Generated final report',
      time: '10:35 AM',
      status: 'success'
    }
  ];

  const availableTools = [
    {
      name: 'create_safety_plan',
      desc: 'Generates a personalized home safety plan from travel dates and context.',
      schema: {
        user_query: 'string',
        destination: 'string',
        departure_date: 'YYYY-MM-DD',
        return_date: 'YYYY-MM-DD'
      }
    },
    {
      name: 'get_tasks',
      desc: 'Retrieves all tasks and current verification statuses for a plan.',
      schema: {
        plan_id: 'string',
        status_filter: 'string (optional)'
      }
    },
    {
      name: 'update_task_status',
      desc: 'Record a legitimate task-status change with audit notes.',
      schema: {
        task_id: 'string',
        status: 'string',
        notes: 'string'
      }
    },
    {
      name: 'record_verification_evidence',
      desc: 'Appends sensor log or visual proof to verify task completion.',
      schema: {
        task_id: 'string',
        evidence_type: 'photo | sensor_reading | device_log',
        raw_payload: 'object'
      }
    },
    {
      name: 'get_verification_evidence',
      desc: 'Returns cryptographic evidence chain for a specific task.',
      schema: {
        task_id: 'string'
      }
    },
    {
      name: 'request_action_confirmation',
      desc: 'Prompts the homeowner for explicit permission before critical automation.',
      schema: {
        task_id: 'string',
        action_type: 'device_lock | valve_shutoff',
        prompt: 'string'
      }
    },
    {
      name: 'generate_safety_report',
      desc: 'Compiles certified departure safety report and exportable metrics.',
      schema: {
        plan_id: 'string',
        format: 'pdf | json'
      }
    }
  ];

  const currentToolData = availableTools.find(t => t.name === selectedTool) || availableTools[2];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Timeline of Agent Tool Executions */}
        <div className="lg:col-span-2 bg-[#0d172e] border border-[#1a2d52] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Execution Flow & Tool Usage
          </div>

          <div className="space-y-4 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#172a50]"></div>

            {activityFeed.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTool(item.tool)}
                className="relative flex items-center justify-between p-3.5 rounded-xl bg-[#0a1224] border border-[#16274a] hover:border-cyan-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 z-10 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                      <span>Called</span>
                      <span className="text-cyan-400">{item.tool}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 col): Available Tools + Tool Details */}
        <div className="space-y-6">
          {/* Available Tools Card */}
          <div className="bg-[#0d172e] border border-[#1a2d52] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Tools
            </div>
            <div className="space-y-1.5">
              {availableTools.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTool(t.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                    selectedTool === t.name
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111f3d]'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Details Card */}
          <div className="bg-[#0d172e] border border-[#1a2d52] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tool Details
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 font-mono">
                {currentToolData.name}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentToolData.desc}
              </p>
            </div>

            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Input Schema:
              </div>
              <pre className="p-3 rounded-lg bg-[#070d1a] border border-[#142340] text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(currentToolData.schema, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
