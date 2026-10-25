import { Commodity, MarketRecord } from '../types';

export const COMMODITIES: Commodity[] = [
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameTa: 'தக்காளி',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 5,
    seasonalityPeak: 'Jul - Oct & Jan - Mar',
    descriptionEn: 'Highly perishable red vegetable. Prices are sensitive to monsoon rainfall and transit delays.',
    descriptionTa: 'விரைவில் கெடக்கூடிய காய்கறி. பருவமழை மற்றும் போக்குவரத்து காலதாமதங்களால் விலை மாறக்கூடியது.',
    icon: '🍅'
  },
  {
    id: 'onion',
    nameEn: 'Onion',
    nameTa: 'வெங்காயம்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 45,
    seasonalityPeak: 'Nov - Jan (Kharif) & Apr - Jun (Rabi)',
    descriptionEn: 'Essential bulb crop. Subject to storage cycles and inter-state arrivals from Maharashtra and Karnataka.',
    descriptionTa: 'முக்கிய சமையல் பயிர். மகாராஷ்டிரா, கர்நாடகா மாநில வரத்து மற்றும் சேமிப்பு காலங்களை சார்ந்தது.',
    icon: '🧅'
  },
  {
    id: 'potato',
    nameEn: 'Potato',
    nameTa: 'உருளைக்கிழங்கு',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 60,
    seasonalityPeak: 'Jan - Apr & Aug - Oct',
    descriptionEn: 'Cold-storage supported tuber. Nilgiris and Hassan produce have distinct market premiums.',
    descriptionTa: 'குளிர்பதன கிடங்கு ஆதரவு கொண்ட கிழங்கு பயிர். நீலகிரி மற்றும் ஹாசன் விளைச்சல் உயர்ந்த விலை பெறும்.',
    icon: '🥔'
  },
  {
    id: 'brinjal',
    nameEn: 'Brinjal',
    nameTa: 'கத்தரிக்காய்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 6,
    seasonalityPeak: 'Year-round (Peak: Dec - Feb)',
    descriptionEn: 'Local staple grown across Tamil Nadu with varieties like Bhavani, Annamalai, and Round Purple.',
    descriptionTa: 'பவானி, அண்ணாமலை ரகங்கள் உட்பட தமிழ்நாடு முழுவதும் பயிரிடப்படும் முக்கிய காய்கறி.',
    icon: '🍆'
  },
  {
    id: 'cabbage',
    nameEn: 'Cabbage',
    nameTa: 'முட்டைக்கோஸ்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 14,
    seasonalityPeak: 'Nov - Feb',
    descriptionEn: 'Cool-season brassica crop cultivated widely in hill tracks of Ooty, Kodaikanal, and Belgaum.',
    descriptionTa: 'ஊட்டி, கொடைக்கானல் மலைப்பகுதிகள் மற்றும் பெல்காமில் பெருமளவில் விளையும் குளிர் கால பயிர்.',
    icon: '🥬'
  },
  {
    id: 'cauliflower',
    nameEn: 'Cauliflower',
    nameTa: 'காலிஃபிளவர்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 8,
    seasonalityPeak: 'Nov - Feb',
    descriptionEn: 'Delicate curd vegetable, demands rapid cold logistics and fetch premium in metropolitan mandis.',
    descriptionTa: 'விரைவான குளிர் போக்குவரத்து தேவைப்படும் மென்மையான பயிர்; பெருநகர சந்தைகளில் நல்ல விலை பெறும்.',
    icon: '🥦'
  },
  {
    id: 'green_chilli',
    nameEn: 'Green Chilli',
    nameTa: 'பச்சை மிளகாய்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 10,
    seasonalityPeak: 'Jan - May',
    descriptionEn: 'High-value condiment crop. Andhra Guntur and Tamil Nadu Ramanathapuram crops set benchmarks.',
    descriptionTa: 'அதிக மதிப்புள்ள மசாலா பயிர். ஆந்திர குண்டூர் மற்றும் தமிழ்நாடு ராமநாதபுரம் சந்தைகளில் விலை நிர்ணயமாகிறது.',
    icon: '🌶️'
  },
  {
    id: 'bhendi',
    nameEn: 'Bhendi (Okra)',
    nameTa: 'வெண்டைக்காய்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 4,
    seasonalityPeak: 'Mar - Jun & Sep - Nov',
    descriptionEn: 'Very tender vegetable requiring daily morning harvesting. Quick price adjustments in wholesale yards.',
    descriptionTa: 'தினமும் காலையில் அறுவடை செய்ய வேண்டிய மென்மையான காய்; மொத்த சந்தைகளில் விரைவான விலை மாற்றம் இருக்கும்.',
    icon: '🌱'
  },
  {
    id: 'carrot',
    nameEn: 'Carrot',
    nameTa: 'கேரட்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 20,
    seasonalityPeak: 'Dec - Mar (Ooty Harvest)',
    descriptionEn: 'Nilgiris premium carrot has high sugar content and commands steady demand in Koyambedu and Madurai.',
    descriptionTa: 'நீலகிரி மலை கேரட் அதிக இனிப்புத்தன்மை கொண்டது; கோயம்பேடு மற்றும் மதுரை சந்தைகளில் சீரான வரவேற்பு உண்டு.',
    icon: '🥕'
  },
  {
    id: 'beans',
    nameEn: 'Beans',
    nameTa: 'பீன்ஸ்',
    category: 'vegetable',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 6,
    seasonalityPeak: 'Dec - Apr',
    descriptionEn: 'French & Ring beans harvested from Thalavadi and Dindigul belts. Prone to mid-week price spikes.',
    descriptionTa: 'தளவாடி, திண்டுக்கல் பகுதிகளில் பயிரிடப்படும் பிரெஞ்சு பீன்ஸ்; வாரத்தின் நடுப்பகுதியில் விலை ஏற்றம் காணப்படும்.',
    icon: '🫘'
  },
  {
    id: 'banana',
    nameEn: 'Banana',
    nameTa: 'வாழை',
    category: 'fruit',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 7,
    seasonalityPeak: 'Jul - Nov (Festive & Marriage seasons)',
    descriptionEn: 'Poovan, Rasthali, and Grand Naine varieties. Strong correlation with Tamil festival calendar.',
    descriptionTa: 'பூவன், ரஸ்தாளி, கிராண்ட் நைன் ரகங்கள். தமிழ் திருவிழாக்கள் மற்றும் சுபதின காலங்களில் அதிக தேவை இருக்கும்.',
    icon: '🍌'
  },
  {
    id: 'paddy',
    nameEn: 'Paddy',
    nameTa: 'நெல்',
    category: 'grain',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 365,
    seasonalityPeak: 'Oct - Jan (Kuruvai / Samba)',
    descriptionEn: 'Primary cereal crop. Regulated by Minimum Support Price (MSP) and TN Direct Purchase Centres (DPCs).',
    descriptionTa: 'முக்கிய உணவு தானியம். மத்திய அரசு குறைந்தபட்ச ஆதரவு விலை (MSP) மற்றும் நேரடி நெல் கொள்முதல் நிலையங்களால் முறைப்படுத்தப்படுகிறது.',
    icon: '🌾'
  },
  {
    id: 'maize',
    nameEn: 'Maize',
    nameTa: 'மக்காச்சோளம்',
    category: 'grain',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 180,
    seasonalityPeak: 'Jan - Mar & Sep - Oct',
    descriptionEn: 'Crucial livestock feed and industrial starch crop. Strong trading volume in Udumalpet and Perambalur.',
    descriptionTa: 'கால்நடை தீவனம் மற்றும் மாவுச்சத்து தொழில்களுக்கான பயிர். உடுமலைப்பேட்டை மற்றும் பெரம்பலூரில் அதிக வர்த்தகம்.',
    icon: '🌽'
  },
  {
    id: 'groundnut',
    nameEn: 'Groundnut',
    nameTa: 'வேர்க்கடலை',
    category: 'cash_crop',
    defaultUnit: '₹/Quintal',
    shelfLifeDays: 180,
    seasonalityPeak: 'Dec - Mar & Jun - Aug',
    descriptionEn: 'Oilseed crop with steady oil mill procurement in Tindivanam, Vellore, and Tiruvannamalai mandis.',
    descriptionTa: 'எண்ணெய் வித்து பயிர். திண்டிவனம், வேலூர், திருவண்ணாமலை ஒழுங்குமுறை விற்பனைக்கூடங்களில் அதிக கிராக்கி.',
    icon: '🥜'
  }
];

export interface MarketLocation {
  id: string;
  nameEn: string;
  nameTa: string;
  districtEn: string;
  districtTa: string;
  stateEn: string;
  stateTa: string;
  distanceFromFarmKm: number; // reference distance for calculation
  typicalMandiFeePercent: number; // e.g. 1.0%
  handlingCostPerQuintal: number; // e.g. ₹25
}

export const TAMIL_NADU_MARKETS: MarketLocation[] = [
  {
    id: 'koyambedu',
    nameEn: 'Koyambedu Wholesale Market Complex',
    nameTa: 'கோயம்பேடு மொத்த விற்பனை வளாகம்',
    districtEn: 'Chennai',
    districtTa: 'சென்னை',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 160,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 35
  },
  {
    id: 'coimbatore_apmc',
    nameEn: 'Coimbatore M.G.R. Market / APMC',
    nameTa: 'கோவை எம்.ஜி.ஆர் சந்தை / ஒழுங்குமுறை விற்பனைக்கூடம்',
    districtEn: 'Coimbatore',
    districtTa: 'கோயம்புத்தூர்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 180,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 30
  },
  {
    id: 'madurai_central',
    nameEn: 'Madurai Mattuthavani Central Market',
    nameTa: 'மதுரை மாட்டுத்தாவணி மத்திய சந்தை',
    districtEn: 'Madurai',
    districtTa: 'மதுரை',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 210,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 28
  },
  {
    id: 'oddanchatram',
    nameEn: 'Oddanchatram Vegetable Market',
    nameTa: 'ஒட்டன்சத்திரம் காய்கறி சந்தை',
    districtEn: 'Dindigul',
    districtTa: 'திண்டுக்கல்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 120,
    typicalMandiFeePercent: 1.2,
    handlingCostPerQuintal: 25
  },
  {
    id: 'trichy_gandhi',
    nameEn: 'Tiruchirappalli Gandhi Market',
    nameTa: 'திருச்சிராப்பள்ளி காந்தி சந்தை',
    districtEn: 'Tiruchirappalli',
    districtTa: 'திருச்சிராப்பள்ளி',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 90,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 25
  },
  {
    id: 'salem_apmc',
    nameEn: 'Salem Shevapet Regulated Market',
    nameTa: 'சேலம் செவ்வாய்பேட்டை ஒழுங்குமுறை சந்தை',
    districtEn: 'Salem',
    districtTa: 'சேலம்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 75,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 25
  },
  {
    id: 'erode_regulated',
    nameEn: 'Erode Perundurai Regulated Market',
    nameTa: 'ஈரோடு பெருந்துறை ஒழுங்குமுறை விற்பனைக்கூடம்',
    districtEn: 'Erode',
    districtTa: 'ஈரோடு',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 140,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 26
  },
  {
    id: 'tirunelveli_nainar',
    nameEn: 'Tirunelveli Nainarkulam Market',
    nameTa: 'திருநெல்வேலி நயினார்குளம் சந்தை',
    districtEn: 'Tirunelveli',
    districtTa: 'திருநெல்வேலி',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    distanceFromFarmKm: 320,
    typicalMandiFeePercent: 1.0,
    handlingCostPerQuintal: 30
  }
];

// Helper to generate realistic daily historical records calibrated to AGMARKNET patterns
export function generateHistoricalMarketRecords(
  commodityId: string,
  marketId: string,
  daysCount: number = 90
): MarketRecord[] {
  const commodity = COMMODITIES.find((c) => c.id === commodityId) || COMMODITIES[0];
  const market = TAMIL_NADU_MARKETS.find((m) => m.id === marketId) || TAMIL_NADU_MARKETS[0];

  // Base price lookup in INR/Quintal
  const basePrices: Record<string, number> = {
    tomato: 2650,
    onion: 3450,
    potato: 2350,
    brinjal: 2450,
    cabbage: 1650,
    cauliflower: 2750,
    green_chilli: 5400,
    bhendi: 3100,
    carrot: 3600,
    beans: 4400,
    banana: 2600,
    paddy: 2320,
    maize: 2180,
    groundnut: 7250
  };

  const marketMultiplier: Record<string, number> = {
    koyambedu: 1.08,
    coimbatore_apmc: 1.03,
    madurai_central: 1.01,
    oddanchatram: 0.95, // Wholesale grower market near Dindigul
    trichy_gandhi: 0.99,
    salem_apmc: 0.97,
    erode_regulated: 0.98,
    tirunelveli_nainar: 1.02
  };

  const base = (basePrices[commodity.id] || 2500) * (marketMultiplier[market.id] || 1.0);
  const records: MarketRecord[] = [];

  // Deterministic seed based on string to keep runs reproducible
  let seed = 42;
  for (let i = 0; i < commodity.id.length; i++) {
    seed += commodity.id.charCodeAt(i) * (i + 1);
  }
  for (let i = 0; i < market.id.length; i++) {
    seed += market.id.charCodeAt(i) * (i + 2);
  }

  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const today = new Date('2026-10-25T00:00:00.000Z');

  let currentPrice = base;
  for (let i = daysCount - 1; i >= 0; i--) {
    const recordDate = new Date(today);
    recordDate.setDate(recordDate.getDate() - i);
    const dateStr = recordDate.toISOString().split('T')[0];

    // Weekly seasonality (Sundays/Wednesdays higher arrivals)
    const dayOfWeek = recordDate.getDay();
    const dayFactor = dayOfWeek === 0 || dayOfWeek === 3 ? -0.015 : 0.01;

    // Monthly cycle oscillation (sinusoidal)
    const cycleFactor = Math.sin((daysCount - i) / 9.5) * 0.04;

    // Random walk noise
    const noise = (pseudoRandom() - 0.49) * 0.035;

    currentPrice = currentPrice * (1 + dayFactor * 0.4 + cycleFactor * 0.15 + noise);
    
    // Bounds guard
    const minCap = base * 0.65;
    const maxCap = base * 1.55;
    if (currentPrice < minCap) currentPrice = minCap * 1.02;
    if (currentPrice > maxCap) currentPrice = maxCap * 0.98;

    const modal = Math.round(currentPrice / 10) * 10;
    const spreadPercent = 0.04 + pseudoRandom() * 0.04;
    const min = Math.round((modal * (1 - spreadPercent)) / 10) * 10;
    const max = Math.round((modal * (1 + spreadPercent)) / 10) * 10;
    const arrivals = Math.round((18 + pseudoRandom() * 35) * 10) / 10;

    records.push({
      id: `${market.id}-${commodity.id}-${dateStr}`,
      date: dateStr,
      commodityId: commodity.id,
      commodityName: commodity.nameEn,
      variety: 'Desi / Hybrid Common',
      state: market.stateEn,
      district: market.districtEn,
      market: market.nameEn,
      minPrice: min,
      maxPrice: max,
      modalPrice: modal,
      priceUnit: '₹/Quintal',
      arrivalsInTonnes: arrivals,
      source: 'AGMARKNET',
      retrievalTimestamp: `${dateStr}T17:30:00.000Z`,
      isSample: true
    });
  }

  return records;
}
