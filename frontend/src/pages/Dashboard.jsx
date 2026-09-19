import React from 'react';
import { 
  Building2, 
  Milk, 
  Truck, 
  Navigation, 
  Percent, 
  AlertTriangle, 
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import RouteMap from '../components/RouteMap';
import ExplanationCard from '../components/ExplanationCard';

export default function Dashboard({ 
  metrics, 
  predictions = [], 
  routes = [], 
  setActiveTab, 
  onRunOptimization 
}) {
  const atRiskCentre = predictions.find((p) => p.risk === 'high') || {
    name: 'Kheri VLC',
    predicted_litres: 455,
    avg_7_day_litres: 390,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Morning Shift Dispatch • 20 Sep 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dairy Collection Ops Hub
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              AI milk volume forecasts coupled with dynamic capacitated vehicle routing for Rajpura Milk Union.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('predictions')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 shadow transition-all cursor-pointer"
            >
              View Yield Forecasts
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Inspect Live Routes</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Total Centres"
          value={metrics?.total_centres || 12}
          unit="VLCs"
          subtitle="Punjab Dairy Belt"
          icon={Building2}
          badgeColor="sky"
        />
        <MetricCard
          title="Predicted Milk"
          value="4,350"
          unit="L"
          subtitle="Morning Intake"
          icon={Milk}
          trend="+12% vs last week"
          badgeColor="indigo"
        />
        <MetricCard
          title="Vehicles Available"
          value={metrics?.vehicles_used || 2}
          unit="Vans"
          subtitle="100% Operational"
          icon={Truck}
          badgeColor="emerald"
        />
        <MetricCard
          title="Optimized Dist."
          value={metrics?.optimized_distance_km || 92}
          unit="km"
          subtitle="vs 126 km fixed"
          icon={Navigation}
          trend="-34 km saved"
          badgeColor="emerald"
        />
        <MetricCard
          title="Estimated Savings"
          value={metrics?.distance_reduction_percent ? `${Math.round(metrics.distance_reduction_percent)}%` : '27%'}
          unit="fuel"
          subtitle="₹26,200/mo"
          icon={Percent}
          trend="Saved"
          badgeColor="amber"
        />
        <MetricCard
          title="At-Risk Centres"
          value={metrics?.at_risk_centres || 1}
          unit="VLC"
          subtitle="Spike Alert"
          icon={AlertTriangle}
          trend="Requires Guard"
          badgeColor="rose"
        />
      </div>

      {/* Main Content Grid: Map & Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              Full Details <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => setActiveTab('driver')}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Launch Driver Handheld View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Explanation Module */}
      {metrics?.explanations && (
        <ExplanationCard explanations={metrics.explanations} />
      )}
    </div>
  );
}
