import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TimelineDataPoint } from '../types';
import { Activity, Eye, EyeOff } from 'lucide-react';

interface InvocationsAreaChartProps {
  data: TimelineDataPoint[];
  isDarkMode: boolean;
}

export const InvocationsAreaChart: React.FC<InvocationsAreaChartProps> = ({ data, isDarkMode }) => {
  // Toggle visibility of series
  const [show2xx, setShow2xx] = useState(true);
  const [show4xx, setShow4xx] = useState(true);
  const [show5xx, setShow5xx] = useState(true);

  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80'
    : 'bg-white border-slate-200/80';

  const gridStroke = isDarkMode ? 'rgba(51, 65, 85, 0.25)' : 'rgba(226, 232, 240, 0.8)';
  const tickFill = isDarkMode ? '#94a3b8' : '#64748b';

  // Calculate totals across timeline
  const total2xx = data.reduce((acc, curr) => acc + curr.status2xx, 0);
  const total4xx = data.reduce((acc, curr) => acc + curr.status4xx, 0);
  const total5xx = data.reduce((acc, curr) => acc + curr.status5xx, 0);
  const grandTotal = total2xx + total4xx + total5xx;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as TimelineDataPoint;
      return (
        <div className={`p-3 rounded-lg shadow-xl border text-xs min-w-[190px] backdrop-blur-md ${
          isDarkMode ? 'bg-[#0f172a]/95 border-slate-700 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>{point.fullDate || label}</span>
            <span className="font-mono text-orange-400">Total: {point.total.toLocaleString()}</span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                2xx Success:
              </span>
              <span>{point.status2xx.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                4xx Client Err:
              </span>
              <span>{point.status4xx.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                5xx Worker Err:
              </span>
              <span>{point.status5xx.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="chart-invocations-timeline" className={`rounded-xl border p-4 transition-all ${cardBgClass}`}>
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-2 border-b border-slate-700/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">Invocations & Load Timeline</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
              {grandTotal.toLocaleString()} requests
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Incoming edge invocation volume broken down by HTTP response classification
          </p>
        </div>

        {/* Series Visibility Toggles */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setShow2xx(!show2xx)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
              show2xx
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                : 'bg-transparent border-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>2xx OK</span>
            {show2xx ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={() => setShow4xx(!show4xx)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
              show4xx
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium'
                : 'bg-transparent border-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>4xx Client</span>
            {show4xx ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={() => setShow5xx(!show5xx)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
              show5xx
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-medium'
                : 'bg-transparent border-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>5xx Error</span>
            {show5xx ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradient2xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradient4xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradient5xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

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
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
            <Tooltip content={<CustomTooltip />} />

            {show2xx && (
              <Area
                type="monotone"
                dataKey="status2xx"
                name="2xx Success"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradient2xx)"
              />
            )}
            {show4xx && (
              <Area
                type="monotone"
                dataKey="status4xx"
                name="4xx Client Error"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradient4xx)"
              />
            )}
            {show5xx && (
              <Area
                type="monotone"
                dataKey="status5xx"
                name="5xx Worker Error"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradient5xx)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
