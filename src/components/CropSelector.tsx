import React from 'react';
import { Commodity, Language } from '../types';
import { COMMODITIES, TAMIL_NADU_MARKETS, MarketLocation } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import { Filter, Calendar, MapPin } from 'lucide-react';

interface CropSelectorProps {
  selectedCommodity: Commodity;
  onCommodityChange: (commodity: Commodity) => void;
  selectedMarket: MarketLocation;
  onMarketChange: (market: MarketLocation) => void;
  selectedRange: string;
  onRangeChange: (range: string) => void;
  selectedHorizon: number;
  onHorizonChange: (horizon: number) => void;
  language: Language;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCommodity,
  onCommodityChange,
  selectedMarket,
  onMarketChange,
  selectedRange,
  onRangeChange,
  selectedHorizon,
  onHorizonChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'vegetable', label: t.vegetables },
    { id: 'grain', label: t.grains },
    { id: 'fruit', label: t.fruits },
    { id: 'cash_crop', label: t.cashCrops },
  ];

  const filteredCommodities = React.useMemo(() => {
    if (selectedCategory === 'all') return COMMODITIES;
    return COMMODITIES.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      {/* Category Pills & Commodity Chips */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.commodity}</span>
          </label>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commodity Scrollable / Grid Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {filteredCommodities.map((c) => {
            const isSelected = selectedCommodity.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onCommodityChange(c)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span>{language === 'ta' ? c.nameTa : c.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selectors Row: Market, District, Range, Horizon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
        {/* Market Selector */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>{t.market}</span>
          </label>
          <select
            value={selectedMarket.id}
            onChange={(e) => {
              const found = TAMIL_NADU_MARKETS.find((m) => m.id === e.target.value);
              if (found) onMarketChange(found);
            }}
            className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            {TAMIL_NADU_MARKETS.map((m) => (
              <option key={m.id} value={m.id}>
                {language === 'ta' ? `${m.districtTa} - ${m.nameTa}` : `${m.districtEn} - ${m.nameEn}`}
              </option>
            ))}
          </select>
        </div>

        {/* District & State Readout */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
            {t.state} & {t.district}
          </label>
          <div className="bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 truncate">
            {language === 'ta'
              ? `${selectedMarket.stateTa} ▶ ${selectedMarket.districtTa}`
              : `${selectedMarket.stateEn} ▶ ${selectedMarket.districtEn}`}
          </div>
        </div>

        {/* Historical Range */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-600" />
            <span>{t.dateRange}</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: '1m', label: '1M' },
              { id: '3m', label: '3M' },
              { id: '6m', label: '6M' },
              { id: '1y', label: '1Y' },
            ].map((rng) => (
              <button
                key={rng.id}
                onClick={() => onRangeChange(rng.id)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRange === rng.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Horizon */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
            {t.forecastHorizon}
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { days: 7, label: t.days7 },
              { days: 14, label: t.days14 },
              { days: 30, label: t.days30 },
            ].map((h) => (
              <button
                key={h.days}
                onClick={() => onHorizonChange(h.days)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedHorizon === h.days
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {h.days}D
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
