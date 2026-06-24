const GATEWAY = "http://localhost:8080";

export const BASE_URLS = {
  taller:      GATEWAY,
  repuesto:    GATEWAY,
  comprobante: GATEWAY,
  proveedor:   GATEWAY,
  cliente:     GATEWAY,
} as const;

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function cerrarSesionPorExpiracion() {
  localStorage.removeItem("jwt_token");
  if (document.getElementById("__session-expired__")) return;

  const overlay = document.createElement("div");
  overlay.id = "__session-expired__";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "99999",
    background: "rgba(5,12,28,0.72)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
  });

  overlay.innerHTML = `
    <div style="background:#fff;width:380px;max-width:92vw;padding:44px 36px 36px;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.22),0 0 0 1px rgba(0,0,0,0.06);">
      <div style="width:48px;height:48px;border:1px solid rgba(26,111,196,0.25);background:rgba(26,111,196,0.07);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <svg width="22" height="22" fill="none" stroke="#1A6FC4" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 style="font-size:18px;font-weight:700;color:#0F172A;margin-bottom:10px;letter-spacing:-0.3px;">Tu sesión terminó</h2>
      <p style="font-size:13.5px;color:#64748B;line-height:1.7;margin-bottom:32px;">Vuelve a iniciar sesión para<br/>usar la plataforma.</p>
      <button onclick="window.location.reload()" style="background:#1A6FC4;color:#fff;border:none;padding:11px 32px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;letter-spacing:0.2px;box-shadow:0 2px 10px rgba(26,111,196,0.32);">
        Iniciar sesión
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("jwt_token");

  if (token && tokenExpirado(token)) {
    cerrarSesionPorExpiracion();
    throw new Error("Sesión expirada");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
  } catch (networkErr) {
    console.error("[ApiClient] Error de red. Verifica que el servidor esté activo:", networkErr);
    throw new Error("Error de conexión con el servidor.");
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      cerrarSesionPorExpiracion();
      throw new Error("Sesión expirada");
    }
    const rawText = await res.text().catch(() => "");
    let backendMsg = "";
    try {
      const json = JSON.parse(rawText);
      backendMsg = json.message || json.error || "";
    } catch {
      backendMsg = rawText;
    }
    if (res.status === 500) {
      console.error(`[ApiClient] Error del servidor (500). Verifica el estado de la base de datos. Respuesta:`, rawText);
      throw new Error(backendMsg || "Error en el servidor. Verifica el estado de la base de datos.");
    }
    throw new Error(backendMsg || `Error ${res.status}`);
  }

  const text = await res.text();
  if (!text) return null as T;

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  return text as unknown as T;
}

export const api = {
  get:    <T>(url: string)                => request<T>(url),
  post:   <T>(url: string, body: unknown) => request<T>(url, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown) => request<T>(url, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(url: string)                => request<T>(url, { method: "DELETE" }),
};
