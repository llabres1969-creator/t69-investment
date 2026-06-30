import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ComunidadPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Comunidad</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Conecta con otros inversores particulares.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">La comunidad está en construcción.</p>
        <Button disabled>Próximamente: unirte</Button>
      </Card>
    </div>
  );
}
