import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Milk, 
  ArrowRight, 
  ShieldCheck, 
  Send, 
  X, 
  ShieldAlert, 
  Sparkles,
  Zap,
  RefreshCw,
  CircleAlert
} from 'lucide-react';
import { completeStop } from '../api';

export default function DriverView({ 
  routes = [], 
  onStopCompleted,
  currentUser
}) {
  const [activeVanId, setActiveVanId] = useState(currentUser?.van_id || 'VAN_01');

  React.useEffect(() => {
    if (currentUser?.van_id) {
      setActiveVanId(currentUser.van_id);
    }
  }, [currentUser]);
  const [modalOpen, setModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [actualLitres, setActualLitres] = useState(455);
  const [issueReason, setIssueReason] = useState('Road Access Blocked');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [backendError, setBackendError] = useState(null);
  // Overflow reassignment state
  const [overflowPlan, setOverflowPlan] = useState(null);  // null | { vanName, overflowLitres, reassignments[] }
  const [reassignedCentreIds, setReassignedCentreIds] = useState(new Set());

  const activeRoute = routes.find((r) => r.vehicle_id === activeVanId) || routes[0];
  const stops = activeRoute?.stop_details || [];

  // Find the first uncompleted stop that has NOT been reassigned to another van/run
  const uncompletedPendingStops = stops.filter((s) => !s.is_completed && !reassignedCentreIds.has(s.centre_id));
  const nextStop = uncompletedPendingStops[0] || null;
  const completedStops = stops.filter((s) => s.is_completed);

  // Dynamic driver tanker calculation
  const totalCapacity = activeRoute?.capacity_litres || 2500;
  
  // Calculate current actual load on this van
  const currentLoad = completedStops.reduce(
    (sum, s) => sum + (s.actual_litres !== null && s.actual_litres !== undefined ? s.actual_litres : (s.predicted_litres || 0)), 
    0
  );

  // Overload calculation for the stop being edited
  const otherLoadOnVan = completedStops
    .filter((s) => s.stop_id !== nextStop?.stop_id)
    .reduce((sum, s) => sum + (s.actual_litres || s.predicted_litres || 0), 0);

  const remainingCapacity = Math.max(0, Math.round(totalCapacity - otherLoadOnVan));
  const isInputOverloaded = Number(actualLitres) > remainingCapacity;
  const overloadExcess = isInputOverloaded ? Math.round(Number(actualLitres) - remainingCapacity) : 0;

  // Check if van is returning with <= 80% capacity
  const loadPercentage = Math.round((currentLoad / totalCapacity) * 100);
  const hasLowLoadOpportunity = loadPercentage <= 80 && stops.some((s) => s.is_opportunistic);

  const handleOpenMarkCollected = () => {
    if (nextStop) {
      setActualLitres(nextStop.predicted_litres || 238);
      setBackendError(null);
      setModalOpen(true);
    }
  };

  const handleConfirmCollection = async () => {
    if (!nextStop) return;

    setIsSubmitting(true);
    setBackendError(null);
    try {
      const result = await completeStop(nextStop.stop_id, actualLitres, 'Collected on time');
      setModalOpen(false);

      if (result.status === 'overflow_reassigned') {
        // Van filled up or reached capacity limit for next stop — show reassignment plan
        const stranded = new Set((result.reassignment_plan || []).map(r => r.centre_id));
        setReassignedCentreIds(prev => new Set([...prev, ...stranded]));
        setOverflowPlan({
          vanName: result.overflowed_van_name || 'Van',
          collectedLitres: result.actual_litres,
          overflowLitres: result.overflow_litres || 0,
          stopName: nextStop.name,
          reassignments: result.reassignment_plan || [],
        });

        const alertMsg = result.overflow_litres > 0
          ? `⚠️ Van full at ${nextStop.name} — ${result.actual_litres}L collected, ${result.overflow_litres}L left behind. Auto-reassignment activated!`
          : `🚨 Capacity limit reached at ${nextStop.name} (${result.actual_litres}L collected). Next stop exceeds remaining space — Auto-reassignment activated!`;
        setFeedbackMsg(alertMsg);
      } else {
        setFeedbackMsg(`✓ Recorded ${result.actual_litres} L collected from ${nextStop.name}!`);
      }

      if (onStopCompleted) await onStopCompleted();
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err) {
      console.error(err);
      setBackendError(err.message || 'Failed to complete stop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    setIsSubmitting(true);
    try {
      setFeedbackMsg(`⚠️ Issue flagged to MCC Rajpura dispatcher: "${issueReason}"`);
      setIssueModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-16">
      {/* Mobile Driver Header */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Driver In-Cab Console</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GPS Connected • MCC Rajpura Hub</span>
            </div>
          </div>
        </div>

        {/* Van Selector */}
        <select
          value={activeVanId}
          onChange={(e) => setActiveVanId(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-sky-500"
        >
          <option value="VAN_01">Van 1 (Eicher Pro - Blue)</option>
          <option value="VAN_02">Van 2 (Tata 407 - Emerald)</option>
        </select>
      </div>

      {/* Dynamic Opportunistic Return Banner if <=80% */}
      {hasLowLoadOpportunity && !overflowPlan && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs shadow-lg animate-in fade-in space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Dynamic AI Route Re-planning Active (&le;80% Return Load)</span>
          </div>
          <p className="text-[11px] text-slate-300">
            This truck is returning with spare capacity ({loadPercentage}% load). An additional village collection point has been dynamically added to your return path to maximize trip efficiency!
          </p>
        </div>
      )}

      {/* ===== VAN OVERFLOW REASSIGNMENT ALERT ===== */}
      {overflowPlan && (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-amber-500/50 animate-in fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500/30 via-orange-500/25 to-amber-500/30 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <CircleAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300 uppercase tracking-wider">🚨 Van Full — Auto Reassignment Activated</div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {overflowPlan.vanName} collected <strong className="text-white">{overflowPlan.collectedLitres}L</strong> at {overflowPlan.stopName} —
                  <span className="text-amber-300 font-semibold">
                    {overflowPlan.overflowLitres > 0
                      ? ` ${overflowPlan.overflowLitres}L left behind at VLC`
                      : ' Remaining space insufficient for next stop'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOverflowPlan(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Reassignment Cards */}
          <div className="bg-slate-900/95 p-3 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              {overflowPlan.reassignments.length} stranded stop(s) automatically reassigned:
            </div>

            {overflowPlan.reassignments.map((item, i) => (
              <div
                key={item.centre_id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  item.is_second_run
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : 'bg-sky-500/10 border-sky-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-sky-400" />
                    {item.name}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.is_second_run
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {item.is_second_run ? '🔄 2nd Run' : '➡️ Redirected'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Truck className="w-3 h-3" />
                    <span className="font-semibold">{item.assigned_van_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3" />
                    <span>ETA: <strong className={item.can_reach_in_window ? 'text-emerald-400' : 'text-amber-400'}>{item.estimated_arrival}</strong></span>
                  </div>
                  <div className="font-mono text-sky-300">{item.stranded_litres}L</div>
                </div>

                {!item.can_reach_in_window && (
                  <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Window tight — notify VLC to hold milk
                  </div>
                )}

                <div className="text-[10px] text-slate-400 italic leading-snug">
                  AI: {item.reason}
                </div>
              </div>
            ))}

            {overflowPlan.reassignments.length === 0 && (
              <div className="text-xs text-slate-400 italic text-center py-2">
                All remaining stops were already completed — no reassignment needed.
              </div>
            )}
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Driver Prompt Spec Card */}
      {nextStop ? (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
          {/* Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase tracking-wider">
                {activeVanId === 'VAN_01' ? 'Van 1' : 'Van 2'} Active Stop
              </span>
              {nextStop.is_opportunistic && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  ⚡ Dynamic Pickup
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              ETA: {nextStop.estimated_arrival}
            </span>
          </div>

          {/* Stop Name & Location */}
          <div>
            <div className="text-xs font-semibold text-slate-400">Next Destination:</div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {nextStop.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Village Level Collection Centre (VLC)</span>
            </div>
          </div>

          {/* 2 Key Metric Boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium">Expected Collection</div>
              <div className="mt-1 text-2xl font-extrabold text-sky-400">
                {nextStop.predicted_litres} <span className="text-sm text-slate-300 font-semibold">L</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium">Arrival Window</div>
              <div className="mt-1 text-sm font-bold text-emerald-400 flex items-center gap-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{nextStop.arrival_window} AM</span>
              </div>
            </div>
          </div>

          {/* Current Tank Load Progress with Overload Guard */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Tanker Load & Overload Guard
              </span>
              <span className="text-white font-mono">
                {Math.round(currentLoad)} / {Math.round(totalCapacity)} L
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  loadPercentage > 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, (currentLoad / totalCapacity) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{loadPercentage}% Tank Fill</span>
              <span className="font-semibold text-sky-400">
                Remaining Safe Space: {Math.max(0, Math.round(totalCapacity - currentLoad))} L
              </span>
            </div>
          </div>

          {/* Big Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleOpenMarkCollected}
              className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Collected</span>
            </button>

            <button
              onClick={() => setIssueModalOpen(true)}
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-sm rounded-2xl border border-rose-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">All Route Stops Completed!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            All village milk collection points successfully picked up. Return to MCC Rajpura Chilling Centre for pasteurization.
          </p>
        </div>
      )}

      {/* Stop Sequence Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Van Stop Queue ({stops.length} Total)
          </h4>
          <span className="text-[11px] text-slate-400">
            Tank Capacity: {Math.round(totalCapacity)} L
          </span>
        </div>

        <div className="space-y-2">
          {stops.map((s, idx) => {
            const isReassigned = reassignedCentreIds.has(s.centre_id);
            const reassignInfo = overflowPlan?.reassignments?.find(r => r.centre_id === s.centre_id);
            return (
              <div
                key={s.stop_id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  s.is_completed
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                    : isReassigned
                      ? 'bg-amber-500/8 border-amber-500/30 text-slate-300'
                      : s.stop_id === nextStop?.stop_id
                        ? 'bg-sky-500/10 border-sky-500/40 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    s.is_completed ? 'bg-emerald-500 text-slate-950'
                    : isReassigned ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-slate-800 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {s.is_opportunistic && !isReassigned && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                          ⚡ Dynamic
                        </span>
                      )}
                      {isReassigned && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
                          ↗ {reassignInfo?.is_second_run ? '2nd Run' : `Reassigned → ${reassignInfo?.assigned_van_name?.split(' ')[0] ?? 'Other Van'}`}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">Window: {s.arrival_window}</div>
                    {isReassigned && reassignInfo && (
                      <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                        ETA: {reassignInfo.estimated_arrival} • {reassignInfo.stranded_litres}L
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sky-400">
                    {s.is_completed ? `${s.actual_litres || s.predicted_litres} L` : `${s.predicted_litres} L`}
                  </div>
                  <div className="text-[10px] font-medium">
                    {s.is_completed ? (
                      <span className="text-emerald-400 font-bold">✓ Collected</span>
                    ) : isReassigned ? (
                      <span className="text-amber-400 font-semibold">⚡ Auto-Reassigned</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark Collected Confirmation Modal with Active Overload Prevention */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Confirm Milk Intake</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Confirm litres collected from <strong className="text-white">{nextStop?.name}</strong>:
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-400">Actual Litres Loaded</label>
                <span className="text-[11px] text-slate-400">
                  Max safe room: <strong className="text-emerald-400">{remainingCapacity} L</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={actualLitres}
                  onChange={(e) => setActualLitres(e.target.value)}
                  className={`w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-950 border text-lg font-bold text-white focus:outline-none ${
                    isInputOverloaded ? 'border-rose-500 text-rose-300 focus:border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">L</span>
              </div>
            </div>

            {/* Overload Alert Warning — Inform driver that overflow will trigger reassignment */}
            {isInputOverloaded && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Van will fill up — overflow will auto-reassign remaining stops!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Entering <strong className="text-amber-300">{actualLitres} L</strong> exceeds remaining tank space by <strong className="text-amber-400">{overloadExcess} L</strong>.
                  Only <strong className="text-white">{remainingCapacity} L</strong> will be collected here.
                  The system will automatically reassign all downstream stops to the best available van.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActualLitres(remainingCapacity)}
                    className="flex-1 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Collect Only {remainingCapacity} L
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCollection}
                    className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Confirm & Auto-Reassign
                  </button>
                </div>
              </div>
            )}

            {backendError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {backendError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCollection}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : isInputOverloaded ? 'Collect & Reassign' : 'Confirm & Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Field Issue</span>
              </div>
              <button onClick={() => setIssueModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Select Issue Category</label>
              <div className="space-y-1.5 text-xs">
                {['Road Access Blocked / Flooded', 'Milk Quality Issue / High Acidity', 'Collection Centre Delay', 'Van Mechanical Breakdown'].map((issue) => (
                  <button
                    key={issue}
                    onClick={() => setIssueReason(issue)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      issueReason === issue 
                        ? 'bg-rose-500/15 border-rose-500/40 text-white font-semibold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIssueModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Send to Dispatcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
