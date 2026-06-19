export interface Repuesto {
  cod_Repuesto: number;
  nom_Repuesto: string;
  marcaRep: string;
  descripRep: string;
  precioUnitario: number;
  stock: number;
}

export type RepuestoFormData = Omit<Repuesto, "cod_Repuesto">;
