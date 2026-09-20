import React, { useState } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  RotateCw, 
} from 'lucide-react';
import RouteMap from '../components/RouteMap';

export default function Routes({ 
  routes = [], 
  onReoptimize, 
  isOptimizing,
  currentUser
}) {
  const isDriver = currentUser?.role === 'driver';
  const driverVanId = currentUser?.van_id;
  const visibleRoutes = isDriver
    ? routes.filter((route) => route.vehicle_id === driverVanId)
    : routes;
  const [selectedVan, setSelectedVan] = useState('all');
  const activeSelectedVan = isDriver ? driverVanId : selectedVan;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isDriver ? 'My Collection Route' : 'Optimized Dispatch & Multi-Van Routes'}
          </h1>
          <p className="text-xs text-slate-400">
            {isDriver
              ? 'Your assigned stops, collection windows, and current tanker load.'
              : 'Capacitated vehicle routing respecting morning village collection windows and vehicle limits.'}
          </p>
        </div>

        {!isDriver && <div className="flex items-center gap-3">
          {/* Van Filter Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedVan('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedVan === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Vans
            </button>
            <button
              onClick={() => setSelectedVan('VAN_01')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedVan === 'VAN_01' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Van 1 (Blue)
            </button>
            <button
              onClick={() => setSelectedVan('VAN_02')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedVan === 'VAN_02' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Van 2 (Emerald)
            </button>
          </div>

          <button
            onClick={onReoptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Re-run Optimizer'}</span>
          </button>
        </div>}
      </div>

      {/* Interactive Leaflet Map */}
      <RouteMap routes={visibleRoutes} selectedVan={activeSelectedVan} />

      {/* Van Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleRoutes.map((route) => {
          if (activeSelectedVan !== 'all' && route.vehicle_id !== activeSelectedVan) return null;

          const isVan1 = route.vehicle_id === 'VAN_01';
          const themeBorder = isVan1 ? 'border-blue-500/30' : 'border-emerald-500/30';
          const themeBadge = isVan1 ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400';

          return (
            <div 
              key={route.vehicle_id}
              className={`rounded-2xl bg-slate-900/80 border ${themeBorder} p-5 shadow-xl backdrop-blur-sm space-y-4`}
            >
              {/* Van Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${themeBadge} border border-current`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{route.vehicle_name}</h3>
                    <p className="text-xs text-slate-400">
                      Departs MCC Rajpura at 05:00 AM • Return: ~07:35 AM
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-white">{route.distance_km} km</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">0 Late Stops</div>
                </div>
              </div>

              {/* Tanker Load Meter */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Tanker Load Utilization:</span>
                  <span className="font-bold text-white">
                    {route.predicted_load_litres} / {route.capacity_litres} L ({route.utilization_percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isVan1 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, route.utilization_percent)}%` }}
                  />
                </div>
                {route.predicted_load_litres > route.capacity_litres * 0.9 && (
                  <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Near capacity threshold (over 90% full)</span>
                  </div>
                )}
              </div>

              {/* Sequence Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Stop Sequence ({route.stop_details?.length || 0} Centres)
                </div>

                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {route.stop_details?.map((stop, sIdx) => (
                    <div 
                      key={stop.stop_id}
                      className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full ${isVan1 ? 'bg-blue-600' : 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-[10px]`}>
                          {sIdx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            <span>{stop.name}</span>
                            {stop.is_completed && (
                              <span className="text-emerald-400 font-bold text-[10px]">✓ Done</span>
                            )}
                            {stop.is_opportunistic && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                ⚡ Dynamic Pickup (&le;80% Return)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Window: {stop.arrival_window}</span>
                            <span>•</span>
                            <span className="text-sky-400 font-medium">ETA: {stop.estimated_arrival}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sky-400 font-mono">
                          {stop.predicted_litres} L
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Load: {stop.current_load_litres}L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
