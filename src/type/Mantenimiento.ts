export type EstadoMant = "Pendiente" | "En Proceso" | "Completado" | "Entregado" | "Finalizado";

export interface Mantenimiento {
  cod_Mantenimiento: number;
  cod_Cliente: number;
  motoPlaca: string;
  motoModelo: string;
  descripcionAveria: string;
  costoManoObra: number;
  estado: EstadoMant;
  fechaIngreso: string;
}

export type MantenimientoFormData = Omit<Mantenimiento, "cod_Mantenimiento" | "fechaIngreso"> & {
  fechaIngreso?: string;
};
