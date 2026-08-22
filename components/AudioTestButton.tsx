"use client";

export default function AudioTestButton() {
  function handlePlay() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(
      "hola Fernando este es un audio de prueba"
    );
    utterance.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      onClick={handlePlay}
      aria-label="Audio de prueba"
      className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl text-center text-xl transition-colors"
    >
      🔊 Audio de prueba
    </button>
  );
}
