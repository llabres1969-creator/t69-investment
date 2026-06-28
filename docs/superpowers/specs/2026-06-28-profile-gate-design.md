# T69 Investment — bloqueo de acceso hasta completar el test

## Contexto

Hoy `/explorar` y `/portfolio` son accesibles sin haber completado el test de perfil — `/portfolio` ya muestra un banner invitando a hacer el test, pero no impide ver la pantalla. El producto quiere que el test de perfil sea un paso obligatorio antes de poder ver activos o cartera: el core business depende de conocer el perfil del usuario antes de mostrarle el universo curado.

## Decisiones de alcance

- **Rutas bloqueadas**: `/explorar` y `/portfolio` únicamente.
- **Rutas siempre accesibles**: `/test` (obviamente), `/educacion`, `/datos`.
- **Comportamiento al bloquear**: redirección inmediata a `/test`, sin pantalla intermedia ni mensaje — cero fricción.
- **Naturaleza del bloqueo**: es una guía de flujo del lado del cliente, no una medida de seguridad. El perfil vive en `localStorage` (sin backend), igual que el resto de la app — alguien con DevTools podría saltárselo, igual que ya podría manipular cualquier otro dato local. Coherente con el modelo de datos existente.
- **Sin cambios visuales en el sidebar**: los ítems "Explorar activos" y "Mi cartera" siguen apareciendo como navegación normal. Si alguien hace clic sin haber completado el test, navega y es redirigido al instante a `/test` — no hay parpadeo de contenido bloqueado, así que no hace falta ningún estado "candado" en el nav.

## Diseño técnico

Nuevo componente cliente `src/components/RequireProfile.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileScore } from "@/lib/useProfileScore";

export function RequireProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { score, loaded } = useProfileScore();

  useEffect(() => {
    if (loaded && score === null) {
      router.replace("/test");
    }
  }, [loaded, score, router]);

  if (!loaded || score === null) {
    return null;
  }

  return <>{children}</>;
}
```

Comportamiento:
- **Mientras `loaded` es `false`** (lectura inicial de `localStorage` en curso): no renderiza nada. Evita el parpadeo de ver el contenido real un instante antes de decidir si hay que redirigir.
- **Si `loaded` es `true` y `score` es `null`** (no hay perfil guardado): dispara `router.replace("/test")` desde un `useEffect` (no durante el render, para evitar el error de Next.js sobre actualizar el estado del router durante el render) y no renderiza nada mientras la navegación ocurre.
- **Si hay perfil**: renderiza `children` normalmente.

### Integración

`ExplorarPage` (`src/app/(dashboard)/explorar/page.tsx`) y `PortfolioPage` (`src/app/(dashboard)/portfolio/page.tsx`) envuelven su contenido existente en `<RequireProfile>...</RequireProfile>`, sin modificar su lógica interna. Ambos componentes ya son `"use client"`, así que no hay conflicto de boundary cliente/servidor.

`useProfileScore` ya existe en `src/lib/useProfileScore.ts` y ya expone `{ score, loaded }` — no necesita cambios.

## Fuera de alcance

- No se construye ningún backend, sesión, ni cookie — el bloqueo sigue siendo 100% client-side sobre `localStorage`, igual que el resto del modelo de datos de la app.
- No se modifica el sidebar ni se añade ningún indicador visual de "bloqueado" en la navegación.
- No se tocan `/educacion` ni `/datos`.
- No se modifica el test de perfil ni el cálculo de `score`.

## Auto-revisión

- Sin placeholders: el componente `RequireProfile` está completamente especificado, incluyendo el manejo del caso "cargando" para evitar el parpadeo.
- Consistencia interna: usa exactamente la interfaz ya existente de `useProfileScore` (`{ score, loaded }`), sin inventar un nuevo hook ni modificar el existente.
- Alcance: cambio único y acotado (2 páginas + 1 componente nuevo), implementable en un plan corto.
- Ambigüedad resuelta: se deja explícito que la redirección ocurre en un `useEffect`, no durante el render, para evitar el warning de React/Next sobre navegación durante el render.
