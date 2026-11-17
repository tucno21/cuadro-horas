# React + TypeScript + Vite

## Sistema de Asignación de Horas Docentes

Aplicación para distribuir las horas de cada área curricular entre los docentes de cada grado.

### Persistencia

Los datos se guardan en **IndexedDB** (base `cuadrohoras`, sin backend):

| Almacén        | Contenido                                                   |
| -------------- | ----------------------------------------------------------- |
| `docentes`     | Docentes con `id`, `nombre`, `nivel`, `color` y `orden`      |
| `grados`       | Grados/secciones con `id`, `nombre` y `orden`                |
| `asignaciones` | Una fila por celda asignada (`areaId:gradoId`)               |
| `meta`         | Docente seleccionado y flags de inicialización               |

La capa de acceso vive en `src/db/indexeddb.ts` y el estado en `src/store/asignacionStore.ts`.
La primera vez que se abre la app se siembran los 16 docentes y los 8 grados por defecto y, si
existen datos de la versión anterior en `localStorage` (`asignacion-storage`), se migran
automáticamente. Las bases creadas con la versión 1 se actualizan solas a la versión 2 (agrega
el almacén `grados`) sin perder docentes ni asignaciones.

### Docentes

Desde el panel izquierdo se pueden **agregar**, **editar** (nombre, nivel y color),
**eliminar** (con confirmación y liberación de sus asignaciones) y **reordenar**
arrastrando la fila o usando las flechas ↑/↓. El orden se guarda en IndexedDB.

### Grados y secciones

El botón **Grados** de la tabla de distribución abre un modal para **agregar**, **editar** y
**eliminar** grados (`1A`, `1B`, …). Al eliminar un grado también se eliminan sus celdas
asignadas (se avisa cuántas antes de confirmar). El respaldo JSON incluye docentes, grados y
asignaciones, de modo que exportar e importar restaura exactamente la misma distribución.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
