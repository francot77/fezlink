# Contributing to Fezlink

We welcome contributions! Please follow these guidelines to ensure a smooth collaboration.

## Development Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up your `.env` (see README).
4.  Run development server: `npm run dev`

## Code Style

We use **Prettier** and **ESLint** to maintain code quality.

- **Format code**: `npm run format`
- **Lint code**: `npm run lint` (or `npm run lint:fix` to autofix)

Naming & estructura:

- Componentes React: PascalCase (`Nombre.tsx`)
- Hooks/utilidades: camelCase (`useNombre.ts`, `helper.ts`)
- Features: singular (`links`, `analytics`) con subcarpetas `components/`, `hooks/`, `services/`, `types/`, `utils/`
- Shared: `src/shared/ui`, `src/shared/hooks`, `src/shared/lib`, `src/shared/types`
- Imports: usar aliases `@/shared/*` y `@/features/*`

Antes de abrir PR:

- Asegura `npm run lint` y `npm run test` pasan
- Ejecuta typecheck con `tsc --noEmit` o `next build`

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `<type>(<scope>): <subject>`

Examples:

- `feat(auth): add google provider`
- `fix(api): handle database connection error`
- `docs: update readme`
- `style: format code`

## Testing

Run tests before submitting a PR:
`npm run test`

Para componentes en `shared/ui`, añade tests de render y props con React Testing Library.
