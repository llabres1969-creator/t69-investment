export interface QuizOption {
  title: string;
  subtitle: string;
  value: number;
}

export interface QuizQuestion {
  id: string;
  dimension: "cap" | "tol" | "know" | "obj";
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "edad",
    dimension: "cap",
    question: "¿Qué edad tienes?",
    options: [
      { title: "18–30 años", subtitle: "Mucho margen por delante", value: 100 },
      { title: "31–45 años", subtitle: "Etapa de crecimiento", value: 75 },
      { title: "46–60 años", subtitle: "Te acercas a tus metas", value: 45 },
      { title: "Más de 60", subtitle: "Jubilación cerca o en curso", value: 15 },
    ],
  },
  {
    id: "horizonte",
    dimension: "cap",
    question: "¿Durante cuánto tiempo piensas mantener esta inversión?",
    options: [
      { title: "Menos de 3 años", subtitle: "Plazo corto", value: 0 },
      { title: "Entre 3 y 7 años", subtitle: "Plazo medio", value: 40 },
      { title: "Entre 7 y 15 años", subtitle: "Plazo largo", value: 80 },
      { title: "Más de 15 años", subtitle: "Plazo muy largo", value: 100 },
    ],
  },
  {
    id: "emergencia",
    dimension: "cap",
    question: "¿Cuentas con ahorro de emergencia al margen de este dinero?",
    options: [
      { title: "No tengo colchón", subtitle: "Ando ajustado", value: 0 },
      { title: "Algo, pero no mucho", subtitle: "Cubre un imprevisto pequeño", value: 40 },
      { title: "Unos tres meses de gastos", subtitle: "Razonablemente cubierto", value: 75 },
      { title: "Seis meses o más", subtitle: "Bien protegido", value: 100 },
    ],
  },
  {
    id: "ingresos",
    dimension: "cap",
    question: "¿Qué tan predecibles son tus ingresos?",
    options: [
      { title: "Muy irregulares", subtitle: "Cambian mucho mes a mes", value: 0 },
      { title: "Algo variables", subtitle: "Con altibajos", value: 40 },
      { title: "Estables", subtitle: "Previsibles", value: 75 },
      { title: "Estables y crecientes", subtitle: "Sólidos y al alza", value: 100 },
    ],
  },
  {
    id: "capital",
    dimension: "cap",
    question: "¿Qué proporción de tus ahorros totales destinas a esta inversión?",
    options: [
      { title: "Casi todo (más del 75%)", subtitle: "La mayor parte de mi capital", value: 20 },
      { title: "Una parte grande (50–75%)", subtitle: "Porción considerable", value: 45 },
      { title: "Una parte moderada (25–50%)", subtitle: "Porción intermedia", value: 75 },
      { title: "Una parte pequeña (menos del 25%)", subtitle: "Entrada acotada", value: 100 },
    ],
  },
  {
    id: "deudas",
    dimension: "cap",
    question: "¿Tienes deudas relevantes además de la hipoteca, si la tienes?",
    options: [
      { title: "Sí, bastante elevadas", subtitle: "Apalancamiento alto", value: 10 },
      { title: "Algunas moderadas", subtitle: "Manejables", value: 45 },
      { title: "Solo la hipoteca", subtitle: "Carga asumible", value: 75 },
      { title: "Ninguna deuda", subtitle: "Sin compromisos", value: 100 },
    ],
  },
  {
    id: "reaccion",
    dimension: "tol",
    question: "Tu cartera pierde un 20% de valor en pocos meses. ¿Cómo reaccionas?",
    options: [
      { title: "Vendo todo", subtitle: "Para frenar la pérdida", value: 0 },
      { title: "Vendo una parte", subtitle: "Reduzco exposición", value: 33 },
      { title: "Mantengo el rumbo", subtitle: "Sigo el plan", value: 75 },
      { title: "Aprovecho para comprar más", subtitle: "Lo veo como oportunidad", value: 100 },
    ],
  },
  {
    id: "rangos",
    dimension: "tol",
    question: "¿Con qué combinación de posible ganancia y pérdida anual te sentirías más cómodo?",
    options: [
      { title: "Entre 0% y +3%", subtitle: "Sin sobresaltos", value: 0 },
      { title: "Entre −8% y +8%", subtitle: "Vaivén leve", value: 40 },
      { title: "Entre −18% y +15%", subtitle: "Vaivén medio", value: 75 },
      { title: "Entre −30% y +25%", subtitle: "Vaivén amplio", value: 100 },
    ],
  },
  {
    id: "actitud",
    dimension: "tol",
    question: "¿Cómo te describirían las personas cercanas frente al riesgo financiero?",
    options: [
      { title: "Muy cauteloso", subtitle: "Prefiero ir sobre seguro", value: 0 },
      { title: "Prudente pero flexible", subtitle: "Abierto si tiene sentido", value: 40 },
      { title: "Decidido si me informo antes", subtitle: "Asumo riesgo calculado", value: 75 },
      { title: "Atrevido", subtitle: "Disfruto el riesgo", value: 100 },
    ],
  },
  {
    id: "palabra",
    dimension: "tol",
    question: "Al oír la palabra \"riesgo\" en finanzas, ¿qué te viene a la cabeza primero?",
    options: [
      { title: "Pérdida", subtitle: "Algo a evitar", value: 0 },
      { title: "Incertidumbre", subtitle: "No saber qué pasará", value: 40 },
      { title: "Oportunidad", subtitle: "Posibilidad de ganar", value: 80 },
      { title: "Emoción", subtitle: "Parte del juego", value: 100 },
    ],
  },
  {
    id: "emocional",
    dimension: "tol",
    question: "Si tus inversiones cayeran con fuerza, ¿cómo te afectaría emocionalmente?",
    options: [
      { title: "Perdería el sueño", subtitle: "Mucha ansiedad", value: 0 },
      { title: "Me preocuparía notablemente", subtitle: "Cierta inquietud", value: 35 },
      { title: "Lo llevaría con calma", subtitle: "Sin grandes nervios", value: 75 },
      { title: "Lo vería como algo normal", subtitle: "Forma parte del proceso", value: 100 },
    ],
  },
  {
    id: "experiencia",
    dimension: "know",
    question: "¿Cuánta experiencia tienes invirtiendo?",
    options: [
      { title: "Ninguna todavía", subtitle: "Estoy empezando", value: 0 },
      { title: "Algo básica", subtitle: "Depósitos o algún fondo", value: 40 },
      { title: "Varios años con ETFs o acciones", subtitle: "Experiencia media", value: 80 },
      { title: "Activa, incluso en activos volátiles", subtitle: "Experiencia avanzada", value: 100 },
    ],
  },
  {
    id: "conocimiento",
    dimension: "know",
    question: "¿Con qué tipo de productos financieros te sientes cómodo?",
    options: [
      { title: "Con ninguno en particular", subtitle: "Aún no me he familiarizado", value: 0 },
      { title: "Solo productos sencillos", subtitle: "Depósitos, fondos básicos", value: 35 },
      { title: "ETFs y renta fija", subtitle: "Inversión indexada", value: 70 },
      { title: "Cualquiera, incluida cripto", subtitle: "Conocimiento avanzado", value: 100 },
    ],
  },
  {
    id: "objetivo",
    dimension: "obj",
    question: "¿Cuál es tu principal objetivo con este dinero?",
    options: [
      { title: "Conservar su valor", subtitle: "Que no pierda poder de compra", value: 0 },
      { title: "Superar la inflación", subtitle: "Mantener el poder adquisitivo", value: 40 },
      { title: "Crecer a largo plazo", subtitle: "Aumentar el capital con el tiempo", value: 80 },
      { title: "Maximizar la rentabilidad", subtitle: "Buscar el mayor crecimiento posible", value: 100 },
    ],
  },
  {
    id: "liquidez",
    dimension: "obj",
    question: "¿Qué probabilidad hay de que necesites retirar este dinero sin previo aviso?",
    options: [
      { title: "Alta probabilidad", subtitle: "Puede que lo necesite pronto", value: 0 },
      { title: "Podría necesitar una parte", subtitle: "No estoy seguro", value: 40 },
      { title: "Poco probable", subtitle: "Casi seguro que no", value: 80 },
      { title: "Nada probable", subtitle: "Lo dejo invertido sin tocarlo", value: 100 },
    ],
  },
];
