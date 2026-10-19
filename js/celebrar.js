// Celebraciones: en cada acierto, una nota suave (cada acierto de la racha, un
// poco más aguda); al fallar, un «oh-oh» amable; al llegar a la meta, un
// arpegio y confeti (js/confetti.js). Los sonidos se generan con
// Web Audio, sin archivos, y se pueden silenciar (la elección se guarda en este navegador).
"use strict";

const Celebrar = (() => {
  let audio = null, activo = true;
  try { activo = localStorage.getItem("repaso-sonido") !== "no"; } catch (e) {}

  // El contexto de audio se crea al primer acierto (tras un clic, como piden los navegadores).
  function contexto() {
    if (!audio) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; audio = new A(); }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }
  // Una nota de campanilla: entra rápido y se apaga sola. Con `hasta`, la nota se desliza hacia esa frecuencia; `tipo`, la forma de onda.
  function nota(f, retraso, dur, vol, { hasta, tipo = "sine" } = {}) {
    const a = contexto(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + retraso;
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur * 0.8);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  // Pentatónica de do: suena bien suba lo que suba la racha.
  const ESCALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

  function acierto(n) {
    if (!activo) return;
    const f = ESCALA[Math.max(0, Math.min(n, ESCALA.length) - 1)];
    nota(f, 0, 0.4, 0.06);
    nota(f * 2, 0, 0.25, 0.012);   // un armónico, para que suene a campanilla
  }

  // Dos notas que bajan, redondas y cortas: «oh-oh», sin pitido de error.
  function fallo() {
    if (!activo) return;
    nota(392, 0, 0.22, 0.07, { tipo: "triangle" });
    nota(330, 0.17, 0.35, 0.07, { tipo: "triangle", hasta: 294 });
  }

  function meta() {
    if (activo) {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(f, i * 0.09, 0.5, 0.08));
      [523.25, 659.25, 783.99, 1046.5].forEach(f => nota(f, 0.4, 1.4, 0.05));
    }
    if (!window.confetti) return;
    const comun = { colors: ["#f0b429", "#4a43b8", "#1f7a45", "#7c74e0", "#ffd166"], disableForReducedMotion: true };
    confetti({ ...comun, particleCount: 110, spread: 75, origin: { y: 0.55 } });
    setTimeout(() => {
      confetti({ ...comun, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...comun, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
  }

  return {
    acierto, fallo, meta,
    get sonido() { return activo; },
    alternar() { activo = !activo; try { localStorage.setItem("repaso-sonido", activo ? "si" : "no"); } catch (e) {} return activo; },
  };
})();
