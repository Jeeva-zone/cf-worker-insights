import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { InvocationsAreaChart } from './components/InvocationsAreaChart';
import { LatencyLineChart } from './components/LatencyLineChart';
import { StatusCodeDonutChart } from './components/StatusCodeDonutChart';
import { GeoDistribution } from './components/GeoDistribution';
import { ClientAnalyticsTable } from './components/ClientAnalyticsTable';
import { GraphQLModal } from './components/GraphQLModal';

import {
  WORKERS_LIST,
  getKpiMetrics,
  generateTimelineData,
  STATUS_CODES_DATA,
  GEO_DISTRIBUTION_DATA,
  INITIAL_CLIENT_LOGS,
  createRandomLog,
  getMockGraphQLQuerySample
} from './data/mockData';

import { 
  TimeRange, 
  AutoRefreshRate, 
  WorkerInfo, 
  ClientConnectionLog, 
  StatusCodeBreakdown, 
  GeoDistributionItem,
  CloudflareGraphQLQuerySample
} from './types';
import { AlertCircle, CheckCircle2, Cloud, Sparkles } from 'lucide-react';

export default function App() {
  // Theme state: defaults to sleek dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Workers list (starts with defaults, updated from live API)
  const [workersList, setWorkersList] = useState<WorkerInfo[]>(WORKERS_LIST);
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo>(WORKERS_LIST[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [autoRefresh, setAutoRefresh] = useState<AutoRefreshRate>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Cloudflare connection status
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [accountInfo, setAccountInfo] = useState<{ id: string; name: string } | null>(null);

  // Interactive cross-chart filters
  const [selectedStatusCodeFilter, setSelectedStatusCodeFilter] = useState<number | null>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);

  // GraphQL inspection modal
  const [isGraphQLModalOpen, setIsGraphQLModalOpen] = useState<boolean>(false);
  const [graphQLSample, setGraphQLSample] = useState<CloudflareGraphQLQuerySample>(() => 
    getMockGraphQLQuerySample(WORKERS_LIST[0].name)
  );

  // Notifications / Alert toast
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Data states
  const [metrics, setMetrics] = useState(() => getKpiMetrics('24h', WORKERS_LIST[0].id));
  const [timelineData, setTimelineData] = useState(() => generateTimelineData('24h', WORKERS_LIST[0].id));
  const [statusCodesData, setStatusCodesData] = useState<StatusCodeBreakdown[]>(STATUS_CODES_DATA);
  const [geoDistributionData, setGeoDistributionData] = useState<GeoDistributionItem[]>(GEO_DISTRIBUTION_DATA);
  const [clientLogs, setClientLogs] = useState<ClientConnectionLog[]>(INITIAL_CLIENT_LOGS);

  // 1. Initial Load: Check Cloudflare connection and load real workers
  useEffect(() => {
    async function initCloudflare() {
      try {
        const [statusRes, workersRes] = await Promise.all([
          fetch('/api/cloudflare/status'),
          fetch('/api/cloudflare/workers')
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.connected) {
            setIsLiveConnected(true);
            setAccountInfo({
              id: statusData.accountId,
              name: statusData.accountName
            });
            setBannerNotice(`⚡ Connected to live Cloudflare Account: ${statusData.accountName}`);
            setTimeout(() => setBannerNotice(null), 6000);
          }
        }

        if (workersRes.ok) {
          const workersData = await workersRes.json();
          if (workersData.success && Array.isArray(workersData.workers) && workersData.workers.length > 0) {
            setWorkersList(workersData.workers);
            setSelectedWorker(workersData.workers[0]);
          }
        }
      } catch (err) {
        console.warn('Could not connect to live Cloudflare API endpoint, using fallback state:', err);
      }
    }

    initCloudflare();
  }, []);

  // 2. Fetch metrics function (either live from Cloudflare GraphQL or simulated fallback)
  const fetchMetricsData = useCallback(async (worker: WorkerInfo, range: TimeRange) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/cloudflare/metrics?scriptName=${encodeURIComponent(worker.name)}&timeRange=${range}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.kpi) setMetrics(data.kpi);
          if (data.timeline && data.timeline.length > 0) setTimelineData(data.timeline);
          if (data.statusCodes && data.statusCodes.length > 0) setStatusCodesData(data.statusCodes);
          if (data.geoDistribution && data.geoDistribution.length > 0) setGeoDistributionData(data.geoDistribution);
          if (data.recentLogs && data.recentLogs.length > 0) setClientLogs(data.recentLogs);
          setIsLiveConnected(true);
          setIsRefreshing(false);
          return;
        }
      }
    } catch {
      // fallback to mock data generator
    }

    // Fallback if live endpoint unavailable or returns empty
    const newMetrics = getKpiMetrics(range, worker.id);
    const newTimeline = generateTimelineData(range, worker.id);
    setMetrics(newMetrics);
    setTimelineData(newTimeline);
    setStatusCodesData(STATUS_CODES_DATA);
    setGeoDistributionData(GEO_DISTRIBUTION_DATA);
    setIsRefreshing(false);
  }, []);

  // Synchronize metrics whenever selected worker or time range changes
  useEffect(() => {
    fetchMetricsData(selectedWorker, timeRange);

    // Also update GraphQL sample query
    fetch(`/api/cloudflare/query-sample?scriptName=${encodeURIComponent(selectedWorker.name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.query) {
          setGraphQLSample({
            query: data.query,
            variables: data.variables,
            responsePayload: {
              data: {
                viewer: {
                  accounts: [
                    {
                      accountTag: data.accountTag,
                      workersInvocationsAdaptive: [
                        {
                          sum: { requests: metrics.totalInvocations, cpuTimeUs: metrics.avgCpuMs * 1000 },
                          quantiles: { cpuTimeP50: metrics.avgCpuMs * 1000, cpuTimeP99: metrics.p99CpuMs * 1000 },
                          dimensions: { scriptName: selectedWorker.name, status: "success" }
                        }
                      ]
                    }
                  ]
                }
              }
            }
          });
        }
      })
      .catch(() => {
        setGraphQLSample(getMockGraphQLQuerySample(selectedWorker.name));
      });
  }, [selectedWorker, timeRange, fetchMetricsData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefresh === 0) return;

    const interval = setInterval(() => {
      // Either re-fetch live metrics or stream simulated live requests
      if (isLiveConnected) {
        fetchMetricsData(selectedWorker, timeRange);
      } else {
        setIsRefreshing(true);
        const newLog1 = createRandomLog();
        const newLog2 = createRandomLog();
        setClientLogs((prev) => [newLog1, newLog2, ...prev.slice(0, 38)]);
        setMetrics((prev) => ({
          ...prev,
          dailyQuotaUsed: Math.min(prev.dailyQuotaMax, prev.dailyQuotaUsed + 2),
          totalInvocations: prev.totalInvocations + 2
        }));
        setTimeout(() => setIsRefreshing(false), 350);
      }
    }, autoRefresh * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, isLiveConnected, selectedWorker, timeRange, fetchMetricsData]);

  // Manual refresh trigger
  const handleManualRefresh = useCallback(() => {
    fetchMetricsData(selectedWorker, timeRange);
  }, [selectedWorker, timeRange, fetchMetricsData]);

  // Simulate synthetic traffic spike
  const handleTriggerTrafficBurst = () => {
    setMetrics((prev) => ({
      ...prev,
      dailyQuotaUsed: Math.min(prev.dailyQuotaMax, prev.dailyQuotaUsed + 480),
      totalInvocations: prev.totalInvocations + 480
    }));

    // Add high-speed incoming logs
    const bursts = [createRandomLog(), createRandomLog(), createRandomLog(), createRandomLog()];
    setClientLogs((prev) => [...bursts, ...prev.slice(0, 36)]);

    setBannerNotice('Traffic Burst Injected: +480 requests registered across edge isolates.');
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Simulate 1042 worker exception
  const handleSimulateWorkerException = () => {
    const errorLog: ClientConnectionLog = {
      id: `err-${Date.now()}`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      clientIp: '198.51.100.21',
      userAgent: 'Mozilla/5.0 (V8 Isolate Crash Trigger)',
      browser: 'Isolate Crash Simulator',
      device: 'Bot',
      country: 'United States',
      countryCode: 'US',
      method: 'POST',
      path: '/api/v1/heavy/transform',
      statusCode: 1042,
      statusText: 'Worker Exception',
      cpuTimeMs: 10.85, // Exceeds 10ms budget!
      rayId: `8ca19fc471b092-SJC`,
      colo: 'SJC',
      coloCity: 'San Jose, CA',
      tlsVersion: 'TLSv1.3',
      asn: 'AS13335 Cloudflare',
      cacheStatus: 'DYNAMIC'
    };

    setClientLogs((prev) => [errorLog, ...prev.slice(0, 39)]);
    setSelectedStatusCodeFilter(1042);
    setBannerNotice('Worker Exception 1042 triggered! CPU Limit exceeded 10.0ms.');
    setTimeout(() => setBannerNotice(null), 5000);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-[#090d16] text-[#f1f5f9]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* Header & Controls Navigation */}
      <Header
        workers={workersList}
        selectedWorker={selectedWorker}
        onSelectWorker={(worker) => setSelectedWorker(worker)}
        timeRange={timeRange}
        onChangeTimeRange={(r) => setTimeRange(r)}
        autoRefresh={autoRefresh}
        onChangeAutoRefresh={(rate) => setAutoRefresh(rate)}
        isRefreshing={isRefreshing}
        onManualRefresh={handleManualRefresh}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenGraphQLModal={() => setIsGraphQLModalOpen(true)}
        isLiveConnected={isLiveConnected}
        accountName={accountInfo?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        
        {/* Synthetic Notice Banner (if triggered) */}
        {bannerNotice && (
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs flex items-center justify-between animate-fadeIn shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-orange-400 hover:text-white font-bold ml-3 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Section 2: High-Level KPI Summary Cards (Top Row) */}
        <KpiSummaryCards metrics={metrics} isDarkMode={isDarkMode} />

        {/* Section 3: Main Data Visualizations & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InvocationsAreaChart data={timelineData} isDarkMode={isDarkMode} />
          <LatencyLineChart data={timelineData} isDarkMode={isDarkMode} />
        </div>

        {/* Section 4: Breakdown & Geo Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatusCodeDonutChart
            data={statusCodesData}
            isDarkMode={isDarkMode}
            selectedCode={selectedStatusCodeFilter}
            onSelectStatusCode={(code) => setSelectedStatusCodeFilter(code)}
          />
          <GeoDistribution
            data={geoDistributionData}
            isDarkMode={isDarkMode}
            selectedCountry={selectedCountryFilter}
            onSelectCountry={(country) => setSelectedCountryFilter(country)}
          />
        </div>

        {/* Section 4.2: Client Analytics Table */}
        <ClientAnalyticsTable
          logs={clientLogs}
          isDarkMode={isDarkMode}
          selectedStatusCodeFilter={selectedStatusCodeFilter}
          onClearStatusCodeFilter={() => setSelectedStatusCodeFilter(null)}
          selectedCountryFilter={selectedCountryFilter}
          onClearCountryFilter={() => setSelectedCountryFilter(null)}
        />

      </main>

      {/* Sleek Minimal Dashboard Footer */}
      <footer className={`border-t py-4 text-xs transition-colors ${
        isDarkMode ? 'border-slate-800/80 text-slate-500 bg-[#090d16]' : 'border-slate-200 text-slate-400 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloudflare Workers Isolate Runtime (v8)</span>
            <span className="text-slate-600">·</span>
            <span>{isLiveConnected ? `Live Account: ${accountInfo?.name || 'Active'}` : 'Anycast Edge DNS Active'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Daily Free Tier Limit: <strong className="font-mono text-slate-400">100,000 req / day</strong></span>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => setIsGraphQLModalOpen(true)}
              className="text-orange-400 hover:underline font-mono cursor-pointer"
            >
              Inspect GraphQL Schema
            </button>
          </div>
        </div>
      </footer>

      {/* Cloudflare GraphQL API Modal */}
      <GraphQLModal
        isOpen={isGraphQLModalOpen}
        onClose={() => setIsGraphQLModalOpen(false)}
        sample={graphQLSample}
        isDarkMode={isDarkMode}
        onTriggerTrafficBurst={handleTriggerTrafficBurst}
        onSimulateWorkerException={handleSimulateWorkerException}
      />

    </div>
  );
}
