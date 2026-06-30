import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Dashboard</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Vista general de tu situación financiera.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Aún no hay datos que mostrar.</p>
        <Button disabled>Próximamente: ver resumen</Button>
      </Card>
    </div>
  );
}
