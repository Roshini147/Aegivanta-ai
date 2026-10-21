import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { AIPlannerView } from './components/AIPlannerView';
import { TaskManagementView } from './components/TaskManagementView';
import { VerificationCenterView } from './components/VerificationCenterView';
import { AgentActivityView } from './components/AgentActivityView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { EvidenceModal } from './components/EvidenceModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PlanModal } from './components/PlanModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { api } from './services/api';
import {
  SafetyPlan,
  DashboardMetrics,
  TaskItem,
  ActionConfirmation,
  NotificationItem
} from './types';

export const App: React.FC = () => {
  // Theme state: default dark mode (navy, turquoise, cyan)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aegivanta_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('aegivanta_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Authentication State - Starts at Login / Signup screen as requested
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Roshini',
    email: 'roshini@gmail.com'
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [plans, setPlans] = useState<SafetyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SafetyPlan | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<ActionConfirmation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals state
  const [evidenceTask, setEvidenceTask] = useState<TaskItem | null>(null);
  const [showConfirmationsModal, setShowConfirmationsModal] = useState<boolean>(false);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);

  // Load plans on mount
  const loadPlans = async () => {
    try {
      const planList = await api.listPlans();
      setPlans(planList);
      if (planList.length > 0 && !selectedPlanId) {
        setSelectedPlanId(planList[0].id);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const notifs = await api.listNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadPlans();
    loadNotifications();
  }, []);

  // When selectedPlanId changes, load plan details, tasks, and metrics
  const loadPlanDetails = async (planId: string) => {
    try {
      const [plan, pMetrics, pTasks, confs] = await Promise.all([
        api.getPlan(planId),
        api.getMetrics(planId),
        api.getTasks(planId),
        api.getPendingConfirmations()
      ]);
      setSelectedPlan(plan);
      setMetrics(pMetrics);
      setTasks(pTasks);
      setPendingConfirmations(confs);
      loadNotifications();
    } catch (err) {
      console.error('Failed to load plan details:', err);
    }
  };

  useEffect(() => {
    if (selectedPlanId) {
      loadPlanDetails(selectedPlanId);
    }
  }, [selectedPlanId]);

  const handlePlanCreated = (newPlan: SafetyPlan) => {
    loadPlans();
    setSelectedPlanId(newPlan.id);
    setSelectedPlan(newPlan);
    loadNotifications();
    setActiveTab('tasks');
  };

  const handleSimulateTelemetry = async () => {
    if (!selectedPlanId) return;
    setIsSimulating(true);
    try {
      await api.simulateTelemetry(selectedPlanId);
      await loadPlanDetails(selectedPlanId);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Notification Handlers
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // If not authenticated, render Login / Signup Screen
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const isDark = theme === 'dark';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div
      className={`min-h-screen flex font-sans selection:bg-[#2FE5D0]/30 selection:text-[#2FE5D0] transition-colors duration-200 ${
        isDark ? 'bg-[#041226] text-[#F5F8FF]' : 'bg-[#F4F7FC] text-slate-900'
      }`}
    >
      {/* Fixed Left Navigation Sidebar matching Reference Image 2 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mcpConnected={true}
        theme={theme}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto ${
          isDark ? 'bg-[#041226]' : 'bg-[#F4F7FC]'
        }`}
      >
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          userName={currentUser.name}
          onLogout={() => setIsAuthenticated(false)}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setShowNotificationDrawer(true)}
          theme={theme}
          onToggleTheme={(t) => setTheme(t)}
          onNavigateTab={setActiveTab}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              plan={selectedPlan}
              metrics={metrics}
              tasks={tasks}
              onNavigateTab={setActiveTab}
              onSimulateTelemetry={handleSimulateTelemetry}
              isSimulating={isSimulating}
              onOpenPlanModal={() => setShowPlanModal(true)}
              theme={theme}
            />
          )}

          {activeTab === 'planner' && (
            <AIPlannerView
              currentPlan={selectedPlan}
              tasks={tasks}
              onPlanCreated={handlePlanCreated}
              onNavigateTab={setActiveTab}
              onOpenEditPlanModal={() => setShowPlanModal(true)}
              theme={theme}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManagementView
              tasks={tasks}
              planId={selectedPlanId}
              onRefreshTasks={() => selectedPlanId && loadPlanDetails(selectedPlanId)}
              onOpenEvidenceModal={(task) => setEvidenceTask(task)}
              onRequestConfirmation={() => setShowConfirmationsModal(true)}
              theme={theme}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationCenterView
              tasks={tasks}
              onOpenEvidenceModal={(task) => setEvidenceTask(task)}
              onSimulateTelemetry={handleSimulateTelemetry}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'agent-activity' && <AgentActivityView />}

          {activeTab === 'report' && (
            <ReportView
              planId={selectedPlanId}
              plan={selectedPlan}
              tasks={tasks}
              theme={theme}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userName={currentUser.name}
              userEmail={currentUser.email}
              onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
              theme={theme}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              theme={theme}
              onToggleTheme={(t) => setTheme(t)}
              userName={currentUser.name}
              onUpdateUserName={(name) => setCurrentUser((prev) => ({ ...prev, name }))}
            />
          )}
        </main>
      </div>

      {/* Plan Details & Edit Modal */}
      <PlanModal
        plan={selectedPlan}
        tasks={tasks}
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onPlanUpdated={(updated) => {
          setSelectedPlan(updated);
          if (selectedPlanId) loadPlanDetails(selectedPlanId);
        }}
        onRefreshTasks={() => {
          if (selectedPlanId) loadPlanDetails(selectedPlanId);
        }}
        theme={theme}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onNavigateTab={setActiveTab}
        theme={theme}
      />

      {/* Evidence Modal */}
      {evidenceTask && (
        <EvidenceModal
          task={evidenceTask}
          onClose={() => setEvidenceTask(null)}
          onEvidenceRecorded={() => {
            if (selectedPlanId) loadPlanDetails(selectedPlanId);
          }}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmationsModal && (
        <ConfirmationModal
          confirmations={pendingConfirmations}
          onClose={() => setShowConfirmationsModal(false)}
          onResolved={() => {
            if (selectedPlanId) loadPlanDetails(selectedPlanId);
          }}
        />
      )}
    </div>
  );
};

export default App;
