import React from 'react';
import { MarketRecord, Language } from '../../types';
import { formatDate } from '../../utils/formatting';

interface ArrivalsChartProps {
  records: MarketRecord[];
  language: Language;
}

export const ArrivalsChart: React.FC<ArrivalsChartProps> = ({ records, language }) => {
  // Take last 20 records for clean presentation
  const recentRecords = records.slice(-20);
  const maxArrivals = Math.max(...recentRecords.map((r) => r.arrivalsInTonnes || 10), 40);

  const width = 840;
  const height = 140;
  const padding = { top: 15, right: 35, bottom: 25, left: 75 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const barWidth = Math.max(8, (chartW / recentRecords.length) * 0.65);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
          <span>🚛</span>
          {language === 'ta' ? 'தினசரி சந்தை வரத்து (டன்கள்)' : 'Daily Mandi Arrivals (Tonnes)'}
        </h4>
        <span className="text-[11px] text-stone-500">
          {language === 'ta' ? 'அதிக வரத்து = குறைந்த விலை அழுத்தம்' : 'High Arrivals typically dampen modal price'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[580px] max-h-[140px]">
          {/* Subtle grid line */}
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke="#f5f5f4"
            strokeDasharray="3 3"
          />

          {recentRecords.map((r, idx) => {
            const x = padding.left + (idx / (recentRecords.length - 1 || 1)) * chartW - barWidth / 2;
            const barHeight = ((r.arrivalsInTonnes || 5) / maxArrivals) * chartH;
            const y = padding.top + chartH - barHeight;

            return (
              <g key={`arrival-bar-${r.id}-${idx}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  className="fill-emerald-600/75 hover:fill-emerald-700 transition-colors"
                >
                  <title>{`${formatDate(r.date, language)}: ${r.arrivalsInTonnes} Tonnes`}</title>
                </rect>
                {/* Every 3rd date label */}
                {idx % 3 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 6}
                    textAnchor="middle"
                    className="text-[9px] fill-stone-400 font-mono"
                  >
                    {r.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
