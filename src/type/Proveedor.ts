export interface Proveedor{
    cod_Proveedor: number;
    ruc: string;
    nomRazSocial: string;
    telefono: string;
    direccion: string;
    correo: string;

}
export type ProveedorFormData = Omit<Proveedor, "cod_Proveedor">;