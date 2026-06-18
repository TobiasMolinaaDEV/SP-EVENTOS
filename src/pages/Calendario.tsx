import { Layout } from "@/components/Layout";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";



const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}


export default function Calendario() {
  const [current, setCurrent] = useState(new Date());
  const [reservas, setReservas] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const usuario = JSON.parse(
  localStorage.getItem("usuario") || "{}"
);

if (usuario.rol !== "admin") {
  return (
    <Layout>
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">
          Acceso denegado
        </h2>

        <p className="text-muted-foreground mt-2">
          No tenés permisos para ver esta sección.
        </p>
      </div>
    </Layout>
  );
}

  const year = current.getFullYear();
  const month = current.getMonth();
  const days = getCalendarDays(year, month);
  const today = new Date();

  useEffect(() => {
    fetch("/api/reservas")
      .then((res) => res.json())
      .then((data) => setReservas(data));
  }, []);

  const eventos: Record<string, any[]> = {};

  reservas.forEach((r) => {
    const fecha = r.fecha?.split("T")[0];

    if (!eventos[fecha]) eventos[fecha] = [];

    eventos[fecha].push(r);
  });

  const prev = () => setCurrent(new Date(year, month - 1));
  const next = () => setCurrent(new Date(year, month + 1));

  const selectedEvents = selectedDay ? eventos[selectedDay] || [] : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vista mensual de eventos y entregas
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-card-foreground">
              {MONTHS[month]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {d}
                </div>
              ))}

              {days.map((day, i) => {
                const dateStr = day
                  ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : "";

                const dayEvents = day ? eventos[dateStr] || [] : [];

                const isToday =
                  day &&
                  today.getFullYear() === year &&
                  today.getMonth() === month &&
                  today.getDate() === day;

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(dateStr)}
                    className={`min-h-[80px] sm:min-h-[100px] p-1.5 border border-border/50 rounded-md cursor-pointer ${
                      day ? "bg-card hover:bg-muted/30" : "bg-muted/30"
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                            isToday
                              ? "bg-primary text-primary-foreground"
                              : "text-card-foreground"
                          }`}
                        >
                          {day}
                        </span>

                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev, j) => (
                            <div
                              key={j}
                              className={`text-primary-foreground text-[10px] px-1 py-0.5 rounded truncate ${
                                ev.estado === "confirmada"
                                  ? "bg-status-success"
                                  : ev.estado === "pendiente"
                                  ? "bg-status-warning"
                                  : "bg-status-danger"
                              }`}
                            >
                              {ev.cliente}
                            </div>
                          ))}

                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🔥 MODAL DEL DÍA */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 shadow-lg">

              <h2 className="text-lg font-semibold">
                Reservas del {selectedDay}
              </h2>

              {selectedEvents.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedEvents.map((r, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{r.cliente}</p>
                        <p className="text-sm text-muted-foreground">{r.evento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm capitalize">{r.estado}</p>
                        <p className="font-semibold">
                          ${Number(r.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No hay reservas este día
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedDay(null)}>
                  Cerrar
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
