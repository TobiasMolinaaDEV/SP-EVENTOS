import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ProductoDisponible = {
  id: number;
  nombre: string;
  categoria: string;
  stock_total: number;
  reservados: number;
  disponibles: number;
  precio_unitario: number;
};

type ProductoReserva = {
  producto_id: string;
  cantidad: number;
};

const estadoBadge: Record<string, string> = {
  confirmada: "bg-status-success/10 text-status-success border-status-success/20",
  pendiente: "bg-status-warning/10 text-status-warning border-status-warning/20",
  cancelada: "bg-status-danger/10 text-status-danger border-status-danger/20",
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
  estado: "pendiente",
  sena: "",
  observaciones: "",
};

const productoInicial: ProductoReserva[] = [{ producto_id: "", cantidad: 1 }];

export default function Reservas() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(formInicial);

  const [productosDisponibles, setProductosDisponibles] = useState<
    ProductoDisponible[]
  >([]);

  const [productosReserva, setProductosReserva] =
    useState<ProductoReserva[]>(productoInicial);

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    if (!form.fecha) {
      setProductosDisponibles([]);
      return;
    }

    fetch(`http://localhost:3001/productos/disponibilidad?fecha=${form.fecha}`)
      .then((res) => res.json())
      .then((data) => setProductosDisponibles(data))
      .catch((err) => console.error("Error cargando disponibilidad:", err));
  }, [form.fecha]);

  const cargarReservas = () => {
    fetch("http://localhost:3001/reservas")
      .then((res) => res.json())
      .then((data) => setReservas(data))
      .catch((err) => console.error("Error cargando reservas:", err));
  };

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const calcularSaldo = (total: number, sena: number) =>
    Math.max(Number(total || 0) - Number(sena || 0), 0);

  const totalCalculado = productosReserva.reduce((acc, item) => {
    const producto = productosDisponibles.find(
      (p) => String(p.id) === String(item.producto_id)
    );

    if (!producto) return acc;

    return (
      acc +
      Number(producto.precio_unitario || 0) * Number(item.cantidad || 0)
    );
  }, 0);

  const saldoFormulario = calcularSaldo(totalCalculado, Number(form.sena));

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

  const limpiarFormulario = () => {
    setForm(formInicial);
    setEditId(null);
    setProductosReserva(productoInicial);
  };

  const abrirNuevaReserva = () => {
    limpiarFormulario();
    setOpen(true);
  };

  const abrirEditarReserva = async (r: any) => {
  setForm({
    cliente: r.cliente || "",
    telefono: r.telefono || "",
    direccion: r.direccion || "",
    email: r.email || "",
    evento: r.evento || "",
    fecha: r.fecha?.split("T")[0] || "",
    horario: r.horario || "",
    lugar: r.lugar || "",
    estado: r.estado || "pendiente",
    sena: r.sena?.toString() || "",
    observaciones: r.observaciones || "",
  });

  setEditId(r.id);
  setOpen(true);

  const res = await fetch(`http://localhost:3001/reservas/${r.id}/productos`);
  const data = await res.json();

  if (data.length > 0) {
    setProductosReserva(
      data.map((p: any) => ({
        producto_id: String(p.producto_id),
        cantidad: Number(p.cantidad),
      }))
    );
  } else {
    setProductosReserva(productoInicial);
  }
};
  const agregarProductoReserva = () => {
    setProductosReserva((prev) => [
      ...prev,
      { producto_id: "", cantidad: 1 },
    ]);
  };

  const actualizarProductoReserva = (
    index: number,
    campo: keyof ProductoReserva,
    valor: string | number
  ) => {
    setProductosReserva((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: campo === "cantidad" ? Number(valor) : String(valor),
            }
          : item
      )
    );
  };

  const eliminarProductoReserva = (index: number) => {
    if (productosReserva.length === 1) return;
    setProductosReserva((prev) => prev.filter((_, i) => i !== index));
  };

  const validarStock = () => {
    for (const item of productosReserva) {
      if (!item.producto_id) continue;

      const producto = productosDisponibles.find(
        (p) => String(p.id) === String(item.producto_id)
      );

      if (!producto) continue;

      if (Number(item.cantidad) > Number(producto.disponibles)) {
        alert(
          `No hay stock suficiente de ${producto.nombre}. Disponible: ${producto.disponibles}`
        );
        return false;
      }
    }

    return true;
  };

  const guardarReserva = async () => {
    if (!form.cliente || !form.evento || !form.fecha) {
      alert("Completá cliente, evento y fecha.");
      return;
    }

    if (totalCalculado <= 0) {
      alert("Agregá al menos un producto con precio para calcular el total.");
      return;
    }

    if (!validarStock()) return;

    const productosValidos = productosReserva
      .filter((p) => p.producto_id && Number(p.cantidad) > 0)
      .map((p) => ({
        producto_id: Number(p.producto_id),
        cantidad: Number(p.cantidad),
      }));

    const payload = {
      ...form,
      total: totalCalculado,
      sena: Number(form.sena) || 0,
      productos: productosValidos,
    };

    if (editId) {
      const res = await fetch(`http://localhost:3001/reservas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const actualizada = await res.json();

      setReservas((prev) =>
        prev.map((r) => (r.id === editId ? actualizada : r))
      );
    } else {
      const res = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const nueva = await res.json();
      setReservas((prev) => [nueva, ...prev]);
    }

    limpiarFormulario();
    setOpen(false);
  };

  const eliminarReserva = async (id: number) => {
    const confirmar = confirm("¿Seguro que querés eliminar esta reserva?");
    if (!confirmar) return;

    await fetch(`http://localhost:3001/reservas/${id}`, {
      method: "DELETE",
    });

    setReservas((prev) => prev.filter((r) => r.id !== id));
  };

  const reservasFiltradas = reservas.filter((r) => {
    const texto = busqueda.toLowerCase();

    return (
      r.cliente?.toLowerCase().includes(texto) ||
      r.evento?.toLowerCase().includes(texto) ||
      r.telefono?.toLowerCase().includes(texto) ||
      r.lugar?.toLowerCase().includes(texto) ||
      r.id?.toString().includes(texto)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestión de reservas de eventos
            </p>
          </div>

          <Button onClick={abrirNuevaReserva} className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nueva reserva
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="block lg:hidden divide-y">
            {reservasFiltradas.length > 0 ? (
              reservasFiltradas.map((r) => {
                const saldo = calcularSaldo(Number(r.total), Number(r.sena));

                return (
                  <div
                    key={r.id}
                    onClick={() => abrirEditarReserva(r)}
                    className="p-4 space-y-3 hover:bg-muted/30 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {r.cliente}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{r.id} · {r.evento}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          estadoBadge[r.estado] || ""
                        }`}
                      >
                        {r.estado}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p>{r.fecha?.split("T")[0]}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Horario</p>
                        <p>{r.horario || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Teléfono
                        </p>
                        <p>{r.telefono || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Lugar</p>
                        <p>{r.lugar || "-"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t pt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium">
                          {formatoMoneda(Number(r.total))}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Seña</p>
                        <p className="font-medium">
                          {formatoMoneda(Number(r.sena))}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Saldo</p>
                        <p className="font-semibold">{formatoMoneda(saldo)}</p>
                      </div>
                    </div>

                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => eliminarReserva(r.id)}
                        className="text-red-500 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No hay reservas
              </div>
            )}
          </div>

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
                  <th className="text-right px-5 py-3">Seña</th>
                  <th className="text-right px-5 py-3">Saldo</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {reservasFiltradas.length > 0 ? (
                  reservasFiltradas.map((r) => {
                    const saldo = calcularSaldo(Number(r.total), Number(r.sena));

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-muted/30 transition cursor-pointer"
                        onClick={() => abrirEditarReserva(r)}
                      >
                        <td className="px-5 py-4">{r.id}</td>

                        <td className="px-5 py-4">
                          <div className="font-medium">{r.cliente}</div>
                          {r.telefono && (
                            <div className="text-xs text-muted-foreground">
                              {r.telefono}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div>{r.evento}</div>
                          {r.lugar && (
                            <div className="text-xs text-muted-foreground">
                              {r.lugar}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {r.fecha?.split("T")[0]}
                          {r.horario && (
                            <div className="text-xs text-muted-foreground">
                              {r.horario}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              estadoBadge[r.estado] || ""
                            }`}
                          >
                            {r.estado}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {formatoMoneda(Number(r.total))}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {formatoMoneda(Number(r.sena))}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          {formatoMoneda(saldo)}
                        </td>

                        <td
                          className="px-5 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => eliminarReserva(r.id)}
                            className="text-red-500 hover:scale-110 transition"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No hay reservas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-5 shadow-lg">
              <h2 className="text-lg font-semibold">
                {editId ? "Editar reserva" : "Nueva reserva"}
              </h2>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Datos del cliente
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
                  Datos del evento
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    name="evento"
                    placeholder="Tipo de evento *"
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
                    placeholder="Lugar del evento"
                    value={form.lugar}
                    onChange={handleChange}
                  />

                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Productos reservados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      La disponibilidad se calcula según la fecha seleccionada.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={agregarProductoReserva}
                    disabled={!form.fecha}
                  >
                    Agregar producto
                  </Button>
                </div>

                {!form.fecha && (
                  <p className="text-sm text-muted-foreground">
                    Primero seleccioná una fecha para ver disponibilidad.
                  </p>
                )}

                {form.fecha &&
                  productosReserva.map((item, i) => {
                    const productoSeleccionado = productosDisponibles.find(
                      (p) => String(p.id) === String(item.producto_id)
                    );

                    const subtotalProducto =
                      Number(productoSeleccionado?.precio_unitario || 0) *
                      Number(item.cantidad || 0);

                    return (
                      <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                      >
                        <select
                          value={item.producto_id}
                          onChange={(e) =>
                            actualizarProductoReserva(
                              i,
                              "producto_id",
                              e.target.value
                            )
                          }
                          className="md:col-span-5 w-full border rounded-md p-2 text-sm"
                        >
                          <option value="">Seleccionar producto</option>

                          {productosDisponibles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} · Disp: {p.disponibles} ·{" "}
                              {formatoMoneda(Number(p.precio_unitario))}
                            </option>
                          ))}
                        </select>

                        <Input
                          className="md:col-span-2"
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarProductoReserva(
                              i,
                              "cantidad",
                              e.target.value
                            )
                          }
                        />

                        <div className="md:col-span-3 text-xs text-muted-foreground">
                          {productoSeleccionado ? (
                            <>
                              Disp: {productoSeleccionado.disponibles} · Subtotal:{" "}
                              <span className="font-semibold text-card-foreground">
                                {formatoMoneda(subtotalProducto)}
                              </span>
                            </>
                          ) : (
                            "Sin producto"
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => eliminarProductoReserva(i)}
                          disabled={productosReserva.length === 1}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-md border px-3 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      Total calculado
                    </p>
                    <p className="font-semibold">
                      {formatoMoneda(totalCalculado)}
                    </p>
                  </div>

                  <Input
                    type="number"
                    name="sena"
                    placeholder="Seña"
                    value={form.sena}
                    onChange={handleChange}
                  />

                  <div className="rounded-md border px-3 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      Saldo pendiente
                    </p>
                    <p className="font-semibold">
                      {formatoMoneda(saldoFormulario)}
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
                  placeholder="Ej: entregas, detalles del pedido, aclaraciones..."
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

                <Button onClick={guardarReserva}>
                  {editId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}