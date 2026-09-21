import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: 'cyan' | 'rose' | 'orange' | 'amber' | 'emerald';
  badge?: string;
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'cyan',
}) => {
  const accentBorders = {
    cyan: 'border-l-sky-500',
    rose: 'border-l-rose-500',
    orange: 'border-l-orange-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
  }[accentColor];

  const iconColors = {
    cyan: 'text-sky-400',
    rose: 'text-rose-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  }[accentColor];

  return (
    <div className={`bg-command-900 border border-command-800 border-l-2 ${accentBorders} p-3.5 flex flex-col justify-between transition-colors hover:bg-command-850/60`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            {title}
          </p>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-1.5 rounded bg-command-950 border border-command-800/80 ${iconColors}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-2.5 pt-2 border-t border-command-800/60 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
