export interface DetalleComprobante {
  cod_Detalle: number;
  cod_Repuesto: number;
  nom_Repuesto: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Comprobante {
  cod_Comprobante: number;
  tipoComprobante: string;
  nroSerie: string;
  correlativo: number;
  cod_Mantenimiento: number;
  descripcionAveria: string;
  atendidoPor: string;
  clienteNombre: string;
  tipoDocumento: string;
  clienteDocumento: string;
  motoPlaca: string;
  costoManoObra: number;
  subTotal: number;
  igv: number;
  total: number;
  fechaEmision: string;
  detalles: DetalleComprobante[];
}

export interface DetalleRequest {
  cod_Repuesto: number;
  cantidad: number;
}

export interface ComprobanteRequest {
  cod_Mantenimiento: number;
  atendidoPor: string;
  repuestos: DetalleRequest[];
}
