export type NivelDocente = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export interface Docente {
    id: string;
    nombre: string;
    nivel: NivelDocente;
    color: string;
    /** Posición del docente en la lista (0 = primero). */
    orden: number;
}

/** Datos que el usuario puede editar de un docente. */
export interface DocenteInput {
    nombre: string;
    nivel: NivelDocente;
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
    /** Posición de la columna en la tabla (0 = primera). */
    orden: number;
}

export interface GradoInput {
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

export interface RespaldoDatos {
    formato: 'cuadrohoras-respaldo';
    version: number;
    exportadoEn: string;
    docentes: Docente[];
    grados: Grado[];
    asignaciones: EstadoAsignacion;
}

export type TipoToast = 'error' | 'exito' | 'info';

export interface ToastNotificacion {
    id: number;
    tipo: TipoToast;
    mensaje: string;
}

export interface StoreState {
    docentes: Docente[];
    grados: Grado[];
    docenteSeleccionado: string | null;
    asignaciones: EstadoAsignacion;
    horasPorDocente: DocenteHoras;
    /** true cuando ya se cargaron los datos desde IndexedDB. */
    hidratado: boolean;
    error: string | null;
    toast: ToastNotificacion | null;
    inicializar: () => Promise<void>;
    seleccionarDocente: (docenteId: string | null) => void;
    /** Devuelve false si la asignación fue rechazada (por ejemplo, al superar el máximo de horas). */
    toggleAsignacion: (areaId: string, gradoId: string) => boolean;
    resetearAsignaciones: () => void;
    agregarDocente: (datos: DocenteInput) => Promise<void>;
    actualizarDocente: (id: string, datos: DocenteInput) => Promise<void>;
    eliminarDocente: (id: string) => Promise<void>;
    moverDocente: (id: string, direccion: 'arriba' | 'abajo') => Promise<void>;
    reordenarDocente: (origenId: string, destinoId: string) => Promise<void>;
    /** Devuelve false si el grado no se pudo crear (nombre vacío o duplicado). */
    agregarGrado: (datos: GradoInput) => Promise<boolean>;
    /** Devuelve false si el grado no se pudo actualizar (nombre vacío o duplicado). */
    actualizarGrado: (id: string, datos: GradoInput) => Promise<boolean>;
    /** Elimina el grado y todas sus celdas asignadas. */
    eliminarGrado: (id: string) => Promise<void>;
    importarRespaldo: (respaldo: RespaldoDatos) => Promise<void>;
    mostrarToast: (tipo: TipoToast, mensaje: string) => void;
    cerrarToast: () => void;
    limpiarError: () => void;
}
