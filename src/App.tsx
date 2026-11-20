import React from 'react';
import DocentesList from './components/DocentesList';
import DistribucionTable from './components/DistribucionTable';
import ResumenHoras from './components/ResumenHoras';
import ExportButton from './components/ExportButton';
import NormativaModal from './components/NormativaModal';
import Toast from './components/Toast';
import { useAsignacionStore } from './store/asignacionStore';

const App: React.FC = () => {
  const { inicializar, error, limpiarError } = useAsignacionStore();
  const [mostrarNormativa, setMostrarNormativa] = React.useState(false);

  // Cargar los datos guardados en IndexedDB al iniciar
  React.useEffect(() => {
    void inicializar();
  }, [inicializar]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:h-screen md:overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-500 rounded-lg p-1.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">
                  Sistema de Asignación de Horas Docentes
                </h1>
                <p className="hidden md:block text-xs text-gray-500 leading-tight">
                  Gestión de distribución de áreas curriculares por grados
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden text-xs text-gray-500 xl:block">
                {new Date().toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <button
                type="button"
                onClick={() => setMostrarNormativa(true)}
                aria-haspopup="dialog"
                title="Normativa: RVM N.° 184-2026-MINEDU"
                aria-label="Ver normativa del cuadro de horas"
                className="flex items-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-blue-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
              <ExportButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex w-full flex-col mx-auto min-h-0 flex-1 px-2 md:px-3 py-2 md:overflow-hidden">
        {error && (
          <div className="mb-2 shrink-0 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-2 text-sm text-red-800">
              <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong className="block">No se pudieron guardar los cambios</strong>
                {error}
              </span>
            </div>
            <button
              type="button"
              onClick={limpiarError}
              className="rounded p-1 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"
              aria-label="Cerrar aviso"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="grid flex-1 min-h-0 grid-cols-1 items-start gap-3 md:grid-cols-[minmax(200px,22%)_minmax(0,1fr)_minmax(240px,27%)] md:items-stretch md:grid-rows-[minmax(0,1fr)]">
          {/* Panel izquierdo - Lista de Docentes */}
          <div className="md:min-h-0 md:overflow-hidden">
            <DocentesList />
          </div>

          {/* Panel central - Tabla de Distribución */}
          <div className="md:min-h-0 md:overflow-hidden">
            <DistribucionTable />
          </div>

          {/* Panel derecho - Resumen */}
          <div className="md:min-h-0 md:overflow-hidden">
            <ResumenHoras />
          </div>
        </div>
      </main>

      <Toast />

      {/* Modal de normativa */}
      {mostrarNormativa && <NormativaModal onCerrar={() => setMostrarNormativa(false)} />}
    </div>
  );
};

export default App;
