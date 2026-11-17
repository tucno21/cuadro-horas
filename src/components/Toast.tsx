import React, { useEffect } from 'react';
import { useAsignacionStore } from '../store/asignacionStore';
import type { TipoToast } from '../types';

const ESTILOS: Record<TipoToast, { caja: string; icono: string; trazo: string }> = {
    error: {
        caja: 'border-red-300 bg-red-50 text-red-800',
        icono: 'text-red-500',
        trazo: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    exito: {
        caja: 'border-green-300 bg-green-50 text-green-800',
        icono: 'text-green-500',
        trazo: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    info: {
        caja: 'border-blue-300 bg-blue-50 text-blue-800',
        icono: 'text-blue-500',
        trazo: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
};

const Toast: React.FC = () => {
    const { toast, cerrarToast } = useAsignacionStore();

    useEffect(() => {
        if (!toast) return;
        const temporizador = window.setTimeout(cerrarToast, toast.tipo === 'error' ? 6000 : 4000);
        return () => window.clearTimeout(temporizador);
    }, [toast, cerrarToast]);

    if (!toast) return null;

    const estilo = ESTILOS[toast.tipo];

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-xl ${estilo.caja}`}
        >
            <svg className={`mt-0.5 h-5 w-5 shrink-0 ${estilo.icono}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={estilo.trazo} />
            </svg>
            <p className="text-sm font-medium leading-snug">{toast.mensaje}</p>
            <button
                type="button"
                onClick={cerrarToast}
                className="ml-1 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label="Cerrar aviso"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
