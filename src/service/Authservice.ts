const GATEWAY = "http://localhost:8080";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
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
    } catch (networkErr) {
      console.error("[AuthService] Error de red al iniciar sesión. Verifica que el servidor esté activo:", networkErr);
      throw new Error("Error al iniciar sesión.");
    }

    const text = await res.text();

    if (!res.ok) {
      if (res.status === 500) {
        console.error(`[AuthService] Error del servidor (500) al iniciar sesión. Verifica el estado de la base de datos. Respuesta:`, text);
        throw new Error("Error al iniciar sesión.");
      }
      let errorMsg = text || "Error al iniciar sesión.";
      try {
        const json = JSON.parse(text);
        errorMsg = json.message || errorMsg;
      } catch {
        // respuesta no es JSON
      }
      throw new Error(errorMsg);
    }

    const token = text.trim();
    localStorage.setItem("jwt_token", token);
    return token;
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    let res: Response;
    try {
      res = await fetch(`${GATEWAY}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      console.error("[AuthService] Error de red al registrar. Verifica que el servidor esté activo:", networkErr);
      throw new Error("Error al registrar.");
    }
    const text = await res.text();
    if (!res.ok) {
      if (res.status === 500) {
        console.error(`[AuthService] Error del servidor (500) al registrar. Verifica el estado de la base de datos. Respuesta:`, text);
        throw new Error("Error al registrar.");
      }
      throw new Error(text || "Error al registrar usuario.");
    }
  },

  logout: (): void => {
    localStorage.removeItem("jwt_token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("jwt_token");
  },

  getToken: (): string | null => {
    return localStorage.getItem("jwt_token");
  },
};
