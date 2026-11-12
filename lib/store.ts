"use client";

import { useSyncExternalStore } from "react";
import { RoadbookList, RoadbookItem } from "./types";

const STORAGE_KEY = "roadbook_lists";

// #16: las páginas se suscriben a las listas con useLists() en vez de copiarlas al estado en un
// useEffect. saveLists avisa a los suscriptores; el evento "storage" cubre otras pestañas.
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedLists: RoadbookList[] = [];

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getListsSnapshot(): RoadbookList[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedLists = raw ? JSON.parse(raw) : [];
    } catch {
      cachedLists = [];
    }
  }
  return cachedLists;
}

function subscribeLists(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Listas guardadas; `null` mientras no se ha leído el navegador (render en servidor e hidratación). */
export function useLists(): RoadbookList[] | null {
  return useSyncExternalStore(subscribeLists, getListsSnapshot, () => null);
}

export function getLists(): RoadbookList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLists(lists: RoadbookList[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  listeners.forEach((notify) => notify());
}

export function getList(id: string): RoadbookList | undefined {
  return getLists().find((l) => l.id === id);
}

export function upsertList(list: RoadbookList): void {
  const lists = getLists();
  const idx = lists.findIndex((l) => l.id === list.id);
  if (idx >= 0) lists[idx] = list;
  else lists.push(list);
  saveLists(lists);
}

export function deleteList(id: string): void {
  saveLists(getLists().filter((l) => l.id !== id));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function createEmptyItem(): RoadbookItem {
  return {
    id: generateId(),
    shortName: "",
    longName: "",
  };
}

export function createEmptyList(name: string): RoadbookList {
  return {
    id: generateId(),
    name,
    items: [],
  };
}
