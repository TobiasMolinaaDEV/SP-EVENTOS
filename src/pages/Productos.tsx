import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const formInicial = {
  nombre: "",
  categoria: "",
  stock_total: "",
  precio_unitario: "",
};

export default function Productos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    fetch("http://localhost:3001/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  };

  const formatoMoneda = (valor: number) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const calcularEstado = (disponibles: number) => {
    if (disponibles <= 10) return "critico";
    if (disponibles <= 50) return "bajo";
    return "ok";
  };

  const limpiarForm = () => {
    setForm(formInicial);
    setEditId(null);
  };

  const abrirNuevo = () => {
    limpiarForm();
    setOpen(true);
  };

  const abrirEditar = (p: any) => {
    setForm({
      nombre: p.nombre || "",
      categoria: p.categoria || "",
      stock_total: p.stock_total?.toString() || "",
      precio_unitario: p.precio_unitario?.toString() || "",
    });

    setEditId(p.id);
    setOpen(true);
  };

  const guardarProducto = async () => {
    if (!form.nombre || !form.stock_total || !form.precio_unitario) {
      alert("Completá nombre, stock total y precio unitario.");
      return;
    }

    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      stock_total: Number(form.stock_total),
      precio_unitario: Number(form.precio_unitario),
    };

    if (editId) {
      const res = await fetch(`http://localhost:3001/productos/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const actualizado = await res.json();

      setProductos((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...actualizado,
                reservados: p.reservados || 0,
                disponibles:
                  Number(actualizado.stock_total) - Number(p.reservados || 0),
              }
            : p
        )
      );
    } else {
      const res = await fetch("http://localhost:3001/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const nuevo = await res.json();

      setProductos((prev) => [
        {
          ...nuevo,
          reservados: 0,
          disponibles: nuevo.stock_total,
        },
        ...prev,
      ]);
    }

    limpiarForm();
    setOpen(false);
  };

  const eliminarProducto = async (id: number) => {
    const confirmar = confirm("¿Seguro que querés eliminar este producto?");
    if (!confirmar) return;

    await fetch(`http://localhost:3001/productos/${id}`, {
      method: "DELETE",
    });

    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const productosFiltrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();

    return (
      p.nombre?.toLowerCase().includes(texto) ||
      p.categoria?.toLowerCase().includes(texto)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Inventario y disponibilidad de stock
            </p>
          </div>

          <Button onClick={abrirNuevo} className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((p) => {
              const disponibles = Number(p.disponibles ?? p.stock_total ?? 0);
              const reservados = Number(p.reservados ?? 0);
              const estado = calcularEstado(disponibles);

              return (
                <div
                  key={p.id}
                  onClick={() => abrirEditar(p)}
                  className="bg-card rounded-xl border shadow-sm p-5 space-y-3 cursor-pointer hover:bg-muted/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-card-foreground">
                        {p.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.categoria || "Sin categoría"}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${estadoStyle[estado]}`}
                    >
                      {estadoLabel[estado]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="font-bold text-card-foreground">
                        {p.stock_total}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs">
                        Reservados
                      </p>
                      <p className="font-bold text-status-warning">
                        {reservados}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs">
                        Disponibles
                      </p>
                      <p className="font-bold text-status-success">
                        {disponibles}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      Precio unitario
                    </p>
                    <p className="font-bold text-status-success">
                      {formatoMoneda(Number(p.precio_unitario))}
                    </p>
                  </div>

                  <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => eliminarProducto(p.id)}
                      className="text-red-500 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No hay productos
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold">
                {editId ? "Editar producto" : "Nuevo producto"}
              </h2>

              <Input
                placeholder="Nombre *"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
              />

              <Input
                placeholder="Categoría"
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Stock total *"
                value={form.stock_total}
                onChange={(e) =>
                  setForm({ ...form, stock_total: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Precio unitario *"
                value={form.precio_unitario}
                onChange={(e) =>
                  setForm({ ...form, precio_unitario: e.target.value })
                }
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    limpiarForm();
                    setOpen(false);
                  }}
                >
                  Cancelar
                </Button>

                <Button onClick={guardarProducto}>
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