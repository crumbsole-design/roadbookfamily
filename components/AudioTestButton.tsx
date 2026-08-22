"use client";

function speakWhenReady(text: string, lang: string) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  const doSpeak = () => {
    synth.cancel();
    synth.speak(utterance);
  };

  const voices = synth.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    let fallbackId: ReturnType<typeof setTimeout>;

    const onVoicesReady = () => {
      clearTimeout(fallbackId);
      doSpeak();
    };

    synth.addEventListener("voiceschanged", onVoicesReady, { once: true });

    // Fallback: if voiceschanged never fires, attempt after a short delay
    fallbackId = setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoicesReady);
      doSpeak();
    }, 500);
  }
}

export default function AudioTestButton() {
  function handlePlay() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speakWhenReady("hola Fernando este es un audio de prueba", "es-ES");
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
