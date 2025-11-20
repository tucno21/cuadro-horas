import { docentes, areasCurriculares, grados } from '../store/asignacionStore';

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

export const generarDatosExportacion = (asignaciones: Record<string, string>, horasPorDocente: Record<string, number>): ExportData => {
    const docentesConAsignaciones = docentes.map(docente => {
        const totalHoras = horasPorDocente[docente.id] || 0;
        const asignacionesDocente = Object.entries(asignaciones)
            .filter(([_, docenteId]) => docenteId === docente.id)
            .map(([key, _]) => {
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
    // Crear contenido HTML para Excel
    const tableContent = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { background-color: #4CAF50; color: white; text-align: center; }
                .resumen { background-color: #e8f5e8; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Reporte de Asignación de Horas</h1>
            <p><strong>Fecha de Exportación:</strong> ${data.fechaExportacion}</p>
            
            <h2>Resumen General</h2>
            <table>
                <tr class="header">
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
                <tr>
                    <td>Total de Horas Asignadas</td>
                    <td>${data.resumen.totalHoras}</td>
                </tr>
                <tr>
                    <td>Total de Docentes Activos</td>
                    <td>${data.resumen.totalDocentes}</td>
                </tr>
                ${Object.entries(data.resumen.horasPorNivel).map(([nivel, horas]) =>
        `<tr><td>Total Nivel ${nivel}</td><td>${horas}</td></tr>`
    ).join('')}
            </table>

            <h2>Detalle de Asignaciones</h2>
            <table>
                <tr class="header">
                    <th>Docente</th>
                    <th>Nivel</th>
                    <th>Área</th>
                    <th>Grado</th>
                    <th>Horas</th>
                    <th>Total Docente</th>
                </tr>
                ${data.docentes.flatMap(docente =>
        docente.asignaciones.map((asignacion, index) => `
                        <tr>
                            <td>${index === 0 ? docente.nombre : ''}</td>
                            <td>${index === 0 ? `Nivel ${docente.nivel}` : ''}</td>
                            <td>${asignacion.area}</td>
                            <td>${asignacion.grado}</td>
                            <td>${asignacion.horas}</td>
                            <td>${index === 0 ? docente.totalHoras : ''}</td>
                        </tr>
                    `).join('')
    ).join('')}
            </table>
        </body>
        </html>
    `;

    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asignacion_horas_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
