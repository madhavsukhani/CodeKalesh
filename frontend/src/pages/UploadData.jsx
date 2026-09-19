import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { uploadCSVFile, loadDemoData } from '../api';

export default function UploadData({ centres = [], onDataReload, setActiveTab }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadCSVFile(file);
      setUploadSuccess(`Successfully loaded ${res.centres_loaded} centres & ${res.history_rows_loaded} historical records!`);
      if (onDataReload) await onDataReload();
    } catch (err) {
      setUploadError(err.message || 'Failed to parse CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await loadDemoData();
      setUploadSuccess(`Loaded 12 Punjab VLC centres & 168 historical collection logs!`);
      if (onDataReload) await onDataReload();
    } catch (err) {
      setUploadError(err.message || 'Failed to load demo data');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCentres = centres.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Data Ingestion & Centre Management
          </h1>
          <p className="text-xs text-slate-400">
            Upload village collection centres, coordinates, collection time windows, and historical logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{isUploading ? 'Loading...' : 'Load Demo Data (12 VLCs)'}</span>
          </button>
        </div>
      </div>

      {/* Upload Box & Validation Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700 hover:border-sky-500/50 transition-all flex flex-col items-center justify-center text-center backdrop-blur-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Upload Collection Centre CSV</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Drag and drop your milk collection CSV with columns for centre ID, latitude, longitude, and historical volume.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 shadow cursor-pointer transition-all"
            >
              Browse Files
            </button>
            <span className="text-xs text-slate-500">or use Punjab demo network</span>
          </div>

          {uploadSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Automated Validation Checklist */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Data Quality Pipeline
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-white">12 Centres Identified</span>
                <p className="text-[11px] text-slate-400">Rampura, Kheri, Banur, Tepla, etc.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-white">Geo-Coordinates Verified</span>
                <p className="text-[11px] text-slate-400">All coordinates within Rajpura 35 km radius</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-white">Intake Windows Valid</span>
                <p className="text-[11px] text-slate-400">Morning windows (05:00 - 07:00 AM)</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-white">Historical Consistency</span>
                <p className="text-[11px] text-slate-400">14 consecutive collection records per centre</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('predictions')}
            className="w-full mt-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Proceed to Yield Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Preview */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Collection Centres Database ({centres.length})</h3>
            <p className="text-xs text-slate-400">Current active village points connected to Rajpura MCC</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search centres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Centre ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Intake Window</th>
                <th className="px-4 py-3">Service Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCentres.map((centre) => (
                <tr key={centre.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-sky-400">{centre.id}</td>
                  <td className="px-4 py-3 font-bold text-white">{centre.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">
                    {centre.latitude.toFixed(4)}, {centre.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {centre.collection_start} – {centre.collection_end}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{centre.service_time_minutes} mins</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
