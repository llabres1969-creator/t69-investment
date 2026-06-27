export const TOTAL_MONTHS = 96;

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function buildFullSeries(isin: string, currentPrice: number) {
  let seed = 0;
  for (let i = 0; i < isin.length; i++) seed += isin.charCodeAt(i);
  const rand = seededRandom(seed);

  const series: number[] = new Array(TOTAL_MONTHS);
  let value = currentPrice * (0.35 + rand() * 0.25);
  for (let i = 0; i < TOTAL_MONTHS - 1; i++) {
    value *= 1 + (rand() - 0.45) * 0.07;
    series[i] = value;
  }
  series[TOTAL_MONTHS - 1] = currentPrice;
  return series;
}
