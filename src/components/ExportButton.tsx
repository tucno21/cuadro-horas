import React, { useEffect, useRef, useState } from 'react';
import { useAsignacionStore } from '../store/asignacionStore';
import { generarDatosExportacion, exportarJSON, exportarCSV, exportarExcel } from '../utils/exportData';
import { crearRespaldo, descargarRespaldo, leerRespaldo } from '../utils/respaldo';
import type { RespaldoDatos } from '../types';

/**
 * Acciones principales de la aplicación (exportar, importar y resetear).
 * Se muestran como botones compactos en el encabezado.
 */
const ExportButton: React.FC = () => {
    const {
        docentes,
        grados,
        asignaciones,
        horasPorDocente,
        resetearAsignaciones,
        importarRespaldo,
        mostrarToast,
    } = useAsignacionStore();

    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [respaldoPendiente, setRespaldoPendiente] = useState<RespaldoDatos | null>(null);
    const [importando, setImportando] = useState(false);
    const inputArchivoRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const hasData = Object.keys(asignaciones).length > 0;

    useEffect(() => {
        if (!showExportMenu) return;

        const alHacerClic = (evento: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
                setShowExportMenu(false);
            }
        };
        const alPresionarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') setShowExportMenu(false);
        };

        document.addEventListener('mousedown', alHacerClic);
        window.addEventListener('keydown', alPresionarTecla);
        return () => {
            document.removeEventListener('mousedown', alHacerClic);
            window.removeEventListener('keydown', alPresionarTecla);
        };
    }, [showExportMenu]);

    const exportarReporte = (formato: 'json' | 'csv' | 'excel') => {
        setShowExportMenu(false);
        if (!hasData) {
            mostrarToast('info', 'Asigna horas a un docente antes de exportar el reporte.');
            return;
        }

        const data = generarDatosExportacion(docentes, grados, asignaciones, horasPorDocente);
        if (formato === 'json') {
            exportarJSON(data);
            mostrarToast('exito', 'Reporte exportado en JSON.');
        } else if (formato === 'csv') {
            exportarCSV(data);
            mostrarToast('exito', 'Reporte exportado en CSV.');
        } else {
            void exportarExcel(data);
            mostrarToast('exito', 'Reporte exportado en Excel.');
        }
    };

    const handleExportarRespaldo = () => {
        setShowExportMenu(false);
        if (docentes.length === 0) {
            mostrarToast('info', 'No hay datos para respaldar todavía.');
            return;
        }
        descargarRespaldo(crearRespaldo(docentes, grados, asignaciones));
        mostrarToast('exito', 'Respaldo exportado. Guárdalo en un lugar seguro.');
    };

    const handleSeleccionArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = evento.target.files?.[0];
        evento.target.value = '';
        if (!archivo) return;

        try {
            const datos = await leerRespaldo(archivo);
            setRespaldoPendiente(datos);
        } catch (error) {
            mostrarToast(
                'error',
                error instanceof Error ? error.message : 'No se pudo leer el archivo seleccionado.',
            );
        }
    };

    const handleConfirmarImportacion = async () => {
        if (!respaldoPendiente) return;
        setImportando(true);
        try {
            await importarRespaldo(respaldoPendiente);
            mostrarToast(
                'exito',
                `Respaldo importado: ${respaldoPendiente.docentes.length} docentes, ` +
                    `${respaldoPendiente.grados.length} grados y ` +
                    `${Object.keys(respaldoPendiente.asignaciones).length} celdas asignadas.`,
            );
        } finally {
            setImportando(false);
            setRespaldoPendiente(null);
        }
    };

    const handleReset = () => {
        resetearAsignaciones();
        setShowConfirmReset(false);
        mostrarToast('info', 'Se resetearon todas las asignaciones.');
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Exportar */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        aria-haspopup="menu"
                        aria-expanded={showExportMenu}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar
                        <svg
                            className={`h-3 w-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showExportMenu && (
                        <div
                            role="menu"
                            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                        >
                            <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                Reporte
                            </p>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => exportarReporte('json')}
                                disabled={!hasData}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                Exportar JSON
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => exportarReporte('csv')}
                                disabled={!hasData}
                                className="w-full border-t border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                Exportar CSV
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => exportarReporte('excel')}
                                disabled={!hasData}
                                className="w-full border-t border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                Exportar Excel
                            </button>
                            <p className="border-y border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                Respaldo completo
                            </p>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleExportarRespaldo}
                                disabled={docentes.length === 0}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                Respaldo (JSON)
                            </button>
                        </div>
                    )}
                </div>

                {/* Importar */}
                <button
                    type="button"
                    onClick={() => inputArchivoRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    Importar
                </button>

                <input
                    ref={inputArchivoRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleSeleccionArchivo}
                />

                {/* Resetear */}
                <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    disabled={!hasData}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resetear
                </button>
            </div>

            {/* Modal de confirmación para reset */}
            {showConfirmReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center">
                            <svg className="mr-2 h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Confirmar reseteo</h3>
                        </div>

                        <p className="text-sm text-gray-600">
                            ¿Estás seguro de que deseas resetear todas las asignaciones?
                        </p>
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm font-semibold text-red-800">⚠️ Esta acción no se puede deshacer</p>
                            <p className="mt-1 text-xs text-red-600">
                                Se eliminarán todas las asignaciones. Los docentes y grados se conservan.
                            </p>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmReset(false)}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                            >
                                Resetear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para importar respaldo */}
            {respaldoPendiente && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center">
                            <svg className="mr-2 h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Importar respaldo</h3>
                        </div>

                        <p className="text-sm text-gray-600">
                            El respaldo contiene <strong>{respaldoPendiente.docentes.length} docentes</strong>,{' '}
                            <strong>{respaldoPendiente.grados.length} grados</strong> y{' '}
                            <strong>{Object.keys(respaldoPendiente.asignaciones).length} celdas asignadas</strong>.
                        </p>

                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-800">
                                Se reemplazarán todos los docentes, grados y asignaciones actuales.
                            </p>
                            <p className="mt-1 text-xs text-amber-700">
                                Exporta un respaldo antes si quieres conservar los datos actuales.
                            </p>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setRespaldoPendiente(null)}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleConfirmarImportacion()}
                                disabled={importando}
                                className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                {importando ? 'Importando…' : 'Importar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportButton;
