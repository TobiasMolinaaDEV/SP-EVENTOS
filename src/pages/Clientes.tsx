import { Layout } from "@/components/Layout";
import { Search, Plus, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const clientes = [
  { nombre: "María López", email: "maria@email.com", telefono: "11-2345-6789", reservas: 3 },
  { nombre: "Carlos Ruiz", email: "carlos@email.com", telefono: "11-3456-7890", reservas: 1 },
  { nombre: "Ana García", email: "ana@email.com", telefono: "11-4567-8901", reservas: 5 },
  { nombre: "Luis Fernández", email: "luis@email.com", telefono: "11-5678-9012", reservas: 2 },
  { nombre: "Sofía Martínez", email: "sofia@email.com", telefono: "11-6789-0123", reservas: 4 },
  { nombre: "Diego Romero", email: "diego@email.com", telefono: "11-7890-1234", reservas: 1 },
];

export default function Clientes() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground text-sm mt-1">Listado de clientes registrados</p>
          </div>
          <Button className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientes.map((c) => (
            <div key={c.email} className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {c.nombre.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{c.nombre}</p>
                  <p className="text-xs text-muted-foreground">{c.reservas} reservas</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{c.telefono}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
