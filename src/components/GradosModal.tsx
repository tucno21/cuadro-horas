import React, { useEffect, useState } from 'react';
import { useAsignacionStore } from '../store/asignacionStore';
import type { Grado } from '../types';

interface GradosModalProps {
    onCerrar: () => void;
}

const GradosModal: React.FC<GradosModalProps> = ({ onCerrar }) => {
    const { grados, asignaciones, agregarGrado, actualizarGrado, eliminarGrado } = useAsignacionStore();

    const [nombreNuevo, setNombreNuevo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [nombreEdicion, setNombreEdicion] = useState('');
    const [porEliminar, setPorEliminar] = useState<Grado | null>(null);

    useEffect(() => {
        const alPresionarTecla = (evento: KeyboardEvent) => {
            if (evento.key !== 'Escape') return;
            if (porEliminar) setPorEliminar(null);
            else onCerrar();
        };
        window.addEventListener('keydown', alPresionarTecla);
        return () => window.removeEventListener('keydown', alPresionarTecla);
    }, [onCerrar, porEliminar]);

    const celdasAsignadas = (gradoId: string) =>
        Object.keys(asignaciones).filter((key) => key.split(':')[1] === gradoId).length;

    const handleAgregar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        const nombre = nombreNuevo.trim();
        if (!nombre) {
            setError('Escribe el nombre del grado o sección (por ejemplo, 1A).');
            return;
        }

        setError(null);
        setGuardando(true);
        try {
            const creado = await agregarGrado({ nombre });
            if (creado) {
                setNombreNuevo('');
            } else {
                setError('No se pudo agregar: revisa que el nombre no esté vacío ni repetido.');
            }
        } finally {
            setGuardando(false);
        }
    };

    const iniciarEdicion = (grado: Grado) => {
        setError(null);
        setEditandoId(grado.id);
        setNombreEdicion(grado.nombre);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setNombreEdicion('');
    };

    const handleGuardarEdicion = async (id: string) => {
        const nombre = nombreEdicion.trim();
        if (!nombre) {
            setError('El nombre del grado o sección no puede quedar vacío.');
            return;
        }

        setError(null);
        setGuardando(true);
        try {
            const actualizado = await actualizarGrado(id, { nombre });
            if (actualizado) {
                cancelarEdicion();
            } else {
                setError('No se pudo guardar: revisa que el nombre no esté repetido.');
            }
        } finally {
            setGuardando(false);
        }
    };

    const handleConfirmarEliminar = async () => {
        if (!porEliminar) return;
        setGuardando(true);
        try {
            await eliminarGrado(porEliminar.id);
            setPorEliminar(null);
            if (editandoId === porEliminar.id) cancelarEdicion();
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Grados y secciones</h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Cada grado es una columna de la tabla de distribución.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Cerrar"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleAgregar} className="border-b border-gray-100 px-5 py-4">
                    <label htmlFor="grado-nombre" className="mb-1 block text-sm font-medium text-gray-700">
                        Nuevo grado o sección
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="grado-nombre"
                            type="text"
                            value={nombreNuevo}
                            onChange={(evento) => setNombreNuevo(evento.target.value)}
                            placeholder="1A, 1B, 2A…"
                            autoFocus
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                            type="submit"
                            disabled={guardando}
                            aria-label="Agregar grado"
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                </form>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {grados.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                            <p className="text-sm font-medium text-gray-600">No hay grados registrados</p>
                            <p className="mt-1 text-xs text-gray-400">Agrega el primero con el formulario de arriba</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {grados.map((grado) => {
                                const enEdicion = editandoId === grado.id;
                                const celdas = celdasAsignadas(grado.id);

                                return (
                                    <li
                                        key={grado.id}
                                        data-grado-id={grado.id}
                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                                    >
                                        {enEdicion ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={nombreEdicion}
                                                    onChange={(evento) => setNombreEdicion(evento.target.value)}
                                                    onKeyDown={(evento) => {
                                                        if (evento.key === 'Enter') {
                                                            evento.preventDefault();
                                                            void handleGuardarEdicion(grado.id);
                                                        }
                                                        if (evento.key === 'Escape') {
                                                            evento.stopPropagation();
                                                            cancelarEdicion();
                                                        }
                                                    }}
                                                    autoFocus
                                                    aria-label={`Nombre del grado ${grado.nombre}`}
                                                    className="min-w-0 flex-1 rounded-lg border border-blue-300 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => void handleGuardarEdicion(grado.id)}
                                                    disabled={guardando}
                                                    aria-label="Guardar grado"
                                                    className="shrink-0 rounded-md bg-green-500 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:bg-green-300"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelarEdicion}
                                                    aria-label="Cancelar edición"
                                                    className="shrink-0 rounded-md bg-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">
                                                    {grado.nombre}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-800" title={grado.nombre}>
                                                        {grado.nombre}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {celdas === 0
                                                            ? 'Sin celdas asignadas'
                                                            : `${celdas} ${celdas === 1 ? 'celda asignada' : 'celdas asignadas'}`}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => iniciarEdicion(grado)}
                                                    aria-label="Editar grado"
                                                    className="shrink-0 rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPorEliminar(grado)}
                                                    aria-label="Eliminar grado"
                                                    className="shrink-0 rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
                    <p className="text-xs text-gray-500">
                        {grados.length} {grados.length === 1 ? 'grado' : 'grados'} en total
                    </p>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Confirmación para eliminar */}
            {porEliminar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center">
                            <svg className="mr-2 h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Eliminar grado</h3>
                        </div>

                        <p className="text-sm text-gray-600">
                            ¿Eliminar <strong>{porEliminar.nombre}</strong> de la tabla? Las celdas asignadas a este
                            grado también se eliminarán.
                        </p>

                        {celdasAsignadas(porEliminar.id) > 0 && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                Se {celdasAsignadas(porEliminar.id) === 1 ? 'quitará 1 celda asignada' : `quitarán ${celdasAsignadas(porEliminar.id)} celdas asignadas`} y sus horas.
                            </div>
                        )}

                        <div className="mt-5 flex gap-3">
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
                                disabled={guardando}
                                aria-label="Confirmar eliminación"
                                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
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

export default GradosModal;
