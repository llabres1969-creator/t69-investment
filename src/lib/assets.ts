import { AssetClass } from "@/lib/profile";

export type AssetCategory = "Acciones" | "ETFs" | "Cripto" | "Derivados" | "Cuenta remunerada";

export interface Asset {
  isin: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  assetClass: AssetClass;
  price: number;
  changePct: number;
  currency: "EUR" | "USD";
  description: string;
}

export const ASSETS: Asset[] = [
  {
    isin: "IE00BK5BQT80",
    name: "Vanguard FTSE All-World",
    ticker: "VWCE",
    assetClass: "rvg",
    category: "ETFs",
    price: 132.4,
    changePct: 0.8,
    currency: "EUR",
    description: "ETF de renta variable global, más de 3.700 compañías en mercados desarrollados y emergentes.",
  },
  {
    isin: "IE00B4L5Y983",
    name: "iShares Core MSCI World",
    ticker: "SWDA",
    assetClass: "rvg",
    category: "ETFs",
    price: 94.1,
    changePct: 1.2,
    currency: "EUR",
    description: "ETF indexado al MSCI World, exposición a grandes y medianas compañías de mercados desarrollados.",
  },
  {
    isin: "IE00B3F81409",
    name: "iShares Core Govt Bond",
    ticker: "IEGA",
    assetClass: "rf",
    category: "ETFs",
    price: 168.9,
    changePct: -0.3,
    currency: "EUR",
    description: "ETF de deuda pública de la eurozona con vencimientos variados.",
  },
  {
    isin: "US0378331005",
    name: "Apple Inc.",
    ticker: "AAPL",
    assetClass: "rvus",
    category: "Acciones",
    price: 214.3,
    changePct: 1.6,
    currency: "USD",
    description: "Fabricante de hardware, software y servicios. Una de las compañías más valiosas del mundo.",
  },
  {
    isin: "US5949181045",
    name: "Microsoft Corp.",
    ticker: "MSFT",
    assetClass: "rvus",
    category: "Acciones",
    price: 421.7,
    changePct: 0.4,
    currency: "USD",
    description: "Software, nube (Azure) y productividad empresarial.",
  },
  {
    isin: "US88160R1014",
    name: "Tesla Inc.",
    ticker: "TSLA",
    assetClass: "rvus",
    category: "Acciones",
    price: 248.9,
    changePct: -2.1,
    currency: "USD",
    description: "Vehículos eléctricos, energía y robótica.",
  },
  {
    isin: "XBT-EUR",
    name: "Bitcoin",
    ticker: "BTC",
    assetClass: "cri",
    category: "Cripto",
    price: 61_200,
    changePct: 3.4,
    currency: "EUR",
    description: "La criptomoneda de mayor capitalización del mercado.",
  },
  {
    isin: "ETH-EUR",
    name: "Ethereum",
    ticker: "ETH",
    assetClass: "cri",
    category: "Cripto",
    price: 3_350,
    changePct: 2.1,
    currency: "EUR",
    description: "Plataforma de contratos inteligentes y aplicaciones descentralizadas.",
  },
  {
    isin: "DE-KO-DAX",
    name: "Knock-out DAX 40",
    ticker: "KO-DAX",
    assetClass: "met",
    category: "Derivados",
    price: 18.45,
    changePct: -4.7,
    currency: "EUR",
    description: "Producto derivado apalancado referenciado al índice DAX 40. Alto riesgo, solo con fines informativos.",
  },
  {
    isin: "CASH-EUR",
    name: "Cuenta remunerada",
    ticker: "CASH",
    assetClass: "rf",
    category: "Cuenta remunerada",
    price: 1,
    changePct: 0,
    currency: "EUR",
    description: "Efectivo remunerado a un tipo de interés variable, cubierto por el fondo de garantía de depósitos.",
  },
];

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Acciones",
  "ETFs",
  "Cripto",
  "Derivados",
  "Cuenta remunerada",
];
