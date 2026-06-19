import { api, BASE_URLS } from "../api/ApiClient";
import type { Cliente, ClienteFormData } from "../type/Cliente";

const BASE = `${BASE_URLS.cliente}/api/cliente`;

export const ClienteService = {
  getAll: () => api.get<Cliente[]>(`${BASE}/listarClientes`),

  getById: (codigo: number) => api.get<Cliente>(`${BASE}/buscarCliente/${codigo}`),

  create: (data: ClienteFormData) => api.post<Cliente>(`${BASE}/crearCliente`, data),

  update: (codigo: number, data: ClienteFormData) =>
    api.put<string>(`${BASE}/editarCliente/${codigo}`, data),

  delete: (codigo: number) => api.delete<void>(`${BASE}/eliminarCliente/${codigo}`),
};
