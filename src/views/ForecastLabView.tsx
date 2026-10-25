import React, { useState } from 'react';
import { Commodity, MarketRecord, ForecastResult, Language } from '../types';
import { MarketLocation } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import { formatINR, formatPercent, formatDate } from '../utils/formatting';
import {
  Brain,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ForecastLabViewProps {
  commodity: Commodity;
  market: MarketLocation;
  records: MarketRecord[];
  forecastResult: ForecastResult | null;
  language: Language;
  onHorizonChange: (horizon: number) => void;
  selectedHorizon: number;
}

export const ForecastLabView: React.FC<ForecastLabViewProps> = ({
  commodity,
  market,
  records,
  forecastResult,
  language,
  onHorizonChange,
  selectedHorizon,
}) => {
  const t = TRANSLATIONS[language];
  const [activeMetricTab, setActiveMetricTab] = useState<'backtest' | 'features' | 'intervals'>('backtest');

  const isTrained = forecastResult?.metrics.status === 'trained';
  const metrics = forecastResult?.metrics;

  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Brain className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {language === 'ta' ? 'இயந்திர கற்றல் விலை கணிப்பு ஆய்வகம்' : 'Machine Learning Price Prediction Lab'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'ta'
                ? 'நேர ஒழுங்குமுறைப் பிரிப்பு (Chronological Split), லேக் அம்சங்கள் & ரேண்டம் ஃபாரஸ்ட் ரெக்ரஷன் மதிப்பீடு'
                : 'Deterministic feature engineering, chronological train/test splitting & out-of-sample backtest validation'}
            </p>
          </div>

          {/* Model Status Badge */}
          <div className="flex items-center gap-2">
            {isTrained ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'ta' ? 'மாடல் பயிற்சி பெற்றது (Trained)' : 'Model Evaluated & Verified'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t.insufficientDataWarning}</span>
              </div>
            )}
          </div>
        </div>

        {/* Insufficient Data Guard Alert (if applicable) */}
        {!isTrained && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              {t.insufficientDataWarning}
            </p>
            <p className="text-amber-800 leading-relaxed">
              {metrics?.insufficientReason || t.insufficientDataDesc}
            </p>
          </div>
        )}
      </div>

      {/* 4 Statistical Metrics Cards */}
      {isTrained && metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MAE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
              {t.maeLabel}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
                ₹{metrics.mae}
              </span>
              <span className="text-xs text-stone-500">/ Quintal</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {language === 'ta' ? 'சராசரியாக கணிப்பு மாறுபடும் தொகை' : 'Average absolute divergence on test set'}
            </p>
          </div>

          {/* RMSE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
              {t.rmseLabel}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
                ₹{metrics.rmse}
              </span>
              <span className="text-xs text-stone-500">/ Quintal</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {language === 'ta' ? 'பெரிய விலையேற்ற பிழைகளுக்கான தண்டனை' : 'Penalizes large outlier price spikes'}
            </p>
          </div>

          {/* MAPE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
              {t.mapeLabel}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {metrics.mape}%
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {language === 'ta' ? 'சதவீத அளவிலான துல்லியம்' : 'Mean relative percentage forecast error'}
            </p>
          </div>

          {/* R2 Score */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
              {t.r2Label}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono">
                {metrics.r2Score}
              </span>
              <span className="text-xs text-stone-500">/ 1.00</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {language === 'ta' ? 'விலை இயக்கத்தை விளக்கும் திறன்' : 'Goodness of fit on out-of-sample data'}
            </p>
          </div>
        </div>
      )}

      {/* Chronological Validation & Horizon Controller */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'காலவரிசைப் பிரிப்பு & கணிப்பு காலம்' : 'Chronological Data Split & Horizon'}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'ta'
                ? 'எதிர்காலத் தரவு கசிவை (Future Leakage) தடுக்க முதல் 80% பயிற்சிக்கும், பிந்தைய 20% சோதனைக்கும் பயன்படுத்தப்படுகிறது.'
                : 'Strict chronological ordering guarantees that test evaluations never peer into future auction data.'}
            </p>
          </div>

          {/* Horizon Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => onHorizonChange(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedHorizon === h
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {h} {language === 'ta' ? 'நாட்கள்' : 'Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Chronological Split Bar */}
        {metrics && (
          <div className="space-y-1.5 pt-2">
            <div className="h-4 w-full rounded-full bg-stone-200 overflow-hidden flex">
              <div
                style={{ width: `${Math.round((metrics.trainSize / (metrics.sampleCount || 1)) * 100)}%` }}
                className="bg-emerald-600 h-full flex items-center justify-center text-[9px] text-white font-bold"
                title={`Train: ${metrics.trainSize} days`}
              >
                TRAIN ({metrics.trainSize}d)
              </div>
              <div
                style={{ width: `${Math.round((metrics.testSize / (metrics.sampleCount || 1)) * 100)}%` }}
                className="bg-indigo-600 h-full flex items-center justify-center text-[9px] text-white font-bold"
                title={`Test: ${metrics.testSize} days`}
              >
                TEST ({metrics.testSize}d)
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>{language === 'ta' ? 'பயிற்சித் தொகுதி (முந்தைய 80%)' : 'Historical Training Window (Past 80%)'}</span>
              <span>{language === 'ta' ? 'சோதனைத் தொகுதி (பிந்தைய 20% Backtest)' : 'Validation Out-of-Sample Window (20%)'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for Deep ML Inspection: Backtest Points, Feature Importance, Confidence Intervals */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Navigation tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveMetricTab('backtest')}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeMetricTab === 'backtest'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            {language === 'ta' ? 'பின்னோக்கி சோதனை பதிவுகள் (Backtest Table)' : 'Out-of-Sample Backtest Records'}
          </button>
          <button
            onClick={() => setActiveMetricTab('features')}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeMetricTab === 'features'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            {language === 'ta' ? 'காரணிகள் முக்கியத்துவம் (Feature Importance)' : 'Feature Importance Weights'}
          </button>
          <button
            onClick={() => setActiveMetricTab('intervals')}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeMetricTab === 'intervals'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            {language === 'ta' ? 'கணிப்பு இடைவெளிகள் (Uncertainty Cones)' : 'Statistical Uncertainty Intervals'}
          </button>
        </div>

        <div className="p-5">
          {/* 1. Backtest Table */}
          {activeMetricTab === 'backtest' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                {language === 'ta'
                  ? 'கீழ்கண்ட அட்டவணை மாடல் முன் எப்போதும் பார்த்திராத சோதனைத் தரவுகளில் (Out-of-sample) கணிக்கப்பட்ட மற்றும் உண்மையான விலைகளை ஒப்பிடுகிறது.'
                  : 'Comparing actual mandi modal prices against model predictions on unseen chronological test records.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px] tracking-wider bg-stone-50">
                      <th className="py-2.5 px-3">{language === 'ta' ? 'தேதி' : 'Date'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'உண்மையான விலை' : 'Actual Mandi Price'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'மாடல் கணிப்பு' : 'ML Predicted Price'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'வேறுபாடு (Error)' : 'Residual Error'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'பிழை சதவீதம்' : '% Error'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {forecastResult?.backtestPoints.slice(-10).map((bp, i) => {
                      const pct = Math.abs((bp.error / bp.actualPrice) * 100);
                      return (
                        <tr key={`bt-row-${bp.date}-${i}`} className="hover:bg-stone-50/80">
                          <td className="py-2 px-3 text-stone-700 font-sans">{formatDate(bp.date, language)}</td>
                          <td className="py-2 px-3 text-right font-bold text-stone-900">
                            {formatINR(bp.actualPrice)}
                          </td>
                          <td className="py-2 px-3 text-right text-indigo-700">
                            {formatINR(bp.predictedPrice)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className={bp.error > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {bp.error > 0 ? `+${bp.error}` : bp.error}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-stone-600">
                            {pct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Feature Importance */}
          {activeMetricTab === 'features' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                {language === 'ta'
                  ? 'ரேண்டம் ஃபாரஸ்ட் மற்றும் ஆட்டோ-ரிக்ரஷன் மாடலில் விலை மாற்றங்களை தீர்மானிக்கும் முக்கிய காரணிகள்:'
                  : 'Relative weight of each lag feature, moving average, and calendar seasonality indicator:'}
              </p>

              <div className="space-y-3">
                {forecastResult?.featureImportance.map((f, i) => (
                  <div key={`feat-${f.feature}-${i}`} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span>{f.feature}</span>
                      <span className="font-mono text-emerald-800">{f.importance}%</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${f.importance * 2}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Prediction Intervals */}
          {activeMetricTab === 'intervals' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                {language === 'ta'
                  ? 'கணிப்பு காலம் தூரமாக செல்ல செல்ல நிச்சயமற்ற தன்மை (Uncertainty) அதிகரிக்கிறது. 80% மற்றும் 95% நிகழ்தகவு இடைவெளிகள்:'
                  : 'Statistical confidence intervals widen over the forecast horizon as compounding autoregressive variance accumulates:'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px] tracking-wider bg-stone-50 font-sans">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Predicted (₹)</th>
                      <th className="py-2.5 px-3 text-center">80% Interval</th>
                      <th className="py-2.5 px-3 text-center">95% Interval</th>
                      <th className="py-2.5 px-3 text-right font-sans">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {forecastResult?.forecastPoints.map((fp, i) => (
                      <tr key={`fp-row-${fp.date}-${i}`} className="hover:bg-stone-50/80">
                        <td className="py-2 px-3 text-stone-700 font-sans">{formatDate(fp.date, language)}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-900">
                          {formatINR(fp.predictedPrice)}
                        </td>
                        <td className="py-2 px-3 text-center text-emerald-800">
                          ₹{fp.lowerBound80} ── ₹{fp.upperBound80}
                        </td>
                        <td className="py-2 px-3 text-center text-stone-500">
                          ₹{fp.lowerBound95} ── ₹{fp.upperBound95}
                        </td>
                        <td className="py-2 px-3 text-right font-sans text-stone-700">
                          {Math.round(fp.confidenceScore * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
