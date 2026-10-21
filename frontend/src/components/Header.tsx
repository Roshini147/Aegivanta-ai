import React, { useState } from 'react';
import {
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  userName: string;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: (newTheme: 'dark' | 'light') => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userName = 'Roshini',
  onLogout,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  theme,
  onToggleTheme,
  onNavigateTab
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isDark = theme === 'dark';

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Your home preparation at a glance'
        };
      case 'planner':
        return {
          title: 'AI Planning',
          subtitle: 'Describe your situation and let Aegivanta AI create a personalized safety plan.'
        };
      case 'tasks':
        return {
          title: 'Task Management',
          subtitle: 'Track and manage your home preparation tasks.'
        };
      case 'verification':
        return {
          title: 'Verification Center',
          subtitle: 'View evidence and verification status for all tasks.'
        };
      case 'agent-activity':
        return {
          title: 'Agent Activity',
          subtitle: "View the AI agent's tool usage and execution flow."
        };
      case 'report':
        return {
          title: 'Final Report',
          subtitle: 'Summary of your home preparation plan.'
        };
      case 'profile':
        return {
          title: 'Homeowner Profile',
          subtitle: 'Identity verification, safety clearance, and residence settings.'
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Configure theme appearance, verification rules, and automated safeguarding.'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Your home preparation at a glance'
        };
    }
  };

  const meta = getHeaderMeta();

  return (
    <header
      className={`h-20 px-8 flex items-center justify-between border-b sticky top-0 z-30 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-[#06172B]/90 border-[#163E63] backdrop-blur-md'
          : 'bg-white/90 border-slate-200 backdrop-blur-md shadow-sm'
      }`}
    >
      {/* Title & Subtitle */}
      <div>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-[#F5F8FF]' : 'text-slate-900'}`}>
          {meta.title}
        </h2>
        <p className={`text-xs font-medium ${isDark ? 'text-[#B7CBE5]' : 'text-slate-600'}`}>
          {meta.subtitle}
        </p>
      </div>

      {/* Right controls: Theme Toggle, Notification Bell, User Avatar Pill */}
      <div className="flex items-center space-x-3.5">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={() => onToggleTheme(isDark ? 'light' : 'dark')}
          className={`p-2 rounded-xl transition-all ${
            isDark
              ? 'text-slate-400 hover:text-amber-300 hover:bg-[#071C34]'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell with Dynamic Unread Badge */}
        <button
          onClick={onOpenNotifications}
          className={`relative p-2 rounded-xl transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-[#2FE5D0] hover:bg-[#071C34]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#2FE5D0] text-[#041226] text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(47,229,208,0.7)] animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-full border transition-all shadow-sm ${
              isDark
                ? 'bg-[#08213D] border-[#163E63] hover:border-[#2FE5D0]/60 text-[#F5F8FF]'
                : 'bg-slate-50 border-slate-300 hover:border-cyan-500/60 text-slate-800'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2FE5D0] to-[#25C8F0] flex items-center justify-center text-[#041226] text-xs font-black shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* User Dropdown */}
          {showDropdown && (
            <div
              className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 ${
                isDark
                  ? 'bg-[#071C34] border-[#163E63]'
                  : 'bg-white border-slate-200 shadow-slate-300/50'
              }`}
            >
              <div className={`px-4 py-2.5 border-b ${isDark ? 'border-[#163E63]' : 'border-slate-100'}`}>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                <p className={`text-[10px] truncate ${isDark ? 'text-[#B7CBE5]' : 'text-slate-500'}`}>roshini@gmail.com</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#2FE5D0]/15 text-[#2FE5D0] border border-[#2FE5D0]/30">
                  Verified Homeowner
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigateTab('profile');
                  }}
                  className={`w-full flex items-center space-x-2.5 px-4 py-2 text-xs transition-colors text-left ${
                    isDark ? 'text-[#B7CBE5] hover:bg-[#08213D] hover:text-[#2FE5D0]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#2FE5D0]" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigateTab('settings');
                  }}
                  className={`w-full flex items-center space-x-2.5 px-4 py-2 text-xs transition-colors text-left ${
                    isDark ? 'text-[#B7CBE5] hover:bg-[#08213D] hover:text-[#2FE5D0]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#2FE5D0]" />
                  <span>System Settings</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme(isDark ? 'light' : 'dark');
                  }}
                  className={`w-full flex items-center space-x-2.5 px-4 py-2 text-xs transition-colors text-left ${
                    isDark ? 'text-[#B7CBE5] hover:bg-[#08213D]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Switch to Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              <div className={`pt-1 border-t ${isDark ? 'border-[#163E63]' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
