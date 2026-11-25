import React, { useEffect, useMemo, useRef } from 'react';
import { useAsignacionStore, areasCurriculares } from '../store/asignacionStore';

const ResumenHoras: React.FC = () => {
    const { docentes, grados, horasPorDocente, asignaciones, docenteSeleccionado } = useAsignacionStore();
    const listaRef = useRef<HTMLDivElement>(null);

    const resumenData = useMemo(() => {
        // Orden de los grados tal como se muestran en la tabla (columnas).
        const ordenGrados = new Map(grados.map((grado, indice) => [grado.id, indice]));

        return docentes.map(docente => {
            const totalHoras = horasPorDocente[docente.id] || 0;
            const asignacionesDocente = Object.entries(asignaciones)
                .filter(([, docenteId]) => docenteId === docente.id)
                .map(([key]) => {
                    const [areaId, gradoId] = key.split(':');
                    const area = areasCurriculares.find(a => a.id === areaId);
                    const grado = grados.find(g => g.id === gradoId);
                    return {
                        area: area?.nombre || 'Desconocido',
                        grado: grado?.nombre || 'Desconocido',
                        horas: area?.horas || 0,
                        ordenGrado: ordenGrados.get(gradoId) ?? Number.MAX_SAFE_INTEGER,
                    };
                })
                // Ordena los grados por su posición en la tabla, no por el orden
                // en que se fueron asignando (1A, 2A, 2B, 3A, 3B, …).
                .sort((a, b) => a.ordenGrado - b.ordenGrado);

            const agrupadoPorArea = asignacionesDocente.reduce((acc, asignacion) => {
                if (!acc[asignacion.area]) {
                    acc[asignacion.area] = {
                        horas: 0,
                        grados: [],
                    };
                }
                acc[asignacion.area].horas += asignacion.horas;
                acc[asignacion.area].grados.push(asignacion.grado);
                return acc;
            }, {} as Record<string, { horas: number; grados: string[] }>);

            return {
                ...docente,
                totalHoras,
                asignaciones: agrupadoPorArea,
            };
        })
            // Se muestran los docentes con horas y, siempre, el docente seleccionado
            // (aunque todavía no tenga ninguna hora asignada).
            .filter(docente => docente.totalHoras > 0 || docente.id === docenteSeleccionado)
            .sort((a, b) => {
                // Si el docente a es el seleccionado y b no, a va primero
                if (docenteSeleccionado === a.id && docenteSeleccionado !== b.id) {
                    return -1;
                }
                // Si el docente b es el seleccionado y a no, b va primero
                if (docenteSeleccionado === b.id && docenteSeleccionado !== a.id) {
                    return 1;
                }
                // Si ninguno es el seleccionado o ambos son (imposible), ordenar por horas totales
                return b.totalHoras - a.totalHoras;
            });
    }, [docentes, grados, horasPorDocente, asignaciones, docenteSeleccionado]);

    const totalGeneral = resumenData.reduce((sum, docente) => sum + docente.totalHoras, 0);
    const docentesConHoras = resumenData.filter((docente) => docente.totalHoras > 0).length;

    // Mantén visible al docente seleccionado: siempre va primero en la lista.
    useEffect(() => {
        const seleccionado = listaRef.current?.querySelector<HTMLElement>('[data-seleccionado="true"]');
        seleccionado?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [docenteSeleccionado]);

    const getCargaLevel = (horas: number) => {
        if (horas === 0) return { text: 'Sin asignar', color: 'text-gray-500 bg-gray-100' };
        if (horas >= 35) return { text: 'Muy Alta', color: 'text-red-600 bg-red-100' };
        if (horas >= 30) return { text: 'Alta', color: 'text-amber-600 bg-amber-100' };
        if (horas >= 20) return { text: 'Normal', color: 'text-green-600 bg-green-100' };
        return { text: 'Baja', color: 'text-blue-600 bg-blue-100' };
    };

    return (
        <div className="flex h-full flex-col bg-white rounded-lg shadow-lg p-3">
            <h2 className="mb-3 flex shrink-0 items-center text-base font-bold text-gray-800">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resumen de Horas
            </h2>

            {resumenData.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">Sin asignaciones registradas</p>
                    <p className="text-gray-400 text-sm mt-1">Comienza asignando horas a los docentes</p>
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                    {/* Total general */}
                    <div className="shrink-0 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg px-3 py-2.5 mb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs opacity-90">Total de Horas Asignadas</p>
                                <p className="text-2xl font-bold leading-tight">{totalGeneral}h</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs opacity-90">Docentes con Horas</p>
                                <p className="text-xl font-bold leading-tight">{docentesConHoras}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de docentes con horas */}
                    <div ref={listaRef} className="max-h-[60vh] md:max-h-none min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {resumenData.map((docente) => {
                            const cargaLevel = getCargaLevel(docente.totalHoras);

                            return (
                                <div
                                    key={docente.id}
                                    data-seleccionado={docenteSeleccionado === docente.id ? 'true' : undefined}
                                    className={`rounded-lg border bg-white p-2.5 transition-shadow hover:shadow-md ${docenteSeleccionado === docente.id
                                        ? 'ring-2 ring-blue-400 ring-offset-1 shadow-md'
                                        : ''
                                        }`}
                                    style={{ borderColor: docente.color }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex min-w-0 flex-1 items-start gap-2">
                                            <span
                                                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                                style={{ backgroundColor: docente.color }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2" title={docente.nombre}>
                                                    {docente.nombre}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                                    <span className="text-xs text-gray-500">Nivel {docente.nivel}</span>
                                                    {docenteSeleccionado === docente.id && (
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                                                            Seleccionado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-base font-bold leading-tight text-gray-800">
                                                {docente.totalHoras}h
                                            </p>
                                            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] ${cargaLevel.color}`}>
                                                {cargaLevel.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desglose por áreas */}
                                    <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                                        {Object.keys(docente.asignaciones).length === 0 ? (
                                            <p className="text-xs italic text-gray-500">
                                                Sin horas asignadas todavía. Selecciona áreas en la distribución.
                                            </p>
                                        ) : (
                                            Object.entries(docente.asignaciones).map(([area, data]) => (
                                                <div key={area} className="flex items-start justify-between gap-2 text-xs">
                                                    <span className="min-w-0 text-gray-700">
                                                        <span className="font-semibold text-gray-900">{area}</span>
                                                        <span className="font-medium text-gray-600"> · {data.grados.join(', ')}</span>
                                                    </span>
                                                    <span className="shrink-0 font-semibold text-gray-800">
                                                        {data.horas}h
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumenHoras;
