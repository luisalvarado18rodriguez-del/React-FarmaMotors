export interface Repuesto {
  cod_Repuesto: number;
  cod_Proveedor: number;
  nom_Repuesto: string;
  marcaRep: string;
  descripRep: string;
  precioUnitario: number;
  stock: number;
}

export interface RepuestoFormData {
  cod_Proveedor: number;
  nom_Repuesto: string;
  marcaRep: string;
  descripRep: string;
  precioUnitario: number;
  stock: number;
}
