import React, { useState } from 'react';
import { useAsignacionStore, PALETA_COLORES, LIMITE_HORAS_DOCENTE } from '../store/asignacionStore';
import type { Docente, DocenteInput } from '../types';
import DocenteFormModal from './DocenteFormModal';

const COLORES_NIVEL: Record<string, string> = {
    I: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    II: 'bg-green-100 text-green-800 border-green-200',
    III: 'bg-blue-100 text-blue-800 border-blue-200',
    IV: 'bg-purple-100 text-purple-800 border-purple-200',
    V: 'bg-teal-100 text-teal-800 border-teal-200',
    VI: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    VII: 'bg-rose-100 text-rose-800 border-rose-200',
    VIII: 'bg-orange-100 text-orange-800 border-orange-200',
};

const getNivelBadgeColor = (nivel: string) =>
    COLORES_NIVEL[nivel] ?? 'bg-gray-100 text-gray-800 border-gray-200';

const DocentesList: React.FC = () => {
    const {
        docentes,
        docenteSeleccionado,
        asignaciones,
        horasPorDocente,
        hidratado,
        seleccionarDocente,
        agregarDocente,
        actualizarDocente,
        eliminarDocente,
        moverDocente,
        reordenarDocente,
    } = useAsignacionStore();

    const [modal, setModal] = useState<{ docente: Docente | null } | null>(null);
    const [porEliminar, setPorEliminar] = useState<Docente | null>(null);
    const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
    const [objetivoId, setObjetivoId] = useState<string | null>(null);

    const handleDocenteClick = (docenteId: string) => {
        seleccionarDocente(docenteSeleccionado === docenteId ? null : docenteId);
    };

    const getTotalHorasDocente = (docenteId: string) => horasPorDocente[docenteId] || 0;

    const getCeldasAsignadas = (docenteId: string) =>
        Object.values(asignaciones).filter((asignado) => asignado === docenteId).length;

    const colorSugerido =
        PALETA_COLORES.find((tono) => !docentes.some((d) => d.color.toLowerCase() === tono.toLowerCase())) ??
        PALETA_COLORES[docentes.length % PALETA_COLORES.length];

    const handleGuardar = async (datos: DocenteInput) => {
        if (modal?.docente) {
            await actualizarDocente(modal.docente.id, datos);
        } else {
            await agregarDocente(datos);
        }
    };

    const handleConfirmarEliminar = async () => {
        if (!porEliminar) return;
        await eliminarDocente(porEliminar.id);
        setPorEliminar(null);
    };

    const handleDragStart = (evento: React.DragEvent, docenteId: string) => {
        evento.dataTransfer.effectAllowed = 'move';
        evento.dataTransfer.setData('text/plain', docenteId);
        setArrastrandoId(docenteId);
    };

    const handleDragOver = (evento: React.DragEvent, docenteId: string) => {
        evento.preventDefault();
        evento.dataTransfer.dropEffect = 'move';
        if (docenteId !== arrastrandoId && objetivoId !== docenteId) {
            setObjetivoId(docenteId);
        }
    };

    const handleDrop = async (evento: React.DragEvent, docenteId: string) => {
        evento.preventDefault();
        const origenId = evento.dataTransfer.getData('text/plain') || arrastrandoId;
        setArrastrandoId(null);
        setObjetivoId(null);
        if (origenId && origenId !== docenteId) {
            await reordenarDocente(origenId, docenteId);
        }
    };

    const handleDragEnd = () => {
        setArrastrandoId(null);
        setObjetivoId(null);
    };

    return (
        <div className="flex h-full flex-col bg-white rounded-lg shadow-lg p-5">
            <div className="mb-4 flex shrink-0 items-center justify-between">
                <h2 className="flex items-center text-xl font-bold text-gray-800">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Docentes
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {docentes.length}
                    </span>
                </h2>
                <button
                    type="button"
                    onClick={() => setModal({ docente: null })}
                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar
                </button>
            </div>

            {!hidratado ? (
                <div className="py-10 text-center text-sm text-gray-500">Cargando docentes…</div>
            ) : docentes.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 py-10 text-center">
                    <p className="text-sm font-medium text-gray-600">No hay docentes registrados</p>
                    <p className="mt-1 text-xs text-gray-400">Usa el botón «Agregar» para crear el primero</p>
                </div>
            ) : (
                <div className="max-h-[70vh] min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {docentes.map((docente, indice) => {
                        const isSelected = docenteSeleccionado === docente.id;
                        const totalHoras = getTotalHorasDocente(docente.id);
                        const esObjetivo = objetivoId === docente.id;
                        const seArrastra = arrastrandoId === docente.id;

                        return (
                            <div
                                key={docente.id}
                                data-docente-id={docente.id}
                                draggable
                                onDragStart={(evento) => handleDragStart(evento, docente.id)}
                                onDragOver={(evento) => handleDragOver(evento, docente.id)}
                                onDrop={(evento) => void handleDrop(evento, docente.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleDocenteClick(docente.id)}
                                className={`
                                    group relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-150
                                    ${isSelected
                                        ? 'border-gray-800 bg-gray-100 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                                    }
                                    ${esObjetivo ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                    ${seArrastra ? 'opacity-40' : ''}
                                `}
                                style={{
                                    borderLeftColor: isSelected ? docente.color : 'transparent',
                                    borderLeftWidth: isSelected ? '4px' : '0px',
                                }}
                            >
                                <div className="flex items-start gap-1.5">
                                    <span
                                        className="mt-1 cursor-grab select-none text-gray-300 transition-colors group-hover:text-gray-500 active:cursor-grabbing"
                                        title="Arrastra para reordenar"
                                        aria-hidden="true"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M7 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                        </svg>
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="h-3 w-3 shrink-0 rounded-full"
                                                style={{ backgroundColor: docente.color }}
                                            />
                                            <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-gray-800 line-clamp-2" title={docente.nombre}>
                                                {docente.nombre}
                                            </p>
                                            {isSelected && (
                                                <svg className="h-4 w-4 shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Seleccionado">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${getNivelBadgeColor(docente.nivel)}`}>
                                                Nivel {docente.nivel}
                                            </span>
                                            <div
                                                className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold ${totalHoras >= LIMITE_HORAS_DOCENTE
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : totalHoras > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                title={totalHoras >= LIMITE_HORAS_DOCENTE ? 'Carga máxima alcanzada' : 'Horas asignadas'}
                                            >
                                                {totalHoras >= LIMITE_HORAS_DOCENTE && '⚠️ '}
                                                {totalHoras}h
                                            </div>
                                        </div>

                                        <div className="mt-1.5 flex items-center justify-between">
                                            <div className="flex items-center gap-0.5 text-gray-400">
                                                <button
                                                    type="button"
                                                    title="Mover arriba"
                                                    aria-label="Mover arriba"
                                                    disabled={indice === 0}
                                                    onClick={(evento) => {
                                                        evento.stopPropagation();
                                                        void moverDocente(docente.id, 'arriba');
                                                    }}
                                                    className="rounded p-0.5 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Mover abajo"
                                                    aria-label="Mover abajo"
                                                    disabled={indice === docentes.length - 1}
                                                    onClick={(evento) => {
                                                        evento.stopPropagation();
                                                        void moverDocente(docente.id, 'abajo');
                                                    }}
                                                    className="rounded p-0.5 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    title="Editar docente"
                                                    aria-label="Editar docente"
                                                    onClick={(evento) => {
                                                        evento.stopPropagation();
                                                        setModal({ docente });
                                                    }}
                                                    className="rounded p-0.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Eliminar docente"
                                                    aria-label="Eliminar docente"
                                                    onClick={(evento) => {
                                                        evento.stopPropagation();
                                                        setPorEliminar(docente);
                                                    }}
                                                    className="rounded p-0.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {docenteSeleccionado && (
                <div className="mt-4 shrink-0 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm font-medium text-blue-800">
                        Docente seleccionado:{' '}
                        <span className="font-bold">
                            {docentes.find((d) => d.id === docenteSeleccionado)?.nombre}
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                        Haz clic en las celdas de la tabla para asignar horas
                    </p>
                </div>
            )}

            {modal && (
                <DocenteFormModal
                    docente={modal.docente}
                    colorInicial={colorSugerido}
                    onCerrar={() => setModal(null)}
                    onGuardar={handleGuardar}
                />
            )}

            {porEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center">
                            <svg className="mr-2 h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Eliminar docente</h3>
                        </div>

                        <p className="mb-3 text-gray-600">
                            ¿Deseas eliminar a{' '}
                            <span className="font-semibold text-gray-800">{porEliminar.nombre}</span>?
                        </p>

                        {getCeldasAsignadas(porEliminar.id) > 0 ? (
                            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-medium text-amber-800">
                                    Este docente tiene {getCeldasAsignadas(porEliminar.id)} celda(s) asignada(s)
                                    ({getTotalHorasDocente(porEliminar.id)}h).
                                </p>
                                <p className="mt-1 text-xs text-amber-700">
                                    Al eliminarlo también se liberarán esas asignaciones.
                                </p>
                            </div>
                        ) : (
                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-800">
                                    <strong>⚠️ Esta acción no se puede deshacer</strong>
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setPorEliminar(null)}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleConfirmarEliminar()}
                                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocentesList;
