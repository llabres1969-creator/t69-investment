import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type Tone = "orange" | "blue";

const toneClasses: Record<Tone, string> = {
  orange: "bg-primary-soft text-primary-hover",
  blue: "bg-surface-2 text-secondary-deep",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Pill({ tone = "orange", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
