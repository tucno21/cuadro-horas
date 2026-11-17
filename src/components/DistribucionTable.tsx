import React, { useState } from 'react';
import { useAsignacionStore, areasCurriculares, getDocenteColor, getDocenteNombre, puedeAsignarArea } from '../store/asignacionStore';
import GradosModal from './GradosModal';

const DistribucionTable: React.FC = () => {
    const { grados, docenteSeleccionado, asignaciones, toggleAsignacion } = useAsignacionStore();
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; areaId: string; gradoId: string; docenteActual: string } | null>(null);
    const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; docenteId: string } | null>(null);
    const [mostrarGrados, setMostrarGrados] = useState(false);

    const handleCellClick = (areaId: string, gradoId: string) => {
        if (!docenteSeleccionado) return;

        const key = `${areaId}:${gradoId}`;
        const asignacionActual = asignaciones[key];

        if (asignacionActual && asignacionActual !== docenteSeleccionado) {
            // Antes de pedir confirmación, validar que no se supere el máximo de horas
            if (!puedeAsignarArea(docenteSeleccionado, areaId)) return;

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

    const handleMouseEnter = (e: React.MouseEvent, docenteId: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            docenteId,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const getCellStyle = (areaId: string, gradoId: string) => {
        const key = `${areaId}:${gradoId}`;
        const asignacionActual = asignaciones[key];
        const area = areasCurriculares.find(a => a.id === areaId);

        if (!area) return {};

        let backgroundColor = 'white';
        let textColor = '#374151'; // gray-700
        let borderColor = '#D1D5DB'; // gray-300
        let borderWidth = '1px';

        if (asignacionActual) {
            backgroundColor = getDocenteColor(asignacionActual) + '20'; // 20% opacity
            borderColor = getDocenteColor(asignacionActual);
            textColor = '#111827'; // gray-900
            if (asignacionActual === docenteSeleccionado) {
                borderWidth = '2px';
            }
        }
        if (docenteSeleccionado && !asignacionActual) {
            backgroundColor = '#F3F4F6';
        }

        return {
            backgroundColor,
            color: textColor,
            borderColor,
            borderWidth,
            cursor: docenteSeleccionado ? 'pointer' : 'default',
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-5 h-full overflow-auto">
            <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="flex items-center text-xl font-bold text-gray-800">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Distribución de Horas
                </h2>
                <button
                    type="button"
                    onClick={() => setMostrarGrados(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Grados
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                        {grados.length}
                    </span>
                </button>
            </div>

            {grados.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="px-4 text-center">
                        <svg className="mx-auto mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <p className="font-medium text-gray-600">No hay grados ni secciones</p>
                        <p className="mt-1 text-sm text-gray-500">Usa el botón «Grados» para agregar el primero</p>
                        <button
                            type="button"
                            onClick={() => setMostrarGrados(true)}
                            className="mt-3 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                        >
                            Agregar grados
                        </button>
                    </div>
                </div>
            ) : !docenteSeleccionado ? (
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
                                                onMouseEnter={asignacionActual ? (e) => handleMouseEnter(e, asignacionActual) : undefined}
                                                onMouseLeave={asignacionActual ? handleMouseLeave : undefined}
                                                className="border px-1 py-1 text-center text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                style={getCellStyle(area.id, grado.id)}
                                            >
                                                <div className="flex h-9 flex-col items-center justify-center gap-0.5">
                                                    {asignacionActual ? (
                                                        <>
                                                            <div
                                                                className="h-2.5 w-2.5 rounded-full"
                                                                style={{ backgroundColor: getDocenteColor(asignacionActual) }}
                                                            />
                                                            <span className={`text-xs ${isAssignedToSelected ? 'font-bold' : ''}`}>
                                                                {area.horas}h
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </div>
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

            {/* Tooltip */}
            {tooltip && tooltip.show && (
                <div
                    className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                    }}
                >
                    <div className="font-medium">{getDocenteNombre(tooltip.docenteId)}</div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
                <p>💡 Tip: Las celdas asignadas al docente seleccionado tienen un borde más grueso y colorido</p>
                <p className="mt-1">⏱️ Cada docente puede acumular como máximo 26 horas.</p>
            </div>

            {mostrarGrados && <GradosModal onCerrar={() => setMostrarGrados(false)} />}
        </div>
    );
};

export default DistribucionTable;
