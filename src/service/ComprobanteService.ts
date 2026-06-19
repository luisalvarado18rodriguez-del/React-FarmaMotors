
import { api, BASE_URLS } from '../api/ApiClient'; 
import type { ComprobanteResponse } from '../type/Comprobante';


export const ComprobanteService = {
  listar: async (): Promise<ComprobanteResponse[]> => {
    const response = await api.get<ComprobanteResponse[]>(`${BASE_URLS.comprobante}/api/comprobante/listarComprobantes`);
    return response; 
  },
    
  crear: (data: any) => 
    api.post(`${BASE_URLS.comprobante}/api/comprobante/crearComprobante`, data),
    
  buscar: (codigo: number) => 
    api.get(`${BASE_URLS.comprobante}/api/comprobante/buscarComprobante/${codigo}`)
};