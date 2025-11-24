import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState } from '../types';

// Datos iniciales
export const docentes = [
    { id: '1', nombre: 'AVILES CONDORI, Teodilo', nivel: 'IV' as const, color: '#3B82F6' },
    { id: '2', nombre: 'CAVALCANTI TAGUADA, Bertha', nivel: 'IV' as const, color: '#10B981' },
    { id: '3', nombre: 'PINEDA BAÑOS, Edwin', nivel: 'IV' as const, color: '#F59E0B' },
    { id: '4', nombre: 'SACHA NALVARTE, Edgar', nivel: 'IV' as const, color: '#EF4444' },
    { id: '5', nombre: 'TUCNO VASQUEZ, Carlos', nivel: 'IV' as const, color: '#8B5CF6' },
    { id: '6', nombre: 'ACENCIO PICHURI, Liliana Rufina', nivel: 'IV' as const, color: '#EC4899' },
    { id: '7', nombre: 'INGA TINCOPA, Mery', nivel: 'III' as const, color: '#14B8A6' },
    { id: '8', nombre: 'PILCO GUTIERREZ, Ruth Ángela', nivel: 'II' as const, color: '#F97316' },
    { id: '9', nombre: 'HERNANDEZ ALTAMIRANO, Miguel', nivel: 'II' as const, color: '#06B6D4' },
    { id: '10', nombre: 'VILLANUEVA PARIONA, María Rosa', nivel: 'I' as const, color: '#84CC16' },
    { id: '11', nombre: 'RICO TINEO, Eneida Yanett', nivel: 'I' as const, color: '#A855F7' },
    { id: '12', nombre: 'YARANGA VARGAS, Milder Julieta', nivel: 'I' as const, color: '#F43F5E' },
    { id: '13', nombre: 'ACERO NINACONDOR, Dynnik', nivel: 'I' as const, color: '#0EA5E9' },
];

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

export const grados = [
    { id: '1A', nombre: '1A' },
    { id: '1B', nombre: '1B' },
    { id: '2A', nombre: '2A' },
    { id: '2B', nombre: '2B' },
    { id: '3A', nombre: '3A' },
    { id: '3B', nombre: '3B' },
    { id: '4U', nombre: '4U' },
    { id: '5U', nombre: '5U' },
];

export const useAsignacionStore = create<StoreState>()(
    persist(
        (set, get) => ({
            docenteSeleccionado: null,
            asignaciones: {},
            horasPorDocente: {},

            seleccionarDocente: (docenteId: string | null) => {
                set({ docenteSeleccionado: docenteId });
            },

            toggleAsignacion: (areaId: string, gradoId: string) => {
                const { docenteSeleccionado, asignaciones, horasPorDocente } = get();

                if (!docenteSeleccionado) {
                    return;
                }

                const key = `${areaId}:${gradoId}`;
                const asignacionActual = asignaciones[key];
                const area = areasCurriculares.find(a => a.id === areaId);

                if (!area) return;

                const nuevasAsignaciones = { ...asignaciones };
                const nuevasHoras = { ...horasPorDocente };

                if (asignacionActual === docenteSeleccionado) {
                    // Desasignar
                    delete nuevasAsignaciones[key];
                    nuevasHoras[docenteSeleccionado] = Math.max(0, (nuevasHoras[docenteSeleccionado] || 0) - area.horas);
                } else {
                    // Asignar o reasignar
                    if (asignacionActual && asignacionActual !== docenteSeleccionado) {
                        // Reasignar de otro docente
                        nuevasHoras[asignacionActual] = Math.max(0, (nuevasHoras[asignacionActual] || 0) - area.horas);
                    }
                    nuevasAsignaciones[key] = docenteSeleccionado;
                    nuevasHoras[docenteSeleccionado] = (nuevasHoras[docenteSeleccionado] || 0) + area.horas;
                }

                set({
                    asignaciones: nuevasAsignaciones,
                    horasPorDocente: nuevasHoras,
                });
            },

            resetearAsignaciones: () => {
                set({
                    asignaciones: {},
                    horasPorDocente: {},
                    docenteSeleccionado: null,
                });
            },

            cargarDesdeLocalStorage: () => {
                // El middleware persist se encarga de cargar automáticamente
            },
        }),
        {
            name: 'asignacion-storage',
        }
    )
);

// Función para obtener el color de un docente
export const getDocenteColor = (docenteId: string): string => {
    const docente = docentes.find(d => d.id === docenteId);
    return docente?.color || '#E5E7EB';
};

// Función para obtener el nombre de un docente
export const getDocenteNombre = (docenteId: string): string => {
    const docente = docentes.find(d => d.id === docenteId);
    return docente?.nombre || 'Desconocido';
};
