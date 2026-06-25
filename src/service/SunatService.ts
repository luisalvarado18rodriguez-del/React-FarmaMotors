import { api, BASE_URLS } from "../api/ApiClient";
import type { EnvioSunat } from "../type/EnvioSunat";

const BASE = `${BASE_URLS.sunat}/api/sunat`;

export const SunatService = {
  listar(): Promise<EnvioSunat[]> {
    return api.get<EnvioSunat[]>(`${BASE}/listar`);
  },

  enviar(idFactura: number): Promise<string> {
    return api.post<string>(`${BASE}/xml/${idFactura}`, {});
  },
};
