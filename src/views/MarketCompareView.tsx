import React, { useState, useMemo } from 'react';
import { Commodity, Language, MarketComparisonItem } from '../types';
import { TAMIL_NADU_MARKETS, generateHistoricalMarketRecords } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import { formatINR, formatPercent, formatDate } from '../utils/formatting';
import {
  ArrowRightLeft,
  Truck,
  Calculator,
  AlertCircle,
  TrendingUp,
  MapPin,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface MarketCompareViewProps {
  commodity: Commodity;
  language: Language;
}

export const MarketCompareView: React.FC<MarketCompareViewProps> = ({ commodity, language }) => {
  const t = TRANSLATIONS[language];

  // Arbitrage calculator interactive parameters
  const [farmDistanceMultiplier, setFarmDistanceMultiplier] = useState<number>(1.0);
  const [vehicleType, setVehicleType] = useState<'small' | 'medium' | 'large'>('small');
  const [freightPerKm, setFreightPerKm] = useState<number>(28); // INR per km
  const [mandiFeeRate, setMandiFeeRate] = useState<number>(1.0); // 1.0%

  // Vehicle capacities in quintals
  const vehicleCapacity = {
    small: 20, // Tata Ace / Bolero (2 Tonnes = 20 Quintals)
    medium: 45, // 4-Tonne Eicher (45 Quintals)
    large: 100, // 10-Tonne Truck (100 Quintals)
  }[vehicleType];

  // Generate multi-market comparisons
  const marketComparisons: MarketComparisonItem[] = useMemo(() => {
    // Generate records for each market
    const list = TAMIL_NADU_MARKETS.map((m) => {
      const records = generateHistoricalMarketRecords(commodity.id, m.id, 14);
      const latest = records[records.length - 1];
      const sparkline = records.slice(-7).map((r) => r.modalPrice);
      const distance = Math.round(m.distanceFromFarmKm * farmDistanceMultiplier);

      // Freight cost per quintal = (distance * 2 [round trip] * freightPerKm) / vehicleCapacity
      const totalFreight = distance * 2 * freightPerKm;
      const freightPerQuintal = Math.round((totalFreight / vehicleCapacity) * 10) / 10;

      // Mandi fee per quintal = modalPrice * (mandiFeeRate / 100)
      const mandiFeePerQuintal = Math.round(latest.modalPrice * (mandiFeeRate / 100) * 10) / 10;

      // Handling / Hamali
      const handling = m.handlingCostPerQuintal;

      // Net Realized Price
      const net = Math.round((latest.modalPrice - freightPerQuintal - mandiFeePerQuintal - handling) * 10) / 10;

      return {
        id: m.id,
        market: language === 'ta' ? m.nameTa : m.nameEn,
        district: language === 'ta' ? m.districtTa : m.districtEn,
        state: language === 'ta' ? m.stateTa : m.stateEn,
        distanceKm: distance,
        latestModalPrice: latest.modalPrice,
        minPrice: latest.minPrice,
        maxPrice: latest.maxPrice,
        priceDate: latest.date,
        priceDiffVsAverage: 0, // computed below
        priceDiffPercent: 0,
        source: latest.source,
        trend7d: sparkline,
        estimatedTransportCostPerQuintal: freightPerQuintal,
        mandiFeePercent: mandiFeeRate,
        handlingChargePerQuintal: handling,
        netRealizedPrice: net,
      };
    });

    // Compute average price
    const avgPrice = list.reduce((sum, item) => sum + item.latestModalPrice, 0) / (list.length || 1);

    return list.map((item) => {
      const diff = item.latestModalPrice - avgPrice;
      const pct = (diff / avgPrice) * 100;
      return {
        ...item,
        priceDiffVsAverage: Math.round(diff),
        priceDiffPercent: Math.round(pct * 10) / 10,
      };
    });
  }, [commodity.id, language, farmDistanceMultiplier, vehicleCapacity, freightPerKm, mandiFeeRate]);

  // Find best gross market vs best net realized market
  const bestGrossMarket = useMemo(() => {
    return [...marketComparisons].sort((a, b) => b.latestModalPrice - a.latestModalPrice)[0];
  }, [marketComparisons]);

  const bestNetMarket = useMemo(() => {
    return [...marketComparisons].sort((a, b) => b.netRealizedPrice - a.netRealizedPrice)[0];
  }, [marketComparisons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <ArrowRightLeft className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {t.compareTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'ta'
                ? `${commodity.nameTa} விலை ஒப்பீடு - கோயம்பேடு, ஒட்டன்சத்திரம், கோவை, மதுரை உட்பட முக்கிய மண்டிகள்`
                : `Compare ${commodity.nameEn} prices across Koyambedu, Oddanchatram, Coimbatore, Madurai, and more`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 block">{commodity.defaultUnit}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {marketComparisons.length} {language === 'ta' ? 'சந்தைகள் இணைக்கப்பட்டுள்ளன' : 'Markets Compared'}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Farmer Advisory Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 shadow-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
            {t.arbitrageAdvisoryTitle}
          </h4>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            {t.arbitrageAdvisoryText}
          </p>
          {bestGrossMarket && bestNetMarket && bestGrossMarket.id !== bestNetMarket.id && (
            <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-amber-300 text-xs font-medium text-amber-900">
              💡 <strong>{language === 'ta' ? 'கவனிக்க வேண்டிய உண்மை:' : 'Crucial Reality Check:'}</strong>{' '}
              {language === 'ta' ? (
                <span>
                  அதிகபட்ச மொத்த விலை தரும் சந்தை <strong>{bestGrossMarket.market}</strong> (₹{bestGrossMarket.latestModalPrice}/q).
                  ஆனால் போக்குவரத்து செலவு கழித்த பின் அதிக நிகர லாபம் தரும் சந்தை <strong>{bestNetMarket.market}</strong> (நிகர விலை: ₹{bestNetMarket.netRealizedPrice}/q)!
                </span>
              ) : (
                <span>
                  The highest gross mandi price is at <strong>{bestGrossMarket.market}</strong> (₹{bestGrossMarket.latestModalPrice}/q),
                  but the highest <strong>Net Realized Profit</strong> is at <strong>{bestNetMarket.market}</strong> (Net: ₹{bestNetMarket.netRealizedPrice}/q) due to lower transit freight!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Net Profitability & Freight Calculator */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <span>
              {language === 'ta' ? 'பண்ணை முதல் சந்தை வரை: லாப கணக்கீட்டுக் கருவி' : 'Farm-to-Mandi Logistics & Net Realized Price Calculator'}
            </span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {vehicleCapacity} Quintals ({vehicleCapacity * 100} kg)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Vehicle Capacity */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ta' ? 'வாகன வகை (Vehicle)' : 'Vehicle Type'}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'small', label: 'Tata Ace (2T)' },
                { id: 'medium', label: 'Eicher (4T)' },
                { id: 'large', label: 'Truck (10T)' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicleType(v.id as any)}
                  className={`py-2 px-1 text-center rounded-xl font-bold transition-all cursor-pointer ${
                    vehicleType === v.id
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Freight per Km */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {language === 'ta' ? 'டீசல் & வாடகை (₹ / கி.மீ)' : 'Freight / Fuel Cost (₹ / km)'}
            </label>
            <input
              type="range"
              min="15"
              max="50"
              value={freightPerKm}
              onChange={(e) => setFreightPerKm(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-stone-500 text-[11px] font-mono mt-1">
              <span>₹15/km</span>
              <span className="font-bold text-stone-900">₹{freightPerKm}/km</span>
              <span>₹50/km</span>
            </div>
          </div>

          {/* Mandi Fee */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {language === 'ta' ? 'சந்தை கமிஷன் / கட்டணம் (%)' : 'Mandi User Fee / Cess (%)'}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={mandiFeeRate}
              onChange={(e) => setMandiFeeRate(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-stone-500 text-[11px] font-mono mt-1">
              <span>0.5%</span>
              <span className="font-bold text-stone-900">{mandiFeeRate}%</span>
              <span>2.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Market Comparison Cards & Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h4 className="text-sm sm:text-base font-bold text-stone-900">
            {language === 'ta' ? 'சந்தைகள் வாரியான விலை மற்றும் நிகர லாப ஒப்பீடு' : 'Mandi-wise Price & Net Realization Breakdown'}
          </h4>
          <span className="text-xs text-stone-500">
            {formatDate(new Date().toISOString().split('T')[0], language)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px] tracking-wider bg-stone-50">
                <th className="py-3 px-3.5">{language === 'ta' ? 'சந்தை & மாவட்டம்' : 'Market & District'}</th>
                <th className="py-3 px-3 text-right">{t.distanceKm}</th>
                <th className="py-3 px-3 text-right font-bold text-stone-900">{t.marketModalPrice}</th>
                <th className="py-3 px-3 text-right">{t.priceDiffVsAvg}</th>
                <th className="py-3 px-3 text-right">{t.transportCost}</th>
                <th className="py-3 px-3 text-right">{t.handlingCost}</th>
                <th className="py-3 px-3.5 text-right font-extrabold text-emerald-800 bg-emerald-50/70">
                  {t.netRealizedPrice}
                </th>
                <th className="py-3 px-3 text-center">{language === 'ta' ? '7-நாள் போக்கு' : '7D Sparkline'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {marketComparisons.map((item) => {
                const isBestNet = bestNetMarket && item.id === bestNetMarket.id;
                const isBestGross = bestGrossMarket && item.id === bestGrossMarket.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isBestNet ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{item.market}</span>
                        {isBestNet && (
                          <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Best Net
                          </span>
                        )}
                        {isBestGross && !isBestNet && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Highest Gross
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {item.district}, {item.state}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-stone-700">
                      {item.distanceKm} km
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 text-sm">
                      {formatINR(item.latestModalPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          item.priceDiffVsAverage > 0
                            ? 'text-emerald-700'
                            : item.priceDiffVsAverage < 0
                            ? 'text-rose-600'
                            : 'text-stone-500'
                        }`}
                      >
                        {item.priceDiffVsAverage > 0 ? '+' : ''}
                        {formatINR(item.priceDiffVsAverage, false)} ({formatPercent(item.priceDiffPercent)})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-rose-700">
                      -₹{item.estimatedTransportCostPerQuintal}/q
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-stone-500">
                      -₹{item.handlingChargePerQuintal}/q
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-extrabold text-sm text-emerald-900 bg-emerald-50/70">
                      {formatINR(item.netRealizedPrice)}
                    </td>

                    {/* Mini SVG Sparkline */}
                    <td className="py-3 px-3 text-center">
                      <svg width="65" height="22" className="inline-block overflow-visible">
                        {(() => {
                          const min = Math.min(...item.trend7d);
                          const max = Math.max(...item.trend7d);
                          const span = max - min || 1;
                          const pts = item.trend7d
                            .map((val, idx) => {
                              const x = (idx / 6) * 65;
                              const y = 20 - ((val - min) / span) * 18;
                              return `${x},${y}`;
                            })
                            .join(' ');
                          return (
                            <polyline
                              fill="none"
                              stroke="#059669"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={pts}
                            />
                          );
                        })()}
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
