import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RoadmapPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Roadmap</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Las próximas funcionalidades de Tony.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Próximamente compartiremos el roadmap público.</p>
        <Button disabled>Próximamente</Button>
      </Card>
    </div>
  );
}
