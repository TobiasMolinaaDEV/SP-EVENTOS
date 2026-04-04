import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const estadoBadge: Record<string, string> = {
  confirmada: "bg-status-success/10 text-status-success border-status-success/20",
  pendiente: "bg-status-warning/10 text-status-warning border-status-warning/20",
  cancelada: "bg-status-danger/10 text-status-danger border-status-danger/20",
};

export default function Reservas() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    cliente: "",
    evento: "",
    fecha: "",
    estado: "pendiente",
    total: "",
  });

  // 🔥 cargar reservas
  useEffect(() => {
    fetch("http://localhost:3001/reservas")
      .then((res) => res.json())
      .then((data) => setReservas(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 crear / editar
  const crearReserva = async () => {
    if (!form.cliente || !form.evento || !form.fecha || !form.total) return;

    if (editId) {
      // EDITAR
      const res = await fetch(`http://localhost:3001/reservas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total: Number(form.total),
        }),
      });

      const actualizada = await res.json();

      setReservas((prev) =>
        prev.map((r) => (r.id === editId ? actualizada : r))
      );

      setEditId(null);
    } else {
      // CREAR
      const res = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          total: Number(form.total),
        }),
      });

      const nueva = await res.json();
      setReservas((prev) => [nueva, ...prev]);
    }

    setForm({
      cliente: "",
      evento: "",
      fecha: "",
      estado: "pendiente",
      total: "",
    });

    setOpen(false);
  };

  // 🔥 eliminar
  const eliminarReserva = async (id: number) => {
    await fetch(`http://localhost:3001/reservas/${id}`, {
      method: "DELETE",
    });

    setReservas((prev) => prev.filter((r) => r.id !== id));
  };

  // 🔹 filtro
  const reservasFiltradas = reservas.filter((r) =>
    r.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.evento.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.id.toString().includes(busqueda)
  );

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestión de reservas de eventos
            </p>
          </div>

          <Button onClick={() => setOpen(true)} className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nueva reserva
          </Button>
        </div>

        {/* Buscador */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Cliente</th>
                  <th className="text-left px-5 py-3">Evento</th>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {reservasFiltradas.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/30 transition cursor-pointer"
                    onClick={() => {
                      setForm({
                        cliente: r.cliente,
                        evento: r.evento,
                        fecha: r.fecha?.split("T")[0], // 🔥 quita hora
                        estado: r.estado,
                        total: r.total.toString(),
                      });
                      setEditId(r.id);
                      setOpen(true);
                    }}
                  >
                    <td className="px-5 py-4">{r.id}</td>
                    <td className="px-5 py-4">{r.cliente}</td>
                    <td className="px-5 py-4">{r.evento}</td>
                    <td className="px-5 py-4">
                      {r.fecha?.split("T")[0]}
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={estadoBadge[r.estado]}>
                        {r.estado}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      ${Number(r.total).toLocaleString()}
                    </td>

                    {/* 🔥 BOTÓN ELIMINAR */}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">

              <h2 className="text-lg font-semibold">
                {editId ? "Editar reserva" : "Nueva reserva"}
              </h2>

              <Input name="cliente" placeholder="Cliente" value={form.cliente} onChange={handleChange} />
              <Input name="evento" placeholder="Evento" value={form.evento} onChange={handleChange} />
              <Input type="date" name="fecha" value={form.fecha} onChange={handleChange} />

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

              <Input name="total" placeholder="Total (sin $)" value={form.total} onChange={handleChange} />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setOpen(false);
                  setEditId(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={crearReserva}>
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