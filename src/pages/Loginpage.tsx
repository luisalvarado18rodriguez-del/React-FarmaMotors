import { useState } from "react";
import { AuthService } from "../service/Authservice";

interface Props {
  onLogin: () => void;
}

type Tab = "login" | "register";

export default function LoginPage({ onLogin }: Props) {
  const [tab, setTab]           = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await AuthService.login({ username, password });
      onLogin();
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await AuthService.register({ name, email: username, password });
      setSuccess("Cuenta creada. Ahora inicia sesión.");
      setTab("login");
      setName("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Panel izquierdo (decorativo) ── */
        .auth-left {
          background: linear-gradient(145deg, #0a1628 0%, #0F2744 45%, #0d2d52 100%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(26,111,196,0.18) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(96,165,250,0.10) 0%, transparent 50%);
        }

        .auth-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
          background-size: 32px 32px;
        }

        .auth-brand {
          position: relative;
          z-index: 1;
          text-align: left;
          max-width: 360px;
        }

        .auth-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(96,165,250,0.12);
          border: 1px solid rgba(96,165,250,0.2);
          border-radius: 99px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #93C5FD;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .auth-brand h1 {
          font-size: 38px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 12px;
          line-height: 1.1;
        }

        .auth-brand p {
          font-size: 14px;
          color: #64748B;
          line-height: 1.65;
          letter-spacing: 0.1px;
          max-width: 280px;
        }

        .auth-stats {
          position: relative;
          z-index: 1;
          margin-top: 52px;
          width: 100%;
          max-width: 340px;
        }

        .auth-stats-divider {
          width: 40px;
          height: 2px;
          background: rgba(96,165,250,0.35);
          border-radius: 2px;
          margin-bottom: 32px;
        }

        .auth-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
        }

        .auth-stat-item {
          padding: 0 20px 0 0;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .auth-stat-item:last-child {
          border-right: none;
          padding-left: 20px;
          padding-right: 0;
        }
        .auth-stat-item:not(:first-child):not(:last-child) {
          padding-left: 20px;
        }

        .auth-stat-num {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 5px;
        }

        .auth-stat-label {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auth-tagline {
          position: relative;
          z-index: 1;
          margin-top: 36px;
          max-width: 300px;
          font-size: 12px;
          color: #334155;
          line-height: 1.7;
          font-style: italic;
          border-left: 2px solid rgba(96,165,250,0.3);
          padding-left: 14px;
        }

        /* ── Panel derecho (formulario) ── */
        .auth-right {
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .auth-card {
          background: #fff;
          border-radius: 20px;
          padding: 40px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow:
            0 4px 24px rgba(15,39,68,0.06),
            0 1px 4px rgba(15,39,68,0.04);
          border: 1px solid #E2E8F0;
        }

        .auth-card-header {
          margin-bottom: 32px;
        }

        .auth-card-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0F2744;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
        }

        .auth-card-header p {
          font-size: 13px;
          color: #64748B;
        }

        /* Tabs */
        .auth-tabs {
          display: flex;
          background: #F1F5F9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .auth-tab {
          flex: 1;
          background: none;
          border: none;
          padding: 9px 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          border-radius: 7px;
          transition: all 0.18s;
          font-family: inherit;
        }

        .auth-tab.active {
          background: #fff;
          color: #0F2744;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* Fields */
        .auth-field { margin-bottom: 18px; }

        .auth-field label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .auth-field input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 9px;
          font-size: 14px;
          color: #1A2332;
          font-family: inherit;
          background: #F8FAFC;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }

        .auth-field input:focus {
          border-color: #1A6FC4;
          box-shadow: 0 0 0 3px rgba(26,111,196,0.12);
          background: #fff;
        }

        /* Alert */
        .auth-alert {
          padding: 11px 14px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 500;
        }
        .auth-alert.error   { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
        .auth-alert.success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }

        /* Button */
        .auth-btn {
          width: 100%;
          padding: 13px;
          background: #0F2744;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          margin-top: 6px;
          box-shadow: 0 4px 14px rgba(15,39,68,0.3);
        }
        .auth-btn:hover    { background: #1a3a5c; box-shadow: 0 6px 20px rgba(15,39,68,0.35); transform: translateY(-1px); }
        .auth-btn:active   { transform: scale(0.99); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: #94A3B8;
        }

        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div className="auth-root">
        {/* Panel izquierdo */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-badge">Sistema de gestión</div>
            <h1>FarmaMotors</h1>
            <p>Plataforma integral para talleres mecánicos. Control total de tu operación desde un solo panel.</p>
          </div>

          <div className="auth-stats">
            <div className="auth-stats-divider" />
            <div className="auth-stats-row">
              <div className="auth-stat-item">
                <div className="auth-stat-num">100%</div>
                <div className="auth-stat-label">Digital</div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-num">5+</div>
                <div className="auth-stat-label">Módulos integrados</div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-num">24/7</div>
                <div className="auth-stat-label">Disponible</div>
              </div>
            </div>
          </div>

          <p className="auth-tagline">
            Gestión completa de tu taller: mantenimientos, inventario, facturación y clientes en un solo lugar.
          </p>
        </div>

        {/* Panel derecho */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>{tab === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}</h2>
              <p>{tab === "login" ? "Ingresa tus credenciales para continuar." : "Completa el formulario para registrarte."}</p>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              >
                Iniciar sesión
              </button>
              <button
                className={`auth-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              >
                Registrarse
              </button>
            </div>

            {/* Alertas */}
            {error   && <div className="auth-alert error">⚠ {error}</div>}
            {success && <div className="auth-alert success">✓ {success}</div>}

            {/* ── Login ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Verificando..." : "Ingresar al sistema"}
                </button>
              </form>
            )}

            {/* ── Register ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>
            )}

            <div className="auth-footer">
              Acceso restringido · FarmaMotors © 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
