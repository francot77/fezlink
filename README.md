# Fezlink

Fezlink is a streamlined link management platform built with Next.js. Create branded short links, generate QR codes, and publish a simple bio page while keeping track of real-time analytics without ads.

## Features

- Shorten URLs with customizable slugs and shareable QR codes.
- Dashboard analytics for clicks, geolocation, and device mix.
- Bio page builder to collect important links in one place.
- Responsive, fast UI powered by Next.js App Router and Tailwind CSS.

## Tech stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root with at least:
   ```bash
   MONGODB_URI="<your-mongodb-connection-string>"
   BASE_URL="http://localhost:3000"
   PADDLE_WEBHOOK_SECRET_KEY="<paddle-webhook-secret>"
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="<paddle-client-token>"
   ```
   Add any other provider keys required by your authentication or analytics setup.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `npm run dev` – start the development server.
- `npm run build` – generate a production build.
- `npm run start` – run the production server.
- `npm run lint` – lint the project with ESLint.
- `npm run format` – format code with Prettier.
- `npm run test` – run Jest tests.
- `npm run worker` – run the analytics worker.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Project structure

- `src/app` – App Router, API routes y estilos globales.
- `src/features` – módulos por dominio (links, analytics, bio, auth, billing, uploads).
  - `components/`, `hooks/`, `services/`, `types/`, `utils/`
- `src/shared` – elementos reutilizables transversales.
  - `ui/` (design system), `hooks/`, `lib/`, `types/`
- `src/services` – integraciones externas (Mongo/Mongoose, R2/S3, Paddle, Redis).
- `src/workers` – procesos offline (analytics/insights).
- `src/i18n` y `src/locales` – integración next-intl y traducciones.

Aliases de import:

- `@/*` → `src/*`
- `@/shared/*` → `src/shared/*`
- `@/features/*` → `src/features/*`

## Deployment

En Vercel, configura variables de entorno y usa `npm run build`. No se requieren pipelines externos; la validación se realiza localmente con `lint`, `test` y `typecheck`.
