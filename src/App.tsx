import React from 'react';
import DocentesList from './components/DocentesList';
import DistribucionTable from './components/DistribucionTable';
import ResumenHoras from './components/ResumenHoras';
import ExportButton from './components/ExportButton';
import { useAsignacionStore } from './store/asignacionStore';

const App: React.FC = () => {
  const { cargarDesdeLocalStorage } = useAsignacionStore();

  // Cargar datos desde localStorage al iniciar
  React.useEffect(() => {
    cargarDesdeLocalStorage();
  }, [cargarDesdeLocalStorage]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Asignación de Horas Docentes
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión de distribución de áreas curriculares por grados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-2 md:px-3 py-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Panel izquierdo - Lista de Docentes */}
          <div className="md:col-span-3 shadow-xl border border-gray-300 rounded-lg">
            <div className="h-full">
              <DocentesList />
            </div>
          </div>

          {/* Panel central - Tabla de Distribución */}
          <div className="md:col-span-6 shadow-xl border-gray-300 rounded-lg">
            <div className="h-full">
              <DistribucionTable />
            </div>
          </div>

          {/* Panel derecho - Resumen y Acciones */}
          <div className="md:col-span-3 space-y-6 shadow-xl border-gray-300 rounded-lg">
            <div className="h-full">
              <ResumenHoras />
            </div>
            <ExportButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Sistema de Asignación de Horas Docentes © 2024</p>
            <p className="text-xs mt-1">
              Los datos se guardan automáticamente en tu navegador
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
