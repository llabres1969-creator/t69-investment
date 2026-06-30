"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export type NavItem  = { href: string; label: string };
export type NavGroup = { label: string; href: string; children: NavItem[] };
export type NavEntry = NavItem | NavGroup;

export function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}

const NAV_ENTRIES: NavEntry[] = [
  { href: "/dashboard",      label: "Dashboard" },
  { href: "/asesor",         label: "Pregunta a Tony" },
  { href: "/radar",          label: "Radar" },
  {
    label: "Mi Cartera",
    href: "/portfolio",
    children: [
      { href: "/datos",         label: "Mis datos" },
      { href: "/test",          label: "Test de perfil" },
      { href: "/explorar",      label: "Explorar activos" },
      { href: "/transacciones", label: "Transacciones" },
      { href: "/metas",         label: "Metas" },
      { href: "/documentos",    label: "Documentos" },
    ],
  },
  { href: "/roadmap",   label: "Roadmap" },
  {
    label: "Comunidad",
    href: "/comunidad",
    children: [
      { href: "/educacion", label: "Educación" },
    ],
  },
];

const MI_CARTERA_PATHS = [
  "/portfolio", "/datos", "/test", "/explorar",
  "/transacciones", "/metas", "/documentos",
];
const COMUNIDAD_PATHS = ["/comunidad", "/educacion"];

export function Sidebar() {
  const pathname = usePathname();

  const [carteraOpen, setCarteraOpen] = useState(
    () => MI_CARTERA_PATHS.some((p) => pathname?.startsWith(p)),
  );
  const [comunidadOpen, setComunidadOpen] = useState(
    () => COMUNIDAD_PATHS.some((p) => pathname?.startsWith(p)),
  );

  function groupState(label: string): [boolean, () => void] {
    if (label === "Mi Cartera") return [carteraOpen, () => setCarteraOpen((v) => !v)];
    return [comunidadOpen, () => setComunidadOpen((v) => !v)];
  }

  return (
    <aside className="shrink-0 border-r border-line bg-secondary-deep px-4 py-4 text-text md:w-[220px] md:py-6">
      <div className="mb-4 font-serif text-[20px] font-bold tracking-tight md:mb-6">
        Tony<span className="text-[#ff9a4d]">.</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ENTRIES.map((entry) => {
          if (isGroup(entry)) {
            const [open, toggle] = groupState(entry.label);
            const groupActive = entry.children.some((c) => pathname?.startsWith(c.href))
              || pathname?.startsWith(entry.href);
            return (
              <div key={entry.label}>
                <div className="flex items-center">
                  <Link
                    href={entry.href}
                    className={cn(
                      "flex-1 shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                      groupActive
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-surface-2 hover:text-text",
                    )}
                  >
                    {entry.label}
                  </Link>
                  <button
                    onClick={toggle}
                    aria-label={entry.label}
                    className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <span
                      className={cn(
                        "inline-block text-[11px] transition-transform duration-200",
                        open ? "rotate-90" : "rotate-0",
                      )}
                    >
                      ›
                    </span>
                  </button>
                </div>
                {open && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-4">
                    {entry.children.map((child) => {
                      const active = pathname?.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                            active
                              ? "bg-primary-soft text-primary"
                              : "text-muted hover:bg-surface-2 hover:text-text",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname?.startsWith(entry.href);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
