import React, { useState, useEffect } from 'react';
import { CircleAlert, RefreshCw, Truck, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchReassignments } from '../api';

export default function ReroutingAuditPanel({ currentUser }) {
  const [reassignments, setReassignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchReassignments();
      setReassignments(res.reassignments || []);
    } catch (err) {
      console.error('Failed to load reassignments audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5s for live supervisor updates
    return () => clearInterval(interval);
  }, []);

  const totalStrandedLitres = reassignments.reduce((sum, r) => sum + (r.stranded_litres || 0), 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Supervisor Audit Console
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Real-Time Log</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <CircleAlert className="w-5 h-5 text-amber-400" />
            <span>Dynamic Fleet Rerouting & Stop Transfer Audit</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitors stops automatically reassigned when a vehicle fills up or reaches remaining capacity limit mid-route.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh Audit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Total Rerouted Stops</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{reassignments.length} Stops</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Volume Re-balanced</div>
          <div className="text-xl font-black text-sky-400 mt-0.5">{Math.round(totalStrandedLitres)} Litres</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Target Rescuer Fleet</div>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Van 2 & 2nd Run Active</span>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {reassignments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Village Centre</th>
                <th className="px-3 py-2.5">Original Van</th>
                <th className="px-3 py-2.5">Reassigned Rescuer</th>
                <th className="px-3 py-2.5">Volume</th>
                <th className="px-3 py-2.5">ETA</th>
                <th className="px-3 py-2.5">AI Routing Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {reassignments.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-3 font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{item.name || item.centre_id}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px]">
                      {item.original_van_id || 'VAN_01'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                      item.is_second_run
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      <Truck className="w-3 h-3" />
                      <span>{item.assigned_van_name}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono font-bold text-sky-400">
                    {item.stranded_litres} L
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.estimated_arrival}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-300 max-w-xs leading-snug italic">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Rerouting Events Triggered Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All trucks are operating within predicted capacity. Once a driver completes a collection that exceeds remaining tanker space, the auto-rerouting audit log will populate here in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
