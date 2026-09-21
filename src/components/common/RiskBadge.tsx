import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', score, showScore = true }) => {
  const configs = {
    SEVERE: {
      label: 'SEVERE',
      bar: 'bg-rose-500',
      badge: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
      dot: 'bg-rose-400',
      shouldPulse: true,
    },
    HIGH: {
      label: 'HIGH',
      bar: 'bg-amber-500',
      badge: 'border-orange-500/40 bg-orange-950/30 text-orange-300',
      dot: 'bg-orange-400',
      shouldPulse: false,
    },
    MODERATE: {
      label: 'MODERATE',
      bar: 'bg-yellow-500',
      badge: 'border-yellow-500/30 bg-yellow-950/30 text-yellow-300',
      dot: 'bg-yellow-400',
      shouldPulse: false,
    },
    LOW: {
      label: 'LOW',
      bar: 'bg-emerald-500',
      badge: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300',
      dot: 'bg-emerald-400',
      shouldPulse: false,
    }
  }[level];

  const sizeClass = {
    sm: 'px-1.5 py-0.5 text-[10px] space-x-1.5',
    md: 'px-2 py-0.5 text-[11px] space-x-1.5',
    lg: 'px-2.5 py-1 text-xs space-x-2'
  }[size];

  return (
    <span className={`inline-flex items-center rounded border font-mono font-medium tracking-wide tabular-nums ${configs.badge} ${sizeClass}`}>
      <span className="relative flex items-center justify-center">
        <span className={`w-1.5 h-1.5 rounded-full ${configs.dot}`} />
        {configs.shouldPulse && (
          <span className="absolute w-2.5 h-2.5 rounded-full bg-rose-500/50 animate-ping" />
        )}
      </span>
      <span className="font-semibold tracking-wider">{configs.label}</span>
      {score !== undefined && showScore && (
        <span className="text-slate-400 font-normal">[{score}]</span>
      )}
    </span>
  );
};
