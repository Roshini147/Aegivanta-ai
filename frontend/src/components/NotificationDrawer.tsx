import React from 'react';
import {
  Bell,
  X,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  theme?: 'dark' | 'light';
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onNavigateTab,
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ALERT':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md border-l shadow-2xl flex flex-col justify-between transition-all ${
            isDark
              ? 'bg-[#06172B] border-[#163E63] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#163E63] bg-[#071C34]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Security Notifications</h3>
                <p className="text-[11px] text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread events` : 'All notifications caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors flex items-center space-x-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bell className="w-10 h-10 text-slate-600 mb-3 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-300">No Notifications</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  All security events, agent plan updates, and verified task attestations will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDark
                      ? item.is_read
                        ? 'bg-[#071C34]/50 border-[#163E63]/60 text-slate-300'
                        : 'bg-[#08213D] border-cyan-500/40 text-slate-100 shadow-lg shadow-cyan-950/30'
                      : item.is_read
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-cyan-50/50 border-cyan-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 flex-shrink-0">{getCategoryIcon(item.category)}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold">{item.title}</h4>
                          {!item.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500">
                          <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {item.link_tab && (
                            <button
                              onClick={() => {
                                onMarkRead(item.id);
                                onNavigateTab(item.link_tab);
                                onClose();
                              }}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-0.5 transition-colors"
                            >
                              <span>View in {item.link_tab}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!item.is_read && (
                        <button
                          onClick={() => onMarkRead(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-4 border-t text-center text-xs ${
              isDark ? 'border-[#163E63] bg-[#071C34]/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Aegivanta AI Agent Sentinel &bull; Continuous Telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
