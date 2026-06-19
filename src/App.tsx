import { useState } from "react";
import MantenimientosPage from "./pages/MantenimientosPage";
import RepuestosPage from "./pages/RepuestosPage";
import { ComprobantePage } from "./pages/ComprobantePage";
import { ProveedorPage } from "./pages/ProveedorPage";
import ClientesPage from "./pages/ClientesPage";
import "./App.css";

type Page = "mantenimientos" | "repuestos" | "factura" | "proveedor"| "clientes";

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: "mantenimientos", icon: "", label: "Mantenimientos" },
  { id: "repuestos",      icon: "",  label: "Repuestos" },
  { id: "factura",        icon: "",  label: "Facturación" },
  { id: "proveedor",      icon: "",  label: "Proveedores" },
  { id: "clientes",       icon: "",  label: "Clientes" },
];

export default function App() {
  const [page, setPage] = useState<Page>("mantenimientos");

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏍️ FarmaMotors</h1>
          <span>Sistema de gestión</span>
        </div>

        <nav>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

    
      </aside>

      {/* Contenido */}
      <main className="main">
        {page === "mantenimientos" && <MantenimientosPage />}
        {page === "repuestos"      && <RepuestosPage />}
        {page === "factura"        && <ComprobantePage />}
        {page === "proveedor"      && <ProveedorPage />}
        {page === "clientes"       && <ClientesPage />}
      </main>
    </div>
  );
}
