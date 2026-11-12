<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Punto de entrada para agentes de IA (Claude Code, Gemini, Codex, Copilot…) y personas nuevas en
Roadbook Family: una PWA en Next.js para crear y recorrer rutas como un roadbook (puntos con audio,
GPS, tiempos y geovallas), que funciona sin conexión tras la primera carga.

**Lee primero:**
- [README.md](README.md): características y despliegue.
- [docs/agentes/plantilla/README.md](docs/agentes/plantilla/README.md): prácticas comunes de
  motercode para webs Next.js y qué vale de cada guía.

El bloque de arriba lo escribe `next dev`: se deja tal cual.

## Reglas que no se pueden saltar

1. **Sin conexión primero.** La app debe seguir funcionando offline: los datos de las listas viven
   en el navegador (`lib/store.ts`), sin backend. Todo cambio se prueba también sin red.
2. **Ni secretos ni datos personales en git.** `.env*` está en el `.gitignore`. Rutas, audios y
   coordenadas reales no entran en tests ni capturas: los E2E usan una posición simulada.
   → [privacidad-y-logs.md](docs/agentes/plantilla/privacidad-y-logs.md)
3. **Antes de cada commit y de cada PR:** `npm run lint`, `npm run test:e2e` y `npm run build` en
   verde. Los tests existentes no se borran. → [tests.md](docs/agentes/plantilla/tests.md)
4. **Commits en inglés** con Conventional Commits y el issue al final:
   `fix(run): keep countdown after resume (#13)`. Comentarios, UI, docs, issues y títulos de PR en
   español. → [flujo-de-trabajo.md](docs/agentes/plantilla/flujo-de-trabajo.md)
5. **Versión automática.** Cada merge a `main` sube el parche de `package.json` con el workflow
   `bump-version.yml` (commit `[skip ci]`): no se toca la versión a mano.
6. **Dónde va cada decisión:** producto y alcance → issue; implementación → PR; arquitectura y
   proceso → `ADR.md` (arrancar con [adr-base.md](docs/agentes/plantilla/adr-base.md)).

## Arquitectura

- `app/`: páginas (App Router): inicio, `lists/` (gestión de listas y puntos) y `run/` (modo recorrido).
- `components/`: componentes compartidos.
- `lib/`: tipos (`types.ts`) y almacenamiento local (`store.ts`).
- `e2e/`: tests de Playwright, con geolocalización simulada en `playwright.config.ts`.

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run test:e2e   # Playwright (arranca el servidor solo)
npm run build
```
