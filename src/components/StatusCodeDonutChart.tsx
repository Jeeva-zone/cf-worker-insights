import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatusCodeBreakdown } from '../types';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';

interface StatusCodeDonutChartProps {
  data: StatusCodeBreakdown[];
  isDarkMode: boolean;
  onSelectStatusCode?: (code: number | null) => void;
  selectedCode?: number | null;
}

export const StatusCodeDonutChart: React.FC<StatusCodeDonutChartProps> = ({
  data,
  isDarkMode,
  onSelectStatusCode,
  selectedCode
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80'
    : 'bg-white border-slate-200/80';

  const totalRequests = data.reduce((acc, curr) => acc + curr.count, 0);

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div id="chart-status-breakdown" className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${cardBgClass}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">HTTP Status Code Breakdown</h2>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Distribution of edge HTTP response codes & worker exceptions
          </p>
        </div>

        {selectedCode && onSelectStatusCode && (
          <button
            onClick={() => onSelectStatusCode(null)}
            className="text-[11px] px-2 py-0.5 rounded border border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main visual body: Donut chart + Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto py-2">
        
        {/* Donut Chart with Center Text */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[190px]">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as StatusCodeBreakdown;
                    return (
                      <div className={`p-2 rounded shadow-md border text-xs ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.label}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {item.count.toLocaleString()} reqs ({item.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="count"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(item: any) => {
                  const targetCode = item?.code ?? item?.payload?.code;
                  if (onSelectStatusCode && targetCode !== undefined) {
                    onSelectStatusCode(selectedCode === targetCode ? null : targetCode);
                  }
                }}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.code}`}
                    fill={entry.color}
                    stroke={selectedCode === entry.code ? '#ffffff' : 'transparent'}
                    strokeWidth={selectedCode === entry.code ? 2 : 0}
                    opacity={hoveredIndex === null || hoveredIndex === index || selectedCode === entry.code ? 1 : 0.4}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {activeItem ? activeItem.label : 'Success Rate'}
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {activeItem ? `${activeItem.percentage}%` : `${data.find(d => d.code === 200)?.percentage}%`}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {activeItem ? `${activeItem.count.toLocaleString()} reqs` : '2xx Verified'}
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="md:col-span-7 space-y-2">
          {data.map((item, idx) => {
            const isSelected = selectedCode === item.code;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.code}
                onClick={() => onSelectStatusCode && onSelectStatusCode(isSelected ? null : item.code)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? isDarkMode ? 'bg-slate-800/80 border-orange-500/60' : 'bg-orange-50 border-orange-400'
                    : isHovered
                      ? isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-300'
                      : isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-slate-50/50 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold font-mono">{item.label}</span>
                    {item.code === 1042 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-medium">
                        Worker Limit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold">{item.percentage}%</span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({item.count.toLocaleString()})
                    </span>
                  </div>
                </div>

                <p className={`text-[11px] mt-1 line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
