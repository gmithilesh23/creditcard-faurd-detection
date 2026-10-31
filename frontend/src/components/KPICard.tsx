import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  accentGradient?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositiveChange,
  icon: Icon,
  iconColor = 'text-blue-400',
  accentGradient = 'from-blue-500/20 to-transparent',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-navy-850 to-navy-900 border border-slate-800/80 p-5 shadow-card hover:border-slate-700/80 transition-all duration-200">
      {/* Top accent subtle glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentGradient} blur-2xl pointer-events-none opacity-40`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-navy-800/80 border border-slate-700/50 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
          {change && (
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                isPositiveChange ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositiveChange ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate ml-auto">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

