# Flujo de trabajo: issues, ramas, commits, PR y ADR

## Ciclo de un cambio

1. **Issue** con el contexto y la decisión (o reutiliza una). Las prioridades y las etiquetas de
   versión se mantienen en el README del proyecto.
2. **Rama** desde `main`: `tipo/issue-N-descripcion-corta` (descripción en el idioma de las docs).
   Ejemplos: `feat/issue-9-boton-prueba-audio`, `fix/issue-16-errores-lint`,
   `docs/issue-17-flujo-nextjs`. Sin issue: `docs/guias-agentes`.
3. **Implementa + tests**: E2E de Playwright en `e2e/` para el alcance de UI, con posición
   simulada y datos ficticios.
4. **Comprueba**: `npm run lint`, `npm run test:e2e` (suite completa) y `npm run build` en verde.
   Si cambia la interfaz, pruébala también en `npm run dev` y sin conexión (PWA).
5. **PR** con la plantilla: cambios, checklist de comprobaciones y evidencia (salida de lint, tests y
   build, y una captura si cambia la interfaz).
6. **ADR** si la decisión afecta a la arquitectura o al proceso; además, una línea en el
   "Registro de decisiones operativas" del ADR con fecha y número de issue.
7. Si cambia una regla funcional, actualiza el README.

## Commits

- **Conventional Commits en inglés**, con ámbito y número de issue al final:
  ```
  feat(run): announce next point by voice (#9)
  fix(run): keep countdown after resume (#13)
  test(e2e): cover list import and GPS toggle
  chore(git): enforce LF line endings with .gitattributes (#14)
  ```
- Tipos: `feat`, `fix`, `test`, `docs`, `chore` (y `refactor` si hace falta). El ámbito es el área
  funcional (`lists`, `run`, `gps`, `audio`, `pwa`, `e2e`…).
- Cuerpo en prosa: qué fallaba o faltaba y por qué esta solución. `Refs #N` si el issue no se cierra
  todavía.
- Los commits hechos con un agente de IA terminan con su línea `Co-Authored-By:`.

## Pull requests

- Título en el idioma de las docs con el mismo prefijo que el commit:
  `fix(run): la cuenta atrás se mantiene al reanudar (#13)`.
- Un PR por issue cuando sea posible.
- Los E2E se acumulan: un PR **no borra** E2E existentes.

### Plantilla de PR

`.github/pull_request_template.md`:
```markdown
## Cambios

Closes #

## Comprobaciones
- [ ] `npm run lint` sin errores.
- [ ] `npm run test:e2e` (Playwright) en verde, con E2E nuevos o actualizados (no se borran los existentes).
- [ ] `npm run build` correcto.
- [ ] Probado en `npm run dev` si cambia la interfaz, también sin conexión (PWA).

## Seguridad y plantilla
- [ ] Ningún secreto (`.env*`) ni ruta, audio o coordenada real entra en el PR.
- [ ] Lo nuevo que sirve en otra web Next.js está separado del negocio (ver `docs/agentes/plantilla/flujo-de-trabajo.md`).

## Evidencia
<!-- Pega aquí la salida de lint, tests y build, y una captura si cambia la interfaz. -->
```
En un PR solo de documentación, marca los puntos de comprobación que no apliquen como "no aplica".

## ADR

- Un único `ADR.md` en la raíz. Entradas `## ADR-NNNN: título`, con Fecha, Estado, Contexto, Decisión
  y Consecuencias; numeración correlativa.
- Al final, "Registro de decisiones operativas": lista cronológica de una línea por decisión menor.
- Dónde va cada cosa: producto y alcance → issue; implementación → PR; arquitectura y proceso → ADR.
- Arranca con [adr-base.md](adr-base.md).

## Idioma

Decide al empezar y escríbelo en `AGENTS.md`. La convención de la plantilla:

| Qué | Idioma |
|---|---|
| Identificadores, nombres de tests, mensajes de commit | inglés |
| Comentarios, TSDoc, textos de la UI, docs, issues, títulos de PR, ADR, mensajes de log | idioma del equipo |

## Estilo de código

- TSDoc o comentario breve en funciones y hooks no evidentes, explicando el **porqué**, a menudo con
  el número de issue ("#16: …").
- La lógica pura va en `lib/` como funciones sin React, separada del acceso a `localStorage`
  (`lib/store.ts`) y de los componentes.
- Nombres de tests de Playwright en frases que describen el comportamiento:
  `test("una lista inexistente redirige a Mis Listas", …)`.
- Antes de commit: `git status` y comprobar que no entra ningún dato real.

## Plantilla o negocio

Todo lo nuevo se clasifica antes de escribirlo. Pregunta: **¿funcionaría copiándolo a otra web
Next.js cambiando solo la configuración?**

- **Sí → plantilla.** Sin nombres, rutas, textos ni datos del proyecto. Lo propio del proyecto entra
  como configuración: variables de entorno, parámetros o constantes que se inyectan. Su guía va a
  `docs/agentes/plantilla/` y se apunta en el inventario de `plantilla/README.md`.
- **No → negocio.** Código de la app y guía en `docs/agentes/proyecto/`.
- **Mezclado →** se separa en el mismo PR: el mecanismo genérico por un lado y los datos o reglas
  del proyecto por otro (ejemplo: un hook genérico de suscripción a `localStorage` es de plantilla;
  el formato de las listas del roadbook es del proyecto).

| Tipo de pieza | Plantilla | Negocio |
|---|---|---|
| Configuración | `eslint.config.mjs`, `playwright.config.ts`, `.gitattributes`, workflows de `.github/` | `public/manifest.json`, iconos |
| Infraestructura de la app | almacenamiento local genérico, registro de la PWA | tipos y lógica de listas, GPS, audio, UI |
| Tests | configuración de Playwright, mocks de voz y geolocalización | E2E de funcionalidades |
| Documentación | `docs/agentes/plantilla/` | `docs/agentes/proyecto/`, `README.md` |

En la revisión del PR se comprueba con la casilla correspondiente de la plantilla de PR.

## Herramientas

- `gh` para issues, etiquetas y PR.
- Permisos de Claude Code por proyecto en `.claude/settings.local.json` (p. ej. permitir `gh issue`,
  `gh label` y `npm run` sin preguntar). `.claude/settings.local.json` no se versiona; las skills de
  `.claude/skills/` sí, porque automatizan el ciclo para todo el equipo.
