import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import Predictions from './pages/Predictions';
import Routes from './pages/Routes';
import BeforeAfter from './pages/BeforeAfter';
import LandingPage from './pages/LandingPage';
import LoginModal from './components/LoginModal';
import { 
  fetchCentres, 
  fetchPredictions, 
  fetchOptimizedRoutes, 
  fetchFixedRoutes, 
  fetchMetrics, 
  resetDemoData,
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [centres, setCentres] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [fixedRoutes, setFixedRoutes] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // RBAC User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'driver') {
      setActiveTab('routes');
      showToast(`🔑 Switched role: Logged in as ${user.name} (${user.role_label || 'Driver'})`, 'success');
    } else {
      setActiveTab('dashboard');
      showToast(`🔑 Switched role: Logged in as ${user.name} (MCC Supervisor)`, 'success');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
    try {
      const [centresData, predData, routesData, fixedData, metricsData] = await Promise.all([
        fetchCentres(),
        fetchPredictions('rf'),
        fetchOptimizedRoutes(),
        fetchFixedRoutes(),
        fetchMetrics(),
      ]);

      setCentres(centresData.centres || []);
      setPredictions(predData.predictions || []);
      setRoutes(routesData.routes || []);
      setFixedRoutes(fixedData.routes || []);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Connecting to backend...', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isSupervisor = currentUser.role === 'supervisor';

  const handleReset = async () => {
    try {
      await resetDemoData();
      await loadAllData();
      showToast('Reset all database records and collection logs to default', 'info');
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const handleReoptimize = async () => {
    setIsLoading(true);
    try {
      const [rData, mData] = await Promise.all([
        fetchOptimizedRoutes(),
        fetchMetrics(),
      ]);
      setRoutes(rData.routes || []);
      setMetrics(mData);
      showToast('Optimized multi-vehicle route schedule re-calculated', 'success');
    } catch (err) {
      console.error('Re-optimization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-semibold shadow-2xl text-white animate-in slide-in-from-bottom-5">
          <span className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Role Access Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* Main Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onReset={handleReset}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isSupervisor && activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics}
            predictions={predictions}
            routes={routes}
            setActiveTab={setActiveTab}
            onRunOptimization={handleReoptimize}
            currentUser={currentUser}
          />
        )}

        {isSupervisor && activeTab === 'upload' && (
          <UploadData 
            centres={centres}
            onDataReload={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {isSupervisor && activeTab === 'predictions' && (
          <Predictions 
            predictions={predictions}
            onPredictionsUpdated={(newPreds) => setPredictions(newPreds)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'routes' && (
          <Routes 
            routes={routes}
            onReoptimize={handleReoptimize}
            isOptimizing={isLoading}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'beforeafter' && (
          <BeforeAfter 
            metrics={metrics}
            routes={routes}
            fixedRoutes={fixedRoutes}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>MilkRouter • Milk Yield Prediction & Dynamic Fleet Routing</div>
          <div className="text-[11px] text-slate-600">Built for Rajpura Milk Chilling Centre (MCC_01) • 12 VLC Network</div>
        </div>
      </footer>
    </div>
  );
}
