import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RadarPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Radar</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Señales y oportunidades de mercado.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Aún no hay señales disponibles.</p>
        <Button disabled>Próximamente: activar radar</Button>
      </Card>
    </div>
  );
}
