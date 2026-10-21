import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Shield,
  Bell,
  Home,
  Database,
  Lock,
  Save,
  CheckCircle2,
  Download,
  Trash2,
  Smartphone,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: (newTheme: 'dark' | 'light') => void;
  userName: string;
  onUpdateUserName: (newName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  userName,
  onUpdateUserName
}) => {
  const [activeSection, setActiveSection] = useState<'appearance' | 'home' | 'safety' | 'notifications' | 'data'>('appearance');

  // Form states
  const [homeName, setHomeName] = useState('Greenwood Villa');
  const [homeType, setHomeType] = useState('Suburban House');
  const [freezeProtection, setFreezeProtection] = useState(true);
  const [hasPets, setHasPets] = useState(true);
  const [hasPlants, setHasPlants] = useState(true);

  // Safety & Automation rules
  const [strictVerification, setStrictVerification] = useState(true);
  const [humanConfirmation, setHumanConfirmation] = useState(true);
  const [pollInterval, setPollInterval] = useState('5');

  // Notifications
  const [pushAlerts, setPushAlerts] = useState(true);
  const [securityWarnings, setSecurityWarnings] = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  // Save feedback state
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = () => {
    setSavedMessage('Settings successfully saved and applied.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleExportLogs = () => {
    const data = {
      user: userName,
      exported_at: new Date().toISOString(),
      home_profile: { homeName, homeType, freezeProtection, hasPets, hasPlants },
      safety_rules: { strictVerification, humanConfirmation, pollInterval },
      notifications: { pushAlerts, securityWarnings, emailReports }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegivanta_audit_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDark = theme === 'dark';

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#16274a] gap-4">
        <div>
          <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            System & Safety Settings
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage your interface appearance, home profile, IoT verification rules, and data policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2.5 text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Settings Layout: Left Navigation + Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section Navigation */}
        <div className={`p-3 rounded-2xl border space-y-1 ${isDark ? 'bg-[#0d172e] border-[#1a2d52]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button
            onClick={() => setActiveSection('appearance')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === 'appearance'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : isDark ? 'text-slate-400 hover:bg-[#111f3d] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Theme & Display</span>
          </button>

          <button
            onClick={() => setActiveSection('home')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === 'home'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : isDark ? 'text-slate-400 hover:bg-[#111f3d] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('safety')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === 'safety'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : isDark ? 'text-slate-400 hover:bg-[#111f3d] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Verification Rules</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === 'notifications'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : isDark ? 'text-slate-400 hover:bg-[#111f3d] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveSection('data')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === 'data'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : isDark ? 'text-slate-400 hover:bg-[#111f3d] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data & Privacy</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className={`lg:col-span-3 p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-[#0d172e] border-[#1a2d52]' : 'bg-white border-slate-200 shadow-sm'}`}>
          {/* 1. Theme & Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Theme & Color Palette
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select between Dark Mode (Deep Blue, Black & White) and Light Mode (Crisp White, Deep Blue & Slate).
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Dark Theme Option */}
                <div
                  onClick={() => onToggleTheme('dark')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isDark
                      ? 'border-cyan-400 bg-[#091122] shadow-lg shadow-cyan-950/40'
                      : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-white">Dark Mode</span>
                    </div>
                    {isDark && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Deep Blue (#091122), Black (#050811), and crisp white text. Recommended for night operations and OLED displays.
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#050811] border border-slate-700" title="Black"></span>
                    <span className="w-6 h-6 rounded-full bg-[#091122] border border-slate-700" title="Deep Blue"></span>
                    <span className="w-6 h-6 rounded-full bg-[#06B6D4]" title="Vivid Cyan"></span>
                    <span className="w-6 h-6 rounded-full bg-white" title="White"></span>
                  </div>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => onToggleTheme('light')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    !isDark
                      ? 'border-cyan-500 bg-slate-50 shadow-md'
                      : 'border-[#1a2d52] bg-[#0a1224] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm">
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Light Mode</span>
                    </div>
                    {!isDark && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                    )}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Crisp White (#FFFFFF), Deep Blue (#0B192C) sidebar and high-contrast text. Clean daylight aesthetics.
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-300" title="Pure White"></span>
                    <span className="w-6 h-6 rounded-full bg-[#0B192C]" title="Deep Blue"></span>
                    <span className="w-6 h-6 rounded-full bg-[#0284C7]" title="Accent Blue"></span>
                    <span className="w-6 h-6 rounded-full bg-[#091124]" title="Black"></span>
                  </div>
                </div>
              </div>

              {/* Palette Explanation Card */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#091122] border-[#16274a]' : 'bg-slate-50 border-slate-200'}`}>
                <h5 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  Customized Palette: White, Deep Blue & Black
                </h5>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  The color scheme balances high-contrast deep blues with midnight black surfaces and bright white indicators for an enterprise-grade command interface.
                </p>
              </div>
            </div>
          )}

          {/* 2. Home Profile */}
          {activeSection === 'home' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Home & Residence Profile
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Customize your residence attributes so Aegivanta AI generates customized checklists.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Residence Name
                  </label>
                  <input
                    type="text"
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Property Architecture Type
                  </label>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                    }`}
                  >
                    <option value="Suburban House">Suburban House (Multi-story with perimeter gates)</option>
                    <option value="Apartment / Condominium">Apartment / Condominium</option>
                    <option value="Villa">Villa / Standalone Estate</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freezeProtection}
                      onChange={(e) => setFreezeProtection(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded bg-[#0a1224] border-[#1d3159] focus:ring-cyan-500"
                    />
                    <div>
                      <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Winter Freeze Risk Protection
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ensures pipe freeze alerts and minimum furnace setpoints are prioritized in every plan.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPets}
                      onChange={(e) => setHasPets(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded bg-[#0a1224] border-[#1d3159] focus:ring-cyan-500"
                    />
                    <div>
                      <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Pet Care Preparation
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Automatically include food, water dispensers, and pet-sitter emergency contact tasks.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPlants}
                      onChange={(e) => setHasPlants(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded bg-[#0a1224] border-[#1d3159] focus:ring-cyan-500"
                    />
                    <div>
                      <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Indoor & Garden Irrigation Check
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Includes automated drip timer verification and plant care tasks.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. Verification Rules */}
          {activeSection === 'safety' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verification Engine & Automation Boundaries
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configure how Aegivanta AI validates task evidence and controls physical device actions.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Strict Verification Enforcement
                      </span>
                      <input
                        type="checkbox"
                        checked={strictVerification}
                        onChange={(e) => setStrictVerification(e.target.checked)}
                        className="w-4 h-4 text-cyan-500 rounded cursor-pointer"
                      />
                    </div>
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Prevents tasks from being marked as 'VERIFIED' without corroborating sensor telemetry, device logs, or visual photographic proof.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Lock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Consequential Action Human Safeguard
                      </span>
                      <input
                        type="checkbox"
                        checked={humanConfirmation}
                        onChange={(e) => setHumanConfirmation(e.target.checked)}
                        className="w-4 h-4 text-cyan-500 rounded cursor-pointer"
                      />
                    </div>
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Always requires explicit homeowner confirmation before locking perimeter gates, turning off main water valves, or resetting alarm panels.
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    IoT Telemetry Polling Frequency
                  </label>
                  <select
                    value={pollInterval}
                    onChange={(e) => setPollInterval(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                    }`}
                  >
                    <option value="1">Every 1 minute (Real-time departure checks)</option>
                    <option value="5">Every 5 minutes (Standard recommended)</option>
                    <option value="15">Every 15 minutes (Low-power eco mode)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Alert & Notification Preferences
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Choose how and when you receive departure safety alerts.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Push Notifications
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Immediate device notifications when a task is verified or requires human attention.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded"
                  />
                </label>

                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Perimeter Security Anomaly Warnings
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      High-priority sound and banner alarms if doors or windows are left ajar before leaving.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityWarnings}
                    onChange={(e) => setSecurityWarnings(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded"
                  />
                </label>

                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Daily Departure Digest via Email
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Receive summary of completed tasks at 8:00 AM each morning during the trip.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={(e) => setEmailReports(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 5. Data & Privacy */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Data Storage & Cryptographic Register
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Manage local SQLite storage, export compliance audit logs, and inspect system integrity.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#0a1224] border-[#1d3159]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Verified SQLite Local Database
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        `aegivanta.db` &bull; Write-Ahead Logging (WAL) enabled
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Synchronized
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleExportLogs}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#142344] hover:bg-[#1a2f5a] border border-[#233a69] text-xs font-semibold text-slate-200 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Export Audit Logs (.JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Plan cache refreshed successfully.');
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
