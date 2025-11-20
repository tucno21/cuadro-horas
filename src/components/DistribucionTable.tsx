import React, { useState } from 'react';
import { useAsignacionStore, areasCurriculares, grados, getDocenteColor, getDocenteNombre } from '../store/asignacionStore';

const DistribucionTable: React.FC = () => {
    const { docenteSeleccionado, asignaciones, toggleAsignacion } = useAsignacionStore();
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; areaId: string; gradoId: string; docenteActual: string } | null>(null);

    const handleCellClick = (areaId: string, gradoId: string) => {
        if (!docenteSeleccionado) return;

        const key = `${areaId}:${gradoId}`;
        const asignacionActual = asignaciones[key];

        if (asignacionActual && asignacionActual !== docenteSeleccionado) {
            // Mostrar confirmación para reasignar
            setConfirmDialog({
                open: true,
                areaId,
                gradoId,
                docenteActual: asignacionActual,
            });
        } else {
            // Asignar o desasignar directamente
            toggleAsignacion(areaId, gradoId);
        }
    };

    const handleConfirmReassign = () => {
        if (confirmDialog) {
            toggleAsignacion(confirmDialog.areaId, confirmDialog.gradoId);
            setConfirmDialog(null);
        }
    };

    const handleCancelReassign = () => {
        setConfirmDialog(null);
    };

    const getCellStyle = (areaId: string, gradoId: string) => {
        const key = `${areaId}:${gradoId}`;
        const asignacionActual = asignaciones[key];
        const area = areasCurriculares.find(a => a.id === areaId);

        if (!area) return {};

        let backgroundColor = 'white';
        let textColor = 'text-gray-700';
        let borderColor = 'border-gray-300';

        if (asignacionActual) {
            backgroundColor = getDocenteColor(asignacionActual) + '20'; // 20% opacity
            borderColor = getDocenteColor(asignacionActual);
            textColor = 'text-gray-900';
        }

        if (docenteSeleccionado && !asignacionActual) {
            backgroundColor = '#F3F4F6';
        }

        return {
            backgroundColor,
            color: textColor,
            borderColor,
            cursor: docenteSeleccionado ? 'pointer' : 'default',
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-5 h-full overflow-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Distribución de Horas
            </h2>

            {!docenteSeleccionado ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Selecciona un docente para comenzar</p>
                        <p className="text-gray-500 text-sm mt-1">Haz clic en un docente de la lista izquierda</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-left text-sm font-semibold text-gray-700">
                                    Área Curricular
                                </th>
                                <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center text-sm font-semibold text-gray-700">
                                    Horas
                                </th>
                                {grados.map((grado) => (
                                    <th
                                        key={grado.id}
                                        className="border border-gray-300 bg-gray-100 px-1 py-1 text-center text-sm font-semibold text-gray-700 min-w-[50px]"
                                    >
                                        {grado.nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {areasCurriculares.map((area) => (
                                <tr key={area.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-2 py-3 text-sm font-medium text-gray-800 bg-gray-50">
                                        {area.nombre}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-3 text-sm text-center font-semibold text-gray-600 bg-gray-50">
                                        {area.horas}
                                    </td>
                                    {grados.map((grado) => {
                                        const key = `${area.id}:${grado.id}`;
                                        const asignacionActual = asignaciones[key];
                                        const isAssignedToSelected = asignacionActual === docenteSeleccionado;

                                        return (
                                            <td
                                                key={grado.id}
                                                onClick={() => handleCellClick(area.id, grado.id)}
                                                className="border border-gray-300 px-1 py-1 text-center text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                style={getCellStyle(area.id, grado.id)}
                                            >
                                                <div className="flex flex-col items-center justify-center h-8">
                                                    {asignacionActual ? (
                                                        <>
                                                            <div
                                                                className="w-3 h-3 rounded-full mb-1"
                                                                style={{ backgroundColor: getDocenteColor(asignacionActual) }}
                                                            />
                                                            <span className="text-xs font-semibold">
                                                                {area.horas}h
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </div>
                                                {isAssignedToSelected && (
                                                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Dialogo de confirmación */}
            {confirmDialog && confirmDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Confirmar reasignación</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Esta celda está asignada actualmente a:
                            <span className="font-semibold block mt-1 text-gray-800">
                                {getDocenteNombre(confirmDialog.docenteActual)}
                            </span>
                        </p>

                        <p className="text-gray-600 mb-6">
                            ¿Deseas reasignarla al docente seleccionado?
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancelReassign}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmReassign}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Reasignar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
                <p>💡 Tip: Las celdas asignadas al docente seleccionado tienen un borde más grueso y colorido</p>
            </div>
        </div>
    );
};

export default DistribucionTable;
