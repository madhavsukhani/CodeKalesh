import React from 'react';
import { 
  Building2, 
  Milk, 
  Navigation, 
  AlertTriangle, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import RouteMap from '../components/RouteMap';

function SummaryMetric({ label, value, unit, note, accent = 'text-sky-400' }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div>
        <div className="text-xs font-semibold text-slate-300">{label}</div>
        <div className="mt-0.5 text-xl font-bold tracking-tight text-white">
          {value} <span className={`text-sm font-semibold ${accent}`}>{unit}</span>
        </div>
      </div>
      <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{note}</span>
    </div>
  );
}

export default function Dashboard({ 
  metrics, 
  predictions = [], 
  routes = [], 
  setActiveTab, 
}) {
  const atRiskCentre = predictions.find((p) => p.risk === 'high') || {
    name: 'Kheri VLC',
    predicted_litres: 455,
    avg_7_day_litres: 390,
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">Morning dispatch</p>
          <h1 className="mt-1 text-xl font-bold text-white tracking-tight">Dairy Collection Ops Hub</h1>
        </div>
        <button
          onClick={() => setActiveTab('routes')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          Inspect live routes <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key operational metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-sky-500/20 bg-slate-900/70 px-4 py-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
            <span className="rounded-lg bg-sky-500/15 p-1.5 text-sky-300"><Building2 className="h-4 w-4" /></span> Network
          </div>
          <SummaryMetric label="Collection centres" value={metrics?.total_centres || 12} unit="VLCs" note="Punjab Dairy Belt" />
          <div className="border-t border-slate-800" />
          <SummaryMetric label="Vehicles available" value={metrics?.vehicles_used || 2} unit="Vans" note="100% operational" accent="text-emerald-400" />
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-slate-900/70 px-4 py-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
            <span className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-300"><Milk className="h-4 w-4" /></span> Morning forecast
          </div>
          <SummaryMetric label="Predicted milk" value="4,350" unit="L" note="+12% vs last week" accent="text-indigo-300" />
          <div className="border-t border-slate-800" />
          <SummaryMetric label="At-risk centres" value={metrics?.at_risk_centres || 1} unit="VLC" note="Requires guard" accent="text-rose-400" />
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-slate-900/70 px-4 py-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
            <span className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-300"><Navigation className="h-4 w-4" /></span> Route impact
          </div>
          <SummaryMetric label="Optimized distance" value={metrics?.optimized_distance_km || 92} unit="km" note="34 km saved" accent="text-emerald-400" />
          <div className="border-t border-slate-800" />
          <SummaryMetric label="Estimated savings" value={metrics?.distance_reduction_percent ? `${Math.round(metrics.distance_reduction_percent)}%` : '27%'} unit="fuel" note="₹26,200 / month" accent="text-amber-300" />
        </div>
      </div>

      {/* Main Content Grid: Map & Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Route Map Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Optimized Fleet Map</h2>
              <p className="text-xs text-slate-400">Real-time geographic clusters for Van 1 and Van 2</p>
            </div>
            <button
              onClick={() => setActiveTab('routes')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              Full details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RouteMap routes={routes} />
        </div>

        {/* Right Sidebar: At-Risk Warning & Quick Fleet Overview */}
        <div className="space-y-4">
          {/* At-Risk Warning Card */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Volume Spike Alert</span>
            </div>
            <h3 className="text-base font-bold text-white">{atRiskCentre.name}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Predicted yield today is <strong className="text-amber-300">{atRiskCentre.predicted_litres} L</strong> (historical 7-day average: {atRiskCentre.avg_7_day_litres} L).
              High volume spike creates overflow risk.
            </p>
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Mitigation:</span>
              <span className="font-semibold text-emerald-400">Assigned Early on Van 1</span>
            </div>
          </div>

          {/* Van Status Summary Cards */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fleet Assignment Status
            </h3>

            {routes.map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">{r.vehicle_name}</span>
                  <span className="text-emerald-400 font-semibold">{r.distance_km} km</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
                  <div 
                    className={`h-full ${i === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, r.utilization_percent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Load: {r.predicted_load_litres} / {r.capacity_litres} L</span>
                  <span>{r.utilization_percent}% Fill</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => setActiveTab('routes')}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Open Smart Routes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
