import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  ShieldCheck,
  Activity,
  FileText,
  User,
  Settings
} from 'lucide-react';
import { AegivantaLogo } from './AegivantaLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mcpConnected?: boolean;
  theme?: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mcpConnected = true,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Plan & Setup', icon: CalendarDays },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'agent-activity', label: 'Agent Activity', icon: Activity },
    { id: 'report', label: 'Final Report', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 flex-shrink-0 border-r flex flex-col justify-between min-h-screen select-none shadow-2xl transition-colors duration-200 ${
        isDark
          ? 'bg-[#06172B] border-[#163E63] text-[#F5F8FF]'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div>
        {/* Brand Header with AegivantaLogo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className={`p-5 border-b cursor-pointer transition-colors ${
            isDark ? 'border-[#163E63] hover:bg-[#071C34]' : 'border-slate-100 hover:bg-slate-50'
          }`}
        >
          <AegivantaLogo size="md" showTagline={true} theme={theme} />
        </div>

        {/* Navigation Menu */}
        <nav className="p-3.5 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? isDark
                      ? 'bg-[#08213D] text-[#2FE5D0] shadow-md shadow-[#041226]/50 border border-[#2FE5D0]/40'
                      : 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-300'
                    : isDark
                    ? 'text-[#B7CBE5] hover:text-[#F5F8FF] hover:bg-[#071C34]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? isDark
                        ? 'text-[#2FE5D0]'
                        : 'text-cyan-600'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: MCP Server Status Indicator matching Reference Image 2 */}
      <div className={`p-4 border-t ${isDark ? 'border-[#163E63]' : 'border-slate-100'}`}>
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg border text-[11px] ${
            isDark
              ? 'bg-[#071C34] border-[#163E63] text-[#B7CBE5]'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="leading-tight">
            <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block">
              MCP Server
            </span>
            <span className="font-bold text-emerald-400 text-xs">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
