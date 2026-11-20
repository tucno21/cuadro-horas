import React, { useEffect } from 'react';

interface NormativaModalProps {
    onCerrar: () => void;
}

const TablaPlanEstudios: React.FC = () => {
    const filas: Array<{ area: string; horas: number[] }> = [
        { area: 'Matemática', horas: [6, 6, 6, 6, 6] },
        { area: 'Comunicación', horas: [5, 5, 5, 5, 5] },
        { area: 'Inglés', horas: [5, 5, 5, 5, 5] },
        { area: 'Arte y Cultura', horas: [2, 2, 2, 2, 2] },
        { area: 'Ciencias Sociales', horas: [4, 4, 4, 4, 4] },
        { area: 'Desarrollo Personal, Ciudadanía y Cívica', horas: [4, 4, 4, 4, 4] },
        { area: 'Educación Física', horas: [2, 2, 2, 2, 2] },
        { area: 'Educación Religiosa', horas: [2, 2, 2, 2, 2] },
        { area: 'Ciencia y Tecnología', horas: [5, 5, 5, 5, 5] },
        { area: 'Educación para el Trabajo', horas: [8, 8, 8, 8, 8] },
        { area: 'Tutoría y Orientación Educativa', horas: [2, 2, 2, 2, 2] },
    ];

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Áreas curriculares</th>
                        {['1.º', '2.º', '3.º', '4.º', '5.º'].map((grado) => (
                            <th key={grado} className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                {grado}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {filas.map((fila) => (
                        <tr key={fila.area}>
                            <td className="px-3 py-1.5 text-gray-800">{fila.area}</td>
                            {fila.horas.map((hora, i) => (
                                <td key={i} className="px-3 py-1.5 text-center text-gray-700">
                                    {hora}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="bg-blue-50 font-semibold text-gray-900">
                        <td className="px-3 py-1.5">Total de horas</td>
                        {[45, 45, 45, 45, 45].map((total, i) => (
                            <td key={i} className="px-3 py-1.5 text-center">
                                {total}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const TablaJornadaLaboral: React.FC<{ titulo: string; filas: number[][]; }> = ({ titulo, filas }) => {
    const encabezados = [
        'Sesiones de aprendizaje',
        'Trabajo colegiado de área curricular',
        'Trabajo colegiado de tutoría',
        'Atención a estudiantes y familias',
        'Elaboración/reajuste de materiales educativos y otras actividades',
        'Total',
    ];

    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-700">{titulo}</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {encabezados.map((encabezado) => (
                                <th
                                    key={encabezado}
                                    className="px-2.5 py-2 text-center text-[11px] font-semibold text-gray-600"
                                >
                                    {encabezado}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filas.map((fila, i) => (
                            <tr key={i}>
                                {fila.map((celda, j) => (
                                    <td
                                        key={j}
                                        className={`px-2.5 py-1.5 text-center ${
                                            j === fila.length - 1
                                                ? 'bg-blue-50 font-semibold text-gray-900'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {celda}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/**
 * Modal con el resumen técnico de la RVM N.° 184-2026-MINEDU
 * (cuadro de distribución de horas pedagógicas, IIEE JEC-SFT).
 */
const NormativaModal: React.FC<NormativaModalProps> = ({ onCerrar }) => {
    useEffect(() => {
        const alPresionarTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') onCerrar();
        };
        window.addEventListener('keydown', alPresionarTecla);
        return () => window.removeEventListener('keydown', alPresionarTecla);
    }, [onCerrar]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-lg bg-blue-50 p-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Normativa: RVM N.° 184-2026-MINEDU
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Cuadro de distribución de horas pedagógicas — Institución Educativa JEC-SFT
                            </p>
                        </div>
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

                {/* Contenido */}
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
                    {/* 1. Comité de la IE */}
                    <section>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">1</span>
                            Conformación del comité de la institución educativa
                        </h4>
                        <div className="space-y-2.5 pl-8 text-sm text-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.3.1 — Comité de Gestión de Condiciones Operativas</p>
                                <p className="mt-0.5">
                                    Es el encargado de formular y proponer el cuadro de distribución de horas
                                    pedagógicas de la IE. Debe estar reconocido por resolución suscrita por el
                                    director de la IE.
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.3.1.1 — Integrantes (EBR secundaria JER, JEC, JEC EIB, SFT, EIB y EIB FT)</p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                    <li>Director de la IE, quien la preside.</li>
                                    <li>Un subdirector (mayor escala magisterial; actúa como secretario; en igualdad, mayor tiempo de servicios oficiales en la IE).</li>
                                    <li>Un representante del personal docente, elegido por votación entre profesores nombrados o contratados; la elección se registra en un acta.</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                                <p className="text-xs text-blue-900">
                                    <strong>Numeral 5.3.1.2:</strong> si la IE no cuenta con plaza de subdirector o
                                    jerárquica, el comité se conforma como mínimo por el director y un representante
                                    del personal docente nombrado. De no contar con dicho personal, el comité de la
                                    UGEL elabora el cuadro de dicha IE.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Plan de estudios JEC-SFT */}
                    <section>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">2</span>
                            Plan de estudios correspondiente a JEC-SFT
                        </h4>
                        <div className="space-y-3 pl-8 text-sm text-gray-700">
                            <div>
                                <p className="mb-1.5 font-semibold text-gray-800">
                                    Numeral 6.1.2, literal b) — Cuadro N.° 08: Plan de estudios de IIEE con JEC-SFT
                                </p>
                                <TablaPlanEstudios />
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.5.12 — Distribución de EPT:</strong> en las IIEE de SFT, la
                                    elaboración del horario escolar debe iniciar distribuyendo las ocho (08) horas de
                                    Educación para el Trabajo, para garantizar el uso óptimo de los talleres de
                                    especialidades técnicas durante la semana.
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.5.13 — Bloques de horas de EPT:</strong> las ocho (08) horas
                                    semanales se distribuyen en dos (02) bloques (4 y 4, 6 y 2, o 5 y 3 horas
                                    pedagógicas, o viceversa). No se admiten otros tipos de distribución.
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.5.20, literal b) — Desdoblamiento:</strong> las IIEE de SFT
                                    podrán desdoblar una sección regular en dos secciones técnicas, en tanto cuenten
                                    con presupuesto (plazas y/o bolsa de horas asignados en el Nexus).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Prelación */}
                    <section>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">3</span>
                            Prelación para la distribución y asignación de horas
                        </h4>
                        <div className="space-y-2.5 pl-8 text-sm text-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.4.4 — Orden de distribución de la carga horaria</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Para EBR secundaria (JER, SFT, JEC y CRFA) y CEBA avanzado:
                                </p>
                                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                                    <li>Director (designado/encargado) de la IE, siempre que le corresponda.</li>
                                    <li>Plazas jerárquicas.</li>
                                    <li>Plaza de profesor nombrado (agrupado por área curricular según numeral 5.5.4).</li>
                                    <li>Plazas vacantes de cargo de profesor.</li>
                                    <li>Bolsa de horas.</li>
                                </ol>
                                <p className="mt-1 text-xs text-gray-500">
                                    Solo el comité de cuadro de horas de la IE o, en su defecto, el de la UGEL, puede
                                    determinar la composición de horas sobre plazas vacantes y/o bolsa de horas.
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.4.5 — Prelación para elección de horas (profesores nombrados)</p>
                                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                                    <li>Mayor escala magisterial.</li>
                                    <li>Tiempo de servicios efectivos en la CPM.</li>
                                    <li>Mayor tiempo de servicios en la IE y cargo donde labora en condición de titular.</li>
                                    <li>De persistir el empate, antigüedad del título de los profesores.</li>
                                </ol>
                                <p className="mt-1 text-xs text-red-600">
                                    El director/subdirector debe respetar las horas elegidas por el profesor; su
                                    incumplimiento genera responsabilidad administrativa.
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.5.3.1 — Orden de prelación para asignación de horas (EBR secundaria: JER, SFT, JEC, SRE y EIB)</p>
                                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                                    <li>Escala magisterial.</li>
                                    <li>Tiempo de servicios oficiales como profesor en la IE, en el área curricular y en la especialidad técnica correspondiente.</li>
                                    <li>Tiempo de servicios oficiales como profesor en la carrera pública magisterial.</li>
                                    <li>Dominio de la lengua originaria (en las IIEE de la EIB).</li>
                                    <li>Antigüedad de la emisión del título pedagógico con el cual se produjo su nombramiento.</li>
                                </ol>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.5.4 — Completar horas de dictado:</strong> para completar sus
                                    horas (12, 24, 25 o 26), el profesor debe acreditar experiencia o especialización
                                    en otra área curricular/campo de conocimiento, respetando el plan de estudios. El
                                    comité de la IE verifica y asigna la carga horaria.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Tutoría */}
                    <section>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">4</span>
                            Asignación de horas de Tutoría y Orientación Educativa
                        </h4>
                        <div className="space-y-2.5 pl-8 text-sm text-gray-700">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.1.6:</strong> los profesores nombrados pueden consignar, junto
                                    a su área curricular, entre 02 y 04 horas de Tutoría y Orientación Educativa.
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 5.1.12:</strong> es posible asignar horas de Tutoría a un
                                    contrato de bolsa de horas, según la composición de cada cuadro de horas.
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 5.5.19 — Disposiciones para IIEE JEC (coordinaciones)</p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                    <li>El director (designado/encargado) no asume horas pedagógicas para sesiones de aprendizaje, excepto directores por encargo de funciones.</li>
                                    <li>El profesor nombrado que asuma funciones de coordinador pedagógico o de tutoría conserva el área curricular de su jornada como profesor.</li>
                                    <li>Las 12 horas liberadas por la encargatura se registran el siguiente año en el Nexus.</li>
                                    <li>Para la encargatura se sugiere considerar profesores con 24 horas pedagógicas asignadas.</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 6.2.9, literal b) — Trabajo colegiado de tutoría:</strong> si se
                                    cuenta con dos (02) horas, estas deben desarrollarse de manera consecutiva.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Jornada laboral */}
                    <section>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">5</span>
                            Cantidad de horas de la jornada laboral docente
                        </h4>
                        <div className="space-y-3 pl-8 text-sm text-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 6.2.4 — Jornada de profesores nombrados JEC</p>
                                <p className="mt-0.5">Jornada laboral de treinta y dos (32) horas semanal-mensual:</p>
                                <div className="mt-1.5">
                                    <TablaJornadaLaboral
                                        titulo="Cuadro N.° 22: actividades extracurriculares con profesores nombrados"
                                        filas={[
                                            [24, 2, 2, 2, 2, 32],
                                            [25, 2, 2, 1, 2, 32],
                                            [26, 2, 2, 1, 1, 32],
                                        ]}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Numeral 6.2.5 — Jornada de plazas orgánicas vacantes y eventuales en JEC</p>
                                <p className="mt-0.5">Jornada laboral de treinta (30) horas pedagógicas semanal-mensual:</p>
                                <div className="mt-1.5">
                                    <TablaJornadaLaboral
                                        titulo="Cuadro N.° 23: actividades extracurriculares con plazas vacantes"
                                        filas={[
                                            [24, 2, 1, 1, 2, 30],
                                            [25, 2, 1, 1, 1, 30],
                                            [26, 2, 1, 1, 0, 30],
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 6.2.6 — Alcance:</strong> la jornada laboral es de alcance para
                                    plazas orgánicas vacantes y eventuales, exceptuando las horas generadas por
                                    diferencia del plan de estudios (bolsa de horas).
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-800">
                                    <strong>Numeral 6.2.8 — Horas extracurriculares adicionales:</strong> la UGEL
                                    y/o DRE debe expedir la resolución de reconocimiento de dos (02) horas
                                    extracurriculares en un plazo no mayor a 15 días hábiles; el responsable de
                                    planillas las registra en el SUP para su pago.
                                </p>
                            </div>
                        </div>
                    </section>

                    <p className="border-t border-gray-200 pt-3 text-[11px] italic text-gray-400">
                        Fuente: Resolución Viceministerial N.° 184-2026-MINEDU — Norma técnica «Procedimientos para la
                        aprobación de los cuadros de distribución de horas pedagógicas en instituciones educativas
                        públicas».
                    </p>
                </div>

                {/* Pie */}
                <div className="flex items-center justify-end border-t border-gray-200 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NormativaModal;
