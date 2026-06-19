
export const BASE_URLS = {
  taller:      "http://localhost:9001",
  repuesto:    "http://localhost:9002",
  comprobante: "http://localhost:9003",
  proveedor:    "http://localhost:9005",
  cliente:    "http://localhost:9004",
} as const;



async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `Error ${res.status}`);
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
