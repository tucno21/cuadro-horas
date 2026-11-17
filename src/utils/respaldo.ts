import type { Docente, EstadoAsignacion, Grado, NivelDocente, RespaldoDatos } from '../types';
import { NIVELES, areasCurriculares, gradosPorDefecto } from '../store/asignacionStore';

const FORMATO = 'cuadrohoras-respaldo';
const VERSION = 2;
const COLOR_HEX = /^#[0-9a-fA-F]{6}$/;

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
    typeof valor === 'object' && valor !== null && !Array.isArray(valor);

/** Construye el objeto de respaldo con todos los datos actuales. */
export const crearRespaldo = (
    docentes: Docente[],
    grados: Grado[],
    asignaciones: EstadoAsignacion,
): RespaldoDatos => ({
    formato: FORMATO,
    version: VERSION,
    exportadoEn: new Date().toISOString(),
    docentes: [...docentes]
        .sort((a, b) => a.orden - b.orden)
        .map((docente) => ({ ...docente })),
    grados: [...grados]
        .sort((a, b) => a.orden - b.orden)
        .map((grado) => ({ ...grado })),
    asignaciones: { ...asignaciones },
});

/** Descarga el respaldo como archivo .json */
export const descargarRespaldo = (datos: RespaldoDatos): void => {
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `respaldo_cuadrohoras_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
};

const normalizarAsignaciones = (crudo: unknown): Record<string, string> => {
    const resultado: Record<string, string> = {};

    if (Array.isArray(crudo)) {
        crudo.forEach((item) => {
            if (!esObjeto(item)) return;
            const docenteId = typeof item.docenteId === 'string' ? item.docenteId : '';
            if (!docenteId) return;
            if (typeof item.key === 'string') {
                resultado[item.key] = docenteId;
            } else if (typeof item.areaId === 'string' && typeof item.gradoId === 'string') {
                resultado[`${item.areaId}:${item.gradoId}`] = docenteId;
            }
        });
        return resultado;
    }

    if (esObjeto(crudo)) {
        Object.entries(crudo).forEach(([key, valor]) => {
            if (typeof valor === 'string') resultado[key] = valor;
        });
    }

    return resultado;
};

/**
 * Normaliza los grados del respaldo. Si el archivo no los incluye (respaldos
 * antiguos) o vienen vacíos, se usan los grados por defecto.
 */
const normalizarGrados = (crudo: unknown): Grado[] => {
    if (!Array.isArray(crudo) || crudo.length === 0) {
        return gradosPorDefecto.map((grado) => ({ ...grado }));
    }

    const ids = new Set<string>();
    const nombres = new Set<string>();
    const grados: Grado[] = crudo.map((item, indice) => {
        if (!esObjeto(item)) {
            throw new Error(`El grado #${indice + 1} no tiene un formato válido.`);
        }

        const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : '';
        if (!nombre) {
            throw new Error(`El grado #${indice + 1} no tiene nombre.`);
        }
        if (nombres.has(nombre.toLowerCase())) {
            throw new Error(`El respaldo tiene grados duplicados ("${nombre}").`);
        }
        nombres.add(nombre.toLowerCase());

        let id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `grado-${indice + 1}`;
        if (ids.has(id)) {
            // Id duplicado: se corrige para no perder la columna.
            let sufijo = 2;
            while (ids.has(`${id}-${sufijo}`)) sufijo += 1;
            id = `${id}-${sufijo}`;
        }
        ids.add(id);

        const orden = typeof item.orden === 'number' && Number.isFinite(item.orden) ? item.orden : indice;

        return { id, nombre, orden };
    });

    return grados.sort((a, b) => a.orden - b.orden).map((grado, indice) => ({ ...grado, orden: indice }));
};

/** Valida y normaliza el contenido de un respaldo. Lanza Error con un mensaje entendible. */
export const validarRespaldo = (crudo: unknown): RespaldoDatos => {
    if (!esObjeto(crudo)) {
        throw new Error('El archivo no tiene un formato válido.');
    }
    if (crudo.formato !== FORMATO) {
        throw new Error('El archivo no es un respaldo del Cuadro de Horas. Usa «Exportar respaldo (JSON)».');
    }

    const docentesCrudos = crudo.docentes;
    if (!Array.isArray(docentesCrudos)) {
        throw new Error('El respaldo no contiene la lista de docentes.');
    }

    const ids = new Set<string>();
    const docentes: Docente[] = docentesCrudos.map((item, indice) => {
        if (!esObjeto(item)) {
            throw new Error(`El docente #${indice + 1} no tiene un formato válido.`);
        }

        const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `doc-${indice + 1}`;
        if (ids.has(id)) {
            throw new Error(`El respaldo tiene docentes duplicados (id "${id}").`);
        }
        ids.add(id);

        const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : '';
        if (!nombre) {
            throw new Error(`El docente #${indice + 1} no tiene nombre.`);
        }

        const nivel = typeof item.nivel === 'string' ? item.nivel.toUpperCase() : '';
        if (!NIVELES.includes(nivel as NivelDocente)) {
            throw new Error(`El nivel "${String(item.nivel)}" del docente "${nombre}" no es válido (de I a VIII).`);
        }

        const color = typeof item.color === 'string' && COLOR_HEX.test(item.color) ? item.color : '#3B82F6';
        const orden = typeof item.orden === 'number' && Number.isFinite(item.orden) ? item.orden : indice;

        return { id, nombre, nivel: nivel as NivelDocente, color, orden };
    });

    const grados = normalizarGrados(crudo.grados);

    const clavesValidas = new Set<string>();
    areasCurriculares.forEach((area) => {
        grados.forEach((grado) => clavesValidas.add(`${area.id}:${grado.id}`));
    });

    const asignacionesCrudas = normalizarAsignaciones(crudo.asignaciones);
    const asignaciones: EstadoAsignacion = {};
    Object.entries(asignacionesCrudas).forEach(([key, docenteId]) => {
        if (clavesValidas.has(key) && ids.has(docenteId)) {
            asignaciones[key] = docenteId;
        }
    });

    return {
        formato: FORMATO,
        version: typeof crudo.version === 'number' ? crudo.version : VERSION,
        exportadoEn: typeof crudo.exportadoEn === 'string' ? crudo.exportadoEn : new Date().toISOString(),
        docentes: docentes
            .sort((a, b) => a.orden - b.orden)
            .map((docente, indice) => ({ ...docente, orden: indice })),
        grados,
        asignaciones,
    };
};

/** Lee un archivo JSON elegido por el usuario y devuelve el respaldo validado. */
export const leerRespaldo = async (archivo: File): Promise<RespaldoDatos> => {
    let texto: string;
    try {
        texto = await archivo.text();
    } catch {
        throw new Error('No se pudo leer el archivo seleccionado.');
    }

    let crudo: unknown;
    try {
        crudo = JSON.parse(texto);
    } catch {
        throw new Error('El archivo no contiene JSON válido.');
    }

    return validarRespaldo(crudo);
};
