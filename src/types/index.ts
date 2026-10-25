export type Language = 'en' | 'ta';

export type CommodityCategory = 'vegetable' | 'grain' | 'cash_crop' | 'fruit';

export interface Commodity {
  id: string;
  nameEn: string;
  nameTa: string;
  category: CommodityCategory;
  defaultUnit: string; // e.g. '₹/Quintal'
  shelfLifeDays: number;
  seasonalityPeak: string;
  descriptionEn: string;
  descriptionTa: string;
  icon: string;
}

export interface MarketRecord {
  id: string;
  date: string; // YYYY-MM-DD
  commodityId: string;
  commodityName: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  minPrice: number; // in INR per quintal
  maxPrice: number;
  modalPrice: number;
  priceUnit: string;
  arrivalsInTonnes: number;
  source: 'AGMARKNET' | 'TN_Govt_UzhavarSandhai' | 'User_Upload' | 'API_Sync';
  retrievalTimestamp: string;
  isSample: boolean;
}

export interface MLMetrics {
  mae: number;
  rmse: number;
  mape: number; // percentage
  r2Score: number;
  sampleCount: number;
  trainSize: number;
  testSize: number;
  trainingTimestamp: string;
  algorithmName: string;
  status: 'trained' | 'insufficient_data';
  insufficientReason?: string;
}

export interface ForecastPoint {
  date: string;
  predictedPrice: number;
  lowerBound80: number;
  upperBound80: number;
  lowerBound95: number;
  upperBound95: number;
  method: string;
  confidenceScore: number;
}

export interface BacktestPoint {
  date: string;
  actualPrice: number;
  predictedPrice: number;
  error: number;
}

export interface ForecastResult {
  commodityId: string;
  market: string;
  forecastDate: string;
  horizonDays: number;
  currentPrice: number;
  predictedFinalPrice: number;
  priceChangeRupees: number;
  priceChangePercent: number;
  trend: 'upward' | 'downward' | 'stable';
  forecastPoints: ForecastPoint[];
  backtestPoints: BacktestPoint[];
  metrics: MLMetrics;
  featureImportance: { feature: string; importance: number }[];
}

export interface MarketComparisonItem {
  id: string;
  market: string;
  district: string;
  state: string;
  distanceKm: number;
  latestModalPrice: number;
  minPrice: number;
  maxPrice: number;
  priceDate: string;
  priceDiffVsAverage: number;
  priceDiffPercent: number;
  source: string;
  trend7d: number[]; // 7-day sparkline
  // Profitability calculations
  estimatedTransportCostPerQuintal: number;
  mandiFeePercent: number;
  handlingChargePerQuintal: number;
  netRealizedPrice: number;
}

export interface DataIngestionConfig {
  sourceName: string;
  apiUrl: string;
  syncFrequency: 'daily' | 'hourly' | 'manual';
  lastSyncTime?: string;
  recordsCount: number;
  status: 'active' | 'configured' | 'sample_only';
}
