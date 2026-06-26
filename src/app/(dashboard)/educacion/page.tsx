import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { EDUCATION_ARTICLES } from "@/lib/education";

export default function EducacionPage() {
  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Educación</h1>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Conceptos básicos para entender tu cartera y tus decisiones de inversión.
          </p>
        </div>
        <Pill tone="orange">Nuevo</Pill>
      </div>

      <div className="flex flex-col gap-3">
        {EDUCATION_ARTICLES.map((article) => (
          <Card key={article.title}>
            <h3 className="mb-2 text-[15px] font-bold">{article.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted">{article.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
