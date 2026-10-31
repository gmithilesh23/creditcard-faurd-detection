import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'emerald' | 'amber' | 'orange' | 'red' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'blue', size = 'sm' }) => {
  const variantStyles: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-700/30 text-slate-400 border-slate-600/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant] || variantStyles.blue} ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
      {label}
    </span>
  );
};

export const getRiskBadge = (level?: string, score?: number) => {
  const s = score ?? 0;
  if (level === 'Critical' || s > 80) return <Badge label="Critical Risk" variant="red" />;
  if (level === 'High' || s > 60) return <Badge label="High Risk" variant="orange" />;
  if (level === 'Medium' || s > 30) return <Badge label="Medium Risk" variant="amber" />;
  return <Badge label="Low Risk" variant="emerald" />;
};

export const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'Approved':
      return <Badge label="Approved" variant="emerald" />;
    case 'Flagged':
      return <Badge label="Flagged" variant="amber" />;
    case 'Blocked':
      return <Badge label="Blocked" variant="red" />;
    case 'Under Review':
      return <Badge label="Under Review" variant="orange" />;
    default:
      return <Badge label={status || 'Unknown'} variant="slate" />;
  }
};

