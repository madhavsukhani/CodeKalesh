import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  TrendingUp, 
  MapPin, 
  ArrowLeftRight, 
  Smartphone, 
  Zap, 
  RotateCcw,
  Milk
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onQuickDemo, onReset, isDemoLoading }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Data Upload', icon: UploadCloud },
    { id: 'predictions', label: 'Milk Predictions', icon: TrendingUp },
    { id: 'routes', label: 'Smart Routes', icon: MapPin },
    { id: 'beforeafter', label: 'Before / After', icon: ArrowLeftRight },
    { id: 'driver', label: 'Driver View', icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Milk className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  DoodhRoute
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  AI Dynamic Routing
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Dairy Logistics & Yield Optimizer</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-semibold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Runs data load, prediction, and routing in 1-click for hackathon presentation"
            >
              <Zap className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
              <span>{isDemoLoading ? 'Running...' : '1-Click Demo'}</span>
            </button>

            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="Reset to clean demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800/60 gap-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium ${
                isActive
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
