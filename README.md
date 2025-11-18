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

## Project structure
- `src/app` – route handlers, pages, and global styles.
- `src/components` – reusable UI components.
- `src/hooks` – custom React hooks.
- `src/lib` – helpers such as the MongoDB client.
- `src/types` and `src/utils` – shared TypeScript types and utilities.

## Deployment
Build the project with `npm run build` and deploy the generated output to your hosting provider. Ensure all environment variables are configured in the deployment environment.
