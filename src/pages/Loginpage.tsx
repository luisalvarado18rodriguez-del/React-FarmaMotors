import { useState } from "react";
import { AuthService } from "../service/Authservice";

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await AuthService.login({ username, password });
      onLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas.");
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

        .auth-left {
          background: #071829;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.025) 1px, transparent 0);
          background-size: 28px 28px;
        }

        .auth-left::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1A6FC4 0%, #60A5FA 100%);
        }

        .auth-brand {
          position: relative;
          z-index: 1;
          margin-bottom: 48px;
        }

        .auth-brand-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #1A6FC4;
          margin-bottom: 14px;
        }

        .auth-brand h1 {
          font-size: 36px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin: 0 0 10px 0;
          line-height: 1.1;
        }

        .auth-left-footer {
          position: relative;
          z-index: 1;
          margin-top: 48px;
          font-size: 10.5px;
          color: #1E3A5F;
          letter-spacing: 0.3px;
        }

        .auth-right {
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .auth-card {
          background: #fff;
          border-radius: 12px;
          padding: 40px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(15,39,68,0.08), 0 1px 4px rgba(15,39,68,0.04);
          border: 1px solid #E2E8F0;
        }

        .auth-card-logo {
          font-size: 13px;
          font-weight: 800;
          color: #0B1E38;
          letter-spacing: -0.3px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #F1F5F9;
        }

        .auth-card-logo span { color: #1A6FC4; }

        .auth-card-header { margin-bottom: 28px; }

        .auth-card-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.4px;
          margin-bottom: 5px;
        }

        .auth-card-header p {
          font-size: 13px;
          color: #64748B;
        }

        .auth-field { margin-bottom: 16px; }

        .auth-field label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .auth-field input {
          width: 100%;
          padding: 10px 13px;
          border: 1px solid #E2E8F0;
          border-radius: 7px;
          font-size: 13.5px;
          color: #1A2332;
          font-family: inherit;
          background: #F8FAFC;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }

        .auth-field input:focus {
          border-color: #1A6FC4;
          box-shadow: 0 0 0 3px rgba(26,111,196,0.1);
          background: #fff;
        }

        .auth-alert {
          padding: 10px 13px;
          border-radius: 7px;
          font-size: 12.5px;
          margin-bottom: 16px;
          font-weight: 500;
          border-left: 3px solid transparent;
        }
        .auth-alert.error { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; }

        .auth-btn {
          width: 100%;
          padding: 11px;
          background: #0B1E38;
          color: #fff;
          border: none;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, box-shadow 0.15s;
          margin-top: 4px;
          letter-spacing: 0.1px;
        }
        .auth-btn:hover:not(:disabled)  { background: #1A3A5C; box-shadow: 0 4px 14px rgba(11,30,56,0.3); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .auth-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 11px;
          color: #CBD5E1;
          letter-spacing: 0.2px;
        }

        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div className="auth-root">

        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-eyebrow">Sistema de taller mecánico</div>
            <h1>Bienvenido a<br />MotoSalud</h1>
          </div>
          <div className="auth-left-footer">
            MotoSalud · FarmaMotors &copy; 2026
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">

            <div className="auth-card-logo">
              Moto<span>Salud</span>
            </div>

            <div className="auth-card-header">
              <h2>Iniciar sesión</h2>
              <p>Ingresa tus credenciales para continuar.</p>
            </div>

            {error && <div className="auth-alert error">{error}</div>}

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
                {loading ? "Verificando..." : "Ingresar"}
              </button>
            </form>

            <div className="auth-footer">
              Acceso restringido &middot; Solo personal autorizado
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
