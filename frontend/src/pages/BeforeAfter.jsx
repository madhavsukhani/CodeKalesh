import React from 'react';
import { ArrowLeftRight, CheckCircle2, Sparkles, XCircle } from 'lucide-react';

const comparisonRows = [
  {
    metric: 'Total transit distance',
    before: '126 km',
    after: '92 km',
    improvement: '34 km saved',
    detail: 'Routes cluster nearby collection centres instead of repeating empty-road travel.',
  },
  {
    metric: 'Late collection stops',
    before: '2 stops',
    after: '0 stops',
    improvement: '100% on time',
    detail: 'Morning collection windows are respected before routes return to the MCC.',
  },
  {
    metric: 'Fleet capacity utilization',
    before: '68%',
    after: '91%',
    improvement: '+23%',
    detail: 'Forecasted volume is distributed across both available tankers.',
  },
  {
    metric: 'Monthly diesel expense',
    before: 'INR 97,200',
    after: 'INR 70,972',
    improvement: 'INR 26,228 saved',
    detail: 'Estimated from the shorter daily dispatch distance.',
  },
  {
    metric: 'Milk waiting risk',
    before: 'High',
    after: 'Low',
    improvement: 'Freshness protected',
    detail: 'High-volume centres are prioritized for earlier collection.',
  },
];

export default function BeforeAfter() {
  return (
    <div className="space-y-6 pb-12">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Operational impact</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Before vs After: Static Route vs MilkRouter Route
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          A focused view of what changes when collection planning uses predicted volume and route capacity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
            <XCircle className="h-4 w-4" /> Static route
          </div>
          <div className="mt-3 text-2xl font-bold text-white">126 km</div>
          <p className="mt-1 text-xs text-slate-400">Longer travel with two late stops.</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> MilkRouter route
          </div>
          <div className="mt-3 text-2xl font-bold text-white">92 km</div>
          <p className="mt-1 text-xs text-slate-400">Optimized distance with zero late stops.</p>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
            <ArrowLeftRight className="h-4 w-4" /> Net improvement
          </div>
          <div className="mt-3 text-2xl font-bold text-white">34 km</div>
          <p className="mt-1 text-xs text-slate-400">Saved per daily dispatch cycle.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-bold text-white">Operational comparison</h2>
          <p className="mt-1 text-xs text-slate-400">The measurable effect of optimized collection planning.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Before</th>
                <th className="px-4 py-3">After</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Why it matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {comparisonRows.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-white">{row.metric}</td>
                  <td className="px-4 py-3 text-slate-400">{row.before}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-300">{row.after}</td>
                  <td className="px-4 py-3 font-semibold text-sky-300">{row.improvement}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-400">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}