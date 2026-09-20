import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { fetchPredictions } from '../api';

export default function Predictions({ 
  predictions = [], 
  onPredictionsUpdated, 
  setActiveTab 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const refreshPredictions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPredictions('rf');
      if (onPredictionsUpdated) onPredictionsUpdated(data.predictions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalLitres = predictions.reduce((sum, p) => sum + (p.predicted_litres || 0), 0);
  const atRiskList = predictions.filter((p) => p.risk === 'high');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Today’s Milk Volume Predictions
          </h1>
        </div>

        <button
          onClick={refreshPredictions}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh AI Forecast'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Predicted Volume</div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {Math.round(totalLitres).toLocaleString()} <span className="text-lg font-bold text-sky-400">Litres</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across 12 village collection centres</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Prediction Model</div>
          <div className="mt-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span className="text-lg font-bold text-white">
              Random Forest Regressor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Non-linear tree ensemble trained on centre history and lag features
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Capacity Surge Warning</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {atRiskList.length} <span className="text-lg font-bold text-amber-300">Centre At-Risk</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Kheri VLC predicted at 455 L (+16.6% surge). Pre-allocated early in Van 1.
          </p>
        </div>
      </div>

      {/* Prediction Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Centre Yield Forecast Table</h3>
            <p className="text-xs text-slate-400">Comparing historical 7-day average with today’s AI prediction</p>
          </div>
          <button
            onClick={() => setActiveTab('routes')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>Generate Routes for Predictions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Centre</th>
                <th className="px-4 py-3">Last 7-day average</th>
                <th className="px-4 py-3">Yesterday Litres</th>
                <th className="px-4 py-3">Predicted Litres</th>
                <th className="px-4 py-3">Delta</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Reason / Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {predictions.map((p) => {
                const diff = p.predicted_litres - p.avg_7_day_litres;
                const pct = ((diff / p.avg_7_day_litres) * 100).toFixed(1);
                const isPositive = diff >= 0;

                return (
                  <tr 
                    key={p.centre_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      p.risk === 'high' ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.centre_id === 'VLC_02' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                            Surge
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{p.avg_7_day_litres} L</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{p.yesterday_litres} L</td>
                    <td className="px-4 py-3 font-bold font-mono text-sky-400 text-sm">
                      {p.predicted_litres} L
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isPositive ? `+${diff.toFixed(0)} L (+${pct}%)` : `${diff.toFixed(0)} L (${pct}%)`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.risk === 'high' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          High
                        </span>
                      ) : p.risk === 'medium' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold text-[11px]">
                          Medium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Low
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate" title={p.risk_reason}>
                      {p.risk_reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
