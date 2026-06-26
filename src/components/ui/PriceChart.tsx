function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildSeries(isin: string, currentPrice: number, points = 24) {
  let seed = 0;
  for (let i = 0; i < isin.length; i++) seed += isin.charCodeAt(i);
  const rand = seededRandom(seed);

  const series: number[] = [];
  let value = currentPrice * (0.8 + rand() * 0.15);
  for (let i = 0; i < points - 1; i++) {
    value *= 1 + (rand() - 0.48) * 0.06;
    series.push(value);
  }
  series.push(currentPrice);
  return series;
}

interface PriceChartProps {
  isin: string;
  currentPrice: number;
  up: boolean;
}

export function PriceChart({ isin, currentPrice, up }: PriceChartProps) {
  const series = buildSeries(isin, currentPrice);
  const min = Math.min(...series);
  const max = Math.max(...series);
  const width = 100;
  const height = 36;

  const points = series.map((value, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = max === min ? height / 2 : height - ((value - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  const color = up ? "#19b56b" : "#e0473e";
  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-24 w-full"
      role="img"
      aria-label="Evolución del precio en los últimos 24 periodos"
    >
      <polygon points={areaPoints} fill={color} opacity="0.08" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
