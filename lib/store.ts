"use client";

import { RoadbookList, RoadbookItem } from "./types";

const STORAGE_KEY = "roadbook_lists";

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
