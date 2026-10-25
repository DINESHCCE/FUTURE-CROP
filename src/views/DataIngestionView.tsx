import React, { useState } from 'react';
import { Commodity, MarketRecord, Language } from '../types';
import { MarketLocation } from '../data/agriDatasets';
import { TRANSLATIONS } from '../utils/translations';
import { formatDate, formatINR } from '../utils/formatting';
import {
  Upload,
  Database,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DataIngestionViewProps {
  commodity: Commodity;
  market: MarketLocation;
  currentRecords: MarketRecord[];
  onIngestNewRecords: (newRecords: MarketRecord[], sourceName: string) => void;
  language: Language;
}

export const DataIngestionView: React.FC<DataIngestionViewProps> = ({
  commodity,
  market,
  currentRecords,
  onIngestNewRecords,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<MarketRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Parse CSV text into normalized MarketRecords
  const parseCSV = (text: string) => {
    setValidationErrors([]);
    setIsSuccess(false);

    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setValidationErrors(['CSV file must contain a header row and at least one record.']);
      setParsedPreview([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const modalIdx = headers.findIndex((h) => h.includes('modal'));
    const minIdx = headers.findIndex((h) => h.includes('min'));
    const maxIdx = headers.findIndex((h) => h.includes('max'));
    const varietyIdx = headers.findIndex((h) => h.includes('variety'));
    const arrivalsIdx = headers.findIndex((h) => h.includes('arrival'));

    if (dateIdx === -1 || modalIdx === -1) {
      setValidationErrors([
        "Missing required columns. CSV must include 'Date' and 'Modal_Price' (or 'Modal Price').",
      ]);
      setParsedPreview([]);
      return;
    }

    const records: MarketRecord[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/['"]/g, ''));
      const rawDate = cols[dateIdx];
      const modal = parseFloat(cols[modalIdx]);
      const min = minIdx !== -1 ? parseFloat(cols[minIdx]) : Math.round(modal * 0.95);
      const max = maxIdx !== -1 ? parseFloat(cols[maxIdx]) : Math.round(modal * 1.05);
      const variety = varietyIdx !== -1 ? cols[varietyIdx] : 'Common Grade';
      const arrivals = arrivalsIdx !== -1 ? parseFloat(cols[arrivalsIdx]) : 25;

      if (!rawDate || isNaN(modal) || modal <= 0) {
        errors.push(`Row ${i + 1}: Invalid date or non-positive modal price.`);
        continue;
      }

      // Check min <= modal <= max
      if (min > modal || modal > max) {
        errors.push(`Row ${i + 1}: Warning: Inconsistent spread (Min ₹${min} > Modal ₹${modal} or Modal > Max ₹${max}). Normalizing bounds.`);
      }

      records.push({
        id: `uploaded-${i}-${Date.now()}`,
        date: rawDate,
        commodityId: commodity.id,
        commodityName: commodity.nameEn,
        variety,
        state: market.stateEn,
        district: market.districtEn,
        market: market.nameEn,
        minPrice: Math.min(min, modal),
        maxPrice: Math.max(max, modal),
        modalPrice: modal,
        priceUnit: '₹/Quintal',
        arrivalsInTonnes: isNaN(arrivals) ? 20 : arrivals,
        source: 'User_Upload',
        retrievalTimestamp: new Date().toISOString(),
        isSample: false,
      });
    }

    setValidationErrors(errors);
    setParsedPreview(records);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleApplyToPipeline = () => {
    if (parsedPreview.length === 0) return;
    onIngestNewRecords(parsedPreview, 'User Ingested Official Data');
    setIsSuccess(true);
  };

  // Download official AGMARKNET template CSV
  const handleDownloadTemplate = () => {
    const templateContent = `Date,Commodity,State,District,Market,Variety,Min_Price,Max_Price,Modal_Price,Price_Unit,Arrivals_Tonnes
2026-10-01,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2400,2800,2650,₹/Quintal,42.5
2026-10-02,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2450,2850,2700,₹/Quintal,38.0
2026-10-03,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2400,2750,2600,₹/Quintal,45.2
2026-10-04,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2500,2900,2750,₹/Quintal,36.4
2026-10-05,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2550,2950,2800,₹/Quintal,32.0
2026-10-06,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2600,3000,2850,₹/Quintal,29.8
2026-10-07,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2500,2900,2700,₹/Quintal,40.1
2026-10-08,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2450,2850,2650,₹/Quintal,41.0
2026-10-09,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2400,2800,2600,₹/Quintal,44.5
2026-10-10,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2500,2900,2720,₹/Quintal,35.0
2026-10-11,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2550,3000,2800,₹/Quintal,30.5
2026-10-12,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2600,3100,2900,₹/Quintal,28.0
2026-10-13,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2650,3150,2950,₹/Quintal,26.5
2026-10-14,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2700,3200,3000,₹/Quintal,24.0
2026-10-15,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2650,3100,2920,₹/Quintal,31.2
2026-10-16,Tomato,Tamil Nadu,Chennai,Koyambedu,Hybrid,2600,3050,2850,₹/Quintal,36.0`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AGMARKNET_${commodity.id}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {t.ingestionTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'ta'
                ? 'அரசு AGMARKNET, data.gov.in மற்றும் உழவர் சந்தை தரவு கட்டமைப்பு சரிபார்ப்பு & பதிவேற்றம்'
                : 'Schema normalization for official AGMARKNET, Open Government Data (OGD), and Tamil Nadu Mandi feeds'}
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer border border-stone-300"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>{t.downloadTemplate}</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-700" />
          <span>{t.uploadCsv}</span>
        </h3>

        <div className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 sm:p-8 text-center transition-all bg-stone-50/50">
          <input
            type="file"
            accept=".csv,text/csv"
            id="csv-file-input"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer block space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">
                {fileName ? fileName : t.dragDropCsv}
              </p>
              <p className="text-xs text-stone-500 mt-1">{t.csvRequirements}</p>
            </div>
            <span className="inline-block px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-2xs hover:bg-emerald-900">
              {language === 'ta' ? 'கோப்பை தேர்வு செய்க' : 'Browse Local Files'}
            </span>
          </label>
        </div>

        {/* Validation Errors / Alerts */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>{language === 'ta' ? 'தரவு சரிபார்ப்பு எச்சரிக்கைகள்:' : 'Data Validation Warnings:'}</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 font-mono">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Successful Apply Button */}
        {parsedPreview.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div>
              <p className="text-xs font-bold text-emerald-900">
                ✓ {parsedPreview.length} {language === 'ta' ? 'சரியான பதிவுகள் கண்டறியப்பட்டன' : 'Valid Market Records Ingested & Normalized'}
              </p>
              <p className="text-[11px] text-emerald-700">
                {language === 'ta'
                  ? 'இந்தத் தரவுகளை உடனடியாக விலை கணிப்பு மற்றும் இயந்திர கற்றல் ஆய்வகத்தில் ஏற்றலாம்.'
                  : 'Ready to replace pre-loaded sample series with your verified official market dataset.'}
              </p>
            </div>

            <button
              onClick={handleApplyToPipeline}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>{language === 'ta' ? 'மாடலில் ஏற்று' : 'Load Into Active Model Pipeline'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-xl text-green-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>
              {language === 'ta'
                ? 'தரவு வெற்றிகரமாக மாதிரி இயந்திரத்தில் ஏற்றப்பட்டது! Dashboard சென்று புதிய கணிப்புகளைக் காணலாம்.'
                : 'Dataset successfully loaded into ML Engine! Return to Dashboard to view updated forecasts.'}
            </span>
          </div>
        )}
      </div>

      {/* Normalized Ingestion Schema Spec */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-700" />
          <span>{language === 'ta' ? 'அதிகாரப்பூர்வ AGMARKNET தரவு வடிவமைப்பு' : 'Official AGMARKNET Standard Schema'}</span>
        </h3>
        <p className="text-xs text-stone-500">
          {language === 'ta'
            ? 'அனைத்து உள்ளீடுகளும் கீழ்கண்ட சர்வதேச மற்றும் தேசிய வடிவமைப்புடன் தானாக இயல்பாக்கப்படுகின்றன (Normalized):'
            : 'All incoming historical feeds are normalized into this unified relational schema for ML model consistency:'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { field: 'date', type: 'YYYY-MM-DD', req: true, desc: 'Trading auction date (ISO 8601)' },
            { field: 'commodity', type: 'string', req: true, desc: 'Standardized commodity name (e.g. Tomato)' },
            { field: 'state & district', type: 'string', req: true, desc: 'Tamil Nadu mandi administrative boundary' },
            { field: 'market', type: 'string', req: true, desc: 'Regulated APMC Market or Uzhavar Sandhai' },
            { field: 'min_price', type: 'float (₹/Quintal)', req: false, desc: 'Lowest auction bid in mandi' },
            { field: 'max_price', type: 'float (₹/Quintal)', req: false, desc: 'Highest auction bid for grade A' },
            { field: 'modal_price', type: 'float (₹/Quintal)', req: true, desc: 'Most frequent trading price (Model Target)' },
            { field: 'price_unit', type: '₹/Quintal (100 kg)', req: true, desc: 'Standard agricultural volume metric' },
            { field: 'source & timestamp', type: 'ISO Timestamp', req: true, desc: 'Audit trail for data provenance' },
          ].map((col, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">{col.field}</span>
                {col.req && (
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">
                    REQUIRED
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-emerald-700 mt-0.5">{col.type}</p>
              <p className="text-[11px] text-stone-500 mt-1">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
