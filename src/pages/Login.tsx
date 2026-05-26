import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Lock,
  Mail,
  LogIn,
} from "lucide-react";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const iniciarSesion = async () => {

    try {

      setLoading(true);

      setError("");

      const res = await fetch(
        "http://localhost:3001/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        setError(
          data.error ||
            "Error iniciando sesión"
        );

        return;
      }

      // guardar token
      localStorage.setItem(
        "token",
        data.token
      );

      // guardar usuario
      localStorage.setItem(
        "usuario",
        JSON.stringify(data.usuario)
      );

      navigate("/");

    } catch (error) {

      console.error(error);

      setError(
        "Error conectando con el servidor"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div
      className="
        min-h-screen
        bg-background
        flex
        items-center
        justify-center
        p-4
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-card
          border
          rounded-2xl
          shadow-sm
          p-8
        "
      >

        {/* HEADER */}
        <div className="text-center mb-8">

          <div
            className="
              mx-auto
              h-14
              w-14
              rounded-2xl
              bg-primary/10
              text-primary
              flex
              items-center
              justify-center
              mb-4
            "
          >
            <Lock className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold">
            Iniciar sesión
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Acceder a SP Eventos
          </p>

        </div>

        {/* ERROR */}
        {error && (

          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-500/30
              bg-red-500/10
              text-red-600
              px-4
              py-3
              text-sm
            "
          >
            {error}
          </div>

        )}

        {/* FORM */}
        <div className="space-y-4">

          {/* EMAIL */}
          <div>

            <label className="text-sm font-medium mb-2 block">
              Email
            </label>

            <div className="relative">

              <Mail
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
                type="email"
                placeholder="ejemplo@empresa.com"
                className="pl-9"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="text-sm font-medium mb-2 block">
              Contraseña
            </label>

            <div className="relative">

              <Lock
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
                type="password"
                placeholder="********"
                className="pl-9"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* BOTON */}
          <Button
            onClick={iniciarSesion}
            disabled={loading}
            className="
              w-full
              gap-2
              mt-2
            "
          >

            <LogIn className="h-4 w-4" />

            {loading
              ? "Ingresando..."
              : "Ingresar"}

          </Button>

        </div>

      </div>

    </div>
  );
}