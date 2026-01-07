# Migración de Avatares a Cloudflare R2

## Variables de entorno requeridas

- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET
- R2_PUBLIC_BASE_URL (p.ej. https://cdn.example.com)

## Configuración de CORS en el bucket R2

Configure CORS en el bucket para permitir PUT desde su dominio frontend:

- Allowed Methods: PUT
- Allowed Origins: https://su-dominio-frontend
- Allowed Headers: Content-Type
- Expose Headers: ETag

## Nuevos endpoints

- POST /api/avatar/upload-init
  - body: { contentType: 'image/jpeg|image/png|image/webp', size: number }
  - valida tipo MIME y tamaño (≤ 1MB)
  - devuelve { uploadUrl, key, publicUrl, expiresIn }
- POST /api/avatar/complete
  - body: { key: 'avatars/...' }
  - persiste la URL pública en MongoDB (Biopage.avatarUrl)

## Frontend

El modal de avatar usa input file, solicita upload-init, sube vía PUT (XMLHttpRequest para progreso) y llama a complete. Maneja errores y muestra barra de progreso.

## Seguridad

- Firmas de URL temporales (expira en 10 minutos)
- Validación de MIME y tamaño en el servidor
- Cache-Control aplicando contenido immutable

## Migración de imágenes existentes

Ejecute:

```bash
npm run migrate:avatars
```

Descarga avatares alojados en UploadThings (utfs.io/uploadthing.com), los sube a R2 y actualiza la base de datos.

## Limpieza automática

Ejecute de forma programada (cron/worker):

```bash
npm run r2:cleanup-avatars
```

Elimina objetos en R2 bajo `avatars/` que no estén referenciados por la base de datos y tengan más de 7 días.

## Next.js imágenes remotas

Se añade el host de `R2_PUBLIC_BASE_URL` a `next.config.ts` para permitir renderizar con next/image.
