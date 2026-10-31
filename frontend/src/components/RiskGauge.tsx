import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 - 100
  size?: number;
  label?: string;
  classification?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 200,
  label = 'Calibrated Risk Score',
  classification,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine stroke color, badge styles & glow based on risk score
  const getTheme = (s: number) => {
    if (s <= 30) {
      return {
        stroke: '#10B981',
        text: 'text-emerald-400',
        bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.35)',
      };
    }
    if (s <= 60) {
      return {
        stroke: '#F59E0B',
        text: 'text-amber-400',
        bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.35)',
      };
    }
    if (s <= 80) {
      return {
        stroke: '#F97316',
        text: 'text-orange-400',
        bgBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        glow: 'rgba(249, 115, 22, 0.35)',
      };
    }
    return {
      stroke: '#EF4444',
      text: 'text-rose-400',
      bgBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      glow: 'rgba(239, 68, 68, 0.4)',
    };
  };

  const { stroke, text, bgBadge, glow } = getTheme(clampedScore);

  // 270-degree speedometer arc (open symmetrically at bottom)
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degrees
  const gapLength = circumference * 0.25; // 90 degrees gap at bottom
  const strokeDashoffset = arcLength * (1 - clampedScore / 100);

  // Height needed for a 270-deg arc is roughly 85% of full diameter
  const svgHeight = size * 0.88;

  return (
    <div className="flex flex-col items-center justify-center w-full select-none py-1">
      {/* Gauge SVG Container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: svgHeight }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          style={{ filter: `drop-shadow(0 0 12px ${glow})` }}
        >
          {/* Background Track Arc (270° starting at 135° bottom-left) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />

          {/* Value Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout inside the arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
          <span className={`text-5xl font-black font-mono tracking-tight ${text}`}>
            {clampedScore}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1 font-semibold">
            / 100
          </span>
        </div>
      </div>

      {/* Spaced Labels Below Gauge (No Overlap) */}
      <div className="flex flex-col items-center text-center mt-3 space-y-1.5 w-full">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </p>

        {classification && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${bgBadge}`}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
            {classification}
          </span>
        )}
      </div>

      {/* Threshold Legend Bar */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono w-full">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          0-30
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          31-60
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
          61-80
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          81-100
        </span>
      </div>
    </div>
  );
};
