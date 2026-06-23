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
  alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
  window.location.reload();
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
