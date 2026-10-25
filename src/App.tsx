import React, { useState, useEffect, useMemo } from 'react';
import { Commodity, MarketRecord, ForecastResult, Language } from './types';
import { COMMODITIES, TAMIL_NADU_MARKETS, MarketLocation, generateHistoricalMarketRecords } from './data/agriDatasets';
import { mlEngine } from './services/mlEngine';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CropSelector } from './components/CropSelector';
import { DashboardView } from './views/DashboardView';
import { ForecastLabView } from './views/ForecastLabView';
import { MarketCompareView } from './views/MarketCompareView';
import { DataIngestionView } from './views/DataIngestionView';
import { GeminiAdvisorView } from './views/GeminiAdvisorView';
import { PythonMLView } from './views/PythonMLView';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Selected filters
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITIES[0]); // Tomato
  const [selectedMarket, setSelectedMarket] = useState<MarketLocation>(TAMIL_NADU_MARKETS[0]); // Koyambedu
  const [selectedRange, setSelectedRange] = useState<string>('3m'); // 1m, 3m, 6m, 1y
  const [selectedHorizon, setSelectedHorizon] = useState<number>(14); // 7, 14, 30 days

  // Python ML Engine toggle
  const [isPythonEngineActive, setIsPythonEngineActive] = useState<boolean>(false);
  const [pythonEndpoint, setPythonEndpoint] = useState<string>('http://localhost:8000');

  // Custom user ingested records map (overrides default calibration dataset when uploaded)
  const [customRecordsMap, setCustomRecordsMap] = useState<Record<string, MarketRecord[]>>({});

  // Prompt to pass to Gemini Advisor if opened from a dashboard button
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string>('');

  // Map selected range string to days count
  const rangeDays = useMemo(() => {
    switch (selectedRange) {
      case '1m':
        return 30;
      case '3m':
        return 90;
      case '6m':
        return 180;
      case '1y':
        return 365;
      default:
        return 90;
    }
  }, [selectedRange]);

  // Compute active records
  const currentRecords = useMemo(() => {
    const key = `${selectedCommodity.id}_${selectedMarket.id}`;
    if (customRecordsMap[key] && customRecordsMap[key].length > 0) {
      return customRecordsMap[key];
    }
    return generateHistoricalMarketRecords(selectedCommodity.id, selectedMarket.id, rangeDays);
  }, [selectedCommodity.id, selectedMarket.id, rangeDays, customRecordsMap]);

  // Compute Machine Learning Forecast
  const forecastResult: ForecastResult | null = useMemo(() => {
    if (!currentRecords || currentRecords.length === 0) return null;
    return mlEngine.trainAndForecast(currentRecords, selectedHorizon);
  }, [currentRecords, selectedHorizon]);

  // Handle new uploaded CSV data
  const handleIngestNewRecords = (newRecords: MarketRecord[], sourceName: string) => {
    const key = `${selectedCommodity.id}_${selectedMarket.id}`;
    setCustomRecordsMap((prev) => ({
      ...prev,
      [key]: newRecords,
    }));
  };

  const handleOpenAdvisorWithPrompt = (prompt?: string) => {
    if (prompt) setAdvisorInitialPrompt(prompt);
    setActiveTab('gemini');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isPythonEngineActive={isPythonEngineActive}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={language}
          selectedCommodity={selectedCommodity}
          selectedMarketName={language === 'ta' ? selectedMarket.nameTa : selectedMarket.nameEn}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Center Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Universal Crop, Market, Range & Horizon Selector Bar */}
          <CropSelector
            selectedCommodity={selectedCommodity}
            onCommodityChange={setSelectedCommodity}
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            selectedHorizon={selectedHorizon}
            onHorizonChange={setSelectedHorizon}
            language={language}
          />

          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              commodity={selectedCommodity}
              market={selectedMarket}
              records={currentRecords}
              forecastResult={forecastResult}
              language={language}
              selectedRange={selectedRange}
              onOpenGeminiAdvisor={handleOpenAdvisorWithPrompt}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastLabView
              commodity={selectedCommodity}
              market={selectedMarket}
              records={currentRecords}
              forecastResult={forecastResult}
              language={language}
              onHorizonChange={setSelectedHorizon}
              selectedHorizon={selectedHorizon}
            />
          )}

          {activeTab === 'compare' && (
            <MarketCompareView
              commodity={selectedCommodity}
              language={language}
            />
          )}

          {activeTab === 'ingestion' && (
            <DataIngestionView
              commodity={selectedCommodity}
              market={selectedMarket}
              currentRecords={currentRecords}
              onIngestNewRecords={handleIngestNewRecords}
              language={language}
            />
          )}

          {activeTab === 'gemini' && (
            <GeminiAdvisorView
              commodity={selectedCommodity}
              market={selectedMarket}
              forecastResult={forecastResult}
              language={language}
              initialPrompt={advisorInitialPrompt}
            />
          )}

          {activeTab === 'python_ml' && (
            <PythonMLView
              language={language}
              isPythonEngineActive={isPythonEngineActive}
              onTogglePythonEngine={setIsPythonEngineActive}
              pythonEndpoint={pythonEndpoint}
              onEndpointChange={setPythonEndpoint}
            />
          )}
        </main>
      </div>
    </div>
  );
}
