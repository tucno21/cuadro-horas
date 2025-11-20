import React from 'react';
import { useAsignacionStore, docentes } from '../store/asignacionStore';

const DocentesList: React.FC = () => {
    const { docenteSeleccionado, seleccionarDocente, horasPorDocente } = useAsignacionStore();

    const handleDocenteClick = (docenteId: string) => {
        if (docenteSeleccionado === docenteId) {
            seleccionarDocente(null);
        } else {
            seleccionarDocente(docenteId);
        }
    };

    const getTotalHorasDocente = (docenteId: string) => {
        return horasPorDocente[docenteId] || 0;
    };

    const getNivelBadgeColor = (nivel: string) => {
        switch (nivel) {
            case 'IV':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'III':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'II':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'I':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-5 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Docentes
            </h2>

            <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {docentes.map((docente) => {
                    const isSelected = docenteSeleccionado === docente.id;
                    const totalHoras = getTotalHorasDocente(docente.id);

                    return (
                        <div
                            key={docente.id}
                            onClick={() => handleDocenteClick(docente.id)}
                            className={`
                                relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 transform
                                ${isSelected
                                    ? 'border-gray-800 border-3 shadow-lg scale-105 bg-gray-200'
                                    : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                                }
                            `}
                            style={{
                                borderLeftColor: isSelected ? docente.color : 'transparent',
                                borderLeftWidth: isSelected ? '4px' : '0px',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: docente.color }}
                                        />
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {docente.nombre}
                                        </p>
                                    </div>
                                    <div className="flex gap-x-4 justify-between items-center">
                                        {/* NIVEL */}
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full border ${getNivelBadgeColor(docente.nivel)}`}>
                                                Nivel {docente.nivel}
                                            </span>
                                        </div>

                                        {/* CARGA HORARIA */}
                                        <div className="flex flex-col items-end">
                                            <div className={`px-2 py-1 rounded-md text-sm font-semibold ${totalHoras > 0
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {totalHoras}h
                                            </div>
                                            {totalHoras > 26 && (
                                                <span className="text-xs text-amber-600 mt-1">⚠️ Alta carga</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {isSelected && (
                                <div className="absolute top-1 right-1">
                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {docenteSeleccionado && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                        Docente seleccionado: <span className="font-bold">{docentes.find(d => d.id === docenteSeleccionado)?.nombre}</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Haz clic en las celdas de la tabla para asignar horas
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocentesList;
