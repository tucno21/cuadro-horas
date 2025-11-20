import React, { useState } from 'react';
import { useAsignacionStore } from '../store/asignacionStore';
import { generarDatosExportacion, exportarJSON, exportarCSV, exportarExcel } from '../utils/exportData';

const ExportButton: React.FC = () => {
    const { asignaciones, horasPorDocente, resetearAsignaciones } = useAsignacionStore();
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportJSON = () => {
        const data = generarDatosExportacion(asignaciones, horasPorDocente);
        exportarJSON(data);
        setShowExportMenu(false);
    };

    const handleExportCSV = () => {
        const data = generarDatosExportacion(asignaciones, horasPorDocente);
        exportarCSV(data);
        setShowExportMenu(false);
    };

    const handleExportExcel = () => {
        const data = generarDatosExportacion(asignaciones, horasPorDocente);
        exportarExcel(data);
        setShowExportMenu(false);
    };

    const handleReset = () => {
        resetearAsignaciones();
        setShowConfirmReset(false);
    };

    const hasData = Object.keys(asignaciones).length > 0;

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Acciones
                </h2>

                <div className="space-y-4">
                    {/* Exportar datos */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={!hasData}
                            className={`
                                w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                                ${hasData
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Exportar Datos</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showExportMenu && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <button
                                    onClick={handleExportJSON}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-xs">JSON</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Exportar como JSON</p>
                                        <p className="text-xs text-gray-500">Formato estructurado para sistemas</p>
                                    </div>
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-t border-gray-100"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-xs">CSV</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Exportar como CSV</p>
                                        <p className="text-xs text-gray-500">Para abrir en Excel o similares</p>
                                    </div>
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-t border-gray-100"
                                >
                                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-xs">XLS</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Exportar como Excel</p>
                                        <p className="text-xs text-gray-500">Formato de tabla con estilos</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resetear asignaciones */}
                    <button
                        onClick={() => setShowConfirmReset(true)}
                        disabled={!hasData}
                        className={`
                            w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                            ${hasData
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Resetear Asignaciones</span>
                    </button>

                    {/* Información del estado */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Celdas asignadas</p>
                                <p className="font-semibold text-gray-800">{Object.keys(asignaciones).length}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total horas</p>
                                <p className="font-semibold text-gray-800">
                                    {Object.values(horasPorDocente).reduce((sum, horas) => sum + horas, 0)}h
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Instrucciones
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Selecciona un docente de la lista izquierda</li>
                            <li>• Haz clic en las celdas para asignar horas</li>
                            <li>• Los datos se guardan automáticamente</li>
                            <li>• Exporta cuando termines</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para reset */}
            {showConfirmReset && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Confirmar reseteo</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-3">
                                ¿Estás seguro de que deseas resetear todas las asignaciones?
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">
                                    <strong>⚠️ Esta acción no se puede deshacer</strong>
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    Se eliminarán todas las asignaciones y se perderán los datos actuales.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmReset(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                Resetear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportButton;
