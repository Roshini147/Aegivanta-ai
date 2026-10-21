import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Video,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  Cog,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { AegivantaLogo } from './AegivantaLogo';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Roshini');
  const [email, setEmail] = useState('roshini@gmail.com');
  const [password, setPassword] = useState('AegivantaSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals for external OAuth & Forgot Password info
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  /**
   * Strict Gmail Validation Specification:
   * Accepts ONLY valid email addresses ending strictly in @gmail.com (case-insensitive)
   */
  const validateGmail = (rawEmail: string): boolean => {
    const trimmed = rawEmail.trim();
    if (!trimmed) {
      setEmailError('Please enter a valid Gmail address ending in @gmail.com.');
      return false;
    }

    // Gmail format regex: local part must be 1-64 characters, followed by exact case-insensitive @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(trimmed)) {
      setEmailError('Please enter a valid Gmail address ending in @gmail.com.');
      return false;
    }

    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      // Clear error immediately if user fixes domain
      const trimmed = val.trim();
      if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmed)) {
        setEmailError(null);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError && e.target.value.trim()) {
      setPasswordError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const isEmailValid = validateGmail(email);
    if (!password.trim()) {
      setPasswordError('Password cannot be empty.');
      return;
    } else {
      setPasswordError(null);
    }

    if (!isEmailValid) {
      return;
    }

    setIsLoading(true);

    // Realistic authentication flow
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: isSignUp ? (name || 'New Homeowner') : 'Roshini',
        email: email.trim().toLowerCase()
      });
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#041226] text-[#F5F8FF] flex items-center justify-center p-3 sm:p-6 lg:p-10 select-none font-sans">
      {/* Outer Application Container with rounded border matching Reference Image 1 */}
      <div className="w-full max-w-7xl bg-[#06172B] border border-[#163E63] rounded-3xl shadow-[0_25px_60px_-15px_rgba(4,18,38,0.9)] overflow-hidden flex flex-col lg:flex-row items-stretch">
        
        {/* LEFT COLUMN: Cinematic Home Safety Hero & Dome Showcase */}
        <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#071C34] via-[#06172B] to-[#041226] border-b lg:border-b-0 lg:border-r border-[#163E63]">
          {/* Subtle Ambient Backing Glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2FE5D0]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#25C8F0]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10">
            <AegivantaLogo size="lg" showTagline={true} />
          </div>

          {/* Center Graphic: House at Twilight with Cyan Cyber-Security Forcefield Dome */}
          <div className="my-6 relative z-10 flex flex-col items-center">
            <div className="relative w-full max-w-xl mx-auto">
              {/* House Container with Cyan Dome and Floating Nodes */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#041226] border border-[#163E63] group">
                <img
                  src="/home_dusk.jpg"
                  alt="Aegivanta Protected Home at Dusk"
                  className="w-full h-72 sm:h-80 object-cover object-center filter brightness-95 contrast-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06172B] via-transparent to-transparent opacity-90" />

                {/* Cyan Security Forcefield Dome Arch Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 sm:w-96 sm:h-96 border-2 border-dashed border-[#25C8F0]/60 rounded-full absolute -top-16 shadow-[0_0_60px_rgba(37,200,240,0.35)]" />
                </div>

                {/* Floating Security Icon Nodes along the Dome */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-7 sm:space-x-12 z-20">
                  <div className="w-9 h-9 rounded-full bg-[#071C34]/90 border border-[#2FE5D0]/80 shadow-lg shadow-[#2FE5D0]/30 flex items-center justify-center text-[#2FE5D0] transform hover:scale-110 transition-transform">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#071C34]/90 border border-[#25C8F0]/80 shadow-lg shadow-[#25C8F0]/30 flex items-center justify-center text-[#25C8F0] transform hover:scale-110 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#071C34]/90 border border-[#25C8F0]/80 shadow-lg shadow-[#25C8F0]/30 flex items-center justify-center text-[#25C8F0] transform hover:scale-110 transition-transform">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#071C34]/90 border border-[#2FE5D0]/80 shadow-lg shadow-[#2FE5D0]/30 flex items-center justify-center text-[#2FE5D0] transform hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {/* Headline Text Inside Image Overlay */}
                <div className="absolute bottom-5 left-6 right-6 z-20">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    Your home. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] drop-shadow-[0_0_15px_rgba(47,229,208,0.5)]">
                      Prepared. Always.
                    </span>
                  </h2>
                </div>
              </div>

              {/* Explanatory Tagline */}
              <p className="text-xs sm:text-sm text-[#B7CBE5] mt-4 leading-relaxed font-normal">
                Aegivanta AI is your intelligent home-safety agent, planning, coordinating, tracking and verifying your home-preparation tasks — so you can leave with peace of mind.
              </p>
            </div>
          </div>

          {/* 4 Feature Badges at Bottom */}
          <div className="relative z-10 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#071C34]/80 border border-[#163E63] flex flex-col items-center text-center">
                <ClipboardList className="w-5 h-5 text-[#25C8F0] mb-1.5" />
                <span className="text-[11px] font-bold text-[#F5F8FF]">Smart Planning</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071C34]/80 border border-[#163E63] flex flex-col items-center text-center">
                <Cog className="w-5 h-5 text-[#2FE5D0] mb-1.5" />
                <span className="text-[11px] font-bold text-[#F5F8FF]">Task Coordination</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071C34]/80 border border-[#163E63] flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-[#2FE5D0] mb-1.5" />
                <span className="text-[11px] font-bold text-[#F5F8FF]">Evidence Verification</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071C34]/80 border border-[#163E63] flex flex-col items-center text-center">
                <BarChart3 className="w-5 h-5 text-[#25C8F0] mb-1.5" />
                <span className="text-[11px] font-bold text-[#F5F8FF]">Clear Reporting</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-3 text-[10px] text-[#B7CBE5]/60 uppercase tracking-widest font-semibold">
              <span className="w-10 h-[1px] bg-[#163E63]" />
              <span>A Safer Tomorrow Starts At Home</span>
              <span className="w-10 h-[1px] bg-[#163E63]" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form */}
        <div className="w-full lg:w-5/12 p-8 lg:p-12 flex items-center justify-center bg-[#06172B] relative">
          <div className="w-full max-w-md bg-[#071C34]/90 border border-[#163E63] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative">
            
            {/* Form Brand Header */}
            <div className="flex flex-col items-center text-center mb-7">
              <AegivantaLogo size="lg" showText={true} className="justify-center mb-3" />
              <h3 className="text-lg font-bold text-[#F5F8FF]">
                {isSignUp ? 'Create your account' : 'Welcome back!'}
              </h3>
              <p className="text-xs text-[#B7CBE5] mt-1">
                {isSignUp ? 'Sign up to setup and secure your home' : 'Sign in to access your home safety dashboard.'}
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#B7CBE5] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Roshini"
                    className="w-full bg-[#08213D] border border-[#163E63] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#F5F8FF] placeholder-slate-500 focus:outline-none focus:border-[#2FE5D0] transition-colors"
                  />
                </div>
              )}

              {/* Email Input with Strict Gmail Validation */}
              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateGmail(email)}
                    placeholder="name@gmail.com"
                    className={`w-full bg-[#08213D] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#F5F8FF] placeholder-slate-500 focus:outline-none transition-colors border ${
                      emailError
                        ? 'border-rose-500 ring-1 ring-rose-500/40'
                        : 'border-[#163E63] focus:border-[#2FE5D0]'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center space-x-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[#B7CBE5] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className={`w-full bg-[#08213D] rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#F5F8FF] placeholder-slate-500 focus:outline-none transition-colors font-mono border ${
                      passwordError
                        ? 'border-rose-500 ring-1 ring-rose-500/40'
                        : 'border-[#163E63] focus:border-[#2FE5D0]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2FE5D0] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center space-x-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-[#B7CBE5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#163E63] bg-[#08213D] text-[#2FE5D0] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#2FE5D0] hover:text-[#25C8F0] font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-[#041226] bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] hover:from-[#26D5DF] hover:to-[#2FE5D0] shadow-lg shadow-[#2FE5D0]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isLoading ? 'Verifying...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-[#041226]" />
              </button>
            </form>

            {/* OR Divider */}
            <div className="my-6 flex items-center space-x-3 text-[#B7CBE5]/50 text-xs">
              <span className="flex-1 h-[1px] bg-[#163E63]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">OR</span>
              <span className="flex-1 h-[1px] bg-[#163E63]" />
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={() => setShowOAuthModal(true)}
              className="w-full py-3 px-4 rounded-xl border border-[#163E63] bg-[#08213D] hover:bg-[#0c2e54] text-xs sm:text-sm font-semibold text-[#F5F8FF] transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Toggle between Login and Signup */}
            <div className="mt-6 text-center text-xs text-[#B7CBE5]">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setEmailError(null);
                      setPasswordError(null);
                    }}
                    className="text-[#2FE5D0] hover:text-[#25C8F0] font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setEmailError(null);
                      setPasswordError(null);
                    }}
                    className="text-[#2FE5D0] hover:text-[#25C8F0] font-semibold cursor-pointer"
                  >
                    Create one
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Sign In Informational Modal */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowOAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google Sign-In Configuration</h4>
                <p className="text-xs text-slate-400">Local Development Environment</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Google OAuth 2.0 requires active Google Cloud Client ID credentials in production. In this local standalone development environment, please sign in directly using your valid Gmail address (e.g. <span className="text-cyan-400 font-mono">roshini@gmail.com</span>).
            </p>
            <button
              onClick={() => setShowOAuthModal(false)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              Got it, continue with Gmail
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Informational Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071C34] border border-[#163E63] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2FE5D0]/15 border border-[#2FE5D0]/30 flex items-center justify-center text-[#2FE5D0]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Local Password Recovery</h4>
                <p className="text-xs text-slate-400">Home Safety Sentinel System</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Automated SMTP password recovery email dispatch is not configured for local development. Default local homeowner credential has been pre-configured for your session.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#2FE5D0] hover:bg-[#25C8F0] text-[#041226] transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
