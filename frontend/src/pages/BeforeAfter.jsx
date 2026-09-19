import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Fuel, 
  Leaf, 
  Coins, 
  Clock,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import RouteMap from '../components/RouteMap';

export default function BeforeAfter({ metrics, routes = [], fixedRoutes = [] }) {
  const [showMapOverlay, setShowMapOverlay] = useState(true);

  const comparisonData = [
    {
      metric: 'Total Transit Distance',
      fixed: '126 km',
      ai: '92 km',
      delta: '-34 km (-26.98%)',
      status: 'positive',
      sub: 'Direct fuel reduction by optimizing spatial clusters'
    },
    {
      metric: 'Fleet Capacity Utilization',
      fixed: '68%',
      ai: '91%',
      delta: '+23% utilization',
      status: 'positive',
      sub: 'Evenly distributes milk volume into available tankers'
    },
    {
      metric: 'Late Window Violations',
      fixed: '2 late stops',
      ai: '0 late stops',
      delta: '100% on-time',
      status: 'positive',
      sub: 'Critical morning 05:00-05:30 intake windows prioritized'
    },
    {
      metric: 'Milk Waiting & Curdling Risk',
      fixed: 'High Risk',
      ai: 'Low Risk',
      delta: 'Freshness Secured',
      status: 'positive',
      sub: 'Vans collect high-producing centres before temperature rises'
    },
    {
      metric: 'Monthly Diesel Expense',
      fixed: '₹97,200',
      ai: '₹70,972',
      delta: '₹26,228 saved/mo',
      status: 'positive',
      sub: 'Calculated at ₹90/L diesel across 2 morning runs daily'
    },
    {
      metric: 'Carbon Footprint (Daily)',
      fixed: '96.5 kg CO₂',
      ai: '70.4 kg CO₂',
      delta: '-26.1 kg CO₂/day',
      status: 'positive',
      sub: 'Reduces dairy supply chain emissions'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Proven Value Proposition for Milk Unions</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Before vs After: Static Route vs AI Dynamic Route
        </h1>
        <p className="text-xs text-slate-400">
          Comparing the legacy static milk collection schedules with AI predicted capacitated dispatch.
        </p>
      </div>

      {/* Side-by-side Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legacy Fixed Route Card */}
        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Legacy Static Schedule
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[11px] font-bold">
              Unoptimized
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">126 <span className="text-lg font-bold text-rose-400">km</span></div>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Zigzag routing causes <strong>2 late stops</strong> past morning window</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Tanker pack density only 68% (wasted space)</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>High milk spoilage risk during peak summer heat</span>
            </div>
          </div>
        </div>

        {/* AI Optimized Route Card */}
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              DoodhRoute AI Dispatch
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              Optimized
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">92 <span className="text-lg font-bold text-emerald-400">km</span></div>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>0 late stops</strong> — all 12 village points collected on-time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>91% optimal tanker utilization across both vans</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Low spoilage risk — milk arrives chilled at MCC by 07:35 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Detailed Operational Comparison</h3>
          <p className="text-xs text-slate-400">Direct benchmarks across core performance metrics</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Performance Metric</th>
                <th className="px-4 py-3">Fixed Route</th>
                <th className="px-4 py-3">AI Route</th>
                <th className="px-4 py-3">Improvement</th>
                <th className="px-4 py-3">Operational Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">{row.metric}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400 line-through decoration-rose-500/50">
                    {row.fixed}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                    {row.ai}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold font-mono text-[11px]">
                      {row.delta}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px]">{row.sub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Route Map Visualization */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Visual Route Overlay</h3>
            <p className="text-xs text-slate-400">
              Compare the Red dashed legacy zig-zag lines with the smooth solid AI routes
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showMapOverlay}
              onChange={(e) => setShowMapOverlay(e.target.checked)}
              className="rounded text-sky-500 focus:ring-0"
            />
            <span>Show Fixed Route Overlay</span>
          </label>
        </div>

        <RouteMap 
          routes={routes} 
          fixedRoutes={fixedRoutes} 
          showFixedComparison={showMapOverlay} 
        />
      </div>
    </div>
  );
}
