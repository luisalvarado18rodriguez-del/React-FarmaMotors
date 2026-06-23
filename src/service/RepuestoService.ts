import { api, BASE_URLS } from "../api/ApiClient";
import type { Repuesto, RepuestoFormData } from "../type/Repuesto";

const BASE = `${BASE_URLS.repuesto}/api/repuesto`;

export const RepuestoService = {
  getAll: (): Promise<Repuesto[]> =>
    api.get<Repuesto[]>(`${BASE}/listarRepuestos`),

  getById: (codigo: number): Promise<Repuesto> =>
    api.get<Repuesto>(`${BASE}/buscarRepuesto/${codigo}`),

  create: (data: RepuestoFormData): Promise<Repuesto> =>
    api.post<Repuesto>(`${BASE}/crearRepuesto`, data),

  update: (codigo: number, data: RepuestoFormData): Promise<string> =>
    api.put<string>(`${BASE}/editarRepuesto/${codigo}`, data),

  delete: (codigo: number): Promise<void> =>
    api.delete<void>(`${BASE}/eliminarRepuesto/${codigo}`),

  disminuirStock: (codigo: number, cantidad: number): Promise<void> =>
    api.put<void>(`${BASE}/disminuirStock/${codigo}/${cantidad}`, {}),
};
