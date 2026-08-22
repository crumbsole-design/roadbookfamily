import Link from "next/link";
import AudioTestButton from "@/components/AudioTestButton";

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-400 mb-2">🗺 Roadbook Family</h1>
        <p className="text-slate-400 text-lg">Navega rutas con puntos característicos</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/lists"
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-6 rounded-xl text-center text-xl transition-colors"
        >
          📋 Mis Listas
        </Link>
        <AudioTestButton />
      </div>
      <p className="absolute bottom-6 text-sm text-slate-500">Versión {appVersion}</p>
    </main>
  );
}
