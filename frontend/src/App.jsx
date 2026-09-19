import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import Predictions from './pages/Predictions';
import Routes from './pages/Routes';
import BeforeAfter from './pages/BeforeAfter';
import DriverView from './pages/DriverView';
import { 
  fetchCentres, 
  fetchPredictions, 
  fetchOptimizedRoutes, 
  fetchFixedRoutes, 
  fetchMetrics, 
  loadDemoData, 
  resetDemoData 
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [centres, setCentres] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [fixedRoutes, setFixedRoutes] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
    try {
      const [centresData, predData, routesData, fixedData, metricsData] = await Promise.all([
        fetchCentres(),
        fetchPredictions('weighted'),
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
    loadAllData();
  }, []);

  const handleQuickDemo = async () => {
    setIsDemoRunning(true);
    showToast('🚀 Running 1-Click Hackathon Demo Sequence...', 'info');
    try {
      // Step 1: Load demo data
      await loadDemoData();
      showToast('1/3: Loaded 12 Punjab VLC collection centres', 'info');

      // Step 2: Predict yields
      const predRes = await fetchPredictions('weighted');
      setPredictions(predRes.predictions || []);
      showToast('2/3: Forecasted 4,350 L milk volume & flagged Kheri VLC surge', 'info');

      // Step 3: Optimize routes & fetch metrics
      const [routesRes, fixedRes, metricsRes, centresRes] = await Promise.all([
        fetchOptimizedRoutes(),
        fetchFixedRoutes(),
        fetchMetrics(),
        fetchCentres(),
      ]);

      setRoutes(routesRes.routes || []);
      setFixedRoutes(fixedRes.routes || []);
      setMetrics(metricsRes);
      setCentres(centresRes.centres || []);

      showToast('🎉 Demo complete! 92 km AI routes generated (26.98% fuel savings)', 'success');
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Demo failed:', err);
      showToast('Demo encountered error: ' + err.message, 'error');
    } finally {
      setIsDemoRunning(false);
    }
  };

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

      {/* Main Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onQuickDemo={handleQuickDemo}
        onReset={handleReset}
        isDemoLoading={isDemoRunning}
      />

      {/* Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics}
            predictions={predictions}
            routes={routes}
            setActiveTab={setActiveTab}
            onRunOptimization={handleReoptimize}
          />
        )}

        {activeTab === 'upload' && (
          <UploadData 
            centres={centres}
            onDataReload={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'predictions' && (
          <Predictions 
            predictions={predictions}
            onPredictionsUpdated={(newPreds) => setPredictions(newPreds)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'routes' && (
          <Routes 
            routes={routes}
            metrics={metrics}
            onReoptimize={handleReoptimize}
            isOptimizing={isLoading}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'beforeafter' && (
          <BeforeAfter 
            metrics={metrics}
            routes={routes}
            fixedRoutes={fixedRoutes}
          />
        )}

        {activeTab === 'driver' && (
          <DriverView 
            routes={routes}
            onStopCompleted={loadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>DoodhRoute AI • Milk Yield Prediction & Dynamic Fleet Routing</div>
          <div className="text-[11px] text-slate-600">Built for Rajpura Milk Chilling Centre (MCC_01) • 12 VLC Network</div>
        </div>
      </footer>
    </div>
  );
}
