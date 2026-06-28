export type ReviewStatus = "incorporado" | "mantenido" | "en_vigilancia" | "sustituido";

export interface ReviewEntry {
  date: string; // ISO "YYYY-MM-DD"
  status: ReviewStatus;
  note: string;
}

export interface Curation {
  thesis: string;
  reviewHistory: ReviewEntry[]; // most recent first
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  incorporado: "Incorporado",
  mantenido: "Mantenido",
  en_vigilancia: "En vigilancia",
  sustituido: "Sustituido",
};

export const CURATION: Record<string, Curation> = {
  "IE00BK5BQT80": {
    thesis:
      "ETF de coste muy bajo (TER 0,22%) con exposición a más de 3.700 compañías globales. Es nuestra posición base de renta variable para perfiles de medio a largo plazo.",
    reviewHistory: [
      {
        date: "2026-03-15",
        status: "mantenido",
        note: "Sin cambios en la tesis. Costes y liquidez siguen siendo los mejores de su categoría.",
      },
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Entra en el universo T69 tras nuestra revisión trimestral de ETFs globales.",
      },
    ],
  },
  "IE00B4L5Y983": {
    thesis:
      "Alternativa de renta variable desarrollada con un enfoque algo más concentrado que nuestra posición base, útil para complementar exposición sin duplicar mercados emergentes.",
    reviewHistory: [
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Incluido como ETF complementario de renta variable desarrollada en la revisión trimestral.",
      },
    ],
  },
  "IE00B3F81409": {
    thesis:
      "ETF de deuda pública de la eurozona, nuestra pieza principal de renta fija para perfiles conservadores y moderados.",
    reviewHistory: [
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Incluido como núcleo de renta fija tras revisar la oferta de ETFs de gobierno en euros.",
      },
    ],
  },
  "US0378331005": {
    thesis:
      "Posición de calidad en tecnología de consumo, con generación de caja y márgenes sostenidos en el tiempo. La incluimos como exposición individual moderada dentro del bloque de renta variable de EE. UU.",
    reviewHistory: [
      {
        date: "2026-02-01",
        status: "mantenido",
        note: "Resultados trimestrales en línea con la tesis. Mantenemos la posición sin cambios.",
      },
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Entra en el universo tras nuestra revisión de compañías de calidad en EE. UU.",
      },
    ],
  },
  "US5949181045": {
    thesis:
      "Negocio diversificado entre software empresarial y nube, con crecimiento estable. Complementa la otra posición individual del bloque de renta variable de EE. UU. sin solapar el mismo sector.",
    reviewHistory: [
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Entra en el universo tras preferir una posición tecnológica diversificada frente a una apuesta individual más concentrada en riesgo idiosincrático.",
      },
    ],
  },
  "CASH-EUR": {
    thesis:
      "Cuenta remunerada como pieza de liquidez y colchón de seguridad, cubierta por el fondo de garantía de depósitos hasta el límite legal.",
    reviewHistory: [
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Incluida como opción de liquidez remunerada para la parte conservadora de cualquier cartera.",
      },
    ],
  },
};

export function getCuration(isin: string): Curation | undefined {
  return CURATION[isin];
}
