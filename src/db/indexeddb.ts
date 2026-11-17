import type { Docente, EstadoAsignacion, Grado } from '../types';

/**
 * Capa de acceso a IndexedDB.
 *
 * Base de datos: `cuadrohoras` (versión 2)
 *  - docentes:      registros completos del docente, clave `id`, índice `orden`.
 *  - grados:        grados/secciones (1A, 1B, …), clave `id`, índice `orden`.
 *  - asignaciones:  una fila por celda asignada, clave `areaId:gradoId`.
 *  - meta:          valores sueltos de la app (docente seleccionado, flags).
 */

const NOMBRE_DB = 'cuadrohoras';
const VERSION_DB = 2;

type Almacen = 'docentes' | 'grados' | 'asignaciones' | 'meta';

interface RegistroAsignacion {
    key: string;
    docenteId: string;
}

interface RegistroMeta {
    key: string;
    valor: string | null;
}

let promesaDB: Promise<IDBDatabase> | null = null;

export const indexedDBSoportado = (): boolean => typeof indexedDB !== 'undefined';

const abrirDB = (): Promise<IDBDatabase> => {
    if (!indexedDBSoportado()) {
        return Promise.reject(new Error('IndexedDB no está disponible en este navegador.'));
    }
    if (promesaDB) return promesaDB;

    promesaDB = new Promise<IDBDatabase>((resolve, reject) => {
        const solicitud = indexedDB.open(NOMBRE_DB, VERSION_DB);

        solicitud.onupgradeneeded = () => {
            const db = solicitud.result;
            if (!db.objectStoreNames.contains('docentes')) {
                const docentes = db.createObjectStore('docentes', { keyPath: 'id' });
                docentes.createIndex('orden', 'orden', { unique: false });
            }
            if (!db.objectStoreNames.contains('grados')) {
                const grados = db.createObjectStore('grados', { keyPath: 'id' });
                grados.createIndex('orden', 'orden', { unique: false });
            }
            if (!db.objectStoreNames.contains('asignaciones')) {
                db.createObjectStore('asignaciones', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta', { keyPath: 'key' });
            }
        };

        solicitud.onsuccess = () => resolve(solicitud.result);
        solicitud.onerror = () => {
            promesaDB = null;
            reject(solicitud.error ?? new Error('No se pudo abrir la base de datos.'));
        };
        solicitud.onblocked = () => {
            console.warn('IndexedDB está bloqueada: cierra otras pestañas de la aplicación.');
        };
    });

    return promesaDB;
};

const leerTodo = async <T>(almacen: Almacen): Promise<T[]> => {
    const db = await abrirDB();
    return new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(almacen, 'readonly');
        const peticion = tx.objectStore(almacen).getAll();
        peticion.onsuccess = () => resolve(peticion.result as T[]);
        peticion.onerror = () => reject(peticion.error ?? new Error('Error de lectura en IndexedDB.'));
    });
};

const leerUno = async <T>(almacen: Almacen, clave: IDBValidKey): Promise<T | undefined> => {
    const db = await abrirDB();
    return new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(almacen, 'readonly');
        const peticion = tx.objectStore(almacen).get(clave);
        peticion.onsuccess = () => resolve(peticion.result as T | undefined);
        peticion.onerror = () => reject(peticion.error ?? new Error('Error de lectura en IndexedDB.'));
    });
};

const escribir = async (almacen: Almacen, acciones: (store: IDBObjectStore) => void): Promise<void> => {
    const db = await abrirDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(almacen, 'readwrite');
        acciones(tx.objectStore(almacen));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('Error de escritura en IndexedDB.'));
        tx.onabort = () => reject(tx.error ?? new Error('Transacción cancelada.'));
    });
};

/* ------------------------------- Docentes ------------------------------- */

export const obtenerDocentesDB = async (): Promise<Docente[]> => {
    const docentes = await leerTodo<Docente>('docentes');
    return docentes.sort((a, b) => a.orden - b.orden);
};

export const guardarDocentesDB = (docentes: Docente[]): Promise<void> =>
    escribir('docentes', (store) => {
        docentes.forEach((docente) => store.put(docente));
    });

export const eliminarDocenteDB = (id: string): Promise<void> =>
    escribir('docentes', (store) => {
        store.delete(id);
    });

/** Reemplaza por completo la tabla de docentes (usado al importar un respaldo). */
export const reemplazarDocentesDB = (docentes: Docente[]): Promise<void> =>
    escribir('docentes', (store) => {
        store.clear();
        docentes.forEach((docente) => store.put(docente));
    });

/* -------------------------------- Grados -------------------------------- */

export const obtenerGradosDB = async (): Promise<Grado[]> => {
    const grados = await leerTodo<Grado>('grados');
    return grados.sort((a, b) => a.orden - b.orden);
};

export const guardarGradosDB = (grados: Grado[]): Promise<void> =>
    escribir('grados', (store) => {
        grados.forEach((grado) => store.put(grado));
    });

export const eliminarGradoDB = (id: string): Promise<void> =>
    escribir('grados', (store) => {
        store.delete(id);
    });

/** Reemplaza por completo la tabla de grados (usado al importar un respaldo). */
export const reemplazarGradosDB = (grados: Grado[]): Promise<void> =>
    escribir('grados', (store) => {
        store.clear();
        grados.forEach((grado) => store.put(grado));
    });

/* ----------------------------- Asignaciones ----------------------------- */

export const obtenerAsignacionesDB = async (): Promise<EstadoAsignacion> => {
    const registros = await leerTodo<RegistroAsignacion>('asignaciones');
    return registros.reduce<EstadoAsignacion>((acc, registro) => {
        acc[registro.key] = registro.docenteId;
        return acc;
    }, {});
};

export const guardarAsignacionDB = (key: string, docenteId: string): Promise<void> =>
    escribir('asignaciones', (store) => {
        store.put({ key, docenteId } satisfies RegistroAsignacion);
    });

export const eliminarAsignacionesDB = (keys: string[]): Promise<void> =>
    escribir('asignaciones', (store) => {
        keys.forEach((key) => store.delete(key));
    });

export const reemplazarAsignacionesDB = (asignaciones: EstadoAsignacion): Promise<void> =>
    escribir('asignaciones', (store) => {
        store.clear();
        Object.entries(asignaciones).forEach(([key, docenteId]) => {
            store.put({ key, docenteId } satisfies RegistroAsignacion);
        });
    });

export const vaciarAsignacionesDB = (): Promise<void> =>
    escribir('asignaciones', (store) => {
        store.clear();
    });

/* --------------------------------- Meta --------------------------------- */

export const obtenerMetaDB = async (key: string): Promise<string | null> => {
    const registro = await leerUno<RegistroMeta>('meta', key);
    return registro?.valor ?? null;
};

export const guardarMetaDB = (key: string, valor: string | null): Promise<void> =>
    escribir('meta', (store) => {
        store.put({ key, valor } satisfies RegistroMeta);
    });
