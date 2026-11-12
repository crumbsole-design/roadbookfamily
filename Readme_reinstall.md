# Reinstalación — roadbookfamily

> Se borraron dependencias y artefactos regenerables para liberar espacio. Aquí está cómo recomponerlo.

## Limpieza del 2026-11-07

**Borrado:**
- `.next/` (Node)

**Cómo recomponerlo:**

### Node
```powershell
npm ci            # usa package-lock.json (o npm install)
npm run dev       # next dev
npm run start     # next start
npm run build     # next build
```

Consulta también el `README.md` del proyecto.
