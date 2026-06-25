// ─── App.tsx ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import LoginPage from "./pages/Loginpage";
import MantenimientosPage from "./pages/MantenimientosPage";
import RepuestosPage from "./pages/RepuestosPage";
import ComprobantePage from "./pages/ComprobantePage";
import { ProveedorPage } from "./pages/ProveedorPage";
import ClientesPage from "./pages/ClientesPage";
import { SunatPage } from "./pages/SunatPage";
import UsuariosPage from "./pages/UsuariosPage";
import { AuthService } from "./service/Authservice";
import "./App.css";

type Page = "clientes" | "proveedor" | "repuestos" | "mantenimientos" | "factura" | "sunat" | "usuarios";

const NAV_BASE: { id: Page; icon: string; label: string }[] = [
  { id: "clientes",       icon: "fi fi-sr-review",        label: "CLIENTES" },
  { id: "proveedor",      icon: "fi fi-rs-supplier-alt",  label: "PROVEEDORES" },
  { id: "repuestos",      icon: "fi fi-sr-tool-box",      label: "REPUESTOS" },
  { id: "mantenimientos", icon: "fi fi-ss-tools",         label: "MANTENIMIENTOS" },
  { id: "factura",        icon: "fi fi-ss-receipt",       label: "FACTURACIÓN" },
  { id: "sunat",          icon: "fi fi-bs-chart-line-up", label: "SUNAT" },
];

const NAV_SUPERADMIN: { id: Page; icon: string; label: string } =
  { id: "usuarios", icon: "fi fi-sr-users-alt", label: "USUARIOS" };

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(AuthService.isAuthenticated());
  const [page, setPage] = useState<Page>("clientes");

  const handleLogin = () => setAuthenticated(true);

  const handleLogout = () => {
    AuthService.logout();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isSuperAdmin = AuthService.getRol() === "SUPERADMIN";
  const nav = isSuperAdmin ? [...NAV_BASE, NAV_SUPERADMIN] : NAV_BASE;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>FarmaMotors</h1>
          <span>Sistema de gestión</span>
        </div>

        <nav>
          {nav.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <i className={n.icon} style={{ fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 }} />
              {n.label}
            </button>
          ))}
        </nav>

        {/* Logout al fondo del sidebar */}
        <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main">
        {page === "clientes"       && <ClientesPage />}
        {page === "proveedor"      && <ProveedorPage />}
        {page === "repuestos"      && <RepuestosPage />}
        {page === "mantenimientos" && <MantenimientosPage />}
        {page === "factura"        && <ComprobantePage />}
        {page === "sunat"          && <SunatPage />}
        {page === "usuarios"       && <UsuariosPage />}
      </main>
    </div>
  );
}