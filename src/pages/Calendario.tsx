import { Layout } from "@/components/Layout";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const eventos: Record<string, { title: string; color: string }[]> = {
  "2026-04-05": [{ title: "López - Casamiento", color: "bg-status-info" }],
  "2026-04-10": [{ title: "López - Entrega", color: "bg-status-success" }],
  "2026-04-12": [{ title: "Ruiz - Cumpleaños", color: "bg-status-warning" }],
  "2026-04-15": [{ title: "García - Corporativo", color: "bg-status-info" }],
  "2026-04-22": [{ title: "Martínez - Casamiento", color: "bg-status-info" }],
};

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
  const [current, setCurrent] = useState(new Date(2026, 3));
  const year = current.getFullYear();
  const month = current.getMonth();
  const days = getCalendarDays(year, month);
  const today = new Date();

  const prev = () => setCurrent(new Date(year, month - 1));
  const next = () => setCurrent(new Date(year, month + 1));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground text-sm mt-1">Vista mensual de eventos y entregas</p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-card-foreground">{MONTHS[month]} {year}</h2>
            <Button variant="ghost" size="icon" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
              {days.map((day, i) => {
                const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                const dayEvents = day ? eventos[dateStr] || [] : [];
                const isToday = day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] sm:min-h-[100px] p-1.5 border border-border/50 rounded-md ${
                      day ? "bg-card" : "bg-muted/30"
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                          isToday ? "bg-primary text-primary-foreground" : "text-card-foreground"
                        }`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.map((ev, j) => (
                            <div key={j} className={`${ev.color} text-primary-foreground text-[10px] px-1 py-0.5 rounded truncate`}>
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
