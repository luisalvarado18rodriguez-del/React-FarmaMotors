import { api, BASE_URLS } from "../api/ApiClient";
import  type{ Repuesto, RepuestoFormData } from "../type/Repuesto";

const BASE = `${BASE_URLS.repuesto}/api/repuesto`;

export const RepuestoService = {
  getAll(): Promise<Repuesto[]> {
    return api.get<Repuesto[]>(`${BASE}/listarRepuestos`);
  },

  getById(codigo: number): Promise<Repuesto> {
    return api.get<Repuesto>(`${BASE}/buscarRepuesto/${codigo}`);
  },

  create(data: RepuestoFormData): Promise<Repuesto> {
    return api.post<Repuesto>(`${BASE}/crearRepuesto`, data);
  },

  update(codigo: number, data: RepuestoFormData): Promise<string> {
    return api.put<string>(`${BASE}/editarRepuesto/${codigo}`, data);
  },

  delete(codigo: number): Promise<void> {
    return api.delete<void>(`${BASE}/eliminarRepuesto/${codigo}`);
  },
};
