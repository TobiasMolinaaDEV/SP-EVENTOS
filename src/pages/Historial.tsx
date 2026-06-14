import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  Clock3,
  CalendarDays,
  DollarSign,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Historial() {

  const [historial, setHistorial] =
    useState<any[]>([]);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {

    try {

      const res = await fetch(
        "http://localhost:3001/historial"
      );

      const data = await res.json();

      setHistorial(data);

    } catch (error) {

      console.error(error);
    }
  };

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const formatoFecha = (fecha: string) => {

    if (!fecha) return "-";

    return fecha.split("T")[0];
  };

  const vaciarHistorial = async () => {

  const confirmar = window.confirm(
    "¿Seguro que deseas eliminar todo el historial?"
  );

  if (!confirmar) return;

  try {

    await fetch(
      "http://localhost:3001/historial",
      {
        method: "DELETE",
      }
    );

    cargarHistorial();

  } catch (error) {

    console.error(error);
  }
  };

  return (
    <Layout>

      <div className="space-y-6">
          
        <div>
          <h1 className="text-2xl font-bold">
            Historial
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Eventos finalizados
          </p>
          <Button
            variant="destructive"
            onClick={vaciarHistorial}
          >
            Vaciar historial
          </Button>

        </div>
        

        {historial.length > 0 ? (

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {historial.map((h) => (

              <div
                key={h.id}
                className="bg-card border rounded-xl p-5 shadow-sm space-y-4"
              >

                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h2 className="font-semibold text-lg">
                      {h.cliente}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {h.evento}
                    </p>
                  </div>

                  <div className="text-xs bg-muted px-2 py-1 rounded-md">
                    Finalizado
                  </div>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Fecha evento
                      </p>

                      <p>
                        {formatoFecha(h.fecha)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Finalizado
                      </p>

                      <p>
                        {formatoFecha(
                          h.fecha_finalizado
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>

                      <p>
                        {formatoMoneda(
                          Number(h.total)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Estado
                      </p>

                      <p>
                        {h.estado}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        ) : (

          <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
            No hay eventos finalizados
          </div>

        )}
      </div>
    </Layout>
  );
}