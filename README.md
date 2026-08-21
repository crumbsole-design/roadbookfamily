# Roadbook Family

Un programa PWA (Progressive Web App) hecho con **Next.js** para crear y recorrer rutas con listas de puntos característicos, funciona **offline** después de la primera carga.

## Características

- 📋 **Gestión de listas** – Crea, edita y elimina listas de puntos
- 📍 **Puntos característicos** con:
  - Nombre corto y nombre largo/descriptivo
  - Audio opcional (grabado o subido)
  - Coordenadas GPS opcionales
  - Tiempo desde el punto anterior / hasta el siguiente
  - Advertencia (Warning) opcional
  - Geovalla circular (Geofence) opcional para activar alertas por proximidad GPS
- 🧭 **Modo recorrido**:
  - Elige desde qué punto empezar
  - Configura cuántos puntos se muestran en pantalla
  - **Avance automático** (temporizador configurable)
  - **Avance manual** con zonas táctiles: mitad superior = punto anterior, mitad inferior = punto siguiente

## Despliegue en Netlify

1. Conecta este repositorio a tu cuenta de Netlify
2. Netlify detectará automáticamente el `netlify.toml` y desplegará con `npm run build`

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
