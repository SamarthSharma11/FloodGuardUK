export function getRiskColor(level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'): string {
  switch (level) {
    case 'SEVERE': return '#ef4444'; // Red
    case 'HIGH': return '#f97316'; // Orange
    case 'MODERATE': return '#f59e0b'; // Amber / Yellow
    case 'LOW':
    default: return '#10b981'; // Green
  }
}

export function getRiskTailwindBg(level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'): string {
  switch (level) {
    case 'SEVERE': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'LOW':
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}

export function getWarningColor(warning: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): string {
  switch (warning) {
    case 'RED': return '#ef4444';
    case 'ORANGE': return '#f97316';
    case 'YELLOW': return '#eab308';
    case 'GREEN':
    default: return '#22c55e';
  }
}
