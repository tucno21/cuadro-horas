import { areasCurriculares } from '../store/asignacionStore';
import type { Docente, Grado } from '../types';
import * as XLSX from 'xlsx';

export interface ExportData {
    fechaExportacion: string;
    docentes: Array<{
        id: string;
        nombre: string;
        nivel: string;
        totalHoras: number;
        asignaciones: Array<{
            area: string;
            grado: string;
            horas: number;
        }>;
    }>;
    resumen: {
        totalHoras: number;
        totalDocentes: number;
        horasPorNivel: Record<string, number>;
    };
}

export const generarDatosExportacion = (
    docentes: Docente[],
    grados: Grado[],
    asignaciones: Record<string, string>,
    horasPorDocente: Record<string, number>,
): ExportData => {
    const docentesConAsignaciones = docentes.map(docente => {
        const totalHoras = horasPorDocente[docente.id] || 0;
        const asignacionesDocente = Object.entries(asignaciones)
            .filter(([, docenteId]) => docenteId === docente.id)
            .map(([key]) => {
                const [areaId, gradoId] = key.split(':');
                const area = areasCurriculares.find(a => a.id === areaId);
                const grado = grados.find(g => g.id === gradoId);
                return {
                    area: area?.nombre || 'Desconocido',
                    grado: grado?.nombre || 'Desconocido',
                    horas: area?.horas || 0,
                };
            });

        return {
            id: docente.id,
            nombre: docente.nombre,
            nivel: docente.nivel,
            totalHoras,
            asignaciones: asignacionesDocente,
        };
    }).filter(docente => docente.totalHoras > 0);

    const totalHoras = Object.values(horasPorDocente).reduce((sum, horas) => sum + horas, 0);

    const horasPorNivel = docentesConAsignaciones.reduce((acc, docente) => {
        acc[docente.nivel] = (acc[docente.nivel] || 0) + docente.totalHoras;
        return acc;
    }, {} as Record<string, number>);

    return {
        fechaExportacion: new Date().toLocaleString('es-PE'),
        docentes: docentesConAsignaciones,
        resumen: {
            totalHoras,
            totalDocentes: docentesConAsignaciones.length,
            horasPorNivel,
        },
    };
};

export const exportarJSON = (data: ExportData): void => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asignacion_horas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportarCSV = (data: ExportData): void => {
    const headers = ['Docente', 'Nivel', 'Área', 'Grado', 'Horas', 'Total Docente'];
    const rows = data.docentes.flatMap(docente =>
        docente.asignaciones.map(asignacion => [
            docente.nombre,
            `Nivel ${docente.nivel}`,
            asignacion.area,
            asignacion.grado,
            asignacion.horas.toString(),
            docente.totalHoras.toString()
        ])
    );

    const csvContent = [
        `Reporte de Asignación de Horas - ${data.fechaExportacion}`,
        '',
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        '',
        'Resumen',
        `Total de Horas Asignadas,${data.resumen.totalHoras}`,
        `Total de Docentes Activos,${data.resumen.totalDocentes}`,
        ...Object.entries(data.resumen.horasPorNivel).map(([nivel, horas]) =>
            `Total Nivel ${nivel},${horas}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asignacion_horas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportarExcel = async (data: ExportData): Promise<void> => {
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const resumenData: (string | number)[][] = [
        ['Reporte de Asignación de Horas'],
        [`Fecha de Exportación: ${data.fechaExportacion}`],
        [],
        ['Resumen General'],
        ['Métrica', 'Valor'],
        ['Total de Horas Asignadas', data.resumen.totalHoras],
        ['Total de Docentes Activos', data.resumen.totalDocentes],
        ...Object.entries(data.resumen.horasPorNivel).map(([nivel, horas]) => [
            `Total Nivel ${nivel}`, String(horas)
        ])
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    // Estilos para el encabezado del resumen
    const headerStyle = {
        font: { bold: true, sz: 14 },
        fill: { fgColor: { rgb: "4CAF50" } },
        alignment: { horizontal: "center" }
    };

    // Aplicar estilos básicos
    const rangeResumen = XLSX.utils.decode_range(wsResumen['!ref'] || 'A1:B1');
    for (let i = rangeResumen.s.r; i <= rangeResumen.e.r; i++) {
        for (let j = rangeResumen.s.c; j <= rangeResumen.e.c; j++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
            if (wsResumen[cellAddress]) {
                if (i === 3) { // Fila de encabezado
                    wsResumen[cellAddress].s = headerStyle;
                }
                if (i === 0) { // Título principal
                    wsResumen[cellAddress].s = {
                        font: { bold: true, sz: 16 },
                        alignment: { horizontal: "center" }
                    };
                }
            }
        }
    }

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2: Detalle de Asignaciones
    const detalleData: (string | number)[][] = [
        ['Detalle de Asignaciones'],
        [],
        ['Docente', 'Nivel', 'Área', 'Grado', 'Horas', 'Total Docente']
    ];

    data.docentes.forEach(docente => {
        docente.asignaciones.forEach((asignacion, index) => {
            detalleData.push([
                index === 0 ? docente.nombre : '',
                index === 0 ? `Nivel ${docente.nivel}` : '',
                asignacion.area,
                asignacion.grado,
                asignacion.horas,
                index === 0 ? docente.totalHoras : ''
            ]);
        });
    });

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);

    // Aplicar estilos a la hoja de detalle
    const rangeDetalle = XLSX.utils.decode_range(wsDetalle['!ref'] || 'A1:F1');
    for (let i = rangeDetalle.s.r; i <= rangeDetalle.e.r; i++) {
        for (let j = rangeDetalle.s.c; j <= rangeDetalle.e.c; j++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
            if (wsDetalle[cellAddress]) {
                if (i === 2) { // Fila de encabezado
                    wsDetalle[cellAddress].s = headerStyle;
                }
                if (i === 0) { // Título principal
                    wsDetalle[cellAddress].s = {
                        font: { bold: true, sz: 16 },
                        alignment: { horizontal: "center" }
                    };
                }
            }
        }
    }

    // Ajustar anchos de columna
    const colWidths = [
        { wch: 30 }, // Docente
        { wch: 12 }, // Nivel
        { wch: 25 }, // Área
        { wch: 10 }, // Grado
        { wch: 8 },  // Horas
        { wch: 12 }  // Total Docente
    ];
    wsDetalle['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    // Generar y descargar el archivo
    const excelBuffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
    });

    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asignacion_horas_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
