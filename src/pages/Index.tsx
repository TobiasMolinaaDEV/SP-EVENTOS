import { Layout } from "@/components/Layout";
import {
  Truck,
  RotateCcw,
  AlertTriangle,
  CalendarCheck,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";

const entregasHoy = [
  { id: 1, cliente: "María López", evento: "Casamiento", items: "120 platos, 10 mesas, 80 sillas", hora: "09:00" },
  { id: 2, cliente: "Carlos Ruiz", evento: "Cumpleaños", items: "50 vasos, 5 mesas, 30 sillas", hora: "14:00" },
];

const retirosHoy = [
  { id: 1, cliente: "Ana García", evento: "Corporativo", items: "200 copas, 15 mesas", hora: "10:00" },
];

const alertas = [
  { tipo: "danger" as const, mensaje: "Stock bajo: Copas de vino (quedan 12)", icono: Package },
  { tipo: "warning" as const, mensaje: "Devolución pendiente: Pedido #1042 (vence hoy)", icono: RotateCcw },
  { tipo: "warning" as const, mensaje: "Devolución pendiente: Pedido #1038 (venció hace 2 días)", icono: AlertTriangle },
];

const statusStyles = {
  danger: "bg-status-danger/10 text-status-danger border-status-danger/20",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/20",
  success: "bg-status-success/10 text-status-success border-status-success/20",
  info: "bg-status-info/10 text-status-info border-status-info/20",
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: keyof typeof statusStyles }) {
  return (
    <div className="bg-card rounded-xl border p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-2.5 rounded-lg border ${statusStyles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-card-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Resumen de operaciones del día</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={CalendarCheck} label="Reservas activas" value="14" color="info" />
          <StatCard icon={DollarSign} label="Ingresos estimados" value="$485.000" color="success" />
          <StatCard icon={Truck} label="Entregas hoy" value={String(entregasHoy.length)} color="info" />
          <StatCard icon={RotateCcw} label="Retiros hoy" value={String(retirosHoy.length)} color="warning" />
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Alertas</h2>
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${statusStyles[a.tipo]}`}>
                  <a.icono className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{a.mensaje}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hoy: Entregas y Retiros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entregas */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <Truck className="h-4 w-4 text-status-info" />
              <h2 className="font-semibold text-card-foreground">Entregas de hoy</h2>
            </div>
            <div className="divide-y">
              {entregasHoy.map((e) => (
                <div key={e.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-card-foreground">{e.cliente}</p>
                    <p className="text-sm text-muted-foreground">{e.evento} — {e.items}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    {e.hora}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Retiros */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-status-success" />
              <h2 className="font-semibold text-card-foreground">Retiros de hoy</h2>
            </div>
            <div className="divide-y">
              {retirosHoy.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-card-foreground">{r.cliente}</p>
                    <p className="text-sm text-muted-foreground">{r.evento} — {r.items}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    {r.hora}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
