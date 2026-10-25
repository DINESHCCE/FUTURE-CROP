import React, { useState } from 'react';
import { Commodity, MarketRecord, ForecastResult, Language } from '../types';
import { MarketLocation } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import { formatINR, formatPercent, formatDate } from '../utils/formatting';
import { PriceForecastChart } from '../components/charts/PriceForecastChart';
import { ArrivalsChart } from '../components/charts/ArrivalsChart';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Volume2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Info,
  Clock,
} from 'lucide-react';

interface DashboardViewProps {
  commodity: Commodity;
  market: MarketLocation;
  records: MarketRecord[];
  forecastResult: ForecastResult | null;
  language: Language;
  selectedRange: string;
  onOpenGeminiAdvisor: (initialPrompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  commodity,
  market,
  records,
  forecastResult,
  language,
  selectedRange,
  onOpenGeminiAdvisor,
}) => {
  const t = TRANSLATIONS[language];
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Latest record & stats
  const latestRecord = records[records.length - 1];
  const previousRecord = records.length > 1 ? records[records.length - 2] : null;

  const currentModal = latestRecord ? latestRecord.modalPrice : 0;
  const previousModal = previousRecord ? previousRecord.modalPrice : currentModal;
  const dailyDiff = currentModal - previousModal;
  const dailyDiffPct = previousModal > 0 ? (dailyDiff / previousModal) * 100 : 0;

  // 30-day stats
  const slice30 = records.slice(-30);
  const min30 = Math.min(...slice30.map((r) => r.minPrice || r.modalPrice));
  const max30 = Math.max(...slice30.map((r) => r.maxPrice || r.modalPrice));

  // Forecast stats
  const hasValidForecast =
    forecastResult &&
    forecastResult.metrics.status === 'trained' &&
    forecastResult.forecastPoints.length > 0;

  const predictedPrice = hasValidForecast ? forecastResult.predictedFinalPrice : null;
  const forecastDiffRupees = hasValidForecast ? forecastResult.priceChangeRupees : 0;
  const forecastDiffPct = hasValidForecast ? forecastResult.priceChangePercent : 0;

  // Fetch server-side Gemini explanation
  const handleExplainTrend = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: language === 'ta' ? commodity.nameTa : commodity.nameEn,
          market: language === 'ta' ? market.nameTa : market.nameEn,
          currentPrice: currentModal,
          predictedPrice,
          priceChangePercent: forecastDiffPct,
          language,
          metrics: forecastResult?.metrics,
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || 'Explanation generated.');
    } catch (err) {
      console.error(err);
      setAiExplanation(
        language === 'ta'
          ? 'ஜெமினி AI சேவையை இணைப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to reach Gemini API. Please check server connectivity.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Text-to-Speech audio synthesizer for accessible farmer read-aloud
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Latest Official Market Price */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">{t.latestModalPrice}</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
              {t.officialMandiPrice}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
              {formatINR(currentModal)}
            </span>
            <span className="text-xs text-stone-500 font-medium">{commodity.defaultUnit}</span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
            {dailyDiff >= 0 ? (
              <span className="text-emerald-700 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{formatINR(dailyDiff, false)} ({formatPercent(dailyDiffPct)})
              </span>
            ) : (
              <span className="text-rose-600 flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {formatINR(dailyDiff, false)} ({formatPercent(dailyDiffPct)})
              </span>
            )}
            <span className="text-stone-400 font-normal">vs prev trading day</span>
          </div>
        </div>

        {/* 2. Predicted Future Price (ML Model) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:border-amber-300 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full pointer-events-none -z-0"></div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1 relative z-10">
            <span className="font-semibold uppercase tracking-wider">{t.predictedFuturePrice}</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
              {t.modelForecastNotice}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2 relative z-10">
            {hasValidForecast ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-mono">
                  {formatINR(predictedPrice)}
                </span>
                <span className="text-xs text-stone-500 font-medium">{commodity.defaultUnit}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-stone-400 italic">
                {t.insufficientDataWarning}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold relative z-10">
            {hasValidForecast ? (
              <>
                {forecastDiffRupees >= 0 ? (
                  <span className="text-emerald-700 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{formatINR(forecastDiffRupees, false)} ({formatPercent(forecastDiffPct)})
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {formatINR(forecastDiffRupees, false)} ({formatPercent(forecastDiffPct)})
                  </span>
                )}
                <span className="text-stone-400 font-normal">in {forecastResult?.horizonDays}D horizon</span>
              </>
            ) : (
              <span className="text-[11px] text-amber-800">
                Min 15 continuous records needed
              </span>
            )}
          </div>
        </div>

        {/* 3. Observed 30-Day Spread */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:border-stone-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">{t.observed30DayRange}</span>
            <span className="text-stone-400 text-xs">Past 30 Days</span>
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-400 block">{t.lowestPrice}</span>
              <span className="text-lg font-bold text-stone-800 font-mono">
                {formatINR(min30, false)}
              </span>
            </div>
            <div className="text-stone-300">───</div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">{t.highestPrice}</span>
              <span className="text-lg font-bold text-stone-800 font-mono">
                {formatINR(max30, false)}
              </span>
            </div>
          </div>

          <div className="mt-2.5 text-xs text-stone-500">
            {language === 'ta' ? 'அகன்ற இடைவெளி = அதிக சந்தை ஏற்ற இறக்கம்' : `Spread: ₹${max30 - min30}/Quintal volatility`}
          </div>
        </div>

        {/* 4. Mandi Location & Source Info */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:border-stone-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">{t.dataSource}</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
              VERIFIED
            </span>
          </div>

          <div className="mt-1">
            <p className="text-sm font-bold text-stone-900 truncate">
              {language === 'ta' ? market.nameTa : market.nameEn}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'ta'
                ? `${market.districtTa}, ${market.stateTa}`
                : `${market.districtEn}, ${market.stateEn}`}
            </p>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 pt-1.5 border-t border-stone-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {latestRecord ? formatDate(latestRecord.date, language) : '---'}
            </span>
            <span className="font-medium text-stone-600">AGMARKNET</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <PriceForecastChart
        records={records}
        forecastPoints={forecastResult?.forecastPoints || []}
        backtestPoints={forecastResult?.backtestPoints || []}
        language={language}
        selectedRange={selectedRange}
      />

      {/* Mandi Daily Arrivals Bar Chart */}
      <ArrivalsChart records={records} language={language} />

      {/* Gemini AI Quick Explainer & Farmer Intelligence Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-700/60 text-emerald-200">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                {t.advisorTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {language === 'ta'
                ? `${commodity.nameTa} விலை போக்கு & சந்தை காரணிகள்`
                : `Understanding ${commodity.nameEn} Price Drivers in ${market.nameEn}`}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'ta'
                ? 'பருவமழை தாக்கம், பண்டிகை கால தேவை மற்றும் அண்டை மாநில வரத்து மாற்றங்களை அடிப்படையாகக் கொண்ட AI வேளாண் பகுப்பாய்வு.'
                : 'Get server-side AI insights on arrivals, weather shocks, festival demand, and post-harvest storage options.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExplainTrend}
              disabled={aiLoading}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{aiLoading ? (language === 'ta' ? 'ஆராய்ச்சி செய்கிறது...' : 'Analyzing...') : t.explainWithGemini}</span>
            </button>

            <button
              onClick={() => onOpenGeminiAdvisor(`Explain current price trend for ${commodity.nameEn} in ${market.nameEn}`)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{language === 'ta' ? 'உரையாடலை திறக்க' : 'Open Chat'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Generated AI Explanation Box */}
        {aiExplanation && (
          <div className="mt-4 pt-4 border-t border-emerald-700/60 bg-emerald-950/40 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-emerald-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
                <span>🌾</span> {language === 'ta' ? 'ஜெமினி வேளாண் பொருளாதார விளக்கம்' : 'Gemini 3.8 Flash Market Commentary'}
              </span>
              <button
                onClick={() => handleSpeak(aiExplanation)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200 hover:text-white bg-emerald-800/80 px-2 py-1 rounded cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? (language === 'ta' ? 'நிறுத்துக' : 'Stop Audio') : t.readAloud}</span>
              </button>
            </div>
            <p className="whitespace-pre-line text-emerald-100">{aiExplanation}</p>
          </div>
        )}
      </div>

      {/* Recent Official Market Transactions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-stone-900">
              {language === 'ta' ? 'சமீபத்திய சந்தை பதிவுகள்' : 'Recent Mandi Price Transactions'}
            </h4>
            <p className="text-xs text-stone-500">
              {language === 'ta'
                ? 'அரசு ஒழுங்குமுறை விற்பனைக்கூட அதிகாரப்பூர்வ விலைப்பட்டியல்'
                : 'Official historical transaction log from AGMARKNET market yards'}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {records.length} {language === 'ta' ? 'நாட்கள் பதிவுகள்' : 'Days Recorded'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px] tracking-wider bg-stone-50/60">
                <th className="py-2.5 px-3">{language === 'ta' ? 'தேதி' : 'Date'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'பயிர் & ரகம்' : 'Commodity & Variety'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'சந்தை' : 'Market'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'குறைந்த விலை' : 'Min (₹)'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'அதிக விலை' : 'Max (₹)'}</th>
                <th className="py-2.5 px-3 text-right font-bold text-stone-900">{language === 'ta' ? 'மாதிரி விலை' : 'Modal Price (₹)'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'வரத்து (டன்)' : 'Arrivals (T)'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'ta' ? 'மூலம்' : 'Source'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {records.slice(-8).reverse().map((r, i) => (
                <tr key={`rec-row-${r.id}-${i}`} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-stone-700">
                    {formatDate(r.date, language)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-stone-900">
                    {language === 'ta' ? commodity.nameTa : commodity.nameEn}
                    <span className="text-stone-400 block text-[10px]">{r.variety}</span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {language === 'ta' ? market.nameTa : market.nameEn}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                    ₹{r.minPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                    ₹{r.maxPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                    ₹{r.modalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                    {r.arrivalsInTonnes}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {r.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
