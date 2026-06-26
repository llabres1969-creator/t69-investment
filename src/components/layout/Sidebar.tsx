"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/explorar", label: "Explorar activos" },
  { href: "/educacion", label: "Educación" },
  { href: "/datos", label: "Mis datos" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 bg-secondary-deep px-4 py-4 text-white md:w-[220px] md:py-6">
      <div className="mb-4 text-[18px] font-extrabold tracking-tight md:mb-6">
        T69<span className="text-[#ff9a4d]">.</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
