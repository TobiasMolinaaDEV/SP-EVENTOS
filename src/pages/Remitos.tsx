import { Layout } from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const remitos = [
  { id: "R-001", cliente: "María López", fecha: "2026-04-03", tipo: "Entrega", estado: "entregado" },
  { id: "R-002", cliente: "Carlos Ruiz", fecha: "2026-04-05", tipo: "Entrega", estado: "pendiente" },
  { id: "R-003", cliente: "Ana García", fecha: "2026-04-01", tipo: "Devolución", estado: "devuelto" },
  { id: "R-004", cliente: "Luis Fernández", fecha: "2026-03-28", tipo: "Devolución", estado: "pendiente" },
  { id: "R-005", cliente: "Sofía Martínez", fecha: "2026-04-10", tipo: "Entrega", estado: "pendiente" },
  { id: "R-006", cliente: "Diego Romero", fecha: "2026-03-30", tipo: "Devolución", estado: "devuelto" },
];

const estadoBadge: Record<string, string> = {
  pendiente: "bg-status-warning/10 text-status-warning border-status-warning/20",
  entregado: "bg-status-success/10 text-status-success border-status-success/20",
  devuelto: "bg-status-info/10 text-status-info border-status-info/20",
};

export default function Remitos() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Remitos</h1>
          <p className="text-muted-foreground text-sm mt-1">Control de entregas y devoluciones</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar remitos..." className="pl-9" />
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Remito</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Cliente</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden md:table-cell">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {remitos.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-medium text-card-foreground">{r.id}</td>
                    <td className="px-5 py-4 text-card-foreground">{r.cliente}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{r.fecha}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{r.tipo}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={`text-xs capitalize ${estadoBadge[r.estado]}`}>
                        {r.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
