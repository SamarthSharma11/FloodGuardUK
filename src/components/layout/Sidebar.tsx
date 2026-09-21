import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Building2,
  Radio,
  BellRing,
  BarChart3,
  Sliders,
  Cpu
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pendingCount?: number;
  hasSevere?: boolean;
}

export const Sidebar: React.FC = () => {
  const { alerts, summary } = useSimulation();
  const pendingAlerts = alerts.filter(a => a.status === 'PENDING');
  const pendingCount = pendingAlerts.length;
  const hasSeverePending = pendingAlerts.some(a => a.riskLevel === 'SEVERE');

  const navItems: NavItem[] = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/map', label: 'Risk Map', icon: Map },
    { to: '/villages', label: 'Villages Directory', icon: Building2 },
    { to: '/stations', label: 'Weather Stations', icon: Radio },
    {
      to: '/alerts',
      label: 'Alerts Console',
      icon: BellRing,
      pendingCount: pendingCount > 0 ? pendingCount : undefined,
      hasSevere: hasSeverePending
    },
    { to: '/analytics', label: 'Risk Analytics', icon: BarChart3 },
    { to: '/scenarios', label: 'Demo Scenarios', icon: Sliders },
    { to: '/status', label: 'System Status', icon: Cpu },
  ];

  return (
    <aside className="w-56 bg-command-900 border-r border-command-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="py-3 px-2 space-y-1">
        <div className="px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase text-slate-500 font-semibold">
          Console Navigation
        </div>
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors border-l-2 ${
                    isActive
                      ? 'border-l-sky-400 bg-command-850/80 text-slate-100 font-semibold'
                      : 'border-l-transparent text-slate-400 hover:text-slate-200 hover:bg-command-850/40'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </div>
                {item.pendingCount !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-bold tabular-nums ${
                      item.hasSevere
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
                        : 'bg-command-800 text-slate-300 border border-command-700'
                    }`}
                  >
                    {item.pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Telemetry status block */}
      <div className="p-3 border-t border-command-800 bg-command-950/70 text-[11px] space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-semibold tracking-wider">TELEMETRY ONLINE</span>
          </span>
          <span className="text-slate-500">v2.4 SOI</span>
        </div>
        <div className="bg-command-900/90 p-2 border border-command-800 font-mono text-[10px] space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Mean Catchment Risk:</span>
            <span className="font-bold text-slate-200 tabular-nums">{summary.averageRisk}/100</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Peak Hourly Precip:</span>
            <span className="font-bold text-sky-400 tabular-nums">{summary.maxRainfall.toFixed(1)} mm/h</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
