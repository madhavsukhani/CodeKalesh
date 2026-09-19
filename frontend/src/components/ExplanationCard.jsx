import React from 'react';
import { Sparkles, AlertTriangle, Route, ShieldCheck, Clock } from 'lucide-react';

export default function ExplanationCard({ explanations = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'yield_surge':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'clustering':
        return <Route className="w-4 h-4 text-sky-400" />;
      case 'time_window':
        return <Clock className="w-4 h-4 text-emerald-400" />;
      case 'capacity_balance':
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'yield_surge':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'clustering':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'time_window':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'capacity_balance':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Explanation Engine: Why this route?
          </h3>
          <p className="text-xs text-slate-400">
            Real-time multi-constraint reasoning generated for route planners & managers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {explanations.map((item, idx) => (
          <div 
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getBadgeStyle(item.type)}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
