import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PresupuestoPDF from "@/components/PresupuestoPDF";

const estadoBadge: Record<string, string> = {
  pendiente:
    "bg-status-warning/10 text-status-warning border-status-warning/20",

  entregado:
    "bg-status-success/10 text-status-success border-status-success/20",

  devuelto:
    "bg-status-info/10 text-status-info border-status-info/20",
};

export default function Remitos() {
  const [pdfVisible, setPdfVisible] =
    useState(false);

  const [pdfData, setPdfData] =
    useState<any>(null);

  const [pdfProductos, setPdfProductos] =
    useState<any[]>([]);

  const [remitos, setRemitos] =
    useState<any[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  useEffect(() => {

  cargarRemitos();

  const interval = setInterval(() => {
    cargarRemitos();
  }, 2000);

  return () => clearInterval(interval);

}, []);

  const cargarRemitos = async () => {

    try {

      const res = await fetch(
        "http://localhost:3001/remitos"
      );

      const data = await res.json();

      setRemitos(data);

    } catch (error) {

      console.error(error);
    }
  };

  const remitosFiltrados =
    remitos.filter((r) => {

      const texto =
        busqueda.toLowerCase();

      return (
        r.cliente
          ?.toLowerCase()
          .includes(texto) ||

        r.evento
          ?.toLowerCase()
          .includes(texto) ||

        r.numero_remito
          ?.toString()
          .includes(texto)
      );
    });

const generarPDF = async (
  remito: any
) => {

  try {

    const res = await fetch(
      `http://localhost:3001/reservas/${remito.reserva_id}/productos`
    );

    const productos =
      await res.json();

    setPdfData(remito);

    setPdfProductos(productos);

    setPdfVisible(true);

    setTimeout(async () => {

      const element =
        document.getElementById(
          "presupuesto-pdf"
        );

      if (!element) return;

      const canvas =
        await html2canvas(
          element,
          {
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
          }
        );

      const imgData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        210,
        297
      );

      pdf.save(
        `Remito-${remito.numero_remito}.pdf`
      );

      setPdfVisible(false);

    }, 300);

  } catch (error) {

    console.error(error);
  }
};

  return (
    <Layout>

      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Remitos
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Control de entregas y logística
          </p>
        </div>

        <div className="relative max-w-sm">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Buscar remitos..."
            className="pl-9"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b bg-muted/50">

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    N°
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    Cliente
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                    Evento
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                    Fecha
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                    Total
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    Estado
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground">
                    PDF
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y">

                {remitosFiltrados.length > 0 ? (

                  remitosFiltrados.map((r) => (

                    <tr
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors"
                    >

                      <td className="px-5 py-4 font-medium text-card-foreground">
                        #{r.numero_remito}
                      </td>

                      <td className="px-5 py-4 text-card-foreground">
                        {r.cliente}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                        {r.evento}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                        {r.fecha?.split("T")[0]}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                        $
                        {Number(
                          r.total || 0
                        ).toLocaleString("es-AR")}
                      </td>

                      <td className="px-5 py-4">

                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${
                            estadoBadge[
                              r.estado || "entregado"
                            ] ||
                            estadoBadge.entregado
                          }`}
                        >
                          {r.estado || "entregado"}
                        </Badge>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() =>
                            generarPDF(r)
                          }
                          className="hover:scale-110 transition"
                          title="Descargar PDF"
                        >
                          🧾
                        </button>

                      </td>

                    </tr>
                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No hay remitos registrados
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
        {pdfVisible && pdfData && (
          <div className="fixed left-[-9999px] top-0">

            <PresupuestoPDF
              presupuesto={pdfData}
              productos={pdfProductos}
              tipo="remito"
            />

          </div>
        )}

    </Layout>
  );
}