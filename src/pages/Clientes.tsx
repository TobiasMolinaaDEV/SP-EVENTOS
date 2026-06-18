import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Search, Plus, Phone, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formInicial = {
  nombre: "",
  email: "",
  telefono: "",
  direccion: "",
  observaciones: "",
};

export default function Clientes() {
  const usuario = JSON.parse(
    localStorage.getItem("usuario") || "{}"
  );
  const esAdmin =
  usuario.rol === "admin";



  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = () => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(data));
  };

  const iniciales = (nombre: string) =>
    nombre
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const abrirNuevo = () => {
    setForm(formInicial);
    setEditId(null);
    setOpen(true);
  };

  const abrirEditar = (c: any) => {
    setForm({
      nombre: c.nombre || "",
      email: c.email || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      observaciones: c.observaciones || "",
    });

    setEditId(c.id);
    setOpen(true);
  };

  const guardarCliente = async () => {
    if (!form.nombre) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (editId) {
      const res = await fetch(`/api/clientes/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const actualizado = await res.json();

      setClientes((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, ...actualizado } : c))
      );
    } else {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const nuevo = await res.json();

      setClientes((prev) => [{ ...nuevo, reservas: 0 }, ...prev]);
    }

    setForm(formInicial);
    setEditId(null);
    setOpen(false);
  };

  const eliminarCliente = async (id: number) => {
    const confirmar = confirm("¿Seguro que querés eliminar este cliente?");
    if (!confirmar) return;

    await fetch(`/api/clientes/${id}`, {
      method: "DELETE",
    });

    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();

    return (
      c.nombre?.toLowerCase().includes(texto) ||
      c.email?.toLowerCase().includes(texto) ||
      c.telefono?.toLowerCase().includes(texto)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Clientes frecuentes registrados
            </p>
          </div>

          {esAdmin && (
              <Button
                onClick={abrirNuevo}
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Nuevo cliente
              </Button>
            )}
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  if (esAdmin) {
                    abrirEditar(c);
                  }
                }}
                className="
  bg-card
  rounded-xl
  border
  shadow-sm
  p-4
  sm:p-5
  space-y-3
  cursor-pointer
  hover:bg-muted/30
  transition
"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {iniciales(c.nombre)}
                  </div>

                  <div>
                    <p className="font-semibold text-card-foreground">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(c.reservas || 0)} reservas
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  {c.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">
  {c.email}
</span>
                    </div>
                  )}

                  {c.telefono && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{c.telefono}</span>
                    </div>
                  )}

                  {c.direccion && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="break-words">
  {c.direccion}
</span>
                    </div>
                  )}
                </div>

                <div
                  className="flex justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {esAdmin && (
                    <button
                      onClick={() => eliminarCliente(c.id)}
                      className="text-red-500 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No hay clientes
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
  className="
    bg-white
    rounded-xl
    p-4
    sm:p-6
    w-full
    max-w-md
    max-h-[90vh]
    overflow-y-auto
    space-y-4
    shadow-lg
  "
>
              <h2 className="text-lg font-semibold">
                {editId ? "Editar cliente" : "Nuevo cliente"}
              </h2>

              <Input
                placeholder="Nombre *"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />

              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <Input
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />

              <Input
                placeholder="Dirección"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
              />

              <textarea
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                className="w-full min-h-[90px] border rounded-md p-2 text-sm resize-none"
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setEditId(null);
                    setForm(formInicial);
                  }}
                >
                  Cancelar
                </Button>

                <Button onClick={guardarCliente}>
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

