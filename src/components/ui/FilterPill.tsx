import { cn } from "@/lib/cn";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
        active
          ? "bg-secondary-deep text-white"
          : "border border-line bg-surface text-muted hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}
