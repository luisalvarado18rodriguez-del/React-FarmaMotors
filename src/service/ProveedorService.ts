import { api, BASE_URLS } from "../api/ApiClient";
import type { Proveedor, ProveedorFormData } from "../type/Proveedor";
const BASE = `${BASE_URLS.proveedor}/api/proveedor`;

export const ProveedorService = {
    getAll(): Promise<Proveedor[]> {
        return api.get<Proveedor[]>(`${BASE}/listarProveedores`);
    },
    create(proveedor: ProveedorFormData): Promise<Proveedor> {
        return api.post<Proveedor>(`${BASE}/crearProveedor`, proveedor);
    },
    getById(cod_Proveedor: number): Promise<Proveedor> {
        return api.get<Proveedor>(`${BASE}/buscarProveedor/${cod_Proveedor}`);
    },
    update(cod_Proveedor: number, proveedor: ProveedorFormData): Promise<string> {
        return api.put<string>(`${BASE}/editarProveedor/${cod_Proveedor}`, proveedor);
    },
    delete(cod_Proveedor: number): Promise<void> {
        return api.delete<void>(`${BASE}/eliminarProveedor/${cod_Proveedor}`);
    },
}