import React, { useState, useMemo } from 'react';
import { MarketRecord, ForecastPoint, BacktestPoint, Language } from '../../types';
import { formatINR, formatDate } from '../../utils/formatting';
import { TRANSLATIONS } from '../../utils/translations';

interface PriceForecastChartProps {
  records: MarketRecord[];
  forecastPoints: ForecastPoint[];
  backtestPoints?: BacktestPoint[];
  language: Language;
  selectedRange: string;
}

export const PriceForecastChart: React.FC<PriceForecastChartProps> = ({
  records,
  forecastPoints,
  backtestPoints = [],
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [showSpread, setShowSpread] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showBacktest, setShowBacktest] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Combine chronological historical + forecast sequence
  const combinedData = useMemo(() => {
    const historical = records.map((r) => ({
      date: r.date,
      type: 'historical' as const,
      modalPrice: r.modalPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      predictedPrice: null as number | null,
      lower80: null as number | null,
      upper80: null as number | null,
      lower95: null as number | null,
      upper95: null as number | null,
    }));

    // Find if there is a backtest overlay
    const backtestMap = new Map(backtestPoints.map((bp) => [bp.date, bp]));

    const historicalWithBacktest = historical.map((h) => {
      const bt = backtestMap.get(h.date);
      return {
        ...h,
        backtestPred: bt ? bt.predictedPrice : null,
      };
    });

    const lastHistorical = historical[historical.length - 1];

    const forecast = forecastPoints.map((f, idx) => ({
      date: f.date,
      type: 'forecast' as const,
      modalPrice: null as number | null,
      minPrice: null as number | null,
      maxPrice: null as number | null,
      predictedPrice: f.predictedPrice,
      lower80: f.lowerBound80,
      upper80: f.upperBound80,
      lower95: f.lowerBound95,
      upper95: f.upperBound95,
      backtestPred: null as number | null,
    }));

    // If we have forecast points, bridge the gap with the last historical point
    return {
      points: [...historicalWithBacktest, ...forecast],
      lastHistoricalIndex: historicalWithBacktest.length - 1,
      lastHistorical,
    };
  }, [records, forecastPoints, backtestPoints]);

  const points = combinedData.points;

  // Compute SVG dimensions and price bounds
  const width = 840;
  const height = 340;
  const padding = { top: 30, right: 35, bottom: 45, left: 75 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const p of points) {
      if (p.modalPrice !== null) {
        min = Math.min(min, p.minPrice || p.modalPrice);
        max = Math.max(max, p.maxPrice || p.modalPrice);
      }
      if (p.predictedPrice !== null) {
        min = Math.min(min, p.lower95 || p.predictedPrice);
        max = Math.max(max, p.upper95 || p.predictedPrice);
      }
      if (p.backtestPred !== null) {
        min = Math.min(min, p.backtestPred);
        max = Math.max(max, p.backtestPred);
      }
    }

    if (min === Infinity) min = 1000;
    if (max === -Infinity) max = 4000;

    // Add 8% buffer top and bottom
    const span = max - min || 500;
    return {
      minVal: Math.max(0, Math.floor((min - span * 0.08) / 100) * 100),
      maxVal: Math.ceil((max + span * 0.08) / 100) * 100,
    };
  }, [points]);

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;
  };

  // Generate SVG paths
  // 1. Historical modal price path
  const historicalPath = useMemo(() => {
    const histPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.modalPrice !== null);
    if (histPoints.length === 0) return '';
    return histPoints.reduce((acc, p, idx) => {
      const x = getX(p.i);
      const y = getY(p.modalPrice!);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [points, minVal, maxVal]);

  // 2. Historical Min-Max area path
  const minMaxAreaPath = useMemo(() => {
    const histPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.minPrice !== null && p.maxPrice !== null);
    if (histPoints.length === 0) return '';

    const topPath = histPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.i)} ${getY(p.maxPrice!)}`)
      .join(' ');

    const bottomPath = histPoints
      .slice()
      .reverse()
      .map((p) => `L ${getX(p.i)} ${getY(p.minPrice!)}`)
      .join(' ');

    return `${topPath} ${bottomPath} Z`;
  }, [points, minVal, maxVal]);

  // 3. Forecast line path (starting from last historical point)
  const forecastPath = useMemo(() => {
    const fcPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.predictedPrice !== null);
    if (fcPoints.length === 0) return '';

    const lastH = combinedData.lastHistoricalIndex;
    let pathStr = '';

    if (lastH >= 0 && points[lastH]?.modalPrice !== null) {
      pathStr = `M ${getX(lastH)} ${getY(points[lastH].modalPrice!)}`;
      for (const fp of fcPoints) {
        pathStr += ` L ${getX(fp.i)} ${getY(fp.predictedPrice!)}`;
      }
    } else {
      for (let idx = 0; idx < fcPoints.length; idx++) {
        const fp = fcPoints[idx];
        const cmd = idx === 0 ? 'M' : 'L';
        pathStr += ` ${cmd} ${getX(fp.i)} ${getY(fp.predictedPrice!)}`;
      }
    }
    return pathStr;
  }, [points, combinedData.lastHistoricalIndex, minVal, maxVal]);

  // 4. Confidence Band 95% path
  const confidence95Path = useMemo(() => {
    const fcPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.lower95 !== null && p.upper95 !== null);
    if (fcPoints.length === 0) return '';

    const lastH = combinedData.lastHistoricalIndex;
    let top = '';
    let bottom = '';

    if (lastH >= 0 && points[lastH]?.modalPrice !== null) {
      const anchorX = getX(lastH);
      const anchorY = getY(points[lastH].modalPrice!);
      top = `M ${anchorX} ${anchorY} ` + fcPoints.map((p) => `L ${getX(p.i)} ${getY(p.upper95!)}`).join(' ');
      bottom = fcPoints
        .slice()
        .reverse()
        .map((p) => `L ${getX(p.i)} ${getY(p.lower95!)}`)
        .join(' ') + ` L ${anchorX} ${anchorY} Z`;
    } else {
      top = fcPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.i)} ${getY(p.upper95!)}`).join(' ');
      bottom = fcPoints
        .slice()
        .reverse()
        .map((p) => `L ${getX(p.i)} ${getY(p.lower95!)}`)
        .join(' ') + ' Z';
    }

    return `${top} ${bottom}`;
  }, [points, combinedData.lastHistoricalIndex, minVal, maxVal]);

  // 5. Confidence Band 80% path
  const confidence80Path = useMemo(() => {
    const fcPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.lower80 !== null && p.upper80 !== null);
    if (fcPoints.length === 0) return '';

    const lastH = combinedData.lastHistoricalIndex;
    let top = '';
    let bottom = '';

    if (lastH >= 0 && points[lastH]?.modalPrice !== null) {
      const anchorX = getX(lastH);
      const anchorY = getY(points[lastH].modalPrice!);
      top = `M ${anchorX} ${anchorY} ` + fcPoints.map((p) => `L ${getX(p.i)} ${getY(p.upper80!)}`).join(' ');
      bottom = fcPoints
        .slice()
        .reverse()
        .map((p) => `L ${getX(p.i)} ${getY(p.lower80!)}`)
        .join(' ') + ` L ${anchorX} ${anchorY} Z`;
    } else {
      top = fcPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.i)} ${getY(p.upper80!)}`).join(' ');
      bottom = fcPoints
        .slice()
        .reverse()
        .map((p) => `L ${getX(p.i)} ${getY(p.lower80!)}`)
        .join(' ') + ' Z';
    }

    return `${top} ${bottom}`;
  }, [points, combinedData.lastHistoricalIndex, minVal, maxVal]);

  // 6. Backtest line path
  const backtestPath = useMemo(() => {
    const btPoints = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.backtestPred !== null);
    if (btPoints.length === 0) return '';
    return btPoints.reduce((acc, p, idx) => {
      const x = getX(p.i);
      const y = getY(p.backtestPred!);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [points, minVal, maxVal]);

  // Y-axis grid ticks (5 intervals)
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const val = minVal + ((maxVal - minVal) / count) * i;
      ticks.push(Math.round(val / 50) * 50);
    }
    return ticks;
  }, [minVal, maxVal]);

  // X-axis date labels
  const xLabels = useMemo(() => {
    if (points.length === 0) return [];
    const step = Math.max(1, Math.floor(points.length / 6));
    const labels = [];
    for (let i = 0; i < points.length; i += step) {
      labels.push({ index: i, date: points[i].date });
    }
    if (labels[labels.length - 1].index !== points.length - 1) {
      labels.push({ index: points.length - 1, date: points[points.length - 1].date });
    }
    return labels;
  }, [points]);

  const activeHoverPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 transition-all">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>📈</span> {t.priceTrendAndForecast}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {language === 'ta'
              ? 'வரலாற்று மாதிரி விலைகள், தினசரி வரம்பு மற்றும் இயந்திர கற்றல் கணிப்பு'
              : 'Daily Mandi modal price history, trading envelope & recursive ML projection'}
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowSpread(!showSpread)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              showSpread
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {t.priceSpreadBand}
          </button>

          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              showConfidence
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {t.confidenceBand80}
          </button>

          {backtestPoints.length > 0 && (
            <button
              onClick={() => setShowBacktest(!showBacktest)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
                showBacktest
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {t.backtestComparison}
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative mt-4 overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[620px] max-h-[380px]"
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const svgX = (mouseX / rect.width) * width;
            if (svgX >= padding.left && svgX <= width - padding.right && points.length > 1) {
              const rel = (svgX - padding.left) / chartW;
              const idx = Math.min(points.length - 1, Math.max(0, Math.round(rel * (points.length - 1))));
              setHoveredIndex(idx);
            }
          }}
        >
          <defs>
            {/* Historical area gradient */}
            <linearGradient id="histSpreadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>

            {/* 95% Confidence interval gradient */}
            <linearGradient id="ci95Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
            </linearGradient>

            {/* 80% Confidence interval gradient */}
            <linearGradient id="ci80Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={`y-grid-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-stone-500 font-mono"
                >
                  ₹{val.toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* Historical Min-Max Spread */}
          {showSpread && minMaxAreaPath && (
            <path d={minMaxAreaPath} fill="url(#histSpreadGrad)" />
          )}

          {/* 95% Confidence Band */}
          {showConfidence && confidence95Path && (
            <path d={confidence95Path} fill="url(#ci95Grad)" />
          )}

          {/* 80% Confidence Band */}
          {showConfidence && confidence80Path && (
            <path d={confidence80Path} fill="url(#ci80Grad)" />
          )}

          {/* Vertical divider indicating Forecast Boundary */}
          {combinedData.lastHistoricalIndex >= 0 && (
            <g>
              <line
                x1={getX(combinedData.lastHistoricalIndex)}
                y1={padding.top}
                x2={getX(combinedData.lastHistoricalIndex)}
                y2={height - padding.bottom}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={getX(combinedData.lastHistoricalIndex) + 6}
                y={padding.top + 14}
                className="text-[10px] fill-emerald-800 font-bold uppercase tracking-wider"
              >
                {language === 'ta' ? 'இன்றைய தேதி ▶ கணிப்பு' : 'Today ▶ ML Forecast'}
              </text>
            </g>
          )}

          {/* Backtest curve */}
          {showBacktest && backtestPath && (
            <path
              d={backtestPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}

          {/* Historical modal price line */}
          {historicalPath && (
            <path
              d={historicalPath}
              fill="none"
              stroke="#047857"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Model Forecast line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Historical Data points (subtle) */}
          {points.map((p, i) => {
            if (p.modalPrice === null) return null;
            // Only draw dots every few points or if hovered
            const isHovered = hoveredIndex === i;
            if (!isHovered && points.length > 25 && i % 3 !== 0) return null;
            return (
              <circle
                key={`hist-pt-${i}`}
                cx={getX(i)}
                cy={getY(p.modalPrice)}
                r={isHovered ? 5.5 : 2.5}
                fill="#ffffff"
                stroke="#047857"
                strokeWidth={isHovered ? 2.5 : 1.5}
              />
            );
          })}

          {/* Forecast Data points */}
          {points.map((p, i) => {
            if (p.predictedPrice === null) return null;
            const isHovered = hoveredIndex === i;
            return (
              <circle
                key={`fc-pt-${i}`}
                cx={getX(i)}
                cy={getY(p.predictedPrice)}
                r={isHovered ? 6 : 3.5}
                fill="#ffffff"
                stroke="#d97706"
                strokeWidth={isHovered ? 2.5 : 2}
              />
            );
          })}

          {/* X Axis ticks */}
          {xLabels.map((lbl) => {
            const x = getX(lbl.index);
            return (
              <g key={`x-lbl-${lbl.date}-${lbl.index}`}>
                <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 5} stroke="#a8a29e" />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-500 font-medium"
                >
                  {formatDate(lbl.date, language)}
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Crosshair */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={height - padding.bottom}
                stroke="#78716c"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeHoverPoint && hoveredIndex !== null && (
          <div
            className="absolute pointer-events-none z-20 bg-stone-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-xl border border-stone-700 text-xs transition-all duration-75"
            style={{
              left: `${Math.min(chartW, Math.max(10, getX(hoveredIndex) - 90))}px`,
              top: '15px',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-1.5 mb-2 font-mono">
              <span className="font-semibold text-emerald-300">
                {formatDate(activeHoverPoint.date, language)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  activeHoverPoint.type === 'historical'
                    ? 'bg-emerald-900/70 text-emerald-200'
                    : 'bg-amber-900/70 text-amber-200'
                }`}
              >
                {activeHoverPoint.type === 'historical'
                  ? (language === 'ta' ? 'அதிகாரப்பூர்வ வரத்து' : 'Mandi Actual')
                  : (language === 'ta' ? 'ML கணிப்பு' : 'ML Forecast')}
              </span>
            </div>

            {activeHoverPoint.modalPrice !== null && (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-400">{language === 'ta' ? 'மாதிரி விலை:' : 'Modal Price:'}</span>
                  <span className="font-bold text-white font-mono">
                    {formatINR(activeHoverPoint.modalPrice)}/q
                  </span>
                </div>
                {activeHoverPoint.minPrice !== null && activeHoverPoint.maxPrice !== null && (
                  <div className="flex justify-between gap-4 text-[11px] text-stone-300">
                    <span className="text-stone-400">{language === 'ta' ? 'வரம்பு (குறைந்த-அதிக):' : 'Min - Max:'}</span>
                    <span className="font-mono">
                      ₹{activeHoverPoint.minPrice} - ₹{activeHoverPoint.maxPrice}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeHoverPoint.predictedPrice !== null && (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-amber-300 font-semibold">{language === 'ta' ? 'கணிக்கப்பட்ட விலை:' : 'Predicted Price:'}</span>
                  <span className="font-bold text-amber-200 font-mono">
                    {formatINR(activeHoverPoint.predictedPrice)}/q
                  </span>
                </div>
                {activeHoverPoint.lower80 !== null && (
                  <div className="flex justify-between gap-4 text-[11px] text-stone-300">
                    <span className="text-stone-400">80% Interval:</span>
                    <span className="font-mono text-emerald-300">
                      ₹{activeHoverPoint.lower80} - ₹{activeHoverPoint.upper80}
                    </span>
                  </div>
                )}
                {activeHoverPoint.lower95 !== null && (
                  <div className="flex justify-between gap-4 text-[11px] text-stone-400">
                    <span>95% Interval:</span>
                    <span className="font-mono">
                      ₹{activeHoverPoint.lower95} - ₹{activeHoverPoint.upper95}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeHoverPoint.backtestPred !== null && (
              <div className="mt-1.5 pt-1 border-t border-stone-800 flex justify-between gap-4 text-indigo-300">
                <span>{language === 'ta' ? 'சோதனை கணிப்பு:' : 'Backtest Pred:'}</span>
                <span className="font-mono">₹{activeHoverPoint.backtestPred}/q</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Footer Legend & Clarifications */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-700 rounded-full"></span>
            <span className="font-medium text-stone-800">{t.historicalActual}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-amber-600 border-dashed border-t-2 border-amber-600"></span>
            <span className="font-medium text-amber-900">{t.forecastedPrice}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span>
            <span className="text-stone-600">{t.confidenceBand80}</span>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 font-medium">
          {language === 'ta'
            ? 'அலகு: ₹ / குவிண்டால் (100 கிலோ) • AGMARKNET தரவு'
            : 'Unit: ₹ per Quintal (100 kg) • Official Market Basis'}
        </div>
      </div>
    </div>
  );
};
