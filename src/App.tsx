// ─── App.tsx ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import LoginPage from "./pages/Loginpage";
import ClientesPage from "./pages/ClientesPage";
import { ProveedorPage } from "./pages/ProveedorPage";
import RepuestosPage from "./pages/RepuestosPage";
import MantenimientosPage from "./pages/MantenimientosPage";
import ComprobantePage from "./pages/ComprobantePage";
import { AuthService } from "./service/Authservice";
import "./App.css";

type Page = "mantenimientos" | "repuestos" | "factura" | "proveedor" | "clientes";

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: "mantenimientos", icon: "🔧", label: "Mantenimientos" },
  { id: "repuestos",      icon: "📦", label: "Repuestos" },
  { id: "factura",        icon: "🧾", label: "Facturación" },
  { id: "proveedor",      icon: "🏭", label: "Proveedores" },
  { id: "clientes",       icon: "👤", label: "Clientes" },
];

export default function App() {
  // Arranca autenticado si ya hay token guardado
  const [authenticated, setAuthenticated] = useState<boolean>(
    AuthService.isAuthenticated()
  );
  const [page, setPage] = useState<Page>("mantenimientos");

  const handleLogin = () => setAuthenticated(true);

  const handleLogout = () => {
    AuthService.logout();
    setAuthenticated(false);
  };

  // ── Si no está autenticado → mostrar login ────────────────────────────────
  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── App principal ─────────────────────────────────────────────────────────
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

        {/* Logout al fondo del sidebar */}
        <div style={{
          padding: "16px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(220,38,38,0.10)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#FCA5A5",
              padding: "9px 14px",
              borderRadius: "8px",
              fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
              letterSpacing: "0.1px"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.10)"; }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main">
        {page === "mantenimientos" && <MantenimientosPage />}
        {page === "clientes"       && <ClientesPage />}
        {page === "proveedor"      && <ProveedorPage />}
        {page === "repuestos"      && <RepuestosPage />}
        {page === "factura" && <ComprobantePage />}
      </main>
    </div>
  );
}