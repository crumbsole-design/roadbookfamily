# Prácticas comunes de motercode para webs Next.js

Guías copiadas el 2026-11-12 de la plantilla «Web Next.js» de motercode, cuyo referente es
myTravelsArround (`docs/agentes/plantilla/`). El esqueleto de código vive en el repositorio template
`motercode/next-netlify-template`; estas guías son el complemento que todavía no tiene.

| Guía | Qué vale aquí | Qué hay que traducir |
|---|---|---|
| [flujo-de-trabajo.md](flujo-de-trabajo.md) | Ciclo issue → rama → tests → PR con evidencia → ADR; Conventional Commits en inglés con `(#issue)`; idioma por tipo de texto; criterio «plantilla o negocio» | `./gradlew …` y `scripts/e2e.sh` → `npm run lint`, `npm run test:e2e`, `npm run build`; KDoc → TSDoc; `docs/agentes/proyecto/` (negocio) → el README |
| [adr-base.md](adr-base.md) | ADR-0002 (dónde va cada decisión), ADR-0003 (calidad antes de cada PR), ADR-0004 (tests sobre datos ficticios), registro de decisiones operativas | ADR-0001 → Next.js + PWA sin conexión + Netlify; ADR-0007 (solo local) **sí** encaja: las listas viven en el navegador; ADR-0005 (R8) y ADR-0006 (Room) no aplican |
| [privacidad-y-logs.md](privacidad-y-logs.md) | Secretos fuera de git; rutas, audios y coordenadas reales fuera de los tests; cuidado con agentes y datos reales | `DebugLog` y R8 → nada de `console.log` con coordenadas en producción |
| [tests.md](tests.md) | Playwright para E2E, buscando por rol accesible | Aquí Playwright ya está configurado (con geolocalización simulada); Vitest todavía no |

No se han copiado las guías de Android de ConserjeCV (tests con Compose, capturas, adb, trampas de
Gradle, modo UIX) ni las de Flutter de Apati Paseo-Perro.
