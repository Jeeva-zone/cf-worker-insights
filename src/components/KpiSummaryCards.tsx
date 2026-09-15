import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { KpiMetrics } from '../types';

interface KpiSummaryCardsProps {
  metrics: KpiMetrics;
  isDarkMode: boolean;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({ metrics, isDarkMode }) => {
  const quotaPercentage = (metrics.dailyQuotaUsed / metrics.dailyQuotaMax) * 100;
  const quotaRemaining = metrics.dailyQuotaMax - metrics.dailyQuotaUsed;

  // Arc math for the circular / semicircular quota gauge
  // SVG radius 38, circumference = 2 * PI * 38 = 238.76
  // We make a 240-degree open gauge for high-density elegance
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  // Let's use an arc of 260 degrees (0.722 of full circle)
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (arcLength * Math.min(quotaPercentage, 100)) / 100;

  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80 shadow-xs'
    : 'bg-white border-slate-200/80 shadow-xs';

  const subtextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* 1. Daily Free Tier Quota Gauge */}
      <div 
        id="kpi-daily-quota"
        className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-orange-500/40 ${cardBgClass}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}>
                Daily Free Tier Quota
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono font-medium">
                100k Limit
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight">
                {metrics.dailyQuotaUsed.toLocaleString()}
              </span>
              <span className={`text-xs font-mono ${subtextColor}`}>/ 100,000</span>
            </div>
          </div>

          {/* SVG Gauge Graphic */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 80 80">
              {/* Background track circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={isDarkMode ? 'text-slate-800' : 'text-slate-100'}
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                strokeDasharray={arcLength}
                strokeLinecap="round"
              />
              {/* Foreground progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-orange-500 transition-all duration-700 ease-out"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold font-mono text-orange-500">
                {quotaPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Readout */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-emerald-400">
              {quotaRemaining.toLocaleString()} requests remaining
            </span>
          </div>
          <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${subtextColor}`}>
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Resets at 00:00 UTC (in {metrics.dailyQuotaResetsIn})</span>
          </p>
        </div>
      </div>

      {/* 2. Total Invocations */}
      <div 
        id="kpi-total-invocations"
        className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-orange-500/40 ${cardBgClass}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}>
              Total Invocations
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight">
                {metrics.totalInvocations.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Change vs previous period */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/20 text-xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {metrics.invocationsChangePercent >= 0 ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                +{metrics.invocationsChangePercent}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-rose-400 gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {metrics.invocationsChangePercent}%
              </span>
            )}
            <span className={subtextColor}>vs previous period</span>
          </div>
          <div className="w-full bg-slate-500/10 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(15, (metrics.totalInvocations / 300000) * 100))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 3. CPU Time / Execution Duration */}
      <div 
        id="kpi-cpu-duration"
        className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-orange-500/40 ${cardBgClass}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}>
                CPU Time & Execution
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div>
                <span className="text-2xl font-bold font-mono tracking-tight">
                  {metrics.avgCpuMs}
                </span>
                <span className="text-xs font-mono ml-0.5 text-slate-400">ms avg</span>
              </div>
              <span className="text-slate-500">/</span>
              <div>
                <span className="text-lg font-bold font-mono tracking-tight text-amber-400">
                  {metrics.p99CpuMs}
                </span>
                <span className="text-xs font-mono ml-0.5 text-slate-400">ms P99</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        {/* Free Tier Limit Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Limit: 10 ms CPU budget
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {((metrics.p99CpuMs / metrics.cpuBudgetMs) * 100).toFixed(0)}% used
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${subtextColor}`}>
            0 breaches recorded · Free isolate tier safe
          </p>
        </div>
      </div>

      {/* 4. Error Rate & Success Rate */}
      <div 
        id="kpi-error-rate"
        className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-orange-500/40 ${cardBgClass}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}>
              Success vs Error Rate
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                {metrics.successRate.toFixed(2)}%
              </span>
              <span className="text-xs font-medium text-emerald-500">2xx Success</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Ratio Breakdown bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/20 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400">
              4xx: <strong className="text-amber-400 font-mono">{metrics.clientErrorRate.toFixed(2)}%</strong>
            </span>
            <span className="text-slate-400">
              5xx/1042: <strong className="text-rose-400 font-mono">{metrics.workerExceptionRate.toFixed(2)}%</strong>
            </span>
          </div>

          <div className="w-full bg-slate-700/30 rounded-full h-1.5 flex overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5" 
              style={{ width: `${metrics.successRate}%` }} 
              title={`2xx: ${metrics.successRate}%`}
            />
            <div 
              className="bg-amber-500 h-1.5" 
              style={{ width: `${metrics.clientErrorRate}%` }} 
              title={`4xx: ${metrics.clientErrorRate}%`}
            />
            <div 
              className="bg-rose-500 h-1.5" 
              style={{ width: `${Math.max(1, metrics.workerExceptionRate)}%` }} 
              title={`5xx: ${metrics.workerExceptionRate}%`}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
