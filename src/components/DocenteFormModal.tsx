import React, { useEffect, useState } from 'react';
import type { Docente, DocenteInput, NivelDocente } from '../types';
import { NIVELES, PALETA_COLORES } from '../store/asignacionStore';

interface DocenteFormModalProps {
    /** Docente a editar. `null` para crear uno nuevo. */
    docente: Docente | null;
    /** Color propuesto al crear un docente. */
    colorInicial: string;
    onCerrar: () => void;
    onGuardar: (datos: DocenteInput) => Promise<void>;
}

const DocenteFormModal: React.FC<DocenteFormModalProps> = ({ docente, colorInicial, onCerrar, onGuardar }) => {
    const [nombre, setNombre] = useState(docente?.nombre ?? '');
    const [nivel, setNivel] = useState<NivelDocente>(docente?.nivel ?? 'I');
    const [color, setColor] = useState(docente?.color ?? colorInicial);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const alPresionarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') onCerrar();
        };
        window.addEventListener('keydown', alPresionarTecla);
        return () => window.removeEventListener('keydown', alPresionarTecla);
    }, [onCerrar]);

    const handleSubmit = async (evento: React.FormEvent) => {
        evento.preventDefault();
        const nombreLimpio = nombre.trim();

        if (!nombreLimpio) {
            setError('El nombre del docente es obligatorio.');
            return;
        }

        setError(null);
        setGuardando(true);
        try {
            await onGuardar({ nombre: nombreLimpio, nivel, color });
            onCerrar();
        } catch {
            setError('No se pudo guardar el docente. Inténtalo de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    const titulo = docente ? 'Editar docente' : 'Nuevo docente';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
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

                <form onSubmit={handleSubmit} className="px-5 py-4">
                    <div className="mb-4">
                        <label htmlFor="docente-nombre" className="mb-1 block text-sm font-medium text-gray-700">
                            Nombre y apellidos
                        </label>
                        <input
                            id="docente-nombre"
                            type="text"
                            value={nombre}
                            onChange={(evento) => setNombre(evento.target.value)}
                            placeholder="APELLIDOS, Nombres"
                            autoFocus
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="docente-nivel" className="mb-1 block text-sm font-medium text-gray-700">
                            Nivel
                        </label>
                        <select
                            id="docente-nivel"
                            value={nivel}
                            onChange={(evento) => setNivel(evento.target.value as NivelDocente)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            {NIVELES.map((opcion) => (
                                <option key={opcion} value={opcion}>
                                    Nivel {opcion}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <span className="mb-1 block text-sm font-medium text-gray-700">Color</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={color}
                                onChange={(evento) => setColor(evento.target.value)}
                                className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                                aria-label="Elegir color personalizado"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {PALETA_COLORES.map((tono) => {
                                    const activo = tono.toLowerCase() === color.toLowerCase();
                                    return (
                                        <button
                                            key={tono}
                                            type="button"
                                            onClick={() => setColor(tono)}
                                            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                                activo ? 'border-gray-800' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: tono }}
                                            aria-label={`Usar color ${tono}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {guardando ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocenteFormModal;
