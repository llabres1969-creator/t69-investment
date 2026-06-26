import { cn } from "@/lib/cn";

interface KpiCardProps {
  label: string;
  value: string;
  tone?: "default" | "up" | "down";
}

const toneClasses = {
  default: "text-text",
  up: "text-success",
  down: "text-danger",
};

export function KpiCard({ label, value, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <div className="mb-1.5 text-[11.5px] text-muted">{label}</div>
      <div className={cn("font-mono text-xl font-extrabold tracking-tight", toneClasses[tone])}>
        {value}
      </div>
    </div>
  );
}
