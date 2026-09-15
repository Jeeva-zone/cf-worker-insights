import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { TimelineDataPoint } from '../types';
import { Cpu, ShieldCheck, Info } from 'lucide-react';

interface LatencyLineChartProps {
  data: TimelineDataPoint[];
  isDarkMode: boolean;
}

export const LatencyLineChart: React.FC<LatencyLineChartProps> = ({ data, isDarkMode }) => {
  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80'
    : 'bg-white border-slate-200/80';

  const gridStroke = isDarkMode ? 'rgba(51, 65, 85, 0.25)' : 'rgba(226, 232, 240, 0.8)';
  const tickFill = isDarkMode ? '#94a3b8' : '#64748b';

  // Latest or average percentiles
  const avgP50 = (data.reduce((a, b) => a + b.p50Latency, 0) / (data.length || 1)).toFixed(2);
  const avgP90 = (data.reduce((a, b) => a + b.p90Latency, 0) / (data.length || 1)).toFixed(2);
  const avgP99 = (data.reduce((a, b) => a + b.p99Latency, 0) / (data.length || 1)).toFixed(2);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as TimelineDataPoint;
      return (
        <div className={`p-3 rounded-lg shadow-xl border text-xs min-w-[200px] backdrop-blur-md ${
          isDarkMode ? 'bg-[#0f172a]/95 border-slate-700 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>{point.fullDate || label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Within 10ms Budget
            </span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                P50 (Median):
              </span>
              <span>{point.p50Latency} ms</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                P90:
              </span>
              <span>{point.p90Latency} ms</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                P99 (Tail):
              </span>
              <span>{point.p99Latency} ms</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-700/50 flex items-center justify-between text-slate-400 text-[10px]">
              <span>CPU Limit:</span>
              <span className="text-red-400 font-bold">10.00 ms (Ceiling)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="chart-latency-distribution" className={`rounded-xl border p-4 transition-all ${cardBgClass}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-2 border-b border-slate-700/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">Latency & CPU Time Distribution</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              10ms Free Limit
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Per-request V8 isolate execution duration overlaying P50, P90, and P99 percentiles
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            P50: {avgP50}ms
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            P90: {avgP90}ms
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            P99: {avgP99}ms
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="timeLabel"
              stroke={tickFill}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke={tickFill}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 12]}
              ticks={[0, 2, 4, 6, 8, 10, 12]}
              tickFormatter={(val) => `${val}ms`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 10ms CPU Budget Threshold Ceiling */}
            <ReferenceLine
              y={10}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: '10 ms CPU Free Tier Limit',
                position: 'insideTopRight',
                fill: '#ef4444',
                fontSize: 10,
                fontWeight: 600
              }}
            />

            {/* P50 Median */}
            <Line
              type="monotone"
              dataKey="p50Latency"
              name="P50 Latency"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, stroke: '#06b6d4' }}
            />

            {/* P90 Percentile */}
            <Line
              type="monotone"
              dataKey="p90Latency"
              name="P90 Latency"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, stroke: '#f59e0b' }}
            />

            {/* P99 Percentile */}
            <Line
              type="monotone"
              dataKey="p99Latency"
              name="P99 Latency"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1, stroke: '#f43f5e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
