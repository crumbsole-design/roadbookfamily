"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RoadbookList, RoadbookItem } from "@/lib/types";
import { getList, upsertList } from "@/lib/store";
import Link from "next/link";

type RunMode = "setup" | "running";

function RunSetup({
  list,
  onStart,
}: {
  list: RoadbookList;
  onStart: (startIndex: number, visibleCount: number, autoAdvance: boolean, autoInterval: number) => void;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoInterval, setAutoInterval] = useState(5);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-bold text-amber-400">⚙️ Configurar recorrido</h2>
      <p className="text-slate-300 font-semibold truncate">{list.name}</p>

      <label className="flex flex-col gap-2">
        <span className="text-slate-300">Empezar desde el punto:</span>
        <select
          value={startIndex}
          onChange={(e) => setStartIndex(+e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          {list.items.map((item, idx) => (
            <option key={item.id} value={idx}>
              {idx + 1}. {item.shortName || "(sin nombre)"}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-slate-300">Puntos visibles en pantalla: <strong className="text-amber-400">{visibleCount}</strong></span>
        <input
          type="range"
          min={1}
          max={Math.min(10, list.items.length)}
          value={visibleCount}
          onChange={(e) => setVisibleCount(+e.target.value)}
          className="accent-amber-500"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-slate-300">Modo de avance:</span>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoAdvance(false)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${!autoAdvance ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-white"}`}
          >
            👆 Manual
          </button>
          <button
            onClick={() => setAutoAdvance(true)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${autoAdvance ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-white"}`}
          >
            ▶ Automático
          </button>
        </div>
      </div>

      {autoAdvance && (
        <label className="flex flex-col gap-2">
          <span className="text-slate-300">Intervalo: <strong className="text-amber-400">{autoInterval}s</strong></span>
          <input
            type="range"
            min={1}
            max={60}
            value={autoInterval}
            onChange={(e) => setAutoInterval(+e.target.value)}
            className="accent-amber-500"
          />
        </label>
      )}

      <button
        onClick={() => onStart(startIndex, visibleCount, autoAdvance, autoInterval)}
        disabled={list.items.length === 0}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl text-xl transition-colors"
      >
        {list.items.length === 0 ? "Sin puntos" : "▶ Iniciar"}
      </button>
    </div>
  );
}

function ItemCard({ item, isCurrent }: { item: RoadbookItem; isCurrent: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isCurrent && item.audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [isCurrent, item.audioUrl]);

  return (
    <div
      className={`h-full rounded-2xl p-4 flex flex-col gap-2 transition-all ${
        isCurrent
          ? "bg-amber-500 text-slate-900 scale-100 shadow-lg shadow-amber-500/30"
          : "bg-slate-800 text-white opacity-60 scale-95"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg leading-tight">{item.shortName || "(sin nombre)"}</p>
          <p className={`text-sm mt-1 ${isCurrent ? "text-slate-700" : "text-slate-400"}`}>{item.longName}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.gpsPoint && <span className="text-sm">📍</span>}
          {item.audioUrl && <span className="text-sm">🔊</span>}
        </div>
      </div>

      {item.warning && (
        <div className={`rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2 ${isCurrent ? "bg-red-600 text-white" : "bg-red-900 text-red-200"}`}>
          ⚠️ {item.warning}
        </div>
      )}

      <div className={`flex gap-3 text-xs ${isCurrent ? "text-slate-700" : "text-slate-500"}`}>
        {item.timeFromPrev !== undefined && <span>⬅️ {item.timeFromPrev}min</span>}
        {item.timeToNext !== undefined && <span>➡️ {item.timeToNext}min</span>}
        {item.gpsPoint && <span>🌐 {item.gpsPoint.lat.toFixed(4)}, {item.gpsPoint.lng.toFixed(4)}</span>}
      </div>

      {item.audioUrl && <audio ref={audioRef} src={item.audioUrl} className={isCurrent ? "w-full" : "hidden"} controls={isCurrent} />}
    </div>
  );
}

function GpsStatusIndicator({
  gpsEnabled,
  gpsStatus,
  onToggle,
}: {
  gpsEnabled: boolean;
  gpsStatus: "checking" | "active" | "denied" | "unsupported" | "off";
  onToggle: () => void;
}) {
  const isActive = gpsEnabled && gpsStatus === "active";
  const label = !gpsEnabled ? "GPS desactivado" : gpsStatus === "active" ? "GPS activo" : gpsStatus === "denied" ? "GPS denegado" : gpsStatus === "unsupported" ? "GPS no disponible" : "GPS comprobando...";
  const visibleText = !gpsEnabled ? "GPS desactivado" : gpsStatus === "active" ? "GPS activo" : "GPS";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      aria-label={label}
      className={`fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-lg backdrop-blur-sm transition-all ${
        isActive
          ? "border-emerald-400/70 bg-emerald-500/25 text-emerald-100"
          : "border-slate-600 bg-slate-900/80 text-slate-200"
      }`}
    >
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-400"}`} />
      <span className="text-[10px] font-bold uppercase tracking-wide">{visibleText}</span>
    </button>
  );
}

function RunSession({
  list,
  startIndex,
  visibleCount,
  autoAdvance,
  autoInterval,
  onStop,
}: {
  list: RoadbookList;
  startIndex: number;
  visibleCount: number;
  autoAdvance: boolean;
  autoInterval: number;
  onStop: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<"checking" | "active" | "denied" | "unsupported" | "off">("checking");
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoAdvance) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((idx) => {
        if (idx >= list.items.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return idx;
        }
        return idx + 1;
      });
    }, autoInterval * 1000);
  }, [autoAdvance, autoInterval, list.items.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((idx) => Math.min(idx + 1, list.items.length - 1));
    if (autoAdvance) restartTimer();
  }, [list.items.length, autoAdvance, restartTimer]);

  const goPrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
    if (autoAdvance) restartTimer();
  }, [autoAdvance, restartTimer]);

  // Auto-advance: start timer
  useEffect(() => {
    if (!autoAdvance) return;
    restartTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvance, autoInterval]);

  // GPS permission + live tracking
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if (!gpsEnabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setCurrentPosition(null);
      setGpsStatus("off");
      return;
    }

    if (!("geolocation" in navigator)) {
      setGpsStatus("unsupported");
      setCurrentPosition(null);
      return;
    }

    setGpsStatus("checking");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsStatus("active");
      },
      () => {
        setCurrentPosition(null);
        setGpsStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [gpsEnabled]);

  const handleToggleGps = useCallback(() => {
    setGpsEnabled((prev) => !prev);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const half = Math.floor(visibleCount / 2);
  const windowStart = Math.max(0, Math.min(currentIndex - half, list.items.length - visibleCount));
  const windowEnd = Math.min(windowStart + visibleCount, list.items.length);
  const visibleItems = list.items.slice(windowStart, windowEnd);
  const actualVisible = visibleItems.length;

  if (autoAdvance) {
    return (
      <div className="min-h-screen flex flex-col">
        <GpsStatusIndicator gpsEnabled={gpsEnabled} gpsStatus={gpsStatus} onToggle={handleToggleGps} />
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
          <button onClick={onStop} className="text-slate-400 hover:text-white">✕ Parar</button>
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="text-slate-300 disabled:text-slate-600 text-xl px-2"
              aria-label="Punto anterior"
            >
              ◀
            </button>
            <span className="text-slate-400 text-sm">{currentIndex + 1} / {list.items.length}</span>
            <button
              onClick={goNext}
              disabled={currentIndex === list.items.length - 1}
              className="text-slate-300 disabled:text-slate-600 text-xl px-2"
              aria-label="Punto siguiente"
            >
              ▶
            </button>
          </div>
          <span className="text-amber-400 text-sm">▶ Auto {autoInterval}s</span>
        </div>
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          {visibleItems.map((item) => (
            <div key={item.id} className="flex-1 min-h-0" style={{ flexBasis: `${100 / actualVisible}%` }}>
              <div className="h-full">
                <ItemCard item={item} isCurrent={item.id === list.items[currentIndex].id} />
              </div>
            </div>
          ))}
        </div>
        {currentPosition && gpsEnabled && (
          <div className="fixed bottom-14 left-4 z-40 rounded-lg border border-emerald-500/50 bg-slate-900/80 px-2 py-1 text-[10px] text-emerald-200 shadow-lg">
            {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
          </div>
        )}
      </div>
    );
  }

  // Manual mode: screen split into two vertical halves
  return (
    <div className="min-h-screen flex flex-col select-none">
      <GpsStatusIndicator gpsEnabled={gpsEnabled} gpsStatus={gpsStatus} onToggle={handleToggleGps} />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
        <button onClick={onStop} className="text-slate-400 hover:text-white">✕ Parar</button>
        <span className="text-slate-400 text-sm">{currentIndex + 1} / {list.items.length}</span>
        <span className="text-slate-500 text-xs">👆 Manual</span>
      </div>

      {/* Content area with tap zones overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Items: fill screen equally */}
        <div className="absolute inset-0 flex flex-col p-4 gap-3 pointer-events-none">
          {visibleItems.map((item) => (
            <div key={item.id} className="flex-1 min-h-0" style={{ flexBasis: `${100 / actualVisible}%` }}>
              <div className="h-full">
                <ItemCard item={item} isCurrent={item.id === list.items[currentIndex].id} />
              </div>
            </div>
          ))}
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 flex flex-col pointer-events-auto">
          {/* Top half → previous */}
          <button
            className="flex-1 flex items-center justify-center opacity-0 hover:opacity-10 bg-blue-400 transition-opacity"
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Punto anterior"
          />
          {/* Bottom half → next */}
          <button
            className="flex-1 flex items-center justify-center opacity-0 hover:opacity-10 bg-green-400 transition-opacity"
            onClick={goNext}
            disabled={currentIndex === list.items.length - 1}
            aria-label="Punto siguiente"
          />
        </div>

        {/* Visual hint for tap zones */}
        <div className="absolute inset-x-0 top-0 h-1/2 border-b border-slate-700/40 pointer-events-none flex items-end justify-center pb-1">
          <span className="text-slate-600 text-xs">▲ Anterior</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none flex items-start justify-center pt-1">
          <span className="text-slate-600 text-xs">▼ Siguiente</span>
        </div>
      </div>
      {currentPosition && gpsEnabled && (
        <div className="fixed bottom-14 left-4 z-40 rounded-lg border border-emerald-500/50 bg-slate-900/80 px-2 py-1 text-[10px] text-emerald-200 shadow-lg">
          {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}

function RunPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listId = searchParams.get("listId");

  const [list, setList] = useState<RoadbookList | null>(null);
  const [mode, setMode] = useState<RunMode>("setup");
  const [runConfig, setRunConfig] = useState<{
    startIndex: number;
    visibleCount: number;
    autoAdvance: boolean;
    autoInterval: number;
  } | null>(null);

  useEffect(() => {
    if (!listId) { router.push("/lists"); return; }
    const l = getList(listId);
    if (!l) { router.push("/lists"); return; }
    setList(l);
  }, [listId, router]);

  function handleStart(startIndex: number, visibleCount: number, autoAdvance: boolean, autoInterval: number) {
    if (!list) return;
    // Update lastActivated
    const updated = { ...list, lastActivated: new Date().toISOString() };
    upsertList(updated);
    setList(updated);
    setRunConfig({ startIndex, visibleCount, autoAdvance, autoInterval });
    setMode("running");
  }

  if (!list) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>;

  if (mode === "setup" || !runConfig) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <Link href="/lists" className="text-slate-400 hover:text-white text-2xl">←</Link>
          <h1 className="text-xl font-bold text-white">Recorrer lista</h1>
        </div>
        <RunSetup list={list} onStart={handleStart} />
      </main>
    );
  }

  return (
    <RunSession
      list={list}
      {...runConfig}
      onStop={() => { setMode("setup"); setRunConfig(null); }}
    />
  );
}

export default function RunPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>}>
      <RunPageInner />
    </Suspense>
  );
}
