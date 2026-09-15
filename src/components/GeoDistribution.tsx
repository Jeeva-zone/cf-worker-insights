import React from 'react';
import { GeoDistributionItem } from '../types';
import { Globe2, Filter, Compass } from 'lucide-react';

interface GeoDistributionProps {
  data: GeoDistributionItem[];
  isDarkMode: boolean;
  selectedCountry: string | null;
  onSelectCountry: (countryCode: string | null) => void;
}

export const GeoDistribution: React.FC<GeoDistributionProps> = ({
  data,
  isDarkMode,
  selectedCountry,
  onSelectCountry
}) => {
  const cardBgClass = isDarkMode
    ? 'bg-[#111726]/90 border-slate-800/80'
    : 'bg-white border-slate-200/80';

  const totalRequests = data.reduce((acc, curr) => acc + curr.requests, 0);

  return (
    <div id="traffic-geo-distribution" className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${cardBgClass}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold tracking-tight">Geographic Request Distribution</h2>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Top traffic origins dispatched across Cloudflare Anycast edge network
          </p>
        </div>

        {selectedCountry && (
          <button
            onClick={() => onSelectCountry(null)}
            className="text-[11px] px-2 py-0.5 rounded border border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 flex items-center gap-1"
          >
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Origin Countries List */}
      <div className="space-y-2.5 my-2 max-h-[290px] overflow-y-auto pr-1">
        {data.map((item) => {
          const isSelected = selectedCountry === item.code;

          return (
            <div
              key={item.code}
              onClick={() => onSelectCountry(isSelected ? null : item.code)}
              className={`p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                isSelected
                  ? isDarkMode ? 'bg-slate-800/90 border-orange-500 text-orange-400 font-semibold' : 'bg-orange-50 border-orange-400 text-orange-900 font-semibold'
                  : isDarkMode ? 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700' : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none" role="img" aria-label={item.name}>
                    {item.flag}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-500/10 text-slate-400">
                    {item.code}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    ~{item.avgLatencyMs}ms
                  </span>
                  <span className="font-bold">{item.percentage}%</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    ({item.requests.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-orange-500' : 'bg-slate-400/80 group-hover:bg-orange-400'
                  }`}
                  style={{ width: `${item.percentage * 2}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-700/20 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-orange-400" />
          <span>Anycast 330+ Global Data Centers</span>
        </span>
        <span className="font-mono">
          {data.length} Top Regions Active
        </span>
      </div>

    </div>
  );
};
