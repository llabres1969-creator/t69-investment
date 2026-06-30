import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function MetasPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Metas</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Define objetivos financieros y sigue tu progreso.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no has creado ninguna meta.</p>
          <Button disabled>Próximamente: crear meta</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
