"use client";

function speakNow(text: string, lang: string) {
  const synth = window.speechSynthesis;
  if (!text.trim()) return;

  const createUtterance = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1;
    return utterance;
  };

  const voicesReady = synth.getVoices().length > 0;

  synth.cancel();
  synth.speak(createUtterance());

  if (voicesReady) return;

  let replayed = false;
  const replayWhenReady = () => {
    if (replayed) return;
    replayed = true;
    synth.cancel();
    synth.speak(createUtterance());
  };
  const onVoicesReady = () => replayWhenReady();

  synth.addEventListener("voiceschanged", onVoicesReady, { once: true });
  setTimeout(() => {
    synth.removeEventListener("voiceschanged", onVoicesReady);
    replayWhenReady();
  }, 500);
}

export default function AudioTestButton() {
  function handlePlay() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speakNow("hola Fernando este es un audio de prueba", "es-ES");
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
