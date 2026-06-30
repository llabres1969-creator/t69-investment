import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
