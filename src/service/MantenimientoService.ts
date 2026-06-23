import { api, BASE_URLS } from "../api/ApiClient";
import type { Mantenimiento, MantenimientoFormData } from "../type/Mantenimiento";

const BASE = `${BASE_URLS.taller}/api/mantenimiento`;

export const MantenimientoService = {
  getAll: (): Promise<Mantenimiento[]> =>
    api.get<Mantenimiento[]>(`${BASE}/listMantenimientos`),

  getById: (codigo: number): Promise<Mantenimiento> =>
    api.get<Mantenimiento>(`${BASE}/buscarMantenimiento/${codigo}`),

  create: (data: MantenimientoFormData): Promise<Mantenimiento> =>
    api.post<Mantenimiento>(`${BASE}/crearMantenimiento`, data),

  update: (codigo: number, data: MantenimientoFormData): Promise<string> =>
    api.put<string>(`${BASE}/editarMantenimiento/${codigo}`, data),

  delete: (codigo: number): Promise<void> =>
    api.delete<void>(`${BASE}/borrarMantenimiento/${codigo}`),
};
