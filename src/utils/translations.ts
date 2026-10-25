import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'FutureCrop',
    tagline: 'Smart Price Insights for Every Farmer',
    dashboard: 'Dashboard',
    priceForecast: 'Price Forecast & ML Lab',
    marketComparison: 'Market Comparison',
    dataIngestion: 'Data Ingestion & AGMARKNET',
    geminiAdvisor: 'Gemini AI Crop Advisor',
    pythonMLService: 'Python FastAPI Pipeline',
    
    // Top Bar
    languageToggle: 'தமிழ்',
    officialDataNotice: 'Calibrated AGMARKNET Dataset (Sample Mode for Research & Prototyping)',
    connectLiveMandi: 'Upload Live CSV or Connect API',
    
    // Filters
    commodity: 'Commodity',
    allCategories: 'All Categories',
    vegetables: 'Vegetables',
    grains: 'Grains & Pulses',
    fruits: 'Fruits',
    cashCrops: 'Cash Crops',
    state: 'State',
    district: 'District',
    market: 'Market / Mandi',
    dateRange: 'Historical Range',
    forecastHorizon: 'Forecast Horizon',
    days7: '7 Days',
    days14: '14 Days',
    days30: '30 Days',
    
    // Metrics
    latestModalPrice: 'Latest Market Price',
    predictedFuturePrice: 'Predicted Future Price',
    modelForecastNotice: 'ML Model Forecast',
    officialMandiPrice: 'Official Mandi Price',
    observed30DayRange: '30-Day Price Range',
    highestPrice: 'Highest Observed',
    lowestPrice: 'Lowest Observed',
    priceChange: 'Expected Price Change',
    perQuintal: 'per Quintal (100 kg)',
    lastUpdated: 'Data Last Updated',
    dataSource: 'Data Source',
    
    // Charts
    priceTrendAndForecast: 'Price History & Machine Learning Forecast',
    historicalActual: 'Historical Modal Price',
    priceSpreadBand: 'Min-Max Daily Spread',
    forecastedPrice: 'ML Predicted Price',
    confidenceBand80: '80% Prediction Interval',
    confidenceBand95: '95% Prediction Interval',
    backtestComparison: 'Backtest (Actual vs Predicted)',
    dailyArrivals: 'Daily Mandi Arrivals (Tonnes)',
    
    // ML Metrics
    mlEvaluationTitle: 'Model Backtest & Accuracy Evaluation',
    maeLabel: 'Mean Absolute Error (MAE)',
    rmseLabel: 'Root Mean Squared Error (RMSE)',
    mapeLabel: 'Mean Abs % Error (MAPE)',
    r2Label: 'R² Correlation Score',
    sampleRecords: 'Sample Records',
    trainTestSplit: 'Train / Test Split (Strict Chronological)',
    featureImportanceTitle: 'Feature Importance & Market Drivers',
    insufficientDataWarning: 'Insufficient Historical Data for Reliable Machine Learning Forecast',
    insufficientDataDesc: 'At least 15 continuous market price records are required. Upload additional historical CSV records to generate statistically supported forecasts.',
    
    // Market Compare
    compareTitle: 'Multi-Market Price Comparison across Tamil Nadu',
    compareSubtitle: 'Compare commodity prices across major regulated markets and evaluate true net profit after transport.',
    distanceKm: 'Distance from Farm',
    marketModalPrice: 'Modal Price',
    priceDiffVsAvg: 'Diff vs State Avg',
    transportCost: 'Transit Freight',
    mandiFee: 'Mandi User Fee (1%)',
    handlingCost: 'Hamali / Handling',
    netRealizedPrice: 'Net Realized Price',
    arbitrageAdvisoryTitle: 'Farmer Advisory on Market Arbitrage',
    arbitrageAdvisoryText: 'A higher gross mandi price does not guarantee higher net earnings. Consider transport distance, driver allowances, produce shrinkage during long transit, and loading charges before dispatching to distant wholesale yards like Koyambedu.',
    
    // Ingestion
    ingestionTitle: 'Agricultural Data Ingestion & AGMARKNET Schema',
    ingestionSubtitle: 'Upload official market CSV files or configure direct REST API synchronization.',
    uploadCsv: 'Upload Official Market CSV',
    dragDropCsv: 'Drag and drop your CSV file here, or click to browse',
    csvRequirements: 'Requires: Date, Commodity, Market, Min_Price, Max_Price, Modal_Price (in ₹/Quintal)',
    loadSampleData: 'Load Sample AGMARKNET Tomato / Onion Data',
    downloadTemplate: 'Download AGMARKNET CSV Template',
    csvPreviewTitle: 'Ingested Dataset Preview & Schema Validation',
    
    // Gemini Advisor
    advisorTitle: 'Gemini AI Agricultural Market Advisor',
    advisorSubtitle: 'Ask questions in English or Tamil about price trends, seasonal festival demand, storage tactics, and mandi economics.',
    explainWithGemini: 'Explain Trend with Gemini AI',
    readAloud: 'Read Aloud (Audio)',
    askPlaceholder: 'Ask about market price factors, Pongal demand, or storage life...',
    sendQuestion: 'Send Question',
    quickQuestions: 'Quick Questions for Farmers',
    
    // Python ML Tab
    pythonTitle: 'Python FastAPI Machine Learning Architecture',
    pythonSubtitle: 'Decoupled Scikit-Learn backend ready for cloud deployment via Docker, Uvicorn, and REST APIs.',
    engineMode: 'Active ML Execution Engine',
    engineWeb: 'Web Native Engine (Instant Edge Execution)',
    enginePython: 'External Python FastAPI Endpoint (Local / Cloud)',
    testConnection: 'Test Python API Connection',
    runCommandGuide: 'How to Launch Python Backend Locally'
  },
  ta: {
    appName: 'பியூச்சர் கிராப் (FutureCrop)',
    tagline: 'ஒவ்வொரு விவசாயிக்கும் ஸ்மார்ட் விலை நுண்ணறிவு',
    dashboard: 'கட்டுப்பாட்டு அறை',
    priceForecast: 'விலை கணிப்பு ஆய்வகம்',
    marketComparison: 'சந்தை ஒப்பீடு & லாப கணக்கீடு',
    dataIngestion: 'தரவு பதிவேற்றம் & AGMARKNET',
    geminiAdvisor: 'ஜெமினி AI வேளாண் ஆலோசகர்',
    pythonMLService: 'பைதான் ML கட்டமைப்பு',
    
    // Top Bar
    languageToggle: 'English',
    officialDataNotice: 'மாதிரி AGMARKNET வரலாற்றுத் தரவு (ஆய்வு & மாதிரி வடிவம்)',
    connectLiveMandi: 'நேரடி CSV பதிவேற்றவும் அல்லது API இணைக்கவும்',
    
    // Filters
    commodity: 'பயிர் / விளைபொருள்',
    allCategories: 'அனைத்து வகைகள்',
    vegetables: 'காய்கறிகள்',
    grains: 'தானியங்கள் & பயறு வகைகள்',
    fruits: 'பழங்கள்',
    cashCrops: 'பணப்பயிர்கள்',
    state: 'மாநிலம்',
    district: 'மாவட்டம்',
    market: 'சந்தை / உழவர் சந்தை',
    dateRange: 'வரலாற்று கால அளவு',
    forecastHorizon: 'கணிப்பு கால அளவு',
    days7: '7 நாட்கள்',
    days14: '14 நாட்கள்',
    days30: '30 நாட்கள்',
    
    // Metrics
    latestModalPrice: 'சமீபத்திய சந்தை விலை',
    predictedFuturePrice: 'கணிக்கப்பட்ட எதிர்கால விலை',
    modelForecastNotice: 'ML மாடல் கணிப்பு',
    officialMandiPrice: 'அதிகாரப்பூர்வ மண்டி விலை',
    observed30DayRange: '30 நாள் விலை வரம்பு',
    highestPrice: 'அதிகபட்ச விலை',
    lowestPrice: 'குறைந்தபட்ச விலை',
    priceChange: 'எதிர்பார்க்கப்படும் விலை மாற்றம்',
    perQuintal: 'ஒரு குவிண்டாலுக்கு (100 கிலோ)',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    dataSource: 'தரவு மூலம்',
    
    // Charts
    priceTrendAndForecast: 'விலை வரலாறு & இயந்திர கற்றல் கணிப்பு',
    historicalActual: 'வரலாற்று மாதிரி விலை',
    priceSpreadBand: 'குறைந்தபட்ச-அதிகபட்ச விலை இடைவெளி',
    forecastedPrice: 'ML கணிக்கப்பட்ட விலை',
    confidenceBand80: '80% கணிப்பு இடைவெளி (Confidence)',
    confidenceBand95: '95% கணிப்பு இடைவெளி (Confidence)',
    backtestComparison: 'பின்னோக்கி சோதனை (Backtest)',
    dailyArrivals: 'தினசரி வரத்து (டன்கள்)',
    
    // ML Metrics
    mlEvaluationTitle: 'இயந்திர கற்றல் துல்லிய மதிப்பீடு',
    maeLabel: 'சராசரி பிழை (MAE)',
    rmseLabel: 'வர்க்க சராசரி பிழை (RMSE)',
    mapeLabel: 'சதவீத பிழை (MAPE)',
    r2Label: 'தொடர்பு மதிப்பு (R² Score)',
    sampleRecords: 'பதிவுகள் எண்ணிக்கை',
    trainTestSplit: 'பயிற்சி / சோதனை பிரிப்பு (Chronological Split)',
    featureImportanceTitle: 'விலை மாற்ற முக்கிய காரணிகள் (Feature Importance)',
    insufficientDataWarning: 'சரியான கணிப்பை உருவாக்க போதிய வரலாற்றுத் தரவுகள் இல்லை',
    insufficientDataDesc: 'நம்பகமான கணிப்பை உருவாக்க குறைந்தது 15 நாட்களுக்கான தொடர் சந்தை விலை பதிவுகள் தேவை. கூடுதல் தரவுகளை பதிவேற்றவும்.',
    
    // Market Compare
    compareTitle: 'தமிழ்நாடு முக்கிய சந்தைகள் விலை ஒப்பீடு',
    compareSubtitle: 'பல்வேறு சந்தைகளின் விலைகளை ஒப்பிட்டு, போக்குவரத்து செலவு கழித்த பின் கிடைக்கும் உண்மையான நிகர லாபத்தை கணக்கிடுங்கள்.',
    distanceKm: 'பண்ணையிலிருந்து தூரம்',
    marketModalPrice: 'மாதிரி விலை',
    priceDiffVsAvg: 'மாநில சராசரியுடன் ஒப்பீடு',
    transportCost: 'வாகன வாடகை / டீசல்',
    mandiFee: 'சந்தை கட்டணம் (1%)',
    handlingCost: 'ஏற்றி இறக்கும் கூலி (ஹமாலி)',
    netRealizedPrice: 'உங்களுக்கு கிடைக்கும் நிகர விலை',
    arbitrageAdvisoryTitle: 'விவசாயிகளுக்கான சந்தை ஆலோசனை',
    arbitrageAdvisoryText: 'அதிக விலை தரும் சந்தை என்பது அதிக லாபத்தை தந்துவிடாது. கோயம்பேடு போன்ற தூரத்து சந்தைக்கு அனுப்பும் போது தூரம், எடை குறைவு மற்றும் வாகன செலவுகளை கவனத்தில் கொள்ளவும்.',
    
    // Ingestion
    ingestionTitle: 'விவசாய தரவு பதிவேற்றம் & AGMARKNET கட்டமைப்பு',
    ingestionSubtitle: 'அரசு அதிகாரப்பூர்வ CSV கோப்புகளை பதிவேற்றவும் அல்லது நேரடி API இணைப்பை அமைக்கவும்.',
    uploadCsv: 'அதிகாரப்பூர்வ CSV கோப்பை பதிவேற்றவும்',
    dragDropCsv: 'உங்கள் CSV கோப்பை இங்கே இழுத்து விடவும் அல்லது கிளிக் செய்து தேர்ந்தெடுக்கவும்',
    csvRequirements: 'தேவைப்படும் விவரங்கள்: தேதி, பயிர், சந்தை, குறைந்தபட்ச விலை, அதிகபட்ச விலை, மாதிரி விலை (ரூ/குவிண்டால்)',
    loadSampleData: 'மாதிரி தக்காளி / வெங்காய தரவை ஏற்றுக',
    downloadTemplate: 'CSV மாதிரி படிவத்தை பதிவிறக்குக',
    csvPreviewTitle: 'பதிவேற்றப்பட்ட தரவு முன்னோட்டம் & சரிபார்ப்பு',
    
    // Gemini Advisor
    advisorTitle: 'ஜெமினி AI வேளாண் சந்தை ஆலோசகர்',
    advisorSubtitle: 'விலை போக்கு, பொங்கல் பண்டிகை தேவை, பாதுகாக்கும் வழிகள் குறித்து எளிய தமிழில் கேளுங்கள்.',
    explainWithGemini: 'ஜெமினி AI மூலம் விளக்கம் பெறுக',
    readAloud: 'குரல் வழியே கேட்க (Audio)',
    askPlaceholder: 'சந்தை விலை மாற்றங்கள், விளைச்சல் அல்லது சேமிப்பு பற்றி கேளுங்கள்...',
    sendQuestion: 'கேள்வி கேட்க',
    quickQuestions: 'விவசாயிகளுக்கான விரைவு கேள்விகள்',
    
    // Python ML Tab
    pythonTitle: 'பைதான் FastAPI இயந்திர கற்றல் கட்டமைப்பு',
    pythonSubtitle: 'Docker, Uvicorn மற்றும் REST API மூலம் இயக்கக்கூடிய பிரத்யேக Scikit-Learn ML கட்டமைப்பு.',
    engineMode: 'இயக்கப்படும் ML இயந்திரம்',
    engineWeb: 'வலைத்தள நேரடி இயந்திரம் (Edge Execution)',
    enginePython: 'வெளிப்புற பைதான் FastAPI சேவை (Local / Cloud)',
    testConnection: 'பைதான் API இணைப்பை சோதிக்க',
    runCommandGuide: 'கணினியில் பைதான் சேவையை இயக்குவது எப்படி?'
  }
};
