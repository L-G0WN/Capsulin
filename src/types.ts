export interface Medicamento {
    nombre: string;
    dosis: string;
    efectos?: string;
}

export interface Sintoma {
    sintoma: string;
    descripcion: string;
    recomendacion: string;
    emergencia: string;
    medicamentos: Medicamento[];
}
