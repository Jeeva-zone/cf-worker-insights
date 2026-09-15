export type TimeRange = '1h' | '24h' | '7d' | '30d';

export type AutoRefreshRate = 0 | 10 | 30 | 60; // in seconds, 0 = Off

export interface WorkerInfo {
  id: string;
  name: string;
  environment: 'production' | 'staging' | 'preview';
  status: 'Active' | 'Degraded' | 'Deploying' | 'Maintenance';
  subdomain: string;
  routes: string[];
  lastDeployed: string;
  version: string;
  compatibilityDate: string;
  usageModel: 'Bundled' | 'Standard' | 'Unbound';
  cpuLimitMs: number;
}

export interface KpiMetrics {
  dailyQuotaUsed: number;
  dailyQuotaMax: number;
  dailyQuotaResetsIn: string;
  totalInvocations: number;
  invocationsChangePercent: number;
  avgCpuMs: number;
  p99CpuMs: number;
  cpuBudgetMs: number;
  cpuBreachCount: number;
  successRate: number;
  clientErrorRate: number;
  workerExceptionRate: number;
}

export interface TimelineDataPoint {
  timestamp: string;
  timeLabel: string;
  fullDate: string;
  status2xx: number;
  status4xx: number;
  status5xx: number;
  total: number;
  p50Latency: number;
  p90Latency: number;
  p99Latency: number;
  avgCpu: number;
}

export interface StatusCodeBreakdown {
  code: number;
  label: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  badgeClass: string;
  description: string;
}

export interface GeoDistributionItem {
  code: string;
  name: string;
  flag: string;
  requests: number;
  percentage: number;
  avgLatencyMs: number;
}

export interface ClientConnectionLog {
  id: string;
  timestamp: string;
  timeAgo: string;
  clientIp: string;
  userAgent: string;
  browser: string;
  device: string;
  country: string;
  countryCode: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  path: string;
  statusCode: number;
  statusText: string;
  cpuTimeMs: number;
  rayId: string;
  colo: string;
  coloCity: string;
  tlsVersion: string;
  asn: string;
  cacheStatus: 'HIT' | 'MISS' | 'DYNAMIC' | 'BYPASS';
}

export interface CloudflareGraphQLQuerySample {
  query: string;
  variables: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
}
