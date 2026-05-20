import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Clock,
  MapPin,
  Package,
} from "lucide-react";

const estadoEntregaStyle: Record<string, string> = {
  pendiente:
    "bg-yellow-100 text-yellow-700 border-yellow-200",

  en_camino:
    "bg-blue-100 text-blue-700 border-blue-200",

  entregado:
    "bg-green-100 text-green-700 border-green-200",

  retirado:
    "bg-zinc-200 text-zinc-700 border-zinc-300",
};

export default function Entregas() {

  const [entregas, setEntregas] = useState<any[]>([]);

  useEffect(() => {
    cargarEntregas();
  }, []);

  const cargarEntregas = async () => {

    const res = await fetch(
      "http://localhost:3001/entregas"
    );

    const data = await res.json();

    setEntregas(data);
  };

  const cambiarEstado = async (
    id: number,
    estado: string
  ) => {

    await fetch(
      `http://localhost:3001/entregas/${id}/estado`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado_entrega: estado,
        }),
      }
    );

    setEntregas((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              estado_entrega: estado,
            }
          : e
      )
    );
  };

  const finalizarEntrega = async (id: number) => {

    const confirmar = confirm(
      "¿Finalizar entrega? Esto eliminará la reserva activa."
    );

    if (!confirmar) return;

    try {

      await fetch(
        `http://localhost:3001/reservas/${id}`,
        {
          method: "DELETE",
        }
      );

      setEntregas((prev) =>
        prev.filter((e) => e.id !== id)
      );

    } catch (error) {

      console.error(error);

      alert("Error finalizando entrega");
    }
  };

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  return (
    <Layout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold">
            Entregas
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Gestión logística de entregas y retiros
          </p>
        </div>

        {entregas.length > 0 ? (

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {entregas.map((e) => (

              <div
                key={e.id}
                className="bg-card border rounded-xl p-5 shadow-sm space-y-4"
              >

                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h2 className="font-semibold text-lg">
                      {e.cliente}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {e.evento}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      estadoEntregaStyle[
                        e.estado_entrega
                      ] || ""
                    }`}
                  >
                    {e.estado_entrega || "pendiente"}
                  </Badge>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Fecha
                      </p>

                      <p>
                        {e.fecha?.split("T")[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Horario
                      </p>

                      <p>{e.horario || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Lugar
                      </p>

                      <p>{e.lugar || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* PRODUCTOS */}
                <div className="border rounded-lg p-3 bg-muted/20 space-y-2">

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />

                    <p className="text-sm font-medium">
                      Productos
                    </p>
                  </div>

                  {e.productos &&
                  e.productos.length > 0 ? (

                    <div className="space-y-1">

                      {e.productos.map(
                        (p: any, i: number) => (

                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {p.nombre}
                            </span>

                            <span className="font-medium">
                              x{p.cantidad}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                  ) : (

                    <p className="text-sm text-muted-foreground">
                      Sin productos
                    </p>

                  )}
                </div>

                {/* TOTAL */}
                <div className="border rounded-lg p-3 bg-muted/20">

                  <p className="text-xs text-muted-foreground mb-1">
                    Total reserva
                  </p>

                  <p className="font-semibold text-lg">
                    {formatoMoneda(Number(e.total))}
                  </p>
                </div>

                {/* BOTONES */}
                <div className="flex flex-wrap items-center gap-2">

                  <button
                    onClick={() =>
                      cambiarEstado(
                        e.id,
                        "pendiente"
                      )
                    }
                    className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition"
                  >
                    Pendiente
                  </button>

                  <button
                    onClick={() =>
                      cambiarEstado(
                        e.id,
                        "en_camino"
                      )
                    }
                    className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition"
                  >
                    En camino
                  </button>

                  <button
                    onClick={() =>
                      cambiarEstado(
                        e.id,
                        "entregado"
                      )
                    }
                    className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition"
                  >
                    Entregado
                  </button>

                  <button
                    onClick={() =>
                      cambiarEstado(
                        e.id,
                        "retirado"
                      )
                    }
                    className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition"
                  >
                    Retirado
                  </button>

                  <button
                    onClick={() =>
                      finalizarEntrega(e.id)
                    }
                    className="px-3 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition ml-auto"
                  >
                    ❌ Finalizar
                  </button>

                </div>

              </div>
            ))}
          </div>

        ) : (

          <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
            No hay entregas cargadas
          </div>

        )}
      </div>
    </Layout>
  );
}