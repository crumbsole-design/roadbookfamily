"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoadbookList } from "@/lib/types";
import { getLists, upsertList, deleteList, createEmptyList } from "@/lib/store";

export default function ListsPage() {
  const [lists, setLists] = useState<RoadbookList[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setLists(getLists());
  }, []);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const list = createEmptyList(name);
    upsertList(list);
    setLists(getLists());
    setNewName("");
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta lista?")) return;
    deleteList(id);
    setLists(getLists());
  }

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-slate-400 hover:text-white text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-amber-400">📋 Mis Listas</h1>
      </div>

      {/* Create new list */}
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
