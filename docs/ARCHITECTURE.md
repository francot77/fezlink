# URLShortener — Arquitectura y Organización
Versión: v0.1.0  
Última actualización: 2026-01-07

## Principios
- Modularidad por funcionalidades (feature-first)
- Dependencias mínimas y bien definidas
- Barreras anti-corrupción frente a APIs externas
- Internacionalización centralizada y UI compartida

## Estructura de Directorios
- src/
  - core/
    - analytics/
      - client.ts
      - emitter.ts
    - auth/
      - session.ts
      - index.ts
    - storage/
      - r2.ts
      - images.ts
    - index.ts
  - features/
    - links/
      - service.ts
      - components/
      - hooks/
      - index.ts
    - metrics/
      - components/
      - hooks/
      - utils/
      - types/
      - constants/
      - index.ts
    - insights/
      - components/
      - index.ts
  - shared/
    - ui/
      - Badge.tsx
      - Skeleton.tsx
      - Modal.tsx
      - index.ts
    - utils/
  - i18n/
  - lib/

## Convenciones de Nombrado
- Directorios: kebab-case
- Archivos React: PascalCase.tsx
- Utilidades/constantes: camelCase.ts, snake_case para JSON de locales
- Barrels index.ts por feature para re-exports

## Dependencias y Límites
- features → shared, core
- core → servicios, adaptadores a APIs
- shared → UI reutilizable, sin lógica de negocio
- i18n → carga de mensajes y hooks de traducción

## Barreras Anti-Corrupción
- Adapters en core/ encapsulan llamadas a APIs externas y formatos
- features consumen interfaces y funciones de core, sin acoplarse a endpoints

## Internacionalización
- next-intl con namespaces por feature: links, insights, metrics
- Fallback y validación en scripts i18n

## Proceso de Evolución
- Extraer lógica común a core/
- Reducir importaciones cruzadas entre features
- Mantener barrels y re-exports durante la transición para compatibilidad
