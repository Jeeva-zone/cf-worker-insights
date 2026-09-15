import {
  WorkerInfo,
  KpiMetrics,
  TimelineDataPoint,
  StatusCodeBreakdown,
  GeoDistributionItem,
  ClientConnectionLog,
  TimeRange,
  CloudflareGraphQLQuerySample
} from '../types';

export const WORKERS_LIST: WorkerInfo[] = [
  {
    id: 'my-production-worker',
    name: 'my-production-worker',
    environment: 'production',
    status: 'Active',
    subdomain: 'prod-api.workers.dev',
    routes: ['api.example.com/*', 'edge.example.com/v1/*'],
    lastDeployed: '14 minutes ago',
    version: 'v2.8.4 (commit #9b2fc4e)',
    compatibilityDate: '2024-09-23',
    usageModel: 'Standard',
    cpuLimitMs: 10
  },
  {
    id: 'auth-gateway-edge',
    name: 'auth-gateway-edge',
    environment: 'production',
    status: 'Active',
    subdomain: 'auth-edge.workers.dev',
    routes: ['auth.example.com/*'],
    lastDeployed: '2 hours ago',
    version: 'v1.4.2 (commit #7ca83d1)',
    compatibilityDate: '2024-08-15',
    usageModel: 'Standard',
    cpuLimitMs: 10
  },
  {
    id: 'image-resizer-worker',
    name: 'image-resizer-worker',
    environment: 'production',
    status: 'Active',
    subdomain: 'media-cdn.workers.dev',
    routes: ['images.example.com/resize/*'],
    lastDeployed: '1 day ago',
    version: 'v3.1.0 (commit #1fa38bc)',
    compatibilityDate: '2024-09-01',
    usageModel: 'Standard',
    cpuLimitMs: 10
  },
  {
    id: 'api-cache-proxy',
    name: 'api-cache-proxy',
    environment: 'staging',
    status: 'Maintenance',
    subdomain: 'staging-proxy.workers.dev',
    routes: ['staging-api.example.com/*'],
    lastDeployed: '3 days ago',
    version: 'v0.9.1-beta',
    compatibilityDate: '2024-07-20',
    usageModel: 'Standard',
    cpuLimitMs: 10
  }
];

export function getKpiMetrics(range: TimeRange, workerId: string): KpiMetrics {
  const isAltWorker = workerId !== 'my-production-worker';
  const multiplier = range === '1h' ? 0.08 : range === '24h' ? 1 : range === '7d' ? 6.8 : 28.5;
  const baseInvocations = isAltWorker ? 112000 : 284500;
  
  // Calculate remaining time until 00:00 UTC
  const now = new Date();
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = utcMidnight.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const resetCountdown = `${diffHours}h ${diffMins}m`;

  const dailyUsed = isAltWorker ? 43190 : 68420;

  return {
    dailyQuotaUsed: dailyUsed,
    dailyQuotaMax: 100000,
    dailyQuotaResetsIn: resetCountdown,
    totalInvocations: Math.round(baseInvocations * multiplier),
    invocationsChangePercent: isAltWorker ? -3.4 : 14.8,
    avgCpuMs: isAltWorker ? 1.62 : 2.18,
    p99CpuMs: isAltWorker ? 6.45 : 7.84,
    cpuBudgetMs: 10.0,
    cpuBreachCount: 0,
    successRate: isAltWorker ? 99.65 : 99.12,
    clientErrorRate: isAltWorker ? 0.28 : 0.74,
    workerExceptionRate: isAltWorker ? 0.07 : 0.14
  };
}

export function generateTimelineData(range: TimeRange, workerId: string): TimelineDataPoint[] {
  const points: TimelineDataPoint[] = [];
  const count = range === '1h' ? 30 : range === '24h' ? 24 : range === '7d' ? 28 : 30;
  const baseScale = workerId === 'my-production-worker' ? 1.0 : 0.65;

  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    let pointTime: Date;
    let timeLabel: string;
    let fullDate: string;

    if (range === '1h') {
      pointTime = new Date(now.getTime() - i * 2 * 60 * 1000);
      timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      fullDate = pointTime.toLocaleTimeString();
    } else if (range === '24h') {
      pointTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      fullDate = pointTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else if (range === '7d') {
      pointTime = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      fullDate = pointTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' });
    } else {
      pointTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
      fullDate = pointTime.toLocaleDateString([], { month: 'long', day: 'numeric' });
    }

    // Realistic traffic wave pattern with peak hours
    const wave = Math.sin((count - i) / 3.5) * 0.35 + Math.cos((count - i) / 2) * 0.15 + 1.1;
    const baseRequests = Math.round(
      (range === '1h' ? 420 : range === '24h' ? 11800 : range === '7d' ? 64000 : 92000) * baseScale * wave
    );

    // Errors (mostly 2xx, low 4xx, tiny 5xx)
    const status4xx = Math.max(2, Math.round(baseRequests * (0.007 + Math.random() * 0.004)));
    const status5xx = Math.max(0, Math.round(baseRequests * (0.0012 + (i % 7 === 0 ? 0.0025 : 0))));
    const status2xx = Math.max(0, baseRequests - status4xx - status5xx);

    // CPU Percentiles in ms (budget 10ms)
    // Add realistic jitter
    const p50 = +(1.8 + Math.sin(i / 2) * 0.3 + Math.random() * 0.25).toFixed(2);
    const p90 = +(4.2 + Math.cos(i / 2.5) * 0.5 + Math.random() * 0.4).toFixed(2);
    const p99 = +(7.4 + Math.sin(i / 4) * 0.8 + Math.random() * 0.6).toFixed(2);
    const avgCpu = +(2.1 + Math.sin(i / 3) * 0.2).toFixed(2);

    points.push({
      timestamp: pointTime.toISOString(),
      timeLabel,
      fullDate,
      status2xx,
      status4xx,
      status5xx,
      total: baseRequests,
      p50Latency: p50,
      p90Latency: p90,
      p99Latency: p99,
      avgCpu
    });
  }

  return points;
}

export const STATUS_CODES_DATA: StatusCodeBreakdown[] = [
  {
    code: 200,
    label: '200 OK',
    name: 'Successful Responses',
    count: 246820,
    percentage: 98.42,
    color: '#10b981', // emerald
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Requests executed successfully and returned healthy responses'
  },
  {
    code: 429,
    label: '429 Rate Limited',
    name: 'Rate Limit Throttled',
    count: 1845,
    percentage: 0.74,
    color: '#f59e0b', // amber
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Throttled by edge rate limiting rules or KV threshold quotas'
  },
  {
    code: 500,
    label: '500 Internal Error',
    name: 'Origin / Script Error',
    count: 1140,
    percentage: 0.45,
    color: '#ef4444', // red
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Unhandled runtime execution failure or broken upstream origin'
  },
  {
    code: 1042,
    label: '1042 Worker Exception',
    name: 'Worker Runtime CPU / Mem Exception',
    count: 382,
    percentage: 0.15,
    color: '#a855f7', // purple
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Cloudflare Worker memory limit exceeded or V8 isolate crash'
  },
  {
    code: 304,
    label: '304 Not Modified',
    name: 'Edge Cache Validated',
    count: 610,
    percentage: 0.24,
    color: '#06b6d4', // cyan
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Client cache hit served instantly without origin compute'
  }
];

export const GEO_DISTRIBUTION_DATA: GeoDistributionItem[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', requests: 114820, percentage: 46.1, avgLatencyMs: 14.2 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', requests: 38400, percentage: 15.4, avgLatencyMs: 18.5 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', requests: 27900, percentage: 11.2, avgLatencyMs: 16.8 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', requests: 21850, percentage: 8.8, avgLatencyMs: 22.1 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', requests: 14600, percentage: 5.9, avgLatencyMs: 24.3 },
  { code: 'FR', name: 'France', flag: '🇫🇷', requests: 11200, percentage: 4.5, avgLatencyMs: 19.1 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', requests: 9400, percentage: 3.8, avgLatencyMs: 28.7 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', requests: 6250, percentage: 2.5, avgLatencyMs: 36.4 },
  { code: 'IN', name: 'India', flag: '🇮🇳', requests: 4500, percentage: 1.8, avgLatencyMs: 31.2 }
];

export const INITIAL_CLIENT_LOGS: ClientConnectionLog[] = [
  {
    id: 'log-1',
    timestamp: 'Just now',
    timeAgo: '4s ago',
    clientIp: '198.51.100.***',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    browser: 'Chrome 129 / macOS',
    device: 'Desktop',
    country: 'United States',
    countryCode: 'US',
    method: 'GET',
    path: '/api/v1/user/profile',
    statusCode: 200,
    statusText: 'OK',
    cpuTimeMs: 1.84,
    rayId: '8ca19ef29ac034a1-SJC',
    colo: 'SJC',
    coloCity: 'San Jose, CA',
    tlsVersion: 'TLSv1.3',
    asn: 'AS13335 Cloudflare',
    cacheStatus: 'HIT'
  },
  {
    id: 'log-2',
    timestamp: '6s ago',
    timeAgo: '6s ago',
    clientIp: '203.0.113.***',
    userAgent: 'curl/8.4.0 (x86_64-apple-darwin23.0)',
    browser: 'curl 8.4.0',
    device: 'CLI / Bot',
    country: 'Germany',
    countryCode: 'DE',
    method: 'POST',
    path: '/api/v1/auth/tokens',
    statusCode: 200,
    statusText: 'OK',
    cpuTimeMs: 3.42,
    rayId: '8ca19ef89e2118f4-FRA',
    colo: 'FRA',
    coloCity: 'Frankfurt',
    tlsVersion: 'TLSv1.3',
    asn: 'AS3320 Deutsche Telekom',
    cacheStatus: 'DYNAMIC'
  },
  {
    id: 'log-3',
    timestamp: '12s ago',
    timeAgo: '12s ago',
    clientIp: '192.0.2.***',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X)',
    browser: 'Mobile Safari 17 / iOS',
    device: 'Mobile',
    country: 'Japan',
    countryCode: 'JP',
    method: 'GET',
    path: '/cdn/assets/bundle.js',
    statusCode: 304,
    statusText: 'Not Modified',
    cpuTimeMs: 0.72,
    rayId: '8ca19f01ab3378d2-NRT',
    colo: 'NRT',
    coloCity: 'Tokyo Narita',
    tlsVersion: 'TLSv1.3',
    asn: 'AS4713 OCN',
    cacheStatus: 'HIT'
  },
  {
    id: 'log-4',
    timestamp: '19s ago',
    timeAgo: '19s ago',
    clientIp: '198.51.100.***',
    userAgent: 'python-requests/2.31.0',
    browser: 'Python Requests / Automated',
    device: 'Bot',
    country: 'United States',
    countryCode: 'US',
    method: 'POST',
    path: '/api/v1/bulk/sync',
    statusCode: 429,
    statusText: 'Rate Limited',
    cpuTimeMs: 1.15,
    rayId: '8ca19f09fc9810a9-IAD',
    colo: 'IAD',
    coloCity: 'Ashburn, VA',
    tlsVersion: 'TLSv1.3',
    asn: 'AS16509 Amazon.com',
    cacheStatus: 'BYPASS'
  },
  {
    id: 'log-5',
    timestamp: '25s ago',
    timeAgo: '25s ago',
    clientIp: '203.0.113.***',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
    browser: 'Firefox 130 / Windows',
    device: 'Desktop',
    country: 'United Kingdom',
    countryCode: 'GB',
    method: 'GET',
    path: '/api/v1/search?q=cloudflare+workers',
    statusCode: 200,
    statusText: 'OK',
    cpuTimeMs: 2.89,
    rayId: '8ca19f15de0249c3-LHR',
    colo: 'LHR',
    coloCity: 'London Heathrow',
    tlsVersion: 'TLSv1.3',
    asn: 'AS2856 BT',
    cacheStatus: 'DYNAMIC'
  },
  {
    id: 'log-6',
    timestamp: '34s ago',
    timeAgo: '34s ago',
    clientIp: '192.0.2.***',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
    browser: 'Chrome Mobile 128 / Android',
    device: 'Mobile',
    country: 'Singapore',
    countryCode: 'SG',
    method: 'POST',
    path: '/api/v1/upload/telemetry',
    statusCode: 500,
    statusText: 'Internal Error',
    cpuTimeMs: 9.12,
    rayId: '8ca19f20ab7155a0-SIN',
    colo: 'SIN',
    coloCity: 'Singapore',
    tlsVersion: 'TLSv1.3',
    asn: 'AS4657 StarHub',
    cacheStatus: 'DYNAMIC'
  },
  {
    id: 'log-7',
    timestamp: '42s ago',
    timeAgo: '42s ago',
    clientIp: '198.51.100.***',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    browser: 'Safari 17 / macOS',
    device: 'Desktop',
    country: 'France',
    countryCode: 'FR',
    method: 'GET',
    path: '/health',
    statusCode: 200,
    statusText: 'OK',
    cpuTimeMs: 0.65,
    rayId: '8ca19f2ab99120e7-CDG',
    colo: 'CDG',
    coloCity: 'Paris Charles de Gaulle',
    tlsVersion: 'TLSv1.3',
    asn: 'AS3215 Orange',
    cacheStatus: 'HIT'
  },
  {
    id: 'log-8',
    timestamp: '58s ago',
    timeAgo: '58s ago',
    clientIp: '203.0.113.***',
    userAgent: 'Go-http-client/1.1',
    browser: 'Go HTTP Client',
    device: 'Microservice',
    country: 'Australia',
    countryCode: 'AU',
    method: 'POST',
    path: '/api/v1/heavy/transform',
    statusCode: 1042,
    statusText: 'Worker Exception',
    cpuTimeMs: 10.45,
    rayId: '8ca19f39aa1098df-SYD',
    colo: 'SYD',
    coloCity: 'Sydney',
    tlsVersion: 'TLSv1.3',
    asn: 'AS1221 Telstra',
    cacheStatus: 'DYNAMIC'
  }
];

export function createRandomLog(): ClientConnectionLog {
  const paths = [
    '/api/v1/user/profile',
    '/api/v1/auth/session',
    '/api/v1/products/list',
    '/api/v1/checkout/verify',
    '/health',
    '/cdn/cache/manifest.json',
    '/graphql',
    '/api/v1/search?term=fast+dns'
  ];

  const countries = [
    { country: 'United States', countryCode: 'US', colo: 'SJC', coloCity: 'San Jose, CA', asn: 'AS13335 Cloudflare' },
    { country: 'Germany', countryCode: 'DE', colo: 'FRA', coloCity: 'Frankfurt', asn: 'AS3320 Deutsche Telekom' },
    { country: 'Japan', countryCode: 'JP', colo: 'NRT', coloCity: 'Tokyo Narita', asn: 'AS4713 OCN' },
    { country: 'United Kingdom', countryCode: 'GB', colo: 'LHR', coloCity: 'London Heathrow', asn: 'AS2856 BT' },
    { country: 'Singapore', countryCode: 'SG', colo: 'SIN', coloCity: 'Singapore', asn: 'AS4657 StarHub' }
  ];

  const methods: ('GET' | 'POST' | 'PUT' | 'OPTIONS')[] = ['GET', 'GET', 'GET', 'POST', 'POST', 'OPTIONS'];
  const geo = countries[Math.floor(Math.random() * countries.length)];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];

  // Status distributions: 96% 200, 2% 429, 1.5% 500, 0.5% 1042
  const rand = Math.random();
  let statusCode = 200;
  let statusText = 'OK';
  let cpuTime = +(1.2 + Math.random() * 2.8).toFixed(2);

  if (rand > 0.985) {
    statusCode = 1042;
    statusText = 'Worker Exception';
    cpuTime = +(9.8 + Math.random() * 1.5).toFixed(2);
  } else if (rand > 0.965) {
    statusCode = 500;
    statusText = 'Internal Error';
    cpuTime = +(6.2 + Math.random() * 3.5).toFixed(2);
  } else if (rand > 0.94) {
    statusCode = 429;
    statusText = 'Rate Limited';
    cpuTime = +(0.9 + Math.random() * 0.8).toFixed(2);
  } else if (rand > 0.88 && method === 'GET') {
    statusCode = 304;
    statusText = 'Not Modified';
    cpuTime = +(0.4 + Math.random() * 0.4).toFixed(2);
  }

  const hexRandom = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 8);
  const rayId = `${hexRandom}-${geo.colo}`;

  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: 'Just now',
    timeAgo: 'Just now',
    clientIp: `${Math.floor(Math.random() * 180 + 20)}.${Math.floor(Math.random() * 200)}.***.***`,
    userAgent: 'Mozilla/5.0 (Worker Edge Client; v2.8)',
    browser: 'Edge Client v2.8',
    device: 'Desktop',
    country: geo.country,
    countryCode: geo.countryCode,
    method,
    path,
    statusCode,
    statusText,
    cpuTimeMs: cpuTime,
    rayId,
    colo: geo.colo,
    coloCity: geo.coloCity,
    tlsVersion: 'TLSv1.3',
    asn: geo.asn,
    cacheStatus: statusCode === 304 ? 'HIT' : statusCode === 200 && Math.random() > 0.5 ? 'HIT' : 'DYNAMIC'
  };
}

export function getMockGraphQLQuerySample(workerName: string): CloudflareGraphQLQuerySample {
  return {
    query: `query GetWorkerInvocationsAdaptive(
  $accountTag: String!
  $filter: WorkersInvocationsAdaptiveFilter_InputObject!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      workersInvocationsAdaptive(
        limit: 1000
        filter: $filter
        orderBy: [datetimeHour_ASC]
      ) {
        dimensions {
          datetimeHour
          scriptName
          status
        }
        sum {
          requests
          errors
          subrequests
        }
        quantiles {
          cpuTimeP50
          cpuTimeP90
          cpuTimeP99
        }
      }
    }
  }
}`,
    variables: {
      accountTag: "d8c919a71b29a1b023f4bce9410ef74a",
      filter: {
        scriptName: workerName,
        datetime_geq: "2026-09-14T00:00:00Z",
        datetime_leq: "2026-09-15T14:24:00Z"
      }
    },
    responsePayload: {
      data: {
        viewer: {
          accounts: [
            {
              workersInvocationsAdaptive: [
                {
                  dimensions: {
                    datetimeHour: "2026-09-15T13:00:00Z",
                    scriptName: workerName,
                    status: "success"
                  },
                  sum: {
                    requests: 12490,
                    errors: 18,
                    subrequests: 24980
                  },
                  quantiles: {
                    cpuTimeP50: 1.84,
                    cpuTimeP90: 4.21,
                    cpuTimeP99: 7.62
                  }
                },
                {
                  dimensions: {
                    datetimeHour: "2026-09-15T14:00:00Z",
                    scriptName: workerName,
                    status: "success"
                  },
                  sum: {
                    requests: 14120,
                    errors: 22,
                    subrequests: 28240
                  },
                  quantiles: {
                    cpuTimeP50: 1.91,
                    cpuTimeP90: 4.35,
                    cpuTimeP99: 7.84
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };
}
