import React, { useState } from 'react';
import { ShieldCheck, Truck, Building2, User, Key, ArrowRight, Sparkles, CheckCircle2, X } from 'lucide-react';
import { loginUser } from '../api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [usernameInput, setUsernameInput] = useState('mcc');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      id: 'mcc_supervisor',
      username: 'mcc',
      name: 'Rajesh Sharma',
      role: 'supervisor',
      roleLabel: 'MCC Rajpura Supervisor',
      vanId: null,
      icon: Building2,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      gradient: 'from-sky-500/20 to-indigo-500/20 border-sky-500/40 hover:border-sky-400',
      desc: 'Full command dashboard: live fleet map, predictions, rerouting audit & savings analytics.',
      buttonText: 'Login as MCC Supervisor',
    },
    {
      id: 'driver1',
      username: 'driver1',
      name: 'Gurdeep Singh',
      role: 'driver',
      roleLabel: 'Van 1 Driver (Eicher Pro - Blue)',
      vanId: 'VAN_01',
      icon: Truck,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 hover:border-blue-400',
      desc: 'In-cab console for Van 1. Record milk collections & trigger smart overflow reassignments.',
      buttonText: 'Login as Driver 1 (Van 1)',
    },
    {
      id: 'driver2',
      username: 'driver2',
      name: 'Harpreet Singh',
      role: 'driver',
      roleLabel: 'Van 2 Driver (Tata 407 - Emerald)',
      vanId: 'VAN_02',
      icon: Truck,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 hover:border-emerald-400',
      desc: 'In-cab console for Van 2. Automatically receives & displays stops rerouted from Van 1!',
      buttonText: 'Login as Driver 2 (Van 2)',
    },
  ];

  const handleQuickLogin = async (account) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginUser(account.username);
      onLoginSuccess(res.user || account);
      onClose();
    } catch (err) {
      // Fallback to local account object if API fails
      onLoginSuccess(account);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginUser(usernameInput, passwordInput);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg('Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Close Button if user is already logged in */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
              Role-Based Access Portal
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hackathon Multi-User Demo
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Select User Profile & Role</h2>
          <p className="text-xs text-slate-400">
            MilkRouter adapts views based on user permissions: Supervisors monitor full fleet & rerouting logs, while Drivers view cab collection consoles.
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.id}
                onClick={() => handleQuickLogin(acc)}
                className={`p-4 rounded-2xl bg-gradient-to-b ${acc.gradient} border text-left transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-lg`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {acc.name}
                    </h3>
                    <div className="text-[11px] font-semibold text-slate-300 mt-0.5">
                      {acc.roleLabel}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {acc.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-white group-hover:text-sky-300">
                  <span>Quick Login</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Login Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
            Or Sign In With ID
          </span>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-sky-400" /> Username / Account ID
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="mcc, driver1, driver2"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-sky-400" /> Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-rose-400 font-semibold">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In To Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
