
export interface DetalleComprobante {
  cod_Detalle: number;
  cod_Repuesto: number;
  nom_Repuesto: string;
  precio: number;
  cantidad: number;
}


export interface ComprobanteResponse {
  cod_Comprobante: number;
  tipoComprobante: string;
  cod_Mantenimiento: number;
  clienteDocumento: string;
  clienteNombre: string;
  motoPlaca: string;
  costoManoObra: number;
  subtotal: number;
  igv: number;
  total: number;
  fechaEmision: string;
  detalles: DetalleComprobante[];
}


export interface ComprobanteRequest {
  cod_Mantenimiento: number;
  repuestos: {
    cod_Repuesto: number;
    cantidad: number;
  }[];
}