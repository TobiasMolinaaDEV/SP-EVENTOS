import { Layout } from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const productos = [
  { nombre: "Platos llanos", categoria: "Vajilla", stock: 250, reservados: 120, estado: "ok" },
  { nombre: "Copas de vino", categoria: "Vajilla", stock: 12, reservados: 50, estado: "critico" },
  { nombre: "Vasos largos", categoria: "Vajilla", stock: 180, reservados: 80, estado: "ok" },
  { nombre: "Mesas redondas", categoria: "Mobiliario", stock: 40, reservados: 25, estado: "bajo" },
  { nombre: "Mesas rectangulares", categoria: "Mobiliario", stock: 30, reservados: 10, estado: "ok" },
  { nombre: "Sillas Tiffany", categoria: "Mobiliario", stock: 200, reservados: 150, estado: "bajo" },
  { nombre: "Manteles blancos", categoria: "Mantelería", stock: 100, reservados: 30, estado: "ok" },
  { nombre: "Cubiertos set x4", categoria: "Vajilla", stock: 300, reservados: 120, estado: "ok" },
];

const estadoStyle: Record<string, string> = {
  ok: "bg-status-success/10 text-status-success border-status-success/20",
  bajo: "bg-status-warning/10 text-status-warning border-status-warning/20",
  critico: "bg-status-danger/10 text-status-danger border-status-danger/20",
};

const estadoLabel: Record<string, string> = {
  ok: "Disponible",
  bajo: "Stock bajo",
  critico: "Crítico",
};

export default function Productos() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm mt-1">Inventario y disponibilidad de stock</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar productos..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {productos.map((p) => (
            <div key={p.nombre} className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-card-foreground">{p.nombre}</p>
                  <p className="text-xs text-muted-foreground">{p.categoria}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${estadoStyle[p.estado]}`}>
                  {estadoLabel[p.estado]}
                </Badge>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="font-bold text-card-foreground">{p.stock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Reservados</p>
                  <p className="font-bold text-status-warning">{p.reservados}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Disponibles</p>
                  <p className="font-bold text-status-success">{p.stock - p.reservados}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
