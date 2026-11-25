import React, { useState } from 'react';
import { useAsignacionStore, areasCurriculares, getDocenteColor, getDocenteNombre, puedeAsignarArea } from '../store/asignacionStore';
import GradosModal from './GradosModal';

const DistribucionTable: React.FC = () => {
    const { docentes, grados, docenteSeleccionado, asignaciones, horasPorDocente, toggleAsignacion } = useAsignacionStore();
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; areaId: string; gradoId: string; docenteActual: string } | null>(null);
    const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; docenteId: string } | null>(null);
    const [mostrarGrados, setMostrarGrados] = useState(false);

    const docenteActual = docentes.find((docente) => docente.id === docenteSeleccionado);
    const horasDocenteActual = docenteSeleccionado ? horasPorDocente[docenteSeleccionado] ?? 0 : 0;

    // Áreas en las que el docente seleccionado ya tiene al menos una sección asignada.
    const areasDelSeleccionado = new Set(
        Object.entries(asignaciones)
            .filter(([, docenteId]) => docenteId === docenteSeleccionado)
            .map(([key]) => key.split(':')[0]),
    );

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
        let boxShadow: string | undefined;

        if (asignacionActual) {
            const color = getDocenteColor(asignacionActual);
            const esSeleccionado = asignacionActual === docenteSeleccionado;

            if (esSeleccionado) {
                // Las horas del docente seleccionado: el resaltado va dentro de
                // la celda (inset) para no agrandarla ni mover la tabla.
                backgroundColor = color + '2E';
                borderColor = color;
                textColor = '#111827'; // gray-900
                boxShadow = `inset 0 0 0 2px ${color}, inset 0 0 10px ${color}44`;
            } else {
                // Horas de otros docentes: conservan su color (atenuado) para
                // poder distinguirlos, pero sin competir con el seleccionado.
                backgroundColor = color + '1A';
                borderColor = color + '66';
                textColor = '#4B5563'; // gray-600
            }
        } else if (docenteSeleccionado) {
            // Celdas vacías: neutras y sin color, para no confundirlas con las
            // horas de otros docentes.
            backgroundColor = '#FAFAFA';
            borderColor = '#E5E7EB'; // gray-200
            textColor = '#D1D5DB'; // gray-300
        }

        return {
            backgroundColor,
            color: textColor,
            borderColor,
            borderWidth,
            boxShadow,
            cursor: docenteSeleccionado ? 'pointer' : 'default',
        };
    };

    return (
        <div className="flex h-full flex-col bg-white rounded-lg shadow-lg p-3">
            <div className="mb-2.5 flex shrink-0 items-center justify-between gap-2">
                <h2 className="flex shrink-0 items-center text-base font-bold text-gray-800">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="hidden xl:inline">Distribución de Horas</span>
                    <span className="xl:hidden">Distribución</span>
                </h2>
                <div className="flex min-w-0 items-center justify-end gap-1.5">
                    {/* Identifica las horas del seleccionado sin ocupar una fila extra */}
                    {docenteSeleccionado && docenteActual && (
                        <span
                            className="flex min-w-0 max-w-[11rem] items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold text-gray-700"
                            style={{
                                borderColor: docenteActual.color + '66',
                                backgroundColor: docenteActual.color + '14',
                            }}
                            title={`${docenteActual.nombre} · ${horasDocenteActual}h`}
                        >
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: docenteActual.color }}
                            />
                            <span className="min-w-0 truncate">{docenteActual.nombre}</span>
                            <span className="shrink-0 font-bold">{horasDocenteActual}h</span>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setMostrarGrados(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="hidden sm:inline">Grados</span>
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                            {grados.length}
                        </span>
                    </button>
                </div>
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
                <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky top-0 z-10 border border-gray-300 bg-gray-100 px-2 py-1.5 text-left text-sm font-semibold text-gray-700">
                                    Área Curricular
                                </th>
                                <th className="sticky top-0 z-10 border border-gray-300 bg-gray-100 px-2 py-1.5 text-center text-sm font-semibold text-gray-700">
                                    Horas
                                </th>
                                {grados.map((grado) => (
                                    <th
                                        key={grado.id}
                                        className="sticky top-0 z-10 border border-gray-300 bg-gray-100 px-1 py-1 text-center text-sm font-semibold text-gray-700 min-w-[50px]"
                                    >
                                        {grado.nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {areasCurriculares.map((area) => {
                                const areaDelSeleccionado = areasDelSeleccionado.has(area.id);
                                return (
                                <tr key={area.id} className="hover:bg-gray-50">
                                    <td
                                        className="border border-gray-300 px-2 py-1.5 text-sm bg-gray-50"
                                        style={areaDelSeleccionado && docenteActual ? {
                                            boxShadow: `inset 4px 0 0 ${docenteActual.color}`,
                                            backgroundColor: docenteActual.color + '12',
                                        } : undefined}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <span className={`font-medium ${areaDelSeleccionado ? 'text-gray-900' : 'text-gray-800'}`}>
                                                {area.nombre}
                                            </span>
                                            {areaDelSeleccionado && (
                                                <span
                                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: docenteActual?.color }}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1.5 text-sm text-center font-semibold text-gray-600 bg-gray-50">
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
                                                className="border px-1 py-1 text-center text-xs font-medium transition-all duration-200"
                                                style={getCellStyle(area.id, grado.id)}
                                                title={asignacionActual ? getDocenteNombre(asignacionActual) : undefined}
                                            >
                                                <div className="flex h-8 flex-col items-center justify-center gap-0.5">
                                                    {asignacionActual ? (
                                                        isAssignedToSelected ? (
                                                            <span
                                                                className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm ring-1 ring-white/60"
                                                                style={{ backgroundColor: getDocenteColor(asignacionActual) }}
                                                            >
                                                                {area.horas}h
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <div
                                                                    className="h-2.5 w-2.5 rounded-full"
                                                                    style={{ backgroundColor: getDocenteColor(asignacionActual) }}
                                                                />
                                                                <span className="text-[11px] font-semibold">{area.horas}h</span>
                                                            </>
                                                        )
                                                    ) : (
                                                        <span className="text-current" aria-hidden="true">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                                );
                            })}
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

            <div className="mt-1.5 shrink-0 text-[11px] font-medium leading-tight text-gray-600">
                <p>
                    <span aria-hidden="true">💡</span> Las celdas con recuadro interior y la hora en color sólido son
                    del docente seleccionado. Las celdas con otro color están ocupadas por otro docente; las vacías
                    (—) están libres · <span aria-hidden="true">⏱️</span> Máximo 26h por docente.
                </p>
            </div>

            {mostrarGrados && <GradosModal onCerrar={() => setMostrarGrados(false)} />}
        </div>
    );
};

export default DistribucionTable;
