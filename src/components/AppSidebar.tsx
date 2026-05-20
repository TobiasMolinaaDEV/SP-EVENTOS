import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Package,
  FileText,
  Menu,
  X,
  Newspaper,
  Truck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Entregas", url: "/entregas", icon: Truck },
  { title: "Reservas", url: "/reservas", icon: ClipboardList },
  { title: "Calendario", url: "/calendario", icon: CalendarDays },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Presupuestos", url: "/presupuestos", icon: Newspaper },
  { title: "Productos", url: "/productos", icon: Package },
  { title: "Remitos", url: "/remitos", icon: FileText },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
          lg:sticky lg:top-0 lg:h-screen lg:z-30
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-sidebar-accent-foreground tracking-tight">
              Silvina Prette Eventos
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-sidebar-muted hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
              AD
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-sidebar-accent-foreground">
                Admin
              </p>
              <p className="text-xs text-sidebar-muted">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}