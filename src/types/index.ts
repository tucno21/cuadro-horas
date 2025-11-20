export interface Docente {
    id: string;
    nombre: string;
    nivel: 'I' | 'II' | 'III' | 'IV';
    color: string;
}

export interface AreaCurricular {
    id: string;
    nombre: string;
    horas: number;
}

export interface Grado {
    id: string;
    nombre: string;
}

export interface Asignacion {
    areaId: string;
    gradoId: string;
    docenteId: string;
}

export interface EstadoAsignacion {
    [key: string]: string; // areaId:gradoId -> docenteId
}

export interface DocenteHoras {
    [docenteId: string]: number;
}

export interface StoreState {
    docenteSeleccionado: string | null;
    asignaciones: EstadoAsignacion;
    horasPorDocente: DocenteHoras;
    seleccionarDocente: (docenteId: string | null) => void;
    toggleAsignacion: (areaId: string, gradoId: string) => void;
    resetearAsignaciones: () => void;
    cargarDesdeLocalStorage: () => void;
}
