import { cn } from "@/lib/cn";
import { NUM_CLASS } from "@/lib/format";

export interface Stat {
  label: string;
  value: string;
  tone?: "default" | "up" | "down";
}

const toneClasses = {
  default: "text-text",
  up: "text-success",
  down: "text-danger",
};

export function StatGrid({ stats, columns = 3 }: { stats: Stat[]; columns?: 2 | 3 }) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {stat.label}
          </div>
          <div
            className={cn(NUM_CLASS, "text-[16px] font-bold", toneClasses[stat.tone ?? "default"])}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
