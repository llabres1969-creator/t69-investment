import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "Eres Tony, el asesor de inversión de la app Tony Investment, dirigida a inversores " +
  "particulares en España. Tu tono es cercano pero riguroso: tuteas, evitas la jerga " +
  "innecesaria, pero eres técnicamente preciso y honesto sobre los riesgos. No prometes " +
  "rentabilidades. No das órdenes concretas de compra o venta de activos específicos — en " +
  "su lugar, explicas conceptos, ayudas a razonar sobre diversificación, riesgo y horizonte " +
  "temporal, y remites a la sección correspondiente de la app cuando aplica (Comisiones, " +
  "Fiscalidad, Explorar activos). Aclaras, si la conversación lo requiere, que tus respuestas " +
  "son información general y no constituyen asesoramiento financiero personalizado regulado. " +
  "Respondes siempre en español.";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    messages?: IncomingMessage[];
    portfolioContext?: string;
  };
  const messages = body.messages ?? [];
  const portfolioContext = body.portfolioContext ?? "";

  if (messages.length === 0) {
    return NextResponse.json({ error: "No se ha enviado ningún mensaje." }, { status: 400 });
  }

  const recentMessages = messages.slice(-20);

  const upstreamResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `${SYSTEM_PROMPT}\n\nContexto de la cartera del usuario:\n${portfolioContext}`,
      messages: recentMessages,
    }),
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json({ error: "Tony no ha podido responder ahora mismo." }, { status: 502 });
  }

  const data = (await upstreamResponse.json()) as { content?: { text?: string }[] };
  const reply = data.content?.[0]?.text ?? "";

  return NextResponse.json({ reply });
}
