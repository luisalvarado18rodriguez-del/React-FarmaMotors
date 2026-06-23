import { api, BASE_URLS } from "../api/ApiClient";
import type { Proveedor, ProveedorFormData } from "../type/Proveedor";

const BASE = `${BASE_URLS.proveedor}/api/proveedor`;

export const ProveedorService = {
  getAll: (): Promise<Proveedor[]> =>
    api.get<Proveedor[]>(`${BASE}/listarProveedores`),

  getById: (codigo: number): Promise<Proveedor> =>
    api.get<Proveedor>(`${BASE}/buscarProveedor/${codigo}`),

  create: (data: ProveedorFormData): Promise<Proveedor> =>
    api.post<Proveedor>(`${BASE}/crearProveedor`, data),

  update: (codigo: number, data: ProveedorFormData): Promise<string> =>
    api.put<string>(`${BASE}/editarProveedor/${codigo}`, data),

  delete: (codigo: number): Promise<void> =>
    api.delete<void>(`${BASE}/eliminarProveedor/${codigo}`),
};
