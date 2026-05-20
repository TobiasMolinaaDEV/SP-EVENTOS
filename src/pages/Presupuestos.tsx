import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PresupuestoPDF from "@/components/PresupuestoPDF";
import { Trash2 } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio_unitario: number;
};

type ProductoPresupuesto = {
  producto_id: string;
  cantidad: number;
};

const estadoStyle: Record<string, string> = {
  pendiente:
    "bg-status-warning/10 text-status-warning border-status-warning/20",
  aceptado:
    "bg-status-success/10 text-status-success border-status-success/20",
  rechazado:
    "bg-status-danger/10 text-status-danger border-status-danger/20",
  convertido:
    "bg-status-info/10 text-status-info border-status-info/20",
};

const formInicial = {
  cliente: "",
  telefono: "",
  direccion: "",
  email: "",

  evento: "",
  fecha: "",
  horario: "",
  lugar: "",

  envio: "",
  descuento: "",
  sena: "",

  estado: "pendiente",

  observaciones: "",
};

const productoInicial: ProductoPresupuesto[] = [
  {
    producto_id: "",
    cantidad: 1,
  },
];

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [busqueda, setBusqueda] = useState("");

  const [open, setOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState(formInicial);

  const [productosPresupuesto, setProductosPresupuesto] =
    useState<ProductoPresupuesto[]>(productoInicial);

  useEffect(() => {
    cargarPresupuestos();
    cargarProductos();
  }, []);

  const [pdfVisible, setPdfVisible] = useState(false);

  const [pdfData, setPdfData] = useState<any>(null);

  const [pdfProductos, setPdfProductos] = useState<any[]>([]);

  const cargarPresupuestos = () => {
    fetch("http://localhost:3001/presupuestos")
      .then((res) => res.json())
      .then((data) => setPresupuestos(data));
  };

  const cargarProductos = () => {
    fetch("http://localhost:3001/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  };

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const subtotalProductos = productosPresupuesto.reduce((acc, item) => {
    const producto = productos.find(
      (p) => String(p.id) === String(item.producto_id)
    );

    if (!producto) return acc;

    return (
      acc +
      Number(producto.precio_unitario || 0) *
        Number(item.cantidad || 0)
    );
  }, 0);

  const totalCalculado =
    subtotalProductos +
    Number(form.envio || 0) -
    Number(form.descuento || 0);

  const saldoPendiente =
    totalCalculado - Number(form.sena || 0);

  const limpiarFormulario = () => {
    setForm(formInicial);
    setEditId(null);
    setProductosPresupuesto(productoInicial);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setOpen(true);
  };

  const abrirEditar = async (p: any) => {
    setForm({
      cliente: p.cliente || "",
      telefono: p.telefono || "",
      direccion: p.direccion || "",
      email: p.email || "",

      evento: p.evento || "",
      fecha: p.fecha?.split("T")[0] || "",
      horario: p.horario || "",
      lugar: p.lugar || "",

      envio: p.envio?.toString() || "",
      descuento: p.descuento?.toString() || "",
      sena: p.sena?.toString() || "",

      estado: p.estado || "pendiente",

      observaciones: p.observaciones || "",
    });

    setEditId(p.id);

    const res = await fetch(
      `http://localhost:3001/presupuestos/${p.id}/productos`
    );

    const data = await res.json();

    if (data.length > 0) {
      setProductosPresupuesto(
        data.map((item: any) => ({
          producto_id: String(item.producto_id),
          cantidad: Number(item.cantidad),
        }))
      );
    } else {
      setProductosPresupuesto(productoInicial);
    }

    setOpen(true);
  };

  const guardarPresupuesto = async () => {
    if (!form.cliente || !form.evento) {
      alert("Cliente y evento son obligatorios.");
      return;
    }

    const productosFinales = productosPresupuesto
      .filter((p) => p.producto_id)
      .map((p) => {
        const producto = productos.find(
          (prod) => String(prod.id) === String(p.producto_id)
        );

        return {
          producto_id: Number(p.producto_id),
          cantidad: Number(p.cantidad),
          precio_unitario: Number(
            producto?.precio_unitario || 0
          ),
          subtotal:
            Number(producto?.precio_unitario || 0) *
            Number(p.cantidad || 0),
        };
      });

    const payload = {
      ...form,

      subtotal: subtotalProductos,

      total: totalCalculado,

      envio: Number(form.envio || 0),
      descuento: Number(form.descuento || 0),
      sena: Number(form.sena || 0),

      productos: productosFinales,
    };

    const res = await fetch(
      "http://localhost:3001/presupuestos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const nuevo = await res.json();

    setPresupuestos((prev) => [nuevo, ...prev]);

    limpiarFormulario();

    setOpen(false);
  };
  const eliminarPresupuesto = async (id: number) => {
  const confirmar = confirm(
    "¿Eliminar este presupuesto?"
  );

  if (!confirmar) return;

  await fetch(
    `http://localhost:3001/presupuestos/${id}`,
    {
      method: "DELETE",
    }
  );

  setPresupuestos((prev) =>
    prev.filter((p) => p.id !== id)
  );
};
const convertirEnReserva = async () => {

  if (!editId) return;

  const confirmar = confirm(
    "¿Convertir este presupuesto en reserva?"
  );

  if (!confirmar) return;

  try {

    const res = await fetch(
      `http://localhost:3001/presupuestos/${editId}/convertir`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      throw new Error("Error");
    }

    cargarPresupuestos();

    alert(
      "Reserva creada correctamente."
    );

    setOpen(false);

  } catch (error) {

    console.error(error);

    alert(
      "Error al convertir presupuesto."
    );
  }
};

  const generarPDF = async () => {
  const productosFinales = productosPresupuesto.map((item) => {
    const producto = productos.find(
      (p) => String(p.id) === String(item.producto_id)
    );

    return {
      nombre: producto?.nombre || "-",
      cantidad: Number(item.cantidad || 0),
      precio_unitario: Number(
        producto?.precio_unitario || 0
      ),
      subtotal:
        Number(producto?.precio_unitario || 0) *
        Number(item.cantidad || 0),
    };
  });

  const presupuestoFinal = {
    ...form,
    subtotal: subtotalProductos,
    total: totalCalculado,
    envio: Number(form.envio || 0),
    descuento: Number(form.descuento || 0),
    sena: Number(form.sena || 0),
  };

  setPdfData(presupuestoFinal);

  setPdfProductos(productosFinales);

  setPdfVisible(true);

  setTimeout(async () => {
    const element = document.getElementById(
      "presupuesto-pdf"
    );

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(
      `Presupuesto-${form.cliente || "cliente"}.pdf`
    );

    setPdfVisible(false);

  }, 300);
};

  const agregarProducto = () => {
    setProductosPresupuesto((prev) => [
      ...prev,
      {
        producto_id: "",
        cantidad: 1,
      },
    ]);
  };

  const actualizarProducto = (
    index: number,
    campo: keyof ProductoPresupuesto,
    valor: string | number
  ) => {
    setProductosPresupuesto((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]:
                campo === "cantidad"
                  ? Number(valor)
                  : String(valor),
            }
          : item
      )
    );
  };

  const eliminarProducto = (index: number) => {
    if (productosPresupuesto.length === 1) return;

    setProductosPresupuesto((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const presupuestosFiltrados = presupuestos.filter((p) => {
    const texto = busqueda.toLowerCase();

    return (
      p.cliente?.toLowerCase().includes(texto) ||
      p.evento?.toLowerCase().includes(texto) ||
      p.estado?.toLowerCase().includes(texto)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Presupuestos
            </h1>

            <p className="text-muted-foreground text-sm mt-1">
              Historial y creación de presupuestos
            </p>
          </div>

          <Button
            onClick={abrirNuevo}
            className="gap-2 self-start"
          >
            <Plus className="h-4 w-4" />
            Nuevo presupuesto
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Buscar presupuestos..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
  {/* MOBILE */}
  <div className="block lg:hidden divide-y">
    {presupuestosFiltrados.length > 0 ? (
      presupuestosFiltrados.map((p) => (
        <div
          key={p.id}
          onClick={() => abrirEditar(p)}
          className="p-4 space-y-3 hover:bg-muted/30 transition cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-card-foreground">
                {p.cliente}
              </p>
              <p className="text-xs text-muted-foreground">
                #{p.id} · {p.evento || "Sin evento"}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`capitalize text-xs ${estadoStyle[p.estado] || ""}`}
            >
              {p.estado}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p>{p.fecha?.split("T")[0] || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold">
                {formatoMoneda(Number(p.total))}
              </p>
            </div>
          </div>

          <div
            className="flex justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => eliminarPresupuesto(p.id)}
              className="text-red-500 text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-10 text-muted-foreground">
        No hay presupuestos
      </div>
    )}
  </div>

  {/* DESKTOP */}
  <div className="hidden lg:block overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="text-left px-5 py-3">#</th>
          <th className="text-left px-5 py-3">Cliente</th>
          <th className="text-left px-5 py-3">Evento</th>
          <th className="text-left px-5 py-3">Fecha</th>
          <th className="text-left px-5 py-3">Estado</th>
          <th className="text-right px-5 py-3">Total</th>
          <th className="text-right px-5 py-3">Acción</th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {presupuestosFiltrados.length > 0 ? (
          presupuestosFiltrados.map((p) => (
            <tr
              key={p.id}
              onClick={() => abrirEditar(p)}
              className="hover:bg-muted/30 transition cursor-pointer"
            >
              <td className="px-5 py-4">#{p.id}</td>
              <td className="px-5 py-4">{p.cliente}</td>
              <td className="px-5 py-4">{p.evento}</td>
              <td className="px-5 py-4">{p.fecha?.split("T")[0]}</td>
              <td className="px-5 py-4">
                <Badge
                  variant="outline"
                  className={`capitalize ${estadoStyle[p.estado] || ""}`}
                >
                  {p.estado}
                </Badge>
              </td>
              <td className="px-5 py-4 text-right font-semibold">
                {formatoMoneda(Number(p.total))}
              </td>
              <td
                className="px-5 py-4 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => eliminarPresupuesto(p.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  ❌
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
              No hay presupuestos
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto space-y-5 shadow-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />

                <h2 className="text-lg font-semibold">
                  {editId
                    ? "Editar presupuesto"
                    : "Nuevo presupuesto"}
                </h2>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Datos cliente
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    name="cliente"
                    placeholder="Cliente *"
                    value={form.cliente}
                    onChange={handleChange}
                  />

                  <Input
                    name="telefono"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                  />

                  <Input
                    name="direccion"
                    placeholder="Dirección"
                    value={form.direccion}
                    onChange={handleChange}
                  />

                  <Input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Datos evento
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    name="evento"
                    placeholder="Evento"
                    value={form.evento}
                    onChange={handleChange}
                  />

                  <Input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                  />

                  <Input
                    name="horario"
                    placeholder="Horario"
                    value={form.horario}
                    onChange={handleChange}
                  />

                  <Input
                    name="lugar"
                    placeholder="Lugar"
                    value={form.lugar}
                    onChange={handleChange}
                  />

                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="pendiente">
                      Pendiente
                    </option>

                    <option value="aceptado">
                      Aceptado
                    </option>

                    <option value="rechazado">
                      Rechazado
                    </option>

                    <option value="convertido">
                      Convertido
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Productos
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Productos incluidos en el presupuesto
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={agregarProducto}
                  >
                    Agregar producto
                  </Button>
                </div>

                {productosPresupuesto.map((item, i) => {
                  const productoSeleccionado =
                    productos.find(
                      (p) =>
                        String(p.id) ===
                        String(item.producto_id)
                    );

                  const subtotal =
                    Number(
                      productoSeleccionado?.precio_unitario || 0
                    ) * Number(item.cantidad || 0);

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                    >
                      <select
                        value={item.producto_id}
                        onChange={(e) =>
                          actualizarProducto(
                            i,
                            "producto_id",
                            e.target.value
                          )
                        }
                        className="md:col-span-5 w-full border rounded-md p-2 text-sm"
                      >
                        <option value="">
                          Seleccionar producto
                        </option>

                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ·{" "}
                            {formatoMoneda(
                              Number(p.precio_unitario)
                            )}
                          </option>
                        ))}
                      </select>

                      <Input
                        className="md:col-span-2"
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarProducto(
                            i,
                            "cantidad",
                            e.target.value
                          )
                        }
                      />

                      <div className="md:col-span-3 text-sm text-muted-foreground">
                        {formatoMoneda(subtotal)}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          eliminarProducto(i)
                        }
                        disabled={
                          productosPresupuesto.length === 1
                        }
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Importes
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="rounded-md border px-3 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      Subtotal
                    </p>

                    <p className="font-semibold">
                      {formatoMoneda(
                        subtotalProductos
                      )}
                    </p>
                  </div>

                  <Input
                    type="number"
                    name="envio"
                    placeholder="Envío"
                    value={form.envio}
                    onChange={handleChange}
                  />

                  <Input
                    type="number"
                    name="descuento"
                    placeholder="Descuento"
                    value={form.descuento}
                    onChange={handleChange}
                  />

                  <Input
                    type="number"
                    name="sena"
                    placeholder="Seña"
                    value={form.sena}
                    onChange={handleChange}
                  />

                  <div className="rounded-md border px-3 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      Total
                    </p>

                    <p className="font-bold text-status-success">
                      {formatoMoneda(totalCalculado)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Saldo:{" "}
                      {formatoMoneda(saldoPendiente)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Observaciones
                </p>

                <textarea
                  name="observaciones"
                  placeholder="Observaciones..."
                  value={form.observaciones}
                  onChange={handleChange}
                  className="w-full min-h-[90px] border rounded-md p-2 text-sm resize-none"
                />
              </div>
                          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">

  <Button
    variant="outline"
    onClick={() => {
      limpiarFormulario();
      setOpen(false);
    }}
  >
    Cancelar
  </Button>

  <Button
    type="button"
    variant="outline"
    onClick={generarPDF}
  >
    Generar PDF
  </Button>

  <Button
    type="button"
    variant="outline"
    onClick={convertirEnReserva}
    disabled={!editId}
  >
    Convertir en reserva
  </Button>

  <Button onClick={guardarPresupuesto}>
    {editId
      ? "Actualizar"
      : "Guardar presupuesto"}
  </Button>

</div>
            </div>
          </div>
        )}
      </div>
      {pdfVisible && pdfData && (
  <div className="fixed left-[-9999px] top-0">
    <PresupuestoPDF
      presupuesto={pdfData}
      productos={pdfProductos}
    />
  </div>
)}
    </Layout>
  );
}