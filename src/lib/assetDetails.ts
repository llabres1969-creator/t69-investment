export interface Quote {
  dayLow: number;
  dayHigh: number;
  week52Low: number;
  week52High: number;
  previousClose: number;
  volume: number;
  exchange: string;
}

export interface CatalogInfo {
  type: string;
  sector?: string;
  country?: string;
  indices?: string[];
  derivativesAvailable?: string[];
}

export interface KeyFacts {
  sector?: string;
  industry?: string;
  country?: string;
  marketCapEur?: number;
  ceo?: string;
  employees?: number;
  ipoDate?: string;
  exchange?: string;
  website?: string;
}

export interface Valuation {
  per: number;
  priceToBook: number;
  priceToSales: number;
  roe: number;
  roa: number;
  grossMargin: number;
  netMargin: number;
  beta: number;
  epsTtm: number;
  debtToEquity: number;
  currentRatio: number;
  return52w: number;
}

export interface DividendInfo {
  yieldPct: number;
  annualDividend: number;
  nextExDate: string;
  payoutPct: number;
}

export interface RiskReturn {
  annualizedReturn: number;
  annualized5y: number;
  volatility: number;
  maxDrawdown: number;
  bestYear: { year: number; pct: number };
  worstYear: { year: number; pct: number };
  totalReturn10y: number;
  worst12m: number;
  returnRiskRatio: number;
  positiveMonthsPct: number;
}

export interface AnalystRecommendation {
  buy: number;
  hold: number;
  sell: number;
}

export interface FinancialYear {
  year: number;
  revenue: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}

export interface BalanceSheet {
  totalAssets: number;
  totalLiabilities: number;
  cash: number;
  longTermDebt: number;
  equity: number;
}

export interface AssetDetail {
  quote?: Quote;
  catalog?: CatalogInfo;
  keyFacts?: KeyFacts;
  valuation?: Valuation;
  dividends?: DividendInfo;
  riskReturn?: RiskReturn;
  analystRecommendation?: AnalystRecommendation;
  financials?: FinancialYear[];
  balanceSheet?: BalanceSheet;
  comparables?: string[];
}

export const ASSET_DETAILS: Record<string, AssetDetail> = {
  US0378331005: {
    quote: {
      dayLow: 240.51,
      dayHigh: 250.81,
      week52Low: 174.77,
      week52High: 278.4,
      previousClose: 261.39,
      volume: 261_244_321,
      exchange: "NasdaqGS",
    },
    catalog: {
      type: "Acción",
      sector: "Ordenadores y redes",
      country: "Estados Unidos",
      indices: ["Dow Jones", "NASDAQ", "S&P 500"],
      derivativesAvailable: ["Knock-outs", "Warrants", "Certificados factor"],
    },
    keyFacts: {
      sector: "Ordenadores y redes",
      industry: "Electrónica de consumo",
      country: "Estados Unidos",
      marketCapEur: 3_660_000_000_000,
      ceo: "Timothy D. Cook",
      employees: 166_000,
      ipoDate: "1980-12-12",
      exchange: "NasdaqGS",
      website: "apple.com",
    },
    valuation: {
      per: 33.5,
      priceToBook: 34,
      priceToSales: 9.1,
      roe: 146.7,
      roa: 34,
      grossMargin: 47.9,
      netMargin: 27.2,
      beta: 1.12,
      epsTtm: 8.27,
      debtToEquity: 0.8,
      currentRatio: 1.07,
      return52w: 36.5,
    },
    dividends: {
      yieldPct: 0.39,
      annualDividend: 0.9473,
      nextExDate: "2026-05-11",
      payoutPct: 12.59,
    },
    riskReturn: {
      annualizedReturn: 27,
      annualized5y: 14.2,
      volatility: 27.3,
      maxDrawdown: -30.7,
      bestYear: { year: 2019, pct: 86.2 },
      worstYear: { year: 2022, pct: -26.8 },
      totalReturn10y: 989.3,
      worst12m: -26.8,
      returnRiskRatio: 0.99,
      positiveMonthsPct: 60,
    },
    analystRecommendation: { buy: 38, hold: 15, sell: 2 },
    financials: [
      { year: 2021, revenue: 315, grossProfit: 132, operatingProfit: 92, netProfit: 78 },
      { year: 2022, revenue: 345, grossProfit: 149, operatingProfit: 102, netProfit: 86 },
      { year: 2023, revenue: 330, grossProfit: 148, operatingProfit: 99, netProfit: 82 },
      { year: 2024, revenue: 345, grossProfit: 154, operatingProfit: 106, netProfit: 74 },
      { year: 2025, revenue: 362, grossProfit: 168, operatingProfit: 110, netProfit: 99 },
    ],
    balanceSheet: {
      totalAssets: 315_100_000_000,
      totalLiabilities: 250_420_000_000,
      cash: 31_520_000_000,
      longTermDebt: 68_700_000_000,
      equity: 64_670_000_000,
    },
    comparables: ["MSFT", "DELL", "WDC", "HPE", "SMCI"],
  },
  US5949181045: {
    quote: {
      dayLow: 410.2,
      dayHigh: 424.8,
      week52Low: 360.1,
      week52High: 468.5,
      previousClose: 419.9,
      volume: 21_300_000,
      exchange: "NasdaqGS",
    },
    catalog: {
      type: "Acción",
      sector: "Software e infraestructura",
      country: "Estados Unidos",
      indices: ["Dow Jones", "NASDAQ", "S&P 500"],
      derivativesAvailable: ["Knock-outs", "Warrants"],
    },
    keyFacts: {
      sector: "Software e infraestructura",
      industry: "Software empresarial",
      country: "Estados Unidos",
      marketCapEur: 2_950_000_000_000,
      ceo: "Satya Nadella",
      employees: 228_000,
      ipoDate: "1986-03-13",
      exchange: "NasdaqGS",
      website: "microsoft.com",
    },
    valuation: {
      per: 35.2,
      priceToBook: 11.4,
      priceToSales: 12.6,
      roe: 33.4,
      roa: 17.8,
      grossMargin: 69.8,
      netMargin: 36.1,
      beta: 0.9,
      epsTtm: 11.98,
      debtToEquity: 0.4,
      currentRatio: 1.3,
      return52w: 12.1,
    },
    dividends: {
      yieldPct: 0.7,
      annualDividend: 3.32,
      nextExDate: "2026-02-18",
      payoutPct: 24.6,
    },
    riskReturn: {
      annualizedReturn: 18.4,
      annualized5y: 19.6,
      volatility: 23.1,
      maxDrawdown: -28.3,
      bestYear: { year: 2023, pct: 56.8 },
      worstYear: { year: 2022, pct: -28.7 },
      totalReturn10y: 812.4,
      worst12m: -20.1,
      returnRiskRatio: 0.8,
      positiveMonthsPct: 64,
    },
    analystRecommendation: { buy: 44, hold: 9, sell: 1 },
    financials: [
      { year: 2021, revenue: 168, grossProfit: 115, operatingProfit: 70, netProfit: 61 },
      { year: 2022, revenue: 198, grossProfit: 135, operatingProfit: 83, netProfit: 67 },
      { year: 2023, revenue: 211, grossProfit: 146, operatingProfit: 89, netProfit: 72 },
      { year: 2024, revenue: 236, grossProfit: 166, operatingProfit: 105, netProfit: 86 },
      { year: 2025, revenue: 261, grossProfit: 184, operatingProfit: 118, netProfit: 94 },
    ],
    balanceSheet: {
      totalAssets: 512_000_000_000,
      totalLiabilities: 232_000_000_000,
      cash: 75_500_000_000,
      longTermDebt: 42_000_000_000,
      equity: 280_000_000_000,
    },
    comparables: ["AAPL", "GOOGL", "ORCL", "SAP", "ADBE"],
  },
  US88160R1014: {
    quote: {
      dayLow: 238.4,
      dayHigh: 256.3,
      week52Low: 138.8,
      week52High: 358.6,
      previousClose: 254.2,
      volume: 88_400_000,
      exchange: "NasdaqGS",
    },
    catalog: {
      type: "Acción",
      sector: "Automóviles y energía",
      country: "Estados Unidos",
      indices: ["NASDAQ", "S&P 500"],
      derivativesAvailable: ["Knock-outs", "Warrants", "Certificados factor"],
    },
    keyFacts: {
      sector: "Automóviles y energía",
      industry: "Vehículos eléctricos",
      country: "Estados Unidos",
      marketCapEur: 780_000_000_000,
      ceo: "Elon Musk",
      employees: 140_000,
      ipoDate: "2010-06-29",
      exchange: "NasdaqGS",
      website: "tesla.com",
    },
    valuation: {
      per: 98.4,
      priceToBook: 14.2,
      priceToSales: 11.8,
      roe: 16.5,
      roa: 7.2,
      grossMargin: 18.2,
      netMargin: 7.9,
      beta: 2.1,
      epsTtm: 2.53,
      debtToEquity: 0.2,
      currentRatio: 1.9,
      return52w: -8.4,
    },
    riskReturn: {
      annualizedReturn: -4.2,
      annualized5y: 22.8,
      volatility: 58.6,
      maxDrawdown: -73.6,
      bestYear: { year: 2020, pct: 743.4 },
      worstYear: { year: 2022, pct: -65.2 },
      totalReturn10y: 1640.8,
      worst12m: -52.1,
      returnRiskRatio: 0.39,
      positiveMonthsPct: 53,
    },
    analystRecommendation: { buy: 17, hold: 19, sell: 12 },
    comparables: ["F", "GM", "RIVN", "BYDDF", "NIO"],
  },
  IE00BK5BQT80: {
    quote: {
      dayLow: 131.2,
      dayHigh: 133.1,
      week52Low: 108.4,
      week52High: 138.9,
      previousClose: 132.1,
      volume: 1_200_000,
      exchange: "Xetra",
    },
    catalog: {
      type: "ETF",
      sector: "Renta variable global",
      country: "Irlanda (domicilio)",
      indices: ["FTSE All-World"],
    },
    keyFacts: {
      sector: "Renta variable global",
      country: "Irlanda (domicilio)",
      exchange: "Xetra",
      website: "vanguard.com",
    },
    riskReturn: {
      annualizedReturn: 11.8,
      annualized5y: 10.6,
      volatility: 14.2,
      maxDrawdown: -24.1,
      bestYear: { year: 2019, pct: 30.0 },
      worstYear: { year: 2022, pct: -18.0 },
      totalReturn10y: 198.3,
      worst12m: -16.4,
      returnRiskRatio: 0.83,
      positiveMonthsPct: 65,
    },
    dividends: {
      yieldPct: 1.6,
      annualDividend: 2.12,
      nextExDate: "2026-03-15",
      payoutPct: 0,
    },
  },
  IE00B4L5Y983: {
    quote: {
      dayLow: 93.4,
      dayHigh: 94.6,
      week52Low: 76.9,
      week52High: 98.2,
      previousClose: 93.9,
      volume: 980_000,
      exchange: "Xetra",
    },
    catalog: {
      type: "ETF",
      sector: "Renta variable desarrollada",
      country: "Irlanda (domicilio)",
      indices: ["MSCI World"],
    },
    keyFacts: {
      sector: "Renta variable desarrollada",
      country: "Irlanda (domicilio)",
      exchange: "Xetra",
      website: "ishares.com",
    },
    riskReturn: {
      annualizedReturn: 12.4,
      annualized5y: 11.1,
      volatility: 14.6,
      maxDrawdown: -25.3,
      bestYear: { year: 2019, pct: 28.9 },
      worstYear: { year: 2022, pct: -18.5 },
      totalReturn10y: 205.1,
      worst12m: -17.0,
      returnRiskRatio: 0.85,
      positiveMonthsPct: 64,
    },
  },
  IE00B3F81409: {
    quote: {
      dayLow: 168.1,
      dayHigh: 169.4,
      week52Low: 162.0,
      week52High: 176.8,
      previousClose: 168.6,
      volume: 410_000,
      exchange: "Xetra",
    },
    catalog: {
      type: "ETF",
      sector: "Renta fija gubernamental",
      country: "Irlanda (domicilio)",
      indices: ["Eurozone Government Bond"],
    },
    keyFacts: {
      sector: "Renta fija gubernamental",
      country: "Irlanda (domicilio)",
      exchange: "Xetra",
      website: "ishares.com",
    },
    riskReturn: {
      annualizedReturn: 1.2,
      annualized5y: -0.4,
      volatility: 5.1,
      maxDrawdown: -16.8,
      bestYear: { year: 2014, pct: 13.2 },
      worstYear: { year: 2022, pct: -16.8 },
      totalReturn10y: 8.4,
      worst12m: -14.1,
      returnRiskRatio: 0.24,
      positiveMonthsPct: 54,
    },
    dividends: {
      yieldPct: 2.4,
      annualDividend: 4.05,
      nextExDate: "2026-04-02",
      payoutPct: 0,
    },
  },
  "XBT-EUR": {
    quote: {
      dayLow: 59_800,
      dayHigh: 62_400,
      week52Low: 38_200,
      week52High: 78_900,
      previousClose: 60_100,
      volume: 0,
      exchange: "Mercado cripto 24/7",
    },
    catalog: {
      type: "Criptomoneda",
      country: "Global",
    },
    keyFacts: {
      sector: "Activos digitales",
      country: "Global",
      marketCapEur: 1_180_000_000_000,
    },
    riskReturn: {
      annualizedReturn: 48.2,
      annualized5y: 51.4,
      volatility: 62.8,
      maxDrawdown: -76.6,
      bestYear: { year: 2017, pct: 1318.0 },
      worstYear: { year: 2022, pct: -64.2 },
      totalReturn10y: 18_400,
      worst12m: -58.1,
      returnRiskRatio: 0.77,
      positiveMonthsPct: 58,
    },
  },
  "ETH-EUR": {
    quote: {
      dayLow: 3_180,
      dayHigh: 3_420,
      week52Low: 1_900,
      week52High: 4_950,
      previousClose: 3_280,
      volume: 0,
      exchange: "Mercado cripto 24/7",
    },
    catalog: {
      type: "Criptomoneda",
      country: "Global",
    },
    keyFacts: {
      sector: "Activos digitales",
      country: "Global",
      marketCapEur: 402_000_000_000,
    },
    riskReturn: {
      annualizedReturn: 39.6,
      annualized5y: 44.8,
      volatility: 71.2,
      maxDrawdown: -82.1,
      bestYear: { year: 2020, pct: 469.0 },
      worstYear: { year: 2022, pct: -67.5 },
      totalReturn10y: 9_200,
      worst12m: -61.4,
      returnRiskRatio: 0.56,
      positiveMonthsPct: 55,
    },
  },
  "DE-KO-DAX": {
    quote: {
      dayLow: 17.9,
      dayHigh: 19.2,
      week52Low: 8.4,
      week52High: 24.6,
      previousClose: 18.6,
      volume: 0,
      exchange: "Producto OTC emitido",
    },
    catalog: {
      type: "Derivado (Knock-out)",
      country: "Alemania",
      derivativesAvailable: [],
    },
    keyFacts: {
      sector: "Derivado apalancado",
      country: "Alemania",
    },
  },
  "CASH-EUR": {
    quote: undefined,
    catalog: {
      type: "Cuenta remunerada",
      country: "Unión Europea",
    },
    keyFacts: {
      sector: "Efectivo",
      country: "Unión Europea",
    },
  },
};

export function getAssetDetail(isin: string): AssetDetail | undefined {
  return ASSET_DETAILS[isin];
}
