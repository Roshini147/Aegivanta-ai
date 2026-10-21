import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Smartphone,
  MapPin,
  Calendar,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  KeyRound,
  Cpu,
  Radio,
  Check
} from 'lucide-react';

interface ProfileViewProps {
  userName: string;
  userEmail: string;
  onUpdateUser: (updated: { name: string; email: string }) => void;
  theme: 'dark' | 'light';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName,
  userEmail,
  onUpdateUser,
  theme
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState('+1 (555) 234-8971');
  const [emergencyContact, setEmergencyContact] = useState('Ananya (Sister) — +1 (555) 987-6543');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDark = theme === 'dark';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, email });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const connectedDevices = [
    { name: 'Front Entrance Smart Lock', type: 'Yale Assure Pro', status: 'Online', verified: true },
    { name: 'Patio Perimeter Camera', type: 'Arlo Ultra 4K', status: 'Online', verified: true },
    { name: 'Main Water Shutoff Valve', type: 'Moen Flo Smart Controller', status: 'Armed', verified: true },
    { name: 'HVAC Smart Thermostat', type: 'Ecobee Premium Eco', status: 'Eco Mode', verified: true },
    { name: 'Smart Lighting Bridge', type: 'Philips Hue Hub v2', status: 'Scheduled', verified: true },
    { name: 'Dual Smoke & CO Detectors', type: 'Nest Protect Gen 2', status: 'Monitored', verified: true }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#16274a] gap-4">
        <div>
          <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Homeowner Profile & Credentials
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Verified residential identity, connected IoT hardware, and security authentication.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#142344] hover:bg-[#1a2f5a] border border-[#233a69] text-xs font-semibold text-slate-200 transition-all shadow-sm self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2.5 text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl relative overflow-hidden ${
        isDark ? 'bg-[#0d172e] border-[#1a2d52]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar with Status Ring */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1325] rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0d172e] flex items-center justify-center" title="Verified Homeowner">
              <Check className="w-3 h-3 text-slate-950 font-black" />
            </span>
          </div>

          {/* User Meta */}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Primary Homeowner & Administrator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified Identity
              </span>
            </div>

            <div className={`flex flex-wrap items-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Greenwood Villa, Suburban House</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-[#16274a] space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Update Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-medium focus:outline-none border ${
                    isDark ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-medium focus:outline-none border ${
                    isDark ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Primary Mobile Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-medium focus:outline-none border ${
                    isDark ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Emergency Contact (During Travel)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-medium focus:outline-none border ${
                    isDark ? 'bg-[#0a1224] border-[#1d3159] text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Two Columns: Connected IoT Devices (left) & Security Credentials (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Devices (span 2) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-xl space-y-4 ${
          isDark ? 'bg-[#0d172e] border-[#1a2d52]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#16274a]">
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Connected Hardware & Sensors (6)
              </h4>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Devices providing real-time telemetry verification for departure tasks.
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Hub Active"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {connectedDevices.map((dev, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#0a1224] border-[#16274a]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {dev.name}
                  </div>
                  <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {dev.type}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {dev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Credentials & Audit Status (span 1) */}
        <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
          isDark ? 'bg-[#0d172e] border-[#1a2d52]' : 'bg-white border-slate-200'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Security Posture
          </h4>

          <div className="space-y-3">
            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#0a1224] border-[#16274a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold">100% Security Score</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Hardware key attestation and local write-ahead log verification active.
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#0a1224] border-[#16274a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-bold">Role: Super Administrator</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Full permission to trigger emergency shutoffs and generate official departure reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
