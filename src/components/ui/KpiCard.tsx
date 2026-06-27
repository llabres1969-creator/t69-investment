import { cn } from "@/lib/cn";
import { NUM_CLASS } from "@/lib/format";

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
    <div className="rounded-control bg-surface-2 p-3.5">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className={cn(NUM_CLASS, "text-xl font-extrabold tracking-tight", toneClasses[tone])}>
        {value}
      </div>
    </div>
  );
}
