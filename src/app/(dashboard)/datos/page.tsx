"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { exportPortfolio, importPortfolio, resetPortfolio } from "@/lib/usePortfolio";
import { clearProfileScore } from "@/lib/useProfileScore";
import { clearChat } from "@/lib/useChat";

export default function DatosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportPortfolio();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "t69-cartera.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Cartera exportada.");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importPortfolio(String(reader.result));
        setMessage("Cartera importada correctamente.");
      } catch {
        setMessage("El archivo no tiene un formato válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    resetPortfolio();
    clearProfileScore();
    clearChat();
    setMessage("Se ha borrado tu cartera, tu perfil y tu conversación con Tony.");
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Mis datos</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        No hace falta crear cuenta: tu perfil y tu cartera se guardan en este navegador. Para
        llevarlos a otro equipo, expórtalos a un archivo e impórtalo allí.
      </p>

      <Card className="flex flex-col gap-2.5">
        <Button onClick={handleExport} className="w-full justify-center">
          Exportar mi cartera
        </Button>
        <Button variant="ghost" onClick={handleImportClick} className="w-full justify-center">
          Importar desde archivo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleReset}
          className="mt-1.5 text-[13px] font-semibold text-danger"
        >
          Empezar de cero (borrar todo)
        </button>
        {message && <p className="mt-2 text-[12.5px] font-semibold text-secondary">{message}</p>}
      </Card>
    </div>
  );
}
