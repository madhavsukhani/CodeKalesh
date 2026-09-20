import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  TrendingUp, 
  MapPin, 
  ArrowLeftRight, 
  RotateCcw,
  Milk,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onReset, currentUser, onOpenLogin }) {
  const isSupervisor = currentUser?.role === 'supervisor';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabs = [
    ...(isSupervisor ? [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'upload', label: 'Data Upload', icon: UploadCloud },
      { id: 'predictions', label: 'Milk Predictions', icon: TrendingUp },
    ] : []),
    { id: 'routes', label: 'Smart Routes', icon: MapPin },
    { id: 'beforeafter', label: 'Before / After', icon: ArrowLeftRight },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(isSupervisor ? 'dashboard' : 'routes')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Milk className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  MilkRouter
                </span>
              </div>
            </div>
          </div>

          {/* Account and menu controls */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 transition-all text-left cursor-pointer group"
                title="Click to switch role or login as different user"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentUser.avatar_color || 'from-sky-500 to-indigo-600'} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold leading-tight">
                    {currentUser.role_label || currentUser.role}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 group-hover:bg-sky-500/20">
                  Switch Role
                </span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-slate-300 transition-colors"
              title="Open navigation menu"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/30"
            aria-label="Close navigation menu"
          />
          <aside className="relative ml-auto h-full w-72 max-w-[85vw] bg-white border-l border-slate-200 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-900">MilkRouter</div>
                <div className="text-xs text-slate-500 mt-0.5">Navigation</div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Close navigation menu"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenLogin();
                }}
                className="mt-5 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${currentUser.avatar_color || 'from-sky-500 to-indigo-600'} flex items-center justify-center text-white text-sm font-bold`}>
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{currentUser.name}</div>
                  <div className="truncate text-xs text-slate-500">Switch role</div>
                </div>
              </button>
            )}

            <nav className="mt-5 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-100 text-sky-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {isSupervisor && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onReset();
                }}
                className="mt-6 flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <RotateCcw className="w-4 h-4" />
                Reset demo data
              </button>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}
