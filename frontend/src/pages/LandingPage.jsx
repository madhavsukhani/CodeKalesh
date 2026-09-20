import React from 'react';
import { 
  Building2, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Milk, 
  Lock,
} from 'lucide-react';
import { loginUser } from '../api';

export default function LandingPage({ onLoginSuccess }) {
  const sampleRoles = [
    {
      id: 'mcc_supervisor',
      username: 'mcc',
      name: 'Rajesh Sharma',
      role: 'supervisor',
      roleLabel: 'MCC Rajpura Supervisor',
      vanId: null,
      icon: Building2,
      badge: 'Hub Command Center',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      gradient: 'from-sky-500/20 via-slate-900 to-indigo-500/20 border-sky-500/40 hover:border-sky-400',
      desc: 'Access full operational control: live 12-VLC fleet map, milk volume predictions, dynamic rerouting audit log & fuel savings metrics.',
      buttonText: 'Login as MCC Supervisor',
      buttonBg: 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20',
    },
    {
      id: 'driver1',
      username: 'driver1',
      name: 'Gurdeep Singh',
      role: 'driver',
      roleLabel: 'Van 1 Driver (Eicher Pro - Blue)',
      vanId: 'VAN_01',
      icon: Truck,
      badge: 'South-West Route Driver',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      gradient: 'from-blue-500/20 via-slate-900 to-cyan-500/20 border-blue-500/40 hover:border-blue-400',
      desc: 'In-cab console for Van 1 (Rampura, Kheri, Alampur loop). Record collections & trigger dynamic overflow reassignments.',
      buttonText: 'Login as Driver 1 (Van 1)',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-blue-500/20',
    },
    {
      id: 'driver2',
      username: 'driver2',
      name: 'Harpreet Singh',
      role: 'driver',
      roleLabel: 'Van 2 Driver (Tata 407 - Emerald)',
      vanId: 'VAN_02',
      icon: Truck,
      badge: 'North-East Route Rescuer',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      gradient: 'from-emerald-500/20 via-slate-900 to-teal-500/20 border-emerald-500/40 hover:border-emerald-400',
      desc: 'In-cab console for Van 2. Automatically receives & displays stops dynamically rerouted from Van 1 when capacity limits are hit.',
      buttonText: 'Login as Driver 2 (Van 2)',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 font-black',
    },
  ];

  const handleRoleSelect = async (account) => {
    try {
      const res = await loginUser(account.username);
      onLoginSuccess(res.user || account);
    } catch (err) {
      onLoginSuccess(account);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Unauthenticated Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Milk className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  MilkRouter
                </span>
                <p className="text-[11px] text-slate-400">Rajpura Milk Chilling Union (MCC_01)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Authentication Required To Access Control Room
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Landing Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Hero Banner */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Milk Yield Forecasting & Dynamic Fleet Rerouting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Optimize Village Milk Collections <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              With Zero Tanker Overflows
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Predict daily milk yields across 12 Punjab Village Collection Centres (VLCs), prevent vehicle overloads, and dynamically reroute stranded milk shipments in real-time.
          </p>
        </div>

        {/* ROLE SELECTION CARDS - PROMINENT LOGIN PORTAL */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" />
              <span>Select Your Role To Enter Platform</span>
            </h2>
            <p className="text-xs text-slate-400">
              Please sign in with one of the pre-configured accounts below to access operational details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {sampleRoles.map((acc) => {
              const Icon = acc.icon;
              return (
                <div
                  key={acc.id}
                  className={`p-6 rounded-3xl bg-slate-900/90 border border-slate-800 ${acc.gradient} text-left transition-all duration-300 hover:-translate-y-1.5 shadow-2xl flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-white shadow-md">
                        <Icon className="w-6 h-6 text-sky-400" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                        {acc.name}
                      </h3>
                      <div className="text-xs font-bold text-slate-300 mt-0.5">
                        {acc.roleLabel}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {acc.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleRoleSelect(acc)}
                      className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${acc.buttonBg}`}
                    >
                      <span>{acc.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>MilkRouter • Milk Yield Prediction & Dynamic Fleet Routing</div>
          <div className="text-[11px] text-slate-600 font-mono">Rajpura Milk Chilling Centre (MCC_01) • 12 VLC Punjab Network</div>
        </div>
      </footer>
    </div>
  );
}
