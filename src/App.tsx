import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Reservas from "./pages/Reservas.tsx";
import Calendario from "./pages/Calendario.tsx";
import Productos from "./pages/Productos.tsx";
import Clientes from "./pages/Clientes.tsx";
import Remitos from "./pages/Remitos.tsx";
import NotFound from "./pages/NotFound.tsx";
import Presupuestos from "./pages/Presupuestos.tsx";
import Entregas from "./pages/Entregas.tsx";
import Historial from "./pages/Historial";
import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const token =
    localStorage.getItem("token");

  if (!token) {

    return <Login />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>}/>
          <Route path="/entregas" element={ <ProtectedRoute><Entregas /></ProtectedRoute>} />
          <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>}  />
          <Route path="/presupuestos" element={<ProtectedRoute><Presupuestos/></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clientes/></ProtectedRoute>} />
          <Route path="/remitos" element={<ProtectedRoute><Remitos/></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>}/>
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>}/>
          <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
