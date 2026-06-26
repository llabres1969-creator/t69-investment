export interface EducationArticle {
  title: string;
  body: string;
}

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    title: "¿Qué significa volatilidad?",
    body: "La volatilidad mide cuánto puede subir o bajar el precio de una inversión en periodos cortos. Una volatilidad alta no implica necesariamente más riesgo a largo plazo, pero sí más oscilación a corto.",
  },
  {
    title: "¿Por qué importa el horizonte temporal?",
    body: "Cuanto más tiempo puedas mantener una inversión, más margen tienes para que las caídas temporales se recuperen. Por eso el test te pregunta cuánto tiempo piensas dejar el dinero invertido.",
  },
  {
    title: "¿Qué cambiaría tu perfil de inversión?",
    body: "Menos liquidez disponible, una necesidad más cercana de retirar el dinero, o una menor tolerancia emocional a las caídas, desplazarían tu cartera ideal hacia algo más conservador.",
  },
  {
    title: "Diversificación: no poner todos los huevos en la misma cesta",
    body: "Repartir el capital entre distintas clases de activos (renta variable, renta fija, materias primas) reduce el impacto de que uno solo de ellos caiga con fuerza.",
  },
  {
    title: "Aportar de forma periódica frente a invertir de golpe",
    body: "Invertir una cantidad fija cada mes (DCA) suaviza el efecto de comprar justo en un mal momento, a cambio de no aprovechar al máximo una subida si entras todo de golpe.",
  },
];
