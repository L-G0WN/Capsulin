export interface Medicamento {
    id: number;
    nombre: string;
    efectos?: string;
    contraindicaciones?: string;
    duracion?: string;
    presentacion?: string;
    laboratorio?: string;
    sintomas?: string[];
}

export interface MedicamentoRelacion {
    id: number;
    nombre: string;
    dosis: string;
    intensidad: string;
    efectos?: string;
    contraindicaciones?: string;
    duracion?: string;
    presentacion?: string;
    laboratorio?: string;
}

export interface Sintoma {
    id: number;
    sintoma: string;
    descripcion: string;
    recomendacion: string;
    emergencia: string;
    categoria?: string;
    frecuencia?: string;
    medicamentos: MedicamentoRelacion[];
    sinMedicamentosPorIntensidad?: boolean;
}