# figma-make-app

Next.js App Router + TypeScript + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `app/layout.tsx` - Root App Router layout, metadata, RTL document attributes, and fonts
- `app/page.tsx` - Home route
- `app/products/page.tsx` - Product catalog route
- `app/globals.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `components/` - Interactive client components
- `data/products.ts` - Shared product catalog data
- `store/cart.ts` - Persisted Zustand cart store
- `package.json` - Project dependencies and Next.js build, development, preview, and formatting scripts
- `next.config.ts` - Next.js configuration
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Next.js 15 and TypeScript 5.7
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/postcss` plugin configured in `postcss.config.mjs`. `app/globals.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `app/globals.css`. This project does not need a Tailwind config file.

`app/layout.tsx` imports `app/globals.css`, so global font wiring belongs in the root layout or global stylesheet. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
