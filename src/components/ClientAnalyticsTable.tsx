import React, { useState, useMemo } from 'react';
import { 
  ClientConnectionLog 
} from '../types';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  Laptop,
  Smartphone,
  Bot
} from 'lucide-react';

interface ClientAnalyticsTableProps {
  logs: ClientConnectionLog[];
  isDarkMode: boolean;
  selectedStatusCodeFilter: number | null;
  onClearStatusCodeFilter: () => void;
  selectedCountryFilter: string | null;
  onClearCountryFilter: () => void;
}

type SortField = 'timestamp' | 'clientIp' | 'method' | 'statusCode' | 'cpuTimeMs';
type SortDirection = 'asc' | 'desc';

export const ClientAnalyticsTable: React.FC<ClientAnalyticsTableProps> = ({
  logs,
  isDarkMode,
  selectedStatusCodeFilter,
  onClearStatusCodeFilter,
  selectedCountryFilter,
  onClearCountryFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedRayId, setCopiedRayId] = useState<string | null>(null);

  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80'
    : 'bg-white border-slate-200/80';

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleCopyRayId = (rayId: string) => {
    navigator.clipboard.writeText(rayId);
    setCopiedRayId(rayId);
    setTimeout(() => setCopiedRayId(null), 2000);
  };

  // Filter and sort logs
  const filteredAndSortedLogs = useMemo(() => {
    return logs.filter((log) => {
      // Global search
      const matchesSearch = 
        log.clientIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.rayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.colo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.statusCode.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      // Method filter
      if (methodFilter !== 'ALL' && log.method !== methodFilter) {
        return false;
      }

      // External status code filter from chart
      if (selectedStatusCodeFilter !== null && log.statusCode !== selectedStatusCodeFilter) {
        return false;
      }

      // External country filter from geo chart
      if (selectedCountryFilter !== null && log.countryCode !== selectedCountryFilter) {
        return false;
      }

      // Local status filter
      if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
      if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
      if (statusFilter === '5xx' && log.statusCode < 500) return false;
      if (statusFilter === 'ERRORS' && log.statusCode < 400) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'statusCode') {
        comparison = a.statusCode - b.statusCode;
      } else if (sortField === 'cpuTimeMs') {
        comparison = a.cpuTimeMs - b.cpuTimeMs;
      } else if (sortField === 'clientIp') {
        comparison = a.clientIp.localeCompare(b.clientIp);
      } else if (sortField === 'method') {
        comparison = a.method.localeCompare(b.method);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [logs, searchTerm, methodFilter, statusFilter, selectedStatusCodeFilter, selectedCountryFilter, sortField, sortDirection]);

  // Method Badge color
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Status Badge color
  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (code >= 300 && code < 400) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    } else if (code >= 400 && code < 500) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (code === 1042) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    } else {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
    if (device === 'Bot' || device === 'CLI / Bot') return <Bot className="w-3.5 h-3.5 text-amber-400" />;
    return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div id="client-analytics-table-container" className={`rounded-xl border p-4 transition-all ${cardBgClass}`}>
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-700/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">Client Analytics & Edge Invocations</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
              {filteredAndSortedLogs.length} events
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time incoming connection stream with Cloudflare Ray ID & V8 isolate runtime diagnostics
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Active Filter Pills */}
          {selectedStatusCodeFilter && (
            <span className="text-xs px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center gap-1.5 font-mono">
              <span>Status: {selectedStatusCodeFilter}</span>
              <button onClick={onClearStatusCodeFilter} className="hover:text-white font-bold ml-1">×</button>
            </span>
          )}

          {selectedCountryFilter && (
            <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1.5 font-mono">
              <span>Country: {selectedCountryFilter}</span>
              <button onClick={onClearCountryFilter} className="hover:text-white font-bold ml-1">×</button>
            </span>
          )}

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              id="client-logs-search"
              type="text"
              placeholder="Search IP, route, colo, Ray..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 focus:border-orange-500 text-slate-200 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 focus:border-orange-500 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Method Filter */}
          <select
            id="method-filter-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          {/* Status Quick Filter */}
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Err</option>
            <option value="5xx">5xx & 1042</option>
            <option value="ERRORS">Errors Only</option>
          </select>

        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2 -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse min-w-[780px]">
          <thead>
            <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
              isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/40' : 'border-slate-200 text-slate-500 bg-slate-50'
            }`}>
              <th className="py-2.5 px-3 w-8"></th>
              
              <th 
                className="py-2.5 px-3 cursor-pointer select-none hover:text-orange-400"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  {sortField === 'timestamp' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                </div>
              </th>

              <th 
                className="py-2.5 px-3 cursor-pointer select-none hover:text-orange-400"
                onClick={() => handleSort('clientIp')}
              >
                <div className="flex items-center gap-1">
                  <span>Client IP (Masked)</span>
                  {sortField === 'clientIp' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                </div>
              </th>

              <th className="py-2.5 px-3">
                <span>User-Agent / Device</span>
              </th>

              <th className="py-2.5 px-3">
                <span>Country & Colo</span>
              </th>

              <th 
                className="py-2.5 px-3 cursor-pointer select-none hover:text-orange-400"
                onClick={() => handleSort('method')}
              >
                <div className="flex items-center gap-1">
                  <span>Method / Path</span>
                  {sortField === 'method' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                </div>
              </th>

              <th 
                className="py-2.5 px-3 cursor-pointer select-none hover:text-orange-400"
                onClick={() => handleSort('statusCode')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === 'statusCode' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                </div>
              </th>

              <th 
                className="py-2.5 px-3 cursor-pointer select-none hover:text-orange-400 text-right"
                onClick={() => handleSort('cpuTimeMs')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CPU Time</span>
                  {sortField === 'cpuTimeMs' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/40 font-mono">
            {filteredAndSortedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  No connection records matched your filter criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedLogs.map((log) => {
                const isExpanded = expandedRowId === log.id;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded
                          ? isDarkMode ? 'bg-slate-800/60' : 'bg-orange-50/50'
                          : isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Expand Arrow */}
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.timeAgo}
                      </td>

                      {/* Client IP */}
                      <td className="py-2.5 px-3 font-semibold text-slate-300">
                        {log.clientIp}
                      </td>

                      {/* User Agent */}
                      <td className="py-2.5 px-3 font-sans max-w-[200px]">
                        <div className="flex items-center gap-1.5 truncate">
                          {getDeviceIcon(log.device)}
                          <span className="truncate text-slate-300" title={log.userAgent}>
                            {log.browser}
                          </span>
                        </div>
                      </td>

                      {/* Country & Colo */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-500/10 text-orange-400 font-semibold">
                            {log.colo}
                          </span>
                          <span className="text-slate-300 truncate">{log.country}</span>
                        </div>
                      </td>

                      {/* Method / Path */}
                      <td className="py-2.5 px-3 max-w-[240px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase ${getMethodBadge(log.method)}`}>
                            {log.method}
                          </span>
                          <span className="truncate text-slate-300 font-sans" title={log.path}>
                            {log.path}
                          </span>
                        </div>
                      </td>

                      {/* Status Code */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(log.statusCode)}`}>
                          <span>{log.statusCode}</span>
                          <span className="text-[10px] font-normal hidden xl:inline">{log.statusText}</span>
                        </span>
                      </td>

                      {/* CPU Time */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-semibold ${
                          log.cpuTimeMs >= 10 
                            ? 'text-rose-400' 
                            : log.cpuTimeMs >= 7 
                              ? 'text-amber-400' 
                              : 'text-slate-300'
                        }`}>
                          {log.cpuTimeMs} ms
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Inspection Drawer */}
                    {isExpanded && (
                      <tr className={isDarkMode ? 'bg-slate-900/90' : 'bg-slate-100/70'}>
                        <td colSpan={8} className="p-4 border-y border-slate-700/40">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                            
                            {/* Column 1: Cloudflare Ray ID & Security */}
                            <div className="space-y-2">
                              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-orange-500" />
                                <span>Cloudflare Ray ID</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="p-1.5 rounded bg-black/40 font-mono text-orange-400 text-[11px] border border-slate-700/50 flex-1 truncate">
                                  {log.rayId}
                                </code>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyRayId(log.rayId);
                                  }}
                                  className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                  title="Copy CF Ray ID"
                                >
                                  {copiedRayId === log.rayId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                TLS Protocol: <strong className="text-slate-200 font-mono">{log.tlsVersion}</strong> · Autonomous System: <strong className="text-slate-200 font-mono">{log.asn}</strong>
                              </div>
                            </div>

                            {/* Column 2: Colo & Edge Route */}
                            <div className="space-y-2">
                              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-orange-500" />
                                <span>Edge Location & Cache</span>
                              </div>
                              <div className="p-2 rounded bg-black/20 border border-slate-700/40 space-y-1 text-[11px]">
                                <div>Colo City: <strong className="text-slate-200">{log.coloCity} ({log.colo})</strong></div>
                                <div>Edge Cache State: <span className="font-mono text-cyan-400 font-semibold">{log.cacheStatus}</span></div>
                                <div>Device Fingerprint: <span className="text-slate-300">{log.browser}</span></div>
                              </div>
                            </div>

                            {/* Column 3: Full User Agent & Diagnostics */}
                            <div className="space-y-2">
                              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                Raw User-Agent Header
                              </div>
                              <p className="p-2 rounded bg-black/40 border border-slate-700/50 font-mono text-[10px] text-slate-300 break-all">
                                {log.userAgent}
                              </p>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Isolate Budget: 10 ms</span>
                                <span className={log.cpuTimeMs <= 10 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-bold'}>
                                  {log.cpuTimeMs <= 10 ? 'Budget OK' : 'Limit Exceeded'}
                                </span>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
