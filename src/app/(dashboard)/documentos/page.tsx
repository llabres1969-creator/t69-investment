import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function DocumentosPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Documentos</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Guarda informes, contratos y otros documentos de tu inversión.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no has subido ningún documento.</p>
          <Button disabled>Próximamente: subir documento</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
