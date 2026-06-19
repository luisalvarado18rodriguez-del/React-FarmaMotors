export type TipoDocumento = "DNI" | "RUC";
 
export interface Cliente {
  codCliente: number;
  numDocumento: string;
  nomRazSocial: string;
  telefono: string;
  direccion: string;
  tipoDocumento: TipoDocumento;
}
 
export type ClienteFormData = {
  numDocumento: string;
  nomRazSocial: string;
  telefono: string;
  direccion: string;
  tipoDocumento: TipoDocumento;
};
 