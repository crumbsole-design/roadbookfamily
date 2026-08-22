"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RoadbookList, RoadbookItem } from "@/lib/types";
import { getLists, upsertList, deleteList, createEmptyList, generateId } from "@/lib/store";

function makeSafeFilename(value: string) {
  return (value || "lista")
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "lista";
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeImportedItem(item: any): RoadbookItem | null {
  if (!item || typeof item !== "object") return null;

  const normalized: RoadbookItem = {
    id: typeof item.id === "string" ? item.id : generateId(),
    shortName: typeof item.shortName === "string" ? item.shortName : "",
    longName: typeof item.longName === "string" ? item.longName : "",
    audioUrl: typeof item.audioUrl === "string" ? item.audioUrl : undefined,
    warning: typeof item.warning === "string" ? item.warning : undefined,
    timeFromPrev: typeof item.timeFromPrev === "number" ? item.timeFromPrev : undefined,
    timeToNext: typeof item.timeToNext === "number" ? item.timeToNext : undefined,
  };

  if (item.gpsPoint && typeof item.gpsPoint === "object") {
    const lat = Number(item.gpsPoint.lat);
    const lng = Number(item.gpsPoint.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      normalized.gpsPoint = { lat, lng };
    }
  }

  if (item.geofence && typeof item.geofence === "object") {
    const center = item.geofence.center;
    const radiusKm = Number(item.geofence.radiusKm);
    if (center && !Number.isNaN(Number(center.lat)) && !Number.isNaN(Number(center.lng)) && !Number.isNaN(radiusKm)) {
      normalized.geofence = {
        center: { lat: Number(center.lat), lng: Number(center.lng) },
        radiusKm,
      };
    }
  }

  return normalized;
}

function normalizeImportedList(raw: any): RoadbookList | null {
  if (!raw || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Lista importada";
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeImportedItem).filter(Boolean) as RoadbookItem[] : [];

  return {
    id: typeof raw.id === "string" ? raw.id : generateId(),
    name,
    lastActivated: typeof raw.lastActivated === "string" ? raw.lastActivated : undefined,
    items,
  };
}

export default function ListsPage() {
  const [lists, setLists] = useState<RoadbookList[]>([]);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLists(getLists());
  }, []);

  function refreshLists() {
    setLists(getLists());
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const list = createEmptyList(name);
    upsertList(list);
    refreshLists();
    setNewName("");
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta lista?")) return;
    deleteList(id);
    refreshLists();
  }

  function handleExport(list: RoadbookList) {
    const text = JSON.stringify(list, null, 2);
    downloadTextFile(`${makeSafeFilename(list.name)}.roadbook.txt`, text);
  }

  function resolveUniqueName(baseName: string, usedNames: Set<string>) {
    let candidate = baseName.trim() || "Lista importada";
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }

    const suggested = `${candidate} (importada)`;
    const customName = window.prompt(
      `Ya existe una lista llamada "${candidate}". Escribe un nombre nuevo:`,
      suggested
    );

    const finalName = (customName ?? suggested).trim() || suggested;
    usedNames.add(finalName);
    return finalName;
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = Array.isArray(parsed) ? parsed : [parsed];
      const imported = incoming.map(normalizeImportedList).filter(Boolean) as RoadbookList[];

      if (!imported.length) {
        alert("El archivo no contiene una lista válida.");
        return;
      }

      const existingNames = new Set(getLists().map((list) => list.name));
      imported.forEach((list) => {
        list.name = resolveUniqueName(list.name, existingNames);
        upsertList(list);
      });

      refreshLists();
    } catch (error) {
      console.error(error);
      alert("No se pudo importar el archivo. Asegúrate de que sea un texto JSON válido.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-slate-400 hover:text-white text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-amber-400">📋 Mis Listas</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nombre de nueva lista..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleCreate}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-3 rounded-lg transition-colors"
        >
          ＋
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-sky-700 hover:bg-sky-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
        >
          ⤴ Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json,text/plain,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      {/* List of lists */}
      {lists.length === 0 ? (
        <p className="text-slate-500 text-center mt-12">No hay listas todavía. ¡Crea una!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{list.name}</p>
                <p className="text-slate-500 text-sm">
                  {list.items.length} punto{list.items.length !== 1 ? "s" : ""}
                  {list.lastActivated && (
                    <span className="ml-2">· {new Date(list.lastActivated).toLocaleString("es")}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExport(list)}
                className="bg-violet-700 hover:bg-violet-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                ⤵ Exportar
              </button>
              <Link
                href={`/lists/${list.id}`}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                ✏️ Editar
              </Link>
              <Link
                href={`/run?listId=${list.id}`}
                className="bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                ▶ Recorrer
              </Link>
              <button
                onClick={() => handleDelete(list.id)}
                className="bg-red-900 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
