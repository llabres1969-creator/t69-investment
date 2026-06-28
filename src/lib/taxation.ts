export interface TaxTreatment {
  figure: string;
  rateRange: string;
  note: string;
}

export const TAXATION: Record<string, TaxTreatment> = {
  "Acción": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Se aplica el método FIFO: se considera vendido primero lo que se compró primero.",
  },
  "ETF": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "A diferencia de los fondos de inversión, los ETF no tienen diferimiento por traspaso: vender uno para comprar otro tributa siempre en el momento de la venta.",
  },
  "Criptomoneda": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Las tenencias en plataformas extranjeras por encima del umbral legal deben declararse en el Modelo 721.",
  },
  "Derivado (Knock-out)": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Las pérdidas solo compensan con otras ganancias patrimoniales de la base del ahorro, no con rendimientos del trabajo.",
  },
  "Cuenta remunerada": {
    figure: "Rendimiento del capital mobiliario",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual.",
  },
};

export function getTaxation(catalogType: string): TaxTreatment | undefined {
  return TAXATION[catalogType];
}
