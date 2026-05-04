import { useEffect, useState } from "react";
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

const statusStyles = {
  danger: "bg-status-danger/10 text-status-danger border-status-danger/20",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/20",
  success: "bg-status-success/10 text-status-success border-status-success/20",
  info: "bg-status-info/10 text-status-info border-status-info/20",
};

type DashboardData = {
  reservas_activas: number;
  ingresos: number;
  entregas_hoy: any[];
  retiros_hoy: any[];
  productos_criticos: any[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: keyof typeof statusStyles;
}) {
  return (
    <div className="bg-card rounded-xl border p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-2.5 rounded-lg border ${statusStyles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-card-foreground mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    reservas_activas: 0,
    ingresos: 0,
    entregas_hoy: [],
    retiros_hoy: [],
    productos_criticos: [],
  });

  useEffect(() => {
    fetch("http://localhost:3001/dashboard")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen de operaciones del día
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarCheck}
            label="Reservas activas"
            value={String(data.reservas_activas)}
            color="info"
          />
          <StatCard
            icon={DollarSign}
            label="Ingresos estimados"
            value={formatoMoneda(data.ingresos)}
            color="success"
          />
          <StatCard
            icon={Truck}
            label="Entregas hoy"
            value={String(data.entregas_hoy.length)}
            color="info"
          />
          <StatCard
            icon={RotateCcw}
            label="Retiros hoy"
            value={String(data.retiros_hoy.length)}
            color="warning"
          />
        </div>

        {data.productos_criticos.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Alertas
            </h2>

            <div className="space-y-2">
              {data.productos_criticos.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${statusStyles.danger}`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">
                    Stock bajo: {p.nombre} quedan {p.disponibles}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <Truck className="h-4 w-4 text-status-info" />
              <h2 className="font-semibold text-card-foreground">
                Entregas de hoy
              </h2>
            </div>

            <div className="divide-y">
              {data.entregas_hoy.length > 0 ? (
                data.entregas_hoy.map((e) => (
                  <div
                    key={e.id}
                    className="px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground">
                        {e.cliente}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.evento} {e.lugar ? `— ${e.lugar}` : ""}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      {e.horario || "--:--"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-sm text-muted-foreground">
                  No hay entregas para hoy
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-status-success" />
              <h2 className="font-semibold text-card-foreground">
                Retiros de hoy
              </h2>
            </div>

            <div className="divide-y">
              {data.retiros_hoy.length > 0 ? (
                data.retiros_hoy.map((r) => (
                  <div
                    key={r.id}
                    className="px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground">
                        {r.cliente}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.evento}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      {r.horario || "--:--"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-sm text-muted-foreground">
                  No hay retiros para hoy
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}