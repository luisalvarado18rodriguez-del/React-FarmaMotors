import { api, BASE_URLS } from "../api/ApiClient";
import type { Cliente, ClienteFormData } from "../type/Cliente";

const BASE = `${BASE_URLS.cliente}/api/cliente`;

export const ClienteService = {
  getAll: (): Promise<Cliente[]> =>
    api.get<Cliente[]>(`${BASE}/listarClientes`),

  getById: (codigo: number): Promise<Cliente> =>
    api.get<Cliente>(`${BASE}/buscarCliente/${codigo}`),

  create: (data: ClienteFormData): Promise<Cliente> =>
    api.post<Cliente>(`${BASE}/crearCliente`, data),

  update: (codigo: number, data: ClienteFormData): Promise<string> =>
    api.put<string>(`${BASE}/editarCliente/${codigo}`, data),

  delete: (codigo: number): Promise<void> =>
    api.delete<void>(`${BASE}/eliminarCliente/${codigo}`),
};
