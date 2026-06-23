import { api, BASE_URLS } from "../api/ApiClient";
import type { Comprobante, ComprobanteRequest } from "../type/Comprobante";

const BASE = `${BASE_URLS.comprobante}/api/comprobante`;

export const ComprobanteService = {
  getAll: (): Promise<Comprobante[]> =>
    api.get<Comprobante[]>(`${BASE}/listarComprobantes`),

  getById: (codigo: number): Promise<Comprobante> =>
    api.get<Comprobante>(`${BASE}/buscarComprobante/${codigo}`),

  create: (data: ComprobanteRequest): Promise<Comprobante> =>
    api.post<Comprobante>(`${BASE}/crearComprobante`, data),
};
