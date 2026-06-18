import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

export default function Usuarios() {


  const usuario = JSON.parse(
    localStorage.getItem("usuario") || "{}"
  );

  if (usuario.rol !== "admin") {

    return (

      <Layout>

        <div className="p-10">

          <h1 className="text-2xl font-bold mb-2">
            Acceso denegado
          </h1>

          <p className="text-muted-foreground">
            No tenés permisos para acceder a esta sección.
          </p>

        </div>

      </Layout>
    );
  }
  
  const [usuarios, setUsuarios] =
    useState<any[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [nombre, setNombre] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rol, setRol] =
    useState("empleado");

  const [editId, setEditId] =
  useState<number | null>(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {

    try {

      const res = await fetch(
        "/api/usuarios"
      );

      const data = await res.json();

      setUsuarios(data);

    } catch (error) {

      console.error(error);
    }
  };

  const crearUsuario = async () => {

  try {

    const payload = {
      nombre,
      email,
      rol,
    };

    let res;

    if (editId) {

      res = await fetch(
        `/api/usuarios/${editId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

    } else {

      res = await fetch(
        "/api/usuarios",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...payload,
            password,
          }),
        }
      );
    }

    if (!res.ok) {

      throw new Error(
        editId
          ? "Error actualizando usuario"
          : "Error creando usuario"
      );
    }

    setNombre("");
    setEmail("");
    setPassword("");
    setRol("empleado");
    setEditId(null);

    cargarUsuarios();

  } catch (error) {

    console.error(error);
  }
};

  const eliminarUsuario = async (
    id: number
  ) => {

    try {

      await fetch(
        `/api/usuarios/${id}`,
        {
          method: "DELETE",
        }
      );

      cargarUsuarios();

    } catch (error) {

      console.error(error);
    }
  };

  const editarUsuario = (u: any) => {

  setNombre(u.nombre);

  setEmail(u.email);

  setPassword("");

  setRol(u.rol);

  setEditId(u.id);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
  const usuariosFiltrados =
    usuarios.filter((u) => {

      const texto =
        busqueda.toLowerCase();

      return (
        u.nombre
          .toLowerCase()
          .includes(texto) ||

        u.email
          .toLowerCase()
          .includes(texto)
      );
    });

  return (
    <Layout>

      <div className="space-y-6">

        {/* HEADER */}
        <div>

          <h1 className="text-2xl font-bold text-foreground">
            Usuarios
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Gestión de empleados y accesos
          </p>

        </div>

        {/* FORM */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-5">

            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>

            <div>

              <h2 className="font-semibold text-lg">
                {editId
                  ? "Editar usuario"
                  : "Crear usuario"}
              </h2>

              <p className="text-sm text-muted-foreground">
                 {editId
                  ? "Modificar datos del usuario"
                  : "Agregar nuevo empleado al sistema"}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NOMBRE */}
            <div>

              <label className="text-sm font-medium mb-2 block">
                Nombre completo
              </label>

              <Input
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
              />

            </div>

            {/* EMAIL */}
            <div>

              <label className="text-sm font-medium mb-2 block">
                Email
              </label>

              <Input
                placeholder="ejemplo@empresa.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="text-sm font-medium mb-2 block">
                Contraseña
              </label>

              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>

            {/* ROL */}
            <div>

              <label className="text-sm font-medium mb-2 block">
                Rol
              </label>

              <select
                value={rol}
                onChange={(e) =>
                  setRol(e.target.value)
                }
                className="
                  w-full
                  h-10
                  rounded-md
                  border
                  bg-background
                  px-3
                  text-sm
                "
              >

                <option value="empleado">
                  Empleado
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

            </div>

          </div>

          {/* BOTON */}
          <div className="mt-5">

          <Button
            className="gap-2"
            onClick={crearUsuario}
          >

            <Plus className="h-4 w-4" />

            {editId
              ? "Actualizar usuario"
              : "Crear usuario"}

          </Button>

          </div>

        </div>

        {/* BUSCADOR */}
        <div className="relative max-w-sm">

          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              h-4
              w-4
              text-muted-foreground
            "
          />

          <Input
            placeholder="Buscar usuarios..."
            className="pl-9"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

        </div>

        {/* LISTA */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b bg-muted/50">

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    Usuario
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                    Email
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    Rol
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                    Estado
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {usuariosFiltrados.map((u) => (

                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >

                    {/* USUARIO */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            h-10
                            w-10
                            rounded-full
                            bg-primary/10
                            text-primary
                            flex
                            items-center
                            justify-center
                            font-semibold
                          "
                        >
                          {u.nombre
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>

                          <p className="font-medium text-card-foreground">
                            {u.nombre}
                          </p>

                          <p className="text-xs text-muted-foreground md:hidden">
                            {u.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                      {u.email}
                    </td>

                    {/* ROL */}
                    <td className="px-5 py-4">

                      <Badge
                        variant="outline"
                        className={
                          u.rol === "admin"
                            ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                            : "border-blue-500/30 text-blue-600 bg-blue-500/10"
                        }
                      >
                        {u.rol === "admin"
                          ? "Admin"
                          : "Empleado"}
                      </Badge>

                    </td>

                    {/* ESTADO */}
                    <td className="px-5 py-4">

                      <Badge
                        variant="outline"
                        className={
                          u.activo
                            ? "border-green-500/30 text-green-600 bg-green-500/10"
                            : "border-red-500/30 text-red-600 bg-red-500/10"
                        }
                      >
                        {u.activo
                          ? "Activo"
                          : "Inactivo"}
                      </Badge>

                    </td>

                    {/* ACCIONES */}
                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-3">

                            <button
      onClick={() =>
        editarUsuario(u)
      }
      className="
        text-blue-500
        hover:text-blue-700
        transition
      "
    >
      <Pencil className="h-4 w-4" />
    </button>

                        <button
                          onClick={() =>
                            eliminarUsuario(u.id)
                          }
                          className="
                            text-red-500
                            hover:text-red-700
                            transition
                          "
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </Layout>
  );
}
