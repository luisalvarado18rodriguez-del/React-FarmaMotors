export interface EnvioSunat {
  idEnvio: number;
  idFactura: number;
  tipoDocumento: string;
  serie: string;
  numero: string;
  estado: "ACEPTADO" | "RECHAZADO" | "ERROR_INTERNO" | "PROCESANDO" | "PENDIENTE" | string;
  codigoRespuesta: string;
  descripcionRespuesta: string;
  fechaEnvio: string;
}
