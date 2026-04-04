import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const reservas = [
  { id: 1001, cliente: "María López", evento: "Casamiento", fecha: "2026-04-10", estado: "confirmada", total: "$85.000" },
  { id: 1002, cliente: "Carlos Ruiz", evento: "Cumpleaños 50", fecha: "2026-04-12", estado: "pendiente", total: "$32.000" },
  { id: 1003, cliente: "Ana García", evento: "Evento corporativo", fecha: "2026-04-15", estado: "confirmada", total: "$120.000" },
  { id: 1004, cliente: "Luis Fernández", evento: "Bautismo", fecha: "2026-04-18", estado: "cancelada", total: "$28.000" },
  { id: 1005, cliente: "Sofía Martínez", evento: "Casamiento", fecha: "2026-04-22", estado: "pendiente", total: "$95.000" },
];

const estadoBadge: Record<string, string> = {
  confirmada: "bg-status-success/10 text-status-success border-status-success/20",
  pendiente: "bg-status-warning/10 text-status-warning border-status-warning/20",
  cancelada: "bg-status-danger/10 text-status-danger border-status-danger/20",
};

export default function Reservas() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestión de reservas de eventos</p>
          </div>
          <Button className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nueva reserva
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar reservas..." className="pl-9" />
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Cliente</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Evento</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden md:table-cell">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Estado</th>
                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reservas.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-medium text-card-foreground">{r.id}</td>
                    <td className="px-5 py-4 text-card-foreground">{r.cliente}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{r.evento}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{r.fecha}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={`text-xs capitalize ${estadoBadge[r.estado]}`}>
                        {r.estado}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-card-foreground">{r.total}</td>
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
