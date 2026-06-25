const GATEWAY = "http://localhost:8080";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UsuarioForm {
  name: string;
  email: string;
  password: string;
  rol: "ADMIN";
}

export interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  rol: string;
  password: null;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("jwt_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = text || `Error ${res.status}`;
    try { msg = JSON.parse(text).message || msg; } catch { /* no-op */ }
    throw new Error(msg);
  }
  if (!text) return null as T;
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

export const AuthService = {

  login: async (payload: LoginPayload): Promise<string> => {
    let res: Response;
    try {
      res = await fetch(`${GATEWAY}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Error de conexión con el servidor.");
    }
    const text = await res.text();
    if (!res.ok) {
      let msg = text || "Credenciales incorrectas.";
      try { msg = JSON.parse(text).message || msg; } catch { /* no-op */ }
      throw new Error(msg);
    }
    const token = text.trim();
    localStorage.setItem("jwt_token", token);
    return token;
  },

  logout: (): void => {
    localStorage.removeItem("jwt_token");
  },

  isAuthenticated: (): boolean => !!localStorage.getItem("jwt_token"),

  getToken: (): string | null => localStorage.getItem("jwt_token"),

  getRol: (): string => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.rol || "";
    } catch { return ""; }
  },

  // ── Gestión de usuarios (solo SUPERADMIN) ──────────────────────────────────

  getUsuarios: async (): Promise<UsuarioItem[]> => {
    let res: Response;
    try {
      res = await fetch(`${GATEWAY}/auth/usuarios`, { headers: authHeaders() });
    } catch {
      throw new Error("Error de conexión con el servidor.");
    }
    return handleResponse<UsuarioItem[]>(res);
  },

  createUser: async (data: UsuarioForm): Promise<void> => {
    let res: Response;
    try {
      res = await fetch(`${GATEWAY}/auth/crearUsuario`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error("Error de conexión con el servidor.");
    }
    await handleResponse<unknown>(res);
  },
};
