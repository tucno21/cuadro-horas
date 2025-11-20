Necesito crear un sistema de asignación de horas para docentes con las siguientes especificaciones:

## Contexto del Proyecto (ya están instados)
- React + TypeScript
- Tailwind CSS para estilos
- Zustand para manejo de estado
- Diseño moderno y responsivo

## Funcionalidades Requeridas

### 1. Estructura de Datos
- **Tabla de Áreas Curriculares**: 11 áreas con sus horas semanales para 8 grados (1A, 1B, 2A, 2B, 3A, 3B, 4U, 5U)
  - Matemática: 6 horas
  - Comunicación: 6 horas
  - Inglés: 5 horas
  - Arte y cultura: 2 horas
  - Ciencias sociales: 4 horas
  - Desarrollo personal, ciudadanía y cívica: 4 horas
  - Educación física: 2 horas
  - Educación religiosa: 2 horas
  - Ciencia y tecnología: 5 horas
  - Educación para el trabajo: 8 horas
  - Tutoría y orientación educativa: 2 horas

- **Lista de Docentes** (13 profesores):
  1. AVILES CONDORI, Teodilo (Nivel IV)
  2. CAVALCANTI TAGUADA, Bertha (Nivel IV)
  3. PINEDA BAÑOS, Edwin (Nivel IV)
  4. SACHA NALVARTE, Edgar (Nivel IV)
  5. TUCNO VASQUEZ, Carlos (Nivel IV)
  6. ACENCIO PICHURI, Liliana Rufina (Nivel IV)
  7. INGA TINCOPA, Mery (Nivel III)
  8. PILCO GUTIERREZ, Ruth Ángela (Nivel II)
  9. HERNANDEZ ALTAMIRANO, Miguel (Nivel II)
  10. VILLANUEVA PARIONA, María Rosa (Nivel I)
  11. RICO TINEO, Eneida Yanett (Nivel I)
  12. YARANGA VARGAS, Milder Julieta (Nivel I)
  13. ACERO NINACONDOR, Dynnik (Nivel I)

### 2. Interfaz de Usuario
- **Layout en una sola vista** dividida en 3 secciones:
  1. **Panel izquierdo**: Lista de docentes con colores distintivos y diferenciados para cada uno
  2. **Panel central**: Tabla de distribución de horas (áreas × grados) - grid interactivo
  3. **Panel derecho**: Resumen de horas asignadas por docente con contador en tiempo real

### 3. Comportamiento Interactivo
- Al seleccionar un docente, queda activo/destacado
- Al hacer clic en una celda de la tabla de distribución:
  - La celda se marca con el color del docente seleccionado
  - Se suma las horas correspondientes al contador del docente
  - Si la celda ya está asignada al mismo docente, se deselecciona y resta las horas
  - Si la celda está asignada a otro docente, mostrar confirmación antes de reasignar
- Indicadores visuales claros: hover effects, estados activos, transiciones suaves

### 4. Gestión de Estado con Zustand
- Store que maneje:
  - Docente actualmente seleccionado
  - Asignaciones de celdas (área + grado → docente)
  - Total de horas por docente
  - Persistencia automática en localStorage en tiempo real

### 5. Persistencia de Datos
- Guardar en localStorage automáticamente cada cambio:
  - Asignaciones de celdas
  - Totales de horas por docente
- Cargar datos al iniciar la aplicación

### 6. Exportación de Datos
- Botón para descargar reporte en formato JSON o Excel con:
  - Nombre del docente
  - Áreas asignadas
  - Grados asignados
  - Total de horas
  - Desglose detallado (área + grado + horas)

### 7. Diseño y UX
- Paleta de colores moderna y profesional
- Colores distintos y armoniosos para cada docente (usar escala de colores predefinida)
- Tabla responsive con scroll si es necesario
- Animaciones suaves (fade, scale) para feedback visual
- Badges para mostrar totales de horas
- Iconos relevantes (Lucide React)
- Sombras, bordes redondeados, espaciado generoso
- Modo claro/oscuro opcional

### 8. Características Adicionales Deseables
- Filtros por nivel docente
- Búsqueda de docentes
- Validación: alertar si un docente excede carga normal
- Botón para resetear todas las asignaciones
- Confirmación antes de resetear
- Toast notifications para feedback de acciones

## Estructura de Archivos Sugerida
```
src/
├── components/
│   ├── DocentesList.tsx
│   ├── DistribucionTable.tsx
│   ├── ResumenHoras.tsx
│   └── ExportButton.tsx
├── store/
│   └── asignacionStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── exportData.ts
└── App.tsx
```

## Consideraciones Técnicas
- TypeScript estricto con tipos bien definidos
- Componentes modulares y reutilizables
- Código limpio y comentado
- Manejo de errores apropiado
- Performance optimizada (useMemo, useCallback donde corresponda)

Por favor, genera el código completo y funcional siguiendo estas especificaciones.