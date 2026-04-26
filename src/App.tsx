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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/presupuestos" element={<Presupuestos/>} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/remitos" element={<Remitos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
