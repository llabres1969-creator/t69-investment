import { cn } from "@/lib/cn";

interface OptionCardProps {
  title: string;
  subtitle: string;
  active?: boolean;
  onClick?: () => void;
}

export function OptionCard({ title, subtitle, active, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-card border p-4 text-left transition-colors",
        active
          ? "border-[rgba(255,106,0,.5)] bg-[rgba(255,106,0,.06)]"
          : "border-line bg-surface hover:bg-surface-2",
      )}
    >
      <div className="text-[13px] font-bold text-text">{title}</div>
      <div className="mt-1 text-[11.5px] text-muted">{subtitle}</div>
    </button>
  );
}
