export interface Mantenimiento {
  cod_Mantenimiento: number;
  cod_Cliente: number;
  motoPlaca: string;
  motoModelo: string;
  descripcionAveria: string;
  costoManoObra: number;
  estado: "Pendiente" | "En Proceso" | "Completado";
  fechaIngreso: string;
}

// fechaIngreso es opcional en el form: Spring Boot la setea automáticamente con LocalDate.now()
export type MantenimientoFormData = Omit<Mantenimiento, "cod_Mantenimiento" | "fechaIngreso"> & {
  fechaIngreso?: string;
};
