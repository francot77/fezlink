## Alcance y Decisiones
- Observabilidad personalizada: se omite en esta fase por despliegue en Vercel (logs y métricas básicas disponibles).
- Decisión documentada: crear ADR “Observabilidad diferida” con criterios de re-evaluación (picos sostenidos > RPS objetivo, p95 latencia fuera de umbral, complejidad de análisis de fallos).

## Análisis de Escalabilidad
### Componentes críticos y limitaciones
- API App Router: endpoints en src/app/api/* (autenticación, links, analytics, biopage, webhooks) [ejemplo](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/app/api/links/route.ts).
- Autenticación: NextAuth + JWT [auth-options.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/lib/auth-options.ts); riesgo CSRF en endpoints mutables no NextAuth.
- Rate limiting: Upstash Redis distribuido [rate-limit.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/lib/rate-limit.ts); fallback LRU no apto para multi-instancia.
- Redirección pública: hot-path [app/[slug]/route.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/app/%5Bslug%5D/route.ts); debe ser cacheable/CDN.
- Analytics pipeline: emisión [emitAnalyticsEvent.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/lib/emitAnalyticsEvent.ts), procesamiento [analyticsWorker.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/workers/analyticsWorker.ts); asegurar idempotencia y batch.
- MongoDB/Mongoose: conexión [mongodb.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/lib/mongodb.ts) y modelos (links/analytics/stats); requerir índices y pooling.
- Uploads: [background-image](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/app/api/background-image/route.ts) + R2 [lib/r2.ts](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/lib/r2.ts); limitar tamaño/tipo.
- Webhook Paddle: [webhooks/paddle](file:///e:/Backup/Programacion/URLShortener/urlshortener/src/app/api/webhooks/paddle/route.ts); verificación de firma necesaria.

### Capacidad actual y proyecciones
- Naturaleza stateless del API (JWT) facilita horizontal scaling.
- Redis (Upstash): throughput adecuado para rate limit y contadores; medir latencias p95/p99 bajo carga.
- Mongo: estimar QPS por colección (links, analyticsDaily/Monthly); revisar poolSize y tiempos de agregación.
- Proyección: picos de redirecciones y eventos de analytics; planificar colas/batch y cache en hot-path.

### Cuellos de botella potenciales
- Fallback LRU en rate limit (inconsistente en múltiples instancias).
- Agregaciones pesadas en analytics sin índices adecuados.
- Uploads grandes y sin validación estricta.
- Endpoints mutables sin CSRF/Origin check.
- Falta de cache/CDN en redirecciones públicas.

### Escalamiento horizontal/vertical
- Horizontal: múltiples instancias serverless (Vercel); obligatorio rate limiting distribuido y cache externo.
- Vertical: aumentar recursos de Mongo (cluster/replica set) y Redis tier según métricas.

### Estado y persistencia
- Sesiones y auth: JWT stateless, no requiere sticky sessions.
- Eventos: garantizar durabilidad (Redis Streams/SQS) e idempotencia en worker.
- Cache: Redis para hot counters; TTLs y invalidación controlada.

## Priorización de Características (por impacto en escalabilidad)
1. Hacer obligatorio Upstash Redis en prod y eliminar fallback LRU.
2. Índices Mongo críticos: slug único, linkId, userId, fechas en analytics; TTL donde aplique.
3. Cache/CDN para redirecciones públicas y páginas públicas.
4. CSRF/Origin check en endpoints mutables; CORS explícito con allowlist.
5. Batch e idempotencia en analytics; límites y paginación en endpoints de insights.
6. Límites de request/upload, validación de MIME; CSP robusta.

## Métricas Clave (monitorización en Vercel por ahora)
- Latencia p95/p99 por endpoint (redirección, analytics, auth).
- Tasa de errores (4xx/5xx) y razones dominantes.
- RPS por ruta y consumo de Redis (rate limit hits, 429s).
- Tiempo medio de consulta Mongo y número de conexiones activas.
- Lag del worker de analytics (eventos pendientes) y throughput.

## Componentes a Refactorizar
- Unificar uso de withErrorHandler y withRateLimit en todos los route.ts.
- Centralizar validación Zod en helpers y aplicar en mutaciones.
- Separar claramente pipeline de analytics y asegurar idempotencia.
- Introducir esquema zod para variables de entorno y fail-fast.

## Plan de Pruebas de Carga y Estrés
- Herramienta: k6/Artillery. Escenarios:
  - Redirección hot-path: ráfagas sostenidas; validar cache/CDN y latencias p95.
  - Registro/login y check-username: probar rate limiting y CSRF.
  - Emisión de analytics: alto volumen de eventos y procesamiento por worker.
- Datos: generar slugs y usuarios sintéticos; prellenar BD con volumen.
- Criterios: latencia p95 bajo umbral, error rate < objetivo, sin lag acumulativo en worker, 429 dentro de límites esperados.

## Hitos y Criterios de Aceptación
### Hito 1: Endurecimiento base
- Entregables: CORS, CSRF/Origin check, CSP, límites de request/upload, Redis obligatorio.
- Aceptación: pruebas unitarias/e2e pasan; revisión de seguridad de endpoints; verificación manual en Vercel.

### Hito 2: Índices y Cache
- Entregables: índices Mongo aplicados; cache/CDN en redirección y páginas públicas.
- Aceptación: explain de queries mejora; latencia p95 reducida en redirección.

### Hito 3: Analytics robusto
- Entregables: batch, idempotencia, límites/paginación; worker con métricas básicas.
- Aceptación: pruebas de carga sin lag sostenido; consistencia de contadores.

### Hito 4: Pruebas de carga
- Entregables: plan y ejecución k6/Artillery; reporte con resultados y recomendaciones.
- Aceptación: métricas dentro de umbrales definidos; documentación de decisiones y siguientes pasos.

## Entregables y Archivo Guía
- Crear docs/Guia_Seguridad_Escalabilidad.md con:
  - Checklist por hito (características, criterios de aceptación, validación).
  - ADR “Observabilidad diferida” y condiciones de activación futura.
  - Métricas clave y umbrales objetivo.
  - Plan de pruebas de carga y estrés y escenarios.

¿Confirmas este plan y la creación del archivo guía con los hitos y criterios descritos?