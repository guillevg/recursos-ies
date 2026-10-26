// Sumar y restar fracciones con el mínimo común múltiplo, paso a paso: las
// listas de múltiplos de cada denominador, el primero que se repite, cada
// fracción pasada a ese denominador (lo mismo arriba y abajo) y la operación.
// Sin rectángulos: es el método que se da en 1º PDC. Cálculos separados del
// dibujo para probarlos con Node; el dibujo está en fracmcm.html.
"use strict";

const FracMcm = (() => {
  const mcd = (x, y) => y === 0 ? Math.abs(x) : mcd(y, x % y);

  function suma({ a, b, op, c, d }) {
    [a, b, c, d] = [a, b, c, d].map(Number);
    const ent = x => Number.isInteger(x);
    if (![a, b, c, d].every(ent) || a < 1 || c < 1) return { error: "Los numeradores tienen que ser números enteros mayores que 0." };
    if (b < 2 || d < 2 || b > 20 || d > 20) return { error: "Los denominadores tienen que ser números enteros entre 2 y 20." };
    if (op !== "+" && op !== "-") return { error: "Elige sumar o restar." };
    const m = b / mcd(b, d) * d;
    if (m / b > 12 || m / d > 12) return { error: "Con estos denominadores las listas de múltiplos son demasiado largas para dibujarlas: prueba otros." };
    const k1 = m / b, k2 = m / d, A = a * k1, B = c * k2, R = op === "+" ? A + B : A - B;
    if (R < 0) return { error: "La segunda fracción es mayor que la primera: el resultado sería negativo. Cambia el orden." };
    const g = mcd(R, m) || 1;
    return { a, b, op, c, d, m, k1, k2, A, B, R, simple: [R / g, m / g], g,
             mb: Array.from({ length: m / b }, (_, i) => (i + 1) * b), md: Array.from({ length: m / d }, (_, i) => (i + 1) * d) };
  }

  const calcular = { suma };

  const EJEMPLOS = {
    suma: [
      { etiqueta: "1/4 + 5/6", a: 1, b: 4, op: "+", c: 5, d: 6, texto: "Suma 1/4 + 5/6." },
      { etiqueta: "7/8 − 1/6", a: 7, b: 8, op: "-", c: 1, d: 6, texto: "Resta 7/8 − 1/6." },
      { etiqueta: "2/3 + 1/2", a: 2, b: 3, op: "+", c: 1, d: 2, texto: "Suma 2/3 + 1/2." },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const pares = [[2, 3], [3, 4], [4, 6], [2, 5], [6, 8], [3, 5], [4, 10], [6, 9], [2, 6], [3, 9]];
    let [b, d] = pares[ent(0, pares.length - 1)];
    if (r() < .5) [b, d] = [d, b];
    let a, c;
    do a = ent(1, b - 1); while (mcd(a, b) !== 1);
    do c = ent(1, d - 1); while (mcd(c, d) !== 1);
    const op = r() < .5 ? "+" : "-";
    return op === "-" && a * d < c * b ? { a: c, b: d, op, c: a, d: b } : { a, b, op, c, d };
  }

  return { calcular, EJEMPLOS, azar };
})();

if (typeof module !== "undefined") module.exports = FracMcm;
