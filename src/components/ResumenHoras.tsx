import React, { useMemo } from 'react';
import { useAsignacionStore, docentes, areasCurriculares, grados, getDocenteColor } from '../store/asignacionStore';

const ResumenHoras: React.FC = () => {
    const { horasPorDocente, asignaciones } = useAsignacionStore();

    const resumenData = useMemo(() => {
        return docentes.map(docente => {
            const totalHoras = horasPorDocente[docente.id] || 0;
            const asignacionesDocente = Object.entries(asignaciones)
                .filter(([_, docenteId]) => docenteId === docente.id)
                .map(([key, _]) => {
                    const [areaId, gradoId] = key.split(':');
                    const area = areasCurriculares.find(a => a.id === areaId);
                    const grado = grados.find(g => g.id === gradoId);
                    return {
                        area: area?.nombre || 'Desconocido',
                        grado: grado?.nombre || 'Desconocido',
                        horas: area?.horas || 0,
                    };
                });

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
        }).filter(docente => docente.totalHoras > 0)
            .sort((a, b) => b.totalHoras - a.totalHoras);
    }, [horasPorDocente, asignaciones]);

    const totalGeneral = resumenData.reduce((sum, docente) => sum + docente.totalHoras, 0);

    const getCargaLevel = (horas: number) => {
        if (horas >= 35) return { text: 'Muy Alta', color: 'text-red-600 bg-red-100' };
        if (horas >= 30) return { text: 'Alta', color: 'text-amber-600 bg-amber-100' };
        if (horas >= 20) return { text: 'Normal', color: 'text-green-600 bg-green-100' };
        return { text: 'Baja', color: 'text-blue-600 bg-blue-100' };
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <>
                    {/* Total general */}
                    <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total de Horas Asignadas</p>
                                <p className="text-3xl font-bold">{totalGeneral}h</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Docentes Activos</p>
                                <p className="text-2xl font-bold">{resumenData.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de docentes con horas */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {resumenData.map((docente) => {
                            const cargaLevel = getCargaLevel(docente.totalHoras);

                            return (
                                <div
                                    key={docente.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    style={{ borderColor: getDocenteColor(docente.id) }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: getDocenteColor(docente.id) }}
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    {docente.nombre}
                                                </p>
                                                <p className="text-xs text-gray-500">Nivel {docente.nivel}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-800">
                                                {docente.totalHoras}h
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${cargaLevel.color}`}>
                                                {cargaLevel.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desglose por áreas */}
                                    <div className="space-y-2">
                                        {Object.entries(docente.asignaciones).map(([area, data]) => (
                                            <div key={area} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-700">{area}:</span>
                                                    <span className="text-gray-500 text-xs">
                                                        ({data.grados.join(', ')})
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-gray-600">
                                                    {data.horas}h
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Estadísticas adicionales */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <p className="text-gray-500">Promedio por docente</p>
                                <p className="font-semibold text-gray-800">
                                    {Math.round(totalGeneral / resumenData.length)}h
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500">Horas sin asignar</p>
                                <p className="font-semibold text-gray-800">
                                    {areasCurriculares.reduce((sum, area) => sum + area.horas, 0) * grados.length - totalGeneral}h
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResumenHoras;
