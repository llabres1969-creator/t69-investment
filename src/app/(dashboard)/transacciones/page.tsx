import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function TransaccionesPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Transacciones</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Historial de compras y ventas en tu cartera.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no hay transacciones registradas.</p>
          <Button disabled>Próximamente: importar histórico</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
