"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoadbookList, RoadbookItem } from "@/lib/types";
import { getList, upsertList, generateId, createEmptyItem } from "@/lib/store";
import Link from "next/link";

export default function ListEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [list, setList] = useState<RoadbookList | null>(null);
  const [editingItem, setEditingItem] = useState<RoadbookItem | null>(null);
  const [listName, setListName] = useState("");
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const l = getList(id);
    if (!l) { router.push("/lists"); return; }
    setList(l);
    setListName(l.name);
  }, [id, router]);

  function save(updated: RoadbookList) {
    upsertList(updated);
    setList(updated);
  }

  function handleNameChange() {
    if (!list) return;
    save({ ...list, name: listName });
  }

  function handleAddItem() {
    if (!list) return;
    const item = createEmptyItem();
    const updated = { ...list, items: [...list.items, item] };
    save(updated);
    setEditingItem(item);
  }

  function handleDeleteItem(itemId: string) {
    if (!list || !confirm("¿Eliminar este punto?")) return;
    save({ ...list, items: list.items.filter((i) => i.id !== itemId) });
    if (editingItem?.id === itemId) setEditingItem(null);
  }

  function handleEditItem(item: RoadbookItem) {
    setEditingItem({ ...item });
  }

  function handleSaveItem() {
    if (!list || !editingItem) return;
    save({ ...list, items: list.items.map((i) => i.id === editingItem.id ? editingItem : i) });
    setEditingItem(null);
  }

  function handleMoveUp(index: number) {
    if (!list || index === 0) return;
    const items = [...list.items];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    save({ ...list, items });
  }

  function handleMoveDown(index: number) {
    if (!list || index >= list.items.length - 1) return;
    const items = [...list.items];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    save({ ...list, items });
  }

  function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingItem({ ...editingItem, audioUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  if (!list) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>;

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/lists" className="text-slate-400 hover:text-white text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-amber-400">✏️ Editar Lista</h1>
      </div>

      {/* List name */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onBlur={handleNameChange}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2 mb-4">
        {list.items.map((item, idx) => (
          <div key={item.id} className="bg-slate-800 rounded-xl p-3 flex items-center gap-2">
            <div className="flex flex-col gap-1 mr-1">
              <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 leading-none">▲</button>
              <button onClick={() => handleMoveDown(idx)} disabled={idx === list.items.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 leading-none">▼</button>
            </div>
            <span className="text-slate-500 text-sm w-6 text-right">{idx + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{item.shortName || <span className="text-slate-500 italic">Sin nombre</span>}</p>
              <p className="text-slate-400 text-sm truncate">{item.longName}</p>
            </div>
            <div className="flex gap-1">
              {item.warning && <span title={item.warning} className="text-yellow-400">⚠️</span>}
              {item.gpsPoint && <span title={`${item.gpsPoint.lat},${item.gpsPoint.lng}`} className="text-blue-400">📍</span>}
              {item.audioUrl && <span className="text-green-400">🔊</span>}
              {item.geofence && <span className="text-purple-400">⭕</span>}
            </div>
            <button onClick={() => handleEditItem(item)} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-sm">✏️</button>
            <button onClick={() => handleDeleteItem(item.id)} className="bg-red-900 hover:bg-red-700 px-2 py-1 rounded text-sm">🗑</button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddItem}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mb-4"
      >
        ＋ Añadir punto
      </button>

      <Link
        href={`/run?listId=${list.id}`}
        className="block w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
      >
        ▶ Recorrer esta lista
      </Link>

      {/* Item editor modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <h2 className="text-xl font-bold text-amber-400">Editar punto</h2>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Nombre corto *</span>
              <input
                type="text"
                value={editingItem.shortName}
                onChange={(e) => setEditingItem({ ...editingItem, shortName: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Nombre largo / descripción *</span>
              <textarea
                value={editingItem.longName}
                onChange={(e) => setEditingItem({ ...editingItem, longName: e.target.value })}
                rows={3}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">⚠️ Advertencia (opcional)</span>
              <input
                type="text"
                value={editingItem.warning ?? ""}
                onChange={(e) => setEditingItem({ ...editingItem, warning: e.target.value || undefined })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Texto de advertencia..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-slate-300 text-sm">⏱ Tiempo desde anterior (min)</span>
                <input
                  type="number"
                  min={0}
                  value={editingItem.timeFromPrev ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, timeFromPrev: e.target.value ? +e.target.value : undefined })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300 text-sm">⏱ Tiempo hasta siguiente (min)</span>
                <input
                  type="number"
                  min={0}
                  value={editingItem.timeToNext ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, timeToNext: e.target.value ? +e.target.value : undefined })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-slate-300 text-sm">📍 GPS Latitud</span>
                <input
                  type="number"
                  step="any"
                  value={editingItem.gpsPoint?.lat ?? ""}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    gpsPoint: e.target.value
                      ? { lat: +e.target.value, lng: editingItem.gpsPoint?.lng ?? 0 }
                      : undefined
                  })}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    const match = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
                    if (match) {
                      e.preventDefault();
                      setEditingItem({ ...editingItem, gpsPoint: { lat: +match[1], lng: +match[2] } });
                    }
                  }}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="ej. 40.4168"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300 text-sm">📍 GPS Longitud</span>
                <input
                  type="number"
                  step="any"
                  value={editingItem.gpsPoint?.lng ?? ""}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    gpsPoint: e.target.value
                      ? { lat: editingItem.gpsPoint?.lat ?? 0, lng: +e.target.value }
                      : undefined
                  })}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    const match = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
                    if (match) {
                      e.preventDefault();
                      setEditingItem({ ...editingItem, gpsPoint: { lat: +match[1], lng: +match[2] } });
                    }
                  }}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="ej. -3.7038"
                />
              </label>
            </div>

            {/* Geofence */}
            <div className="border border-slate-600 rounded-xl p-3 flex flex-col gap-3">
              <span className="text-slate-300 text-sm font-semibold">⭕ Geovalla (opcional)</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs">Centro Lat</span>
                  <input
                    type="number" step="any"
                    value={editingItem.geofence?.center.lat ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        geofence: v ? {
                          center: { lat: +v, lng: editingItem.geofence?.center.lng ?? 0 },
                          radiusMeters: editingItem.geofence?.radiusMeters ?? 100
                        } : undefined
                      });
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs">Centro Lng</span>
                  <input
                    type="number" step="any"
                    value={editingItem.geofence?.center.lng ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        geofence: v ? {
                          center: { lat: editingItem.geofence?.center.lat ?? 0, lng: +v },
                          radiusMeters: editingItem.geofence?.radiusMeters ?? 100
                        } : undefined
                      });
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-slate-400 text-xs">Radio (metros)</span>
                <input
                  type="number" min={1}
                  value={editingItem.geofence?.radiusMeters ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingItem({
                      ...editingItem,
                      geofence: editingItem.geofence ? { ...editingItem.geofence, radiusMeters: +v } : undefined
                    });
                  }}
                  disabled={!editingItem.geofence}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-40"
                />
              </label>
            </div>

            {/* Audio */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">🔊 Audio (opcional)</span>
              {editingItem.audioUrl && (
                <audio controls src={editingItem.audioUrl} className="w-full mb-1" />
              )}
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  {editingItem.audioUrl ? "Cambiar audio" : "Subir audio"}
                </button>
                {editingItem.audioUrl && (
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, audioUrl: undefined })}
                    className="bg-red-900 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </label>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSaveItem}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
              >
                💾 Guardar
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
