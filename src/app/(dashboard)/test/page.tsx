"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OptionCard } from "@/components/ui/OptionCard";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { computeScore, profileLabel } from "@/lib/profile";
import { saveProfileScore } from "@/lib/useProfileScore";

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const question = QUIZ_QUESTIONS[step];
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / QUIZ_QUESTIONS.length) * 100);

  const provisionalScore = useMemo(() => {
    if (Object.keys(answers).length === 0) return null;
    return computeScore(answers);
  }, [answers]);

  function selectOption(value: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function goNext() {
    if (step < QUIZ_QUESTIONS.length - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const isLast = step === QUIZ_QUESTIONS.length - 1;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  function finishTest() {
    saveProfileScore(computeScore(answers));
    router.push("/portfolio");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="mb-0.5 text-[12px] font-bold text-muted">
            Pregunta {step + 1} de {QUIZ_QUESTIONS.length}
          </div>
          <h1 className="font-serif text-[28px] font-bold tracking-tight">Test de perfil</h1>
        </div>
        {provisionalScore !== null && (
          <Pill tone="orange">Perfil provisional: {profileLabel(provisionalScore)}</Pill>
        )}
      </div>

      <div className="mb-5">
        <ProgressBar percent={percent} />
      </div>

      <Card className="mb-4">
        <h3 className="mb-4 text-[17px] font-bold tracking-tight">{question.question}</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {question.options.map((opt) => (
            <OptionCard
              key={opt.title}
              title={opt.title}
              subtitle={opt.subtitle}
              active={answers[question.id] === opt.value}
              onClick={() => selectOption(opt.value)}
            />
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goBack} disabled={step === 0}>
          Anterior
        </Button>
        {isLast ? (
          <Button disabled={!allAnswered} onClick={finishTest}>
            Ver mi cartera ideal →
          </Button>
        ) : (
          <Button onClick={goNext} disabled={answers[question.id] === undefined}>
            Siguiente pregunta
          </Button>
        )}
      </div>
    </div>
  );
}
