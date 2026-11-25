import { create } from 'zustand';
import type {
    Docente,
    DocenteHoras,
    DocenteInput,
    EstadoAsignacion,
    Grado,
    GradoInput,
    NivelDocente,
    StoreState,
} from '../types';
import {
    eliminarAsignacionesDB,
    eliminarDocenteDB,
    eliminarGradoDB,
    guardarAsignacionDB,
    guardarDocentesDB,
    guardarGradosDB,
    guardarMetaDB,
    obtenerAsignacionesDB,
    obtenerDocentesDB,
    obtenerGradosDB,
    obtenerMetaDB,
    reemplazarAsignacionesDB,
    reemplazarDocentesDB,
    reemplazarGradosDB,
    vaciarAsignacionesDB,
} from '../db/indexeddb';

/**
 * Docentes iniciales. Solo se usan como semilla la primera vez que se abre la
 * aplicación (o si la base de datos todavía no existe).
 */
export const docentesPorDefecto: Docente[] = [
    { id: '1', nombre: 'AVILES CONDORI, Teodilo', nivel: 'IV', color: '#3B82F6', orden: 0 },
    { id: '3', nombre: 'PINEDA BAÑOS, Edwin', nivel: 'V', color: '#F59E0B', orden: 1 },
    { id: '5', nombre: 'TUCNO VASQUEZ, Carlos', nivel: 'V', color: '#8B5CF6', orden: 2 },
    { id: '2', nombre: 'CAVALCANTI TAGUADA, Bertha', nivel: 'IV', color: '#10B981', orden: 3 },
    { id: '4', nombre: 'SACHA NALVARTE, Edgar', nivel: 'IV', color: '#EF4444', orden: 4 },
    { id: '6', nombre: 'ACENCIO PICHURI, Liliana Rufina', nivel: 'IV', color: '#EC4899', orden: 5 },
    { id: '7', nombre: 'INGA TINCOPA, Mery', nivel: 'III', color: '#14B8A6', orden: 6 },
    { id: '8', nombre: 'PILCO GUTIERREZ, Ruth Ángela', nivel: 'II', color: '#F97316', orden: 7 },
    { id: '9', nombre: 'HERNANDEZ ALTAMIRANO, Miguel', nivel: 'II', color: '#06B6D4', orden: 8 },
    { id: '10', nombre: 'VILLANUEVA PARIONA, María Rosa', nivel: 'I', color: '#84CC16', orden: 9 },
    { id: '11', nombre: 'RICO TINEO, Eneida Yanett', nivel: 'I', color: '#A855F7', orden: 10 },
    { id: '12', nombre: 'YARANGA VARGAS, Milder Julieta', nivel: 'I', color: '#F43F5E', orden: 11 },
    { id: '13', nombre: 'ACERO NINACONDOR, Dynnik', nivel: 'I', color: '#0EA5E9', orden: 12 },
    { id: '14', nombre: 'VACANTE 1', nivel: 'I', color: '#386641', orden: 13 },
    { id: '15', nombre: 'VACANTE 2', nivel: 'I', color: '#ae2012', orden: 14 },
    { id: '16', nombre: 'VACANTE 3', nivel: 'I', color: '#3d405b', orden: 15 },
];

/** Colores disponibles para asignar a los docentes. */
export const PALETA_COLORES = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#A855F7', '#F43F5E',
    '#0EA5E9', '#386641', '#ae2012', '#3d405b', '#6366F1', '#D946EF',
];

export const NIVELES: NivelDocente[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Carga horaria máxima permitida por docente. */
export const LIMITE_HORAS_DOCENTE = 26;

export const areasCurriculares = [
    { id: 'mat', nombre: 'MAT', horas: 6 },
    { id: 'com', nombre: 'COM', horas: 5 },
    { id: 'ing', nombre: 'Inglés', horas: 5 },
    { id: 'arte', nombre: 'Arte', horas: 2 },
    { id: 'cs', nombre: 'CCSS', horas: 4 },
    { id: 'dpcc', nombre: 'DPCC', horas: 4 },
    { id: 'ef', nombre: 'Ed Fisica', horas: 2 },
    { id: 'er', nombre: 'Religion', horas: 2 },
    { id: 'cyt', nombre: 'CCTT', horas: 5 },
    { id: 'ept', nombre: 'EPT', horas: 8 },
    { id: 'toe', nombre: 'TOE', horas: 2 },
];
// export const areasCurriculares = [
//     { id: 'mat', nombre: 'Matemática', horas: 6 },
//     { id: 'com', nombre: 'Comunicación', horas: 6 },
//     { id: 'ing', nombre: 'Inglés', horas: 5 },
//     { id: 'arte', nombre: 'Arte y cultura', horas: 2 },
//     { id: 'cs', nombre: 'Ciencias sociales', horas: 4 },
//     { id: 'dpcc', nombre: 'Desarrollo personal, ciudadanía y cívica', horas: 4 },
//     { id: 'ef', nombre: 'Educación física', horas: 2 },
//     { id: 'er', nombre: 'Educación religiosa', horas: 2 },
//     { id: 'cyt', nombre: 'Ciencia y tecnología', horas: 5 },
//     { id: 'ept', nombre: 'Educación para el trabajo', horas: 8 },
//     { id: 'toe', nombre: 'Tutoría y orientación educativa', horas: 2 },
// ];

/**
 * Grados/secciones iniciales. Igual que los docentes, solo se usan como semilla
 * la primera vez que se abre la aplicación.
 */
export const gradosPorDefecto: Grado[] = [
    { id: '1A', nombre: '1A', orden: 0 },
    { id: '1B', nombre: '1B', orden: 1 },
    { id: '2A', nombre: '2A', orden: 2 },
    { id: '2B', nombre: '2B', orden: 3 },
    { id: '3A', nombre: '3A', orden: 4 },
    { id: '3B', nombre: '3B', orden: 5 },
    { id: '4U', nombre: '4U', orden: 6 },
    { id: '5U', nombre: '5U', orden: 7 },
];

/* ------------------------------ Utilidades ------------------------------ */

const CLAVE_LOCAL_STORAGE_ANTERIOR = 'asignacion-storage';

interface EstadoAnterior {
    docenteSeleccionado?: string | null;
    asignaciones?: EstadoAsignacion;
}

const mensajeError = (error: unknown): string =>
    error instanceof Error ? error.message : 'Error desconocido al guardar los datos.';

const generarId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/** Las horas por docente se derivan siempre de las asignaciones. */
const calcularHoras = (asignaciones: EstadoAsignacion): DocenteHoras => {
    const horas: DocenteHoras = {};
    Object.entries(asignaciones).forEach(([key, docenteId]) => {
        const areaId = key.split(':')[0];
        const area = areasCurriculares.find((a) => a.id === areaId);
        if (!area) return;
        horas[docenteId] = (horas[docenteId] ?? 0) + area.horas;
    });
    return horas;
};

const renumerar = (docentes: Docente[]): Docente[] =>
    docentes.map((docente, index) => ({ ...docente, orden: index }));

const renumerarGrados = (grados: Grado[]): Grado[] =>
    grados.map((grado, index) => ({ ...grado, orden: index }));

/** Id estable a partir del nombre del grado (1A, 2B, …), sin chocar con los existentes. */
export const generarIdGrado = (nombre: string, existentes: Grado[]): string => {
    const base =
        nombre
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '') || 'GRADO';

    const usados = new Set(existentes.map((grado) => grado.id.toUpperCase()));
    if (!usados.has(base)) return base;

    let sufijo = 2;
    while (usados.has(`${base}${sufijo}`)) sufijo += 1;
    return `${base}${sufijo}`;
};

/**
 * Ajuste puntual pedido por el usuario sobre los docentes ya existentes:
 * PINEDA BAÑOS pasa a nivel V en el 2.º puesto y TUCNO VASQUEZ a nivel V en el 3.º.
 * Se aplica una sola vez por base de datos (meta `ajusteDocentesV2`).
 */
const aplicarAjustesDocentes = (docentes: Docente[]): Docente[] => {
    const esPineda = (docente: Docente) => docente.id === '3' || /PINEDA/i.test(docente.nombre);
    const esTucno = (docente: Docente) => docente.id === '5' || /TUCNO/i.test(docente.nombre);

    const ordenados = [...docentes].sort((a, b) => a.orden - b.orden);
    const pineda = ordenados.find(esPineda);
    const tucno = ordenados.find(esTucno);
    if (!pineda && !tucno) return docentes;

    const resto = ordenados.filter((docente) => docente !== pineda && docente !== tucno);
    if (pineda) resto.splice(Math.min(1, resto.length), 0, { ...pineda, nivel: 'V' });
    if (tucno) resto.splice(Math.min(2, resto.length), 0, { ...tucno, nivel: 'V' });

    return renumerar(resto);
};

/** Lee los datos guardados por la versión anterior (localStorage + persist). */
const leerEstadoAnterior = (): EstadoAnterior | null => {
    try {
        const crudo = localStorage.getItem(CLAVE_LOCAL_STORAGE_ANTERIOR);
        if (!crudo) return null;
        const parseado = JSON.parse(crudo) as { state?: EstadoAnterior };
        return parseado.state ?? null;
    } catch {
        return null;
    }
};

let promesaInicializacion: Promise<void> | null = null;

/* -------------------------------- Store -------------------------------- */

export const useAsignacionStore = create<StoreState>()((set, get) => {
    const persistir = async (operacion: () => Promise<void>): Promise<void> => {
        try {
            await operacion();
            if (get().error) set({ error: null });
        } catch (error) {
            set({ error: mensajeError(error) });
        }
    };

    return {
        docentes: [],
        grados: [],
        docenteSeleccionado: null,
        asignaciones: {},
        horasPorDocente: {},
        hidratado: false,
        error: null,
        toast: null,

        inicializar: () => {
            if (get().hidratado) return Promise.resolve();
            if (promesaInicializacion) return promesaInicializacion;

            const promesa = (async () => {
                try {
                    const primeraVez = (await obtenerMetaDB('datosInicializados')) !== 'true';
                    let docentes = await obtenerDocentesDB();
                    let grados = await obtenerGradosDB();
                    let asignaciones = await obtenerAsignacionesDB();
                    let docenteSeleccionado = await obtenerMetaDB('docenteSeleccionado');

                    if (primeraVez) {
                        if (docentes.length === 0) {
                            docentes = docentesPorDefecto.map((docente) => ({ ...docente }));
                            await guardarDocentesDB(docentes);
                        }
                        if (grados.length === 0) {
                            grados = gradosPorDefecto.map((grado) => ({ ...grado }));
                            await guardarGradosDB(grados);
                        }

                        // Migración de los datos que vivían en localStorage.
                        const estadoAnterior = leerEstadoAnterior();
                        if (estadoAnterior?.asignaciones && Object.keys(estadoAnterior.asignaciones).length > 0) {
                            asignaciones = estadoAnterior.asignaciones;
                            await reemplazarAsignacionesDB(asignaciones);
                        }
                        if (!docenteSeleccionado && estadoAnterior?.docenteSeleccionado) {
                            docenteSeleccionado = estadoAnterior.docenteSeleccionado;
                            await guardarMetaDB('docenteSeleccionado', docenteSeleccionado);
                        }

                        await guardarMetaDB('datosInicializados', 'true');
                        await guardarMetaDB('gradosInicializados', 'true');
                    }

                    // Semilla de grados para bases creadas antes de que fueran editables.
                    if ((await obtenerMetaDB('gradosInicializados')) !== 'true') {
                        if (grados.length === 0) {
                            grados = gradosPorDefecto.map((grado) => ({ ...grado }));
                            await guardarGradosDB(grados);
                        }
                        await guardarMetaDB('gradosInicializados', 'true');
                    }

                    grados = renumerarGrados([...grados].sort((a, b) => a.orden - b.orden));

                    // Ajuste puntual de docentes (nivel/orden) sobre bases ya existentes.
                    if ((await obtenerMetaDB('ajusteDocentesV2')) !== 'true') {
                        try {
                            docentes = aplicarAjustesDocentes(docentes);
                            await guardarDocentesDB(docentes);
                            await guardarMetaDB('ajusteDocentesV2', 'true');
                        } catch (error) {
                            console.warn('No se pudo aplicar el ajuste de docentes:', error);
                        }
                    }

                    // Limpieza de referencias a docentes o grados que ya no existen.
                    const idsValidos = new Set(docentes.map((docente) => docente.id));
                    const idsGradosValidos = new Set(grados.map((grado) => grado.id));
                    const asignacionesValidas: EstadoAsignacion = {};
                    Object.entries(asignaciones).forEach(([key, docenteId]) => {
                        const gradoId = key.split(':')[1];
                        if (idsValidos.has(docenteId) && idsGradosValidos.has(gradoId)) {
                            asignacionesValidas[key] = docenteId;
                        }
                    });
                    if (docenteSeleccionado && !idsValidos.has(docenteSeleccionado)) {
                        docenteSeleccionado = null;
                    }

                    set({
                        docentes,
                        grados,
                        asignaciones: asignacionesValidas,
                        horasPorDocente: calcularHoras(asignacionesValidas),
                        docenteSeleccionado,
                        hidratado: true,
                        error: null,
                    });
                } catch (error) {
                    set({
                        docentes: get().docentes.length > 0 ? get().docentes : docentesPorDefecto.map((d) => ({ ...d })),
                        grados: get().grados.length > 0 ? get().grados : gradosPorDefecto.map((g) => ({ ...g })),
                        hidratado: true,
                        error: mensajeError(error),
                    });
                } finally {
                    promesaInicializacion = null;
                }
            })();

            promesaInicializacion = promesa;
            return promesa;
        },

        seleccionarDocente: (docenteId) => {
            set({ docenteSeleccionado: docenteId });
            void persistir(() => guardarMetaDB('docenteSeleccionado', docenteId));
        },

        toggleAsignacion: (areaId, gradoId) => {
            const { docenteSeleccionado, asignaciones } = get();
            if (!docenteSeleccionado) return false;

            const area = areasCurriculares.find((a) => a.id === areaId);
            if (!area) return false;

            const key = `${areaId}:${gradoId}`;
            const nuevasAsignaciones: EstadoAsignacion = { ...asignaciones };

            if (nuevasAsignaciones[key] === docenteSeleccionado) {
                // Desasignar: siempre permitido
                delete nuevasAsignaciones[key];
                void persistir(() => eliminarAsignacionesDB([key]));
            } else {
                // Asignar o reasignar: se valida el máximo de horas del docente
                if (!puedeAsignarArea(docenteSeleccionado, areaId)) return false;

                nuevasAsignaciones[key] = docenteSeleccionado;
                void persistir(() => guardarAsignacionDB(key, docenteSeleccionado));
            }

            set({
                asignaciones: nuevasAsignaciones,
                horasPorDocente: calcularHoras(nuevasAsignaciones),
            });
            return true;
        },

        resetearAsignaciones: () => {
            set({
                asignaciones: {},
                horasPorDocente: {},
                docenteSeleccionado: null,
            });
            void persistir(async () => {
                await vaciarAsignacionesDB();
                await guardarMetaDB('docenteSeleccionado', null);
            });
        },

        agregarDocente: async (datos: DocenteInput) => {
            const { docentes } = get();
            const nuevo: Docente = {
                id: generarId(),
                nombre: datos.nombre.trim(),
                nivel: datos.nivel,
                color: datos.color,
                orden: docentes.length,
            };

            set({ docentes: [...docentes, nuevo] });
            await persistir(() => guardarDocentesDB([nuevo]));
        },

        actualizarDocente: async (id, datos: DocenteInput) => {
            const docentes = get().docentes.map((docente) =>
                docente.id === id
                    ? { ...docente, nombre: datos.nombre.trim(), nivel: datos.nivel, color: datos.color }
                    : docente,
            );
            const actualizado = docentes.find((docente) => docente.id === id);

            set({ docentes });
            if (actualizado) {
                await persistir(() => guardarDocentesDB([actualizado]));
            }
        },

        eliminarDocente: async (id) => {
            const { docentes, asignaciones, docenteSeleccionado } = get();
            const restantes = renumerar(docentes.filter((docente) => docente.id !== id));

            const clavesAEliminar = Object.entries(asignaciones)
                .filter(([, docenteId]) => docenteId === id)
                .map(([key]) => key);

            const nuevasAsignaciones: EstadoAsignacion = { ...asignaciones };
            clavesAEliminar.forEach((key) => delete nuevasAsignaciones[key]);

            const seleccionadoEliminado = docenteSeleccionado === id;
            set({
                docentes: restantes,
                asignaciones: nuevasAsignaciones,
                horasPorDocente: calcularHoras(nuevasAsignaciones),
                docenteSeleccionado: seleccionadoEliminado ? null : docenteSeleccionado,
            });

            await persistir(async () => {
                await eliminarDocenteDB(id);
                if (clavesAEliminar.length > 0) await eliminarAsignacionesDB(clavesAEliminar);
                await guardarDocentesDB(restantes);
                if (seleccionadoEliminado) await guardarMetaDB('docenteSeleccionado', null);
            });
        },

        moverDocente: async (id, direccion) => {
            const docentes = [...get().docentes].sort((a, b) => a.orden - b.orden);
            const indice = docentes.findIndex((docente) => docente.id === id);
            if (indice < 0) return;

            const nuevoIndice = direccion === 'arriba' ? indice - 1 : indice + 1;
            if (nuevoIndice < 0 || nuevoIndice >= docentes.length) return;

            const [movido] = docentes.splice(indice, 1);
            docentes.splice(nuevoIndice, 0, movido);
            const reordenados = renumerar(docentes);

            set({ docentes: reordenados });
            await persistir(() => guardarDocentesDB(reordenados));
        },

        reordenarDocente: async (origenId, destinoId) => {
            if (origenId === destinoId) return;

            const docentes = [...get().docentes].sort((a, b) => a.orden - b.orden);
            const indiceOrigen = docentes.findIndex((docente) => docente.id === origenId);
            const indiceDestino = docentes.findIndex((docente) => docente.id === destinoId);
            if (indiceOrigen < 0 || indiceDestino < 0) return;

            const [movido] = docentes.splice(indiceOrigen, 1);
            docentes.splice(indiceDestino, 0, movido);
            const reordenados = renumerar(docentes);

            set({ docentes: reordenados });
            await persistir(() => guardarDocentesDB(reordenados));
        },

        agregarGrado: async (datos: GradoInput) => {
            const nombre = datos.nombre.trim();
            if (!nombre) {
                get().mostrarToast('error', 'El nombre del grado o sección es obligatorio.');
                return false;
            }

            const { grados } = get();
            if (grados.some((grado) => grado.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
                get().mostrarToast('error', `Ya existe un grado llamado «${nombre}».`);
                return false;
            }

            const nuevo: Grado = {
                id: generarIdGrado(nombre, grados),
                nombre,
                orden: grados.length,
            };

            set({ grados: [...grados, nuevo] });
            await persistir(() => guardarGradosDB([nuevo]));
            return true;
        },

        actualizarGrado: async (id, datos) => {
            const nombre = datos.nombre.trim();
            if (!nombre) {
                get().mostrarToast('error', 'El nombre del grado o sección es obligatorio.');
                return false;
            }

            const grados = get().grados;
            if (!grados.some((grado) => grado.id === id)) return false;

            if (
                grados.some(
                    (grado) => grado.id !== id && grado.nombre.trim().toLowerCase() === nombre.toLowerCase(),
                )
            ) {
                get().mostrarToast('error', `Ya existe un grado llamado «${nombre}».`);
                return false;
            }

            const actualizados = grados.map((grado) => (grado.id === id ? { ...grado, nombre } : grado));
            const actualizado = actualizados.find((grado) => grado.id === id);

            set({ grados: actualizados });
            if (actualizado) {
                await persistir(() => guardarGradosDB([actualizado]));
            }
            return true;
        },

        eliminarGrado: async (id) => {
            const { grados, asignaciones } = get();
            if (!grados.some((grado) => grado.id === id)) return;

            const restantes = renumerarGrados(grados.filter((grado) => grado.id !== id));

            const clavesAEliminar = Object.keys(asignaciones).filter((key) => key.split(':')[1] === id);
            const nuevasAsignaciones: EstadoAsignacion = { ...asignaciones };
            clavesAEliminar.forEach((key) => delete nuevasAsignaciones[key]);

            set({
                grados: restantes,
                asignaciones: nuevasAsignaciones,
                horasPorDocente: calcularHoras(nuevasAsignaciones),
            });

            await persistir(async () => {
                await eliminarGradoDB(id);
                if (clavesAEliminar.length > 0) await eliminarAsignacionesDB(clavesAEliminar);
                await guardarGradosDB(restantes);
            });
        },

        importarRespaldo: async (respaldo) => {
            const docentes = renumerar(respaldo.docentes.map((docente) => ({ ...docente })));
            const grados = renumerarGrados(
                [...(respaldo.grados ?? [])]
                    .sort((a, b) => a.orden - b.orden)
                    .map((grado) => ({ ...grado })),
            );

            const idsValidos = new Set(docentes.map((docente) => docente.id));
            const idsGradosValidos = new Set(grados.map((grado) => grado.id));

            const asignaciones: EstadoAsignacion = {};
            Object.entries(respaldo.asignaciones).forEach(([key, docenteId]) => {
                const gradoId = key.split(':')[1];
                if (idsValidos.has(docenteId) && idsGradosValidos.has(gradoId)) {
                    asignaciones[key] = docenteId;
                }
            });

            set({
                docentes,
                grados,
                asignaciones,
                horasPorDocente: calcularHoras(asignaciones),
                docenteSeleccionado: null,
            });

            await persistir(async () => {
                await reemplazarDocentesDB(docentes);
                await reemplazarGradosDB(grados);
                await reemplazarAsignacionesDB(asignaciones);
                await guardarMetaDB('docenteSeleccionado', null);
                await guardarMetaDB('ajusteDocentesV2', 'true');
                await guardarMetaDB('gradosInicializados', 'true');
            });
        },

        mostrarToast: (tipo, mensaje) => set({ toast: { id: Date.now(), tipo, mensaje } }),
        cerrarToast: () => set({ toast: null }),

        limpiarError: () => set({ error: null }),
    };
});

/**
 * Comprueba si un docente puede recibir las horas de un área sin superar el máximo.
 * Si se excede, muestra un toast de error y devuelve false.
 */
export const puedeAsignarArea = (docenteId: string, areaId: string): boolean => {
    const { horasPorDocente, docentes, mostrarToast } = useAsignacionStore.getState();
    const area = areasCurriculares.find((a) => a.id === areaId);
    if (!area) return false;

    const horasActuales = horasPorDocente[docenteId] ?? 0;
    if (horasActuales + area.horas <= LIMITE_HORAS_DOCENTE) return true;

    const nombre = docentes.find((d) => d.id === docenteId)?.nombre ?? 'El docente';
    const restantes = Math.max(0, LIMITE_HORAS_DOCENTE - horasActuales);
    mostrarToast(
        'error',
        `${nombre} ya tiene ${horasActuales}h y el máximo es ${LIMITE_HORAS_DOCENTE}h. ` +
            `Solo puede sumar ${restantes}h más (esta área tiene ${area.horas}h).`,
    );
    return false;
};

// Función para obtener el color de un docente
export const getDocenteColor = (docenteId: string): string => {
    const docente = useAsignacionStore.getState().docentes.find((d) => d.id === docenteId);
    return docente?.color || '#E5E7EB';
};

// Función para obtener el nombre de un docente
export const getDocenteNombre = (docenteId: string): string => {
    const docente = useAsignacionStore.getState().docentes.find((d) => d.id === docenteId);
    return docente?.nombre || 'Desconocido';
};
