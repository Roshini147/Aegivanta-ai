import React from 'react';

interface AegivantaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const AegivantaLogo: React.FC<AegivantaLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const sizeMap = {
    sm: { box: 32, icon: 20, text: 'text-sm', tag: 'text-[9px]' },
    md: { box: 42, icon: 26, text: 'text-base', tag: 'text-[10px]' },
    lg: { box: 54, icon: 34, text: 'text-xl', tag: 'text-xs' },
    xl: { box: 68, icon: 44, text: 'text-2xl', tag: 'text-xs' }
  };

  const { box, text: textSize, tag: tagSize } = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Geometric Shield with Modern Home Symbol */}
      <div
        style={{ width: `${box}px`, height: `${box}px` }}
        className="relative flex items-center justify-center flex-shrink-0 group"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2FE5D0] to-[#25C8F0] rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />

        {/* Shield Container */}
        <svg
          viewBox="0 0 100 110"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(47,229,208,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Turquoise to Cyan Gradient */}
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2FE5D0" />
              <stop offset="50%" stopColor="#26D5DF" />
              <stop offset="100%" stopColor="#25C8F0" />
            </linearGradient>

            <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#08213D" />
              <stop offset="100%" stopColor="#041226" />
            </linearGradient>

            <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F8FF" />
              <stop offset="100%" stopColor="#2FE5D0" />
            </linearGradient>

            <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2FE5D0" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Shield Outline */}
          <path
            d="M50 4 
               C74 4 94 16 94 36 
               C94 72 68 96 50 106 
               C32 96 6 72 6 36 
               C6 16 26 4 50 4 Z"
            fill="url(#shieldInner)"
            stroke="url(#shieldGrad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Accent Contour */}
          <path
            d="M50 12 
               C70 12 86 22 86 38 
               C86 68 64 88 50 96 
               C36 88 14 68 14 38 
               C14 22 30 12 50 12 Z"
            fill="none"
            stroke="#2FE5D0"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />

          {/* Modern Minimal Home Icon inside Shield */}
          {/* Roof */}
          <path
            d="M50 28 L72 45 L67 49 L50 36 L33 49 L28 45 Z"
            fill="url(#homeGrad)"
            filter="url(#shieldGlow)"
          />

          {/* Chimney / Sensor Node */}
          <rect x="63" y="32" width="4" height="7" rx="1" fill="#25C8F0" opacity="0.9" />

          {/* House Body */}
          <path
            d="M36 47 L64 47 L64 68 C64 70 62 72 60 72 L40 72 C38 72 36 70 36 68 Z"
            fill="#06172B"
            stroke="url(#shieldGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Smart Door / Core Portal */}
          <path
            d="M45 72 L45 56 C45 54 47 53 50 53 C53 53 55 54 55 56 L55 72 Z"
            fill="url(#shieldGrad)"
          />

          {/* Cyan Telemetry Pulse Dot above Roof */}
          <circle cx="50" cy="22" r="2.5" fill="#2FE5D0" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-black tracking-tight ${textSize} ${
                isDark ? 'text-[#F5F8FF]' : 'text-slate-900'
              }`}
            >
              Aegivanta
            </span>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2FE5D0] to-[#25C8F0] tracking-wider text-sm uppercase">
              AI
            </span>
          </div>

          {showTagline && (
            <p
              className={`font-medium tracking-tight leading-tight ${tagSize} ${
                isDark ? 'text-[#B7CBE5]' : 'text-slate-600'
              }`}
            >
              Intelligence That Acts. Safety You Can Verify.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
