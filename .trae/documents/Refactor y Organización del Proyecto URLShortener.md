# Plan de Reestructuración y Mejora Organizativa

## Estructura de Carpetas Propuesta

- Mantener App Router de Next en `src/app` y rutas API existentes
- Reorganizar dominio por “features” y crear capa “shared” reutilizable

```text
src/
  app/                       # Next.js App Router y API routes
  features/                  # Módulos por dominio
    links/
    analytics/
    bio/
    auth/
    billing/
    uploads/
    <feature>/
      components/
      hooks/
      services/
      types/
      utils/
  shared/                    # Reutilizables transversales
    ui/                      # Design system (Button, Select, Modal, etc.)
    hooks/
    lib/                     # Utilidades puras sin I/O
    types/
  services/                  # Integraciones externas (DB, R2/S3, Paddle, Redis)
  workers/                   # Procesos offline (analytics/insights)
  i18n/                      # Integración next-intl
  locales/                   # en/es JSONs
  styles/                    # Tailwind y estilos globales
  tests/                     # Unit/integration helpers
```

- Migrar `src/components/ui/*` a `src/shared/ui/*` (p. ej. [Select.tsx](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/components/ui/Select.tsx))
- Consolidar `src/utils` → `src/shared/lib` y `src/types` → `src/shared/types`
- Usar `tsconfig.json` paths `@/shared/*` y `@/features/*` para imports consistentes

## Convenciones de Nombrado

- Componentes: PascalCase en archivos `Nombre.tsx`
- Hooks y utilidades: camelCase en `nombre.ts`
- Directorios de dominio: singular por feature (`links`, `analytics`)
- Tests: `Nombre.test.ts` y `Nombre.int.test.ts` junto a los módulos o en `tests/`

## Componentización del Código

- Extraer componentes reutilizables a `shared/ui` con interfaces tipadas
- Principio de única responsabilidad: separar presentación (UI) de lógica (hooks/services)
- Documentar props con TSDoc (interfaces y tipos exportados); agrupar story/use-cases

## Legibilidad y Tipado

- Aplicar formato con Prettier ([.prettierrc](file:///e:/Backup/Programacion/URLShortener/urlshortener/.prettierrc)) y lint con ESLint flat ([eslint.config.mjs](file:///e:/Backup/Programacion/URLShortener/urlshortener/eslint.config.mjs))
- Habilitar reglas: import order, no unused vars, exhaustive-deps para hooks
- Mantener TypeScript estricto ([tsconfig.json](file:///e:/Backup/Programacion/URLShortener/urlshortener/tsconfig.json)); eliminar `any` y tipar servicios con Zod donde aplique
- Añadir JSDoc/TSDoc en funciones complejas de `src/lib` y `workers`

## Estándares de Calidad

- Tests unitarios con Jest ([jest.config.js](file:///e:/Backup/Programacion/URLShortener/urlshortener/jest.config.js)), añadir React Testing Library para componentes
- Integración: probar handlers de `src/app/api/*` con mocks de DB/Redis/R2
- Cobertura mínima: 80% líneas/funciones en features críticas (links, insights)
- Revisión de código obligatoria: PR templates, CODEOWNERS y protección de ramas
- Convenciones de commit (Conventional Commits) y changelog mantenible

## Plan de Migración (Incremental, sin romper producción)

1. Preparación
   - Configurar paths TS y aliases; añadir reglas ESLint/Prettier estables
   - Crear `shared/*` y esqueleto `features/*`
2. UI Compartida
   - Mover `src/components/ui/*` → `src/shared/ui/*`
   - Documentar props y añadir pruebas unitarias por componente
3. Dominios por Feature
   - `links`, `analytics`, `bio`, `auth`, `billing`, `uploads`: mover componentes/hooks/utils a cada feature
   - Extraer acceso a datos/externos a `services/*` (Mongo/Mongoose, R2, Paddle, Redis)
4. Limpieza de Imports
   - Actualizar imports a `@/shared/*` y `@/features/*`
   - Ejecutar typecheck, lint y tests por paquete

## Validación

- Ejecutar `lint`, `format`, `typecheck`, `test` y `build` en cada fase
- Verificar i18n (`i18n:validate`) y rutas App Router en `src/app`
- Monitorizar workers (`src/workers`) en entorno local

## Entregables

- Árbol de carpetas actualizado y mapeo de migración
- Guía de estilo y convenciones (README/CONTRIBUTING actualizados)
- Plantillas de PR y CODEOWNERS para el flujo de revisión
- Documentación técnica (TypeDoc) y catálogo de UI (Storybook)
- Suite de pruebas con cobertura y reportes locales

Sin CI/CD externo: orientamos la validación a scripts locales y al flujo de PR con Vercel. Si apruebas este plan, procedo a implementarlo de forma incremental y verificada por etapas.
