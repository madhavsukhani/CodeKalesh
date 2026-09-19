import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  icon: Icon, 
  trend, 
  badgeColor = 'sky', 
  highlight = false 
}) {
  const colorMap = {
    sky: 'from-sky-500/10 to-transparent border-sky-500/20 text-sky-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
  };

  const currentTheme = colorMap[badgeColor] || colorMap.sky;

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-b ${currentTheme} bg-slate-900/70 border backdrop-blur-sm shadow-lg transition-all hover:scale-[1.01] hover:border-slate-600/60 group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:text-white transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.startsWith('+') || trend.includes('Optimized') || trend.includes('Saved')
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
