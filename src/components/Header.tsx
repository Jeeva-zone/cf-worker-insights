import React, { useState } from 'react';
import { 
  Cloud, 
  Activity, 
  RefreshCw, 
  Sun, 
  Moon, 
  Code2, 
  ChevronDown, 
  Check, 
  Zap, 
  ExternalLink,
  Radio,
  Download
} from 'lucide-react';
import { TimeRange, AutoRefreshRate, WorkerInfo } from '../types';

interface HeaderProps {
  workers: WorkerInfo[];
  selectedWorker: WorkerInfo;
  onSelectWorker: (worker: WorkerInfo) => void;
  timeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
  autoRefresh: AutoRefreshRate;
  onChangeAutoRefresh: (rate: AutoRefreshRate) => void;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenGraphQLModal: () => void;
  isLiveConnected?: boolean;
  accountName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  workers,
  selectedWorker,
  onSelectWorker,
  timeRange,
  onChangeTimeRange,
  autoRefresh,
  onChangeAutoRefresh,
  isRefreshing,
  onManualRefresh,
  isDarkMode,
  onToggleDarkMode,
  onOpenGraphQLModal,
  isLiveConnected = true,
  accountName
}) => {
  const [workerDropdownOpen, setWorkerDropdownOpen] = useState(false);
  const [refreshDropdownOpen, setRefreshDropdownOpen] = useState(false);

  const rangeOptions: { label: string; value: TimeRange }[] = [
    { label: 'Last 1 Hour', value: '1h' },
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' }
  ];

  const refreshOptions: { label: string; value: AutoRefreshRate }[] = [
    { label: 'Off', value: 0 },
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 }
  ];

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#090d16]/90 border-slate-800/80 text-slate-100' 
        : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      {/* Upper Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Worker Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight">CF Worker Insights</h1>
                  <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    Free Tier
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Real-time edge telemetry & runtime performance
                </p>
              </div>
            </div>

            {/* Worker Status Badge */}
            <div className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
              selectedWorker.status === 'Active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  selectedWorker.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  selectedWorker.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span>Worker Status: {selectedWorker.status}</span>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Worker Selector Dropdown */}
            <div className="relative">
              <button
                id="worker-selector-button"
                onClick={() => {
                  setWorkerDropdownOpen(!workerDropdownOpen);
                  setRefreshDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600 text-slate-200'
                    : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-mono">{selectedWorker.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                  selectedWorker.environment === 'production' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {selectedWorker.environment}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {workerDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setWorkerDropdownOpen(false)} 
                  />
                  <div className={`absolute left-0 mt-1.5 w-72 rounded-xl shadow-xl border p-1.5 z-50 transition-all ${
                    isDarkMode 
                      ? 'bg-[#111726] border-slate-800 text-slate-200' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Select Cloudflare Worker
                    </div>
                    {workers.map((worker) => (
                      <button
                        key={worker.id}
                        onClick={() => {
                          onSelectWorker(worker);
                          setWorkerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          selectedWorker.id === worker.id
                            ? isDarkMode ? 'bg-slate-800/90 text-orange-400 font-semibold' : 'bg-orange-50 text-orange-700 font-semibold'
                            : isDarkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-mono truncate">{worker.name}</div>
                          <div className="text-[11px] opacity-70 truncate">{worker.routes[0]}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            worker.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                          }`}>
                            {worker.status}
                          </span>
                          {selectedWorker.id === worker.id && <Check className="w-3.5 h-3.5 text-orange-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quick Range Picker */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {rangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChangeTimeRange(opt.value)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    timeRange === opt.value
                      ? isDarkMode
                        ? 'bg-slate-800 text-slate-100 font-semibold shadow-xs'
                        : 'bg-white text-slate-900 font-semibold shadow-xs'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Auto-Refresh Toggle */}
            <div className="relative">
              <button
                id="auto-refresh-button"
                onClick={() => {
                  setRefreshDropdownOpen(!refreshDropdownOpen);
                  setWorkerDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  autoRefresh > 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : isDarkMode
                      ? 'bg-slate-900/80 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}
                title="Configure auto-refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh: {autoRefresh === 0 ? 'Off' : `${autoRefresh}s`}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {refreshDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRefreshDropdownOpen(false)} />
                  <div className={`absolute right-0 mt-1.5 w-40 rounded-xl shadow-xl border p-1 z-50 ${
                    isDarkMode ? 'bg-[#111726] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
                      Auto-Refresh Rate
                    </div>
                    {refreshOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onChangeAutoRefresh(opt.value);
                          setRefreshDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          autoRefresh === opt.value
                            ? isDarkMode ? 'bg-slate-800 text-emerald-400 font-semibold' : 'bg-slate-100 text-emerald-600 font-semibold'
                            : isDarkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {autoRefresh === opt.value && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                    <div className="border-t my-1 border-slate-700/50" />
                    <button
                      onClick={() => {
                        onManualRefresh();
                        setRefreshDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 text-orange-400 hover:bg-orange-500/10`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Now</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cloudflare Connection Indicator */}
            <button
              onClick={onOpenGraphQLModal}
              id="cloudflare-connection-indicator"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all group ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-800 hover:border-orange-500/40 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 hover:border-orange-500/40 text-slate-700'
              }`}
              title={accountName ? `Connected to Cloudflare Account: ${accountName}. Click to inspect live GraphQL query & schema.` : "Cloudflare GraphQL API connection active. Click to view GraphQL query & payload."}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-mono">{isLiveConnected ? 'CF Live API' : 'CF GraphQL'}</span>
              </div>
              <span className="text-[10px] text-slate-400">{isLiveConnected ? 'Live' : 'Cached'}</span>
              <Code2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-button"
              onClick={onToggleDarkMode}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Download .env for Vercel / Deployments */}
            <a
              href="/api/download-env"
              download=".env"
              id="download-env-button"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white' 
                  : 'bg-slate-50 border-slate-200 hover:border-blue-500/40 text-slate-700 hover:text-black'
              }`}
              title="Download .env file for Vercel, Netlify, or local deployment"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline font-mono text-[11px]">.env</span>
            </a>

          </div>
        </div>

        {/* Worker Details Sub-strip */}
        <div className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-between text-[11px] gap-2 ${
          isDarkMode ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="text-slate-500">Route:</span>
              <code className="font-mono text-orange-400 font-medium">{selectedWorker.routes[0]}</code>
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:flex items-center gap-1">
              <span className="text-slate-500">Release:</span>
              <span className="font-mono">{selectedWorker.version}</span>
            </span>
            <span className="hidden lg:inline text-slate-600">·</span>
            <span className="hidden lg:flex items-center gap-1">
              <span className="text-slate-500">Compatibility Date:</span>
              <span>{selectedWorker.compatibilityDate}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Edge SLA: <strong className="text-emerald-400">99.99%</strong></span>
            </span>
            <span className="text-slate-600">·</span>
            <span>Free Tier Ceiling: <strong className="text-slate-200 font-mono">10 ms CPU</strong></span>
          </div>
        </div>

      </div>
    </header>
  );
};
