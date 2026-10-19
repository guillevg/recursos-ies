// Multiplicar y dividir fracciones con dibujos, paso a paso. Tres modos:
// «fracción de una fracción» (modelo de área), «¿cuántas caben?» (dividir
// contando cuántas veces cabe el divisor, sobre una barra cortada en trozos
// comunes) y «¿mayor o menor?» (el efecto de multiplicar o dividir por un
// número menor o mayor que 1, en la recta). Cálculos separados del dibujo para probarlos con Node
// (tests/test_web_herramientas.py); el dibujo está en producto.html.
"use strict";

const Producto = (() => {
  const mcd = (x, y) => y === 0 ? Math.abs(x) : mcd(y, x % y);
  const simp = (n, d) => { const g = mcd(n, d) || 1; return [n / g, d / g]; };

  // a/b de c/d: se dibuja c/d en columnas y se marcan a de b filas.
  function deUna({ a, b, c, d }) {
    if (!(b >= 1 && d >= 1 && b <= 12 && d <= 12)) return { error: "Los denominadores tienen que estar entre 1 y 12." };
    if (!(a >= 0 && a <= b && c >= 0 && c <= d)) return { error: "Las dos fracciones tienen que estar entre 0 y 1 (numerador no mayor que el denominador)." };
    const n = a * c, total = b * d;
    return { a, b, c, d, n, total, simple: simp(n, total) };
  }

  // (a/b) : (c/d): ¿cuántas veces cabe c/d en a/b? Se cortan las unidades en
  // m trozos (el m.c.m. de b y d): el dividendo ocupa A trozos y el divisor C.
  function caben({ a, b, c, d }) {
    if (!(b >= 1 && d >= 1 && b <= 12 && d <= 12)) return { error: "Los denominadores tienen que estar entre 1 y 12." };
    if (!(a >= 1 && c >= 1)) return { error: "Los numeradores tienen que ser mayores que 0." };
    const m = b * d / mcd(b, d), A = a * m / b, C = c * m / d;
    // Las unidades que hay que dibujar: hasta el dividendo o, si es más corto, hasta el divisor.
    const unidades = Math.max(Math.ceil(a / b), Math.ceil(c / d));
    if (unidades > 8) return { error: "El dividendo es demasiado grande para dibujarlo (como mucho, 8 unidades)." };
    if (unidades * m > 72) return { error: "Salen demasiados trozos para dibujarlos: prueba con denominadores más pequeños." };
    const enteras = Math.floor(A / C), sobra = A - enteras * C;
    return { a, b, c, d, m, A, C, unidades, enteras, sobra, cociente: simp(a * d, b * c), sobraFrac: simp(sobra, C) };
  }

  // ¿Mayor o menor? N · k o N : k comparado con N, según k sea menor o mayor que 1.
  function efecto({ N, op, k }) {
    if (!(N > 0 && k > 0)) return { error: "Los dos números tienen que ser mayores que 0." };
    if (op !== "·" && op !== ":") return { error: "La operación tiene que ser una multiplicación o una división." };
    if (k === 1) return { error: "Con 1 el número no cambia: prueba con otro." };
    const r = Math.round((op === "·" ? N * k : N / k) * 1e6) / 1e6, inv = Math.round(1e6 / k) / 1e6;
    // Equivalencia sencilla: · 0,5 es : 2; : 0,25 es · 4.
    const eq = k < 1 && Number.isInteger(inv) ? (op === "·" ? `: ${inv}` : `· ${inv}`) : null;
    return { N, op, k, r, mayor: r > N, eq };
  }

  const calcular = { deUna, caben, efecto };

  const EJEMPLOS = {
    deUna: [
      { etiqueta: "2/3 de 3/4", a: 2, b: 3, c: 3, d: 4, texto: "Pinta 3/4 de un rectángulo y marca 2/3 de lo pintado. ¿Qué fracción del rectángulo has marcado?" },
      { etiqueta: "Media de un cuarto", a: 1, b: 2, c: 1, d: 4, texto: "En el mercado piden media de un cuarto de kilo de jamón. ¿Qué fracción de kilo es?" },
      { etiqueta: "3/5 de 5/6", a: 3, b: 5, c: 5, d: 6, texto: "Calcula 3/5 de 5/6." },
    ],
    caben: [
      { etiqueta: "3 : 1/5 (regletas)", a: 3, b: 1, c: 1, d: 5, texto: "Si la regleta naranja vale 1, la roja vale 1/5. ¿Cuántas regletas rojas caben en un tren de tres naranjas?" },
      { etiqueta: "2 : 2/5 (vasos)", a: 2, b: 1, c: 2, d: 5, texto: "¿Cuántos vasos de 2/5 de litro se llenan con una jarra de 2 litros?" },
      { etiqueta: "5 : 3/4 (¿sobra?)", a: 5, b: 1, c: 3, d: 4, texto: "¿Cuántos vasos de 3/4 de litro se llenan con 5 litros? ¿Sobra algo?" },
      { etiqueta: "3/4 : 1/8", a: 3, b: 4, c: 1, d: 8, texto: "¿Cuántas porciones de 1/8 de pizza hay en 3/4 de pizza?" },
    ],
    efecto: [
      { etiqueta: "60 · 0,5", N: 60, op: "·", k: 0.5, texto: "¿60 · 0,5 es mayor o menor que 60?" },
      { etiqueta: "12 : 0,25", N: 12, op: ":", k: 0.25, texto: "¿12 : 0,25 es mayor o menor que 12?" },
      { etiqueta: "80 · 1,5", N: 80, op: "·", k: 1.5, texto: "¿80 · 1,5 es mayor o menor que 80?" },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "efecto") {
      const ops = [["·", 0.5], ["·", 0.25], ["·", 0.2], ["·", 0.8], ["·", 1.5], ["·", 2.5], [":", 0.5], [":", 0.25], [":", 0.2], [":", 0.1], [":", 2], [":", 4]];
      const [op, k] = ops[ent(0, ops.length - 1)];
      return { N: 20 * ent(1, 20), op, k };
    }
    if (modo === "deUna") { const b = ent(2, 5), d = ent(2, 6); return { a: ent(1, b - 1), b, c: ent(1, d - 1), d }; }
    for (;;) {
      const b = [1, 1, 2, 3, 4][ent(0, 4)], d = ent(2, 6), a = b === 1 ? ent(1, 4) : ent(1, 3 * b - 1), c = ent(1, d - 1);
      const x = caben({ a, b, c, d });
      if (!x.error && x.enteras >= 1) return { a, b, c, d };
    }
  }

  return { calcular, EJEMPLOS, azar, simp };
})();

if (typeof module !== "undefined") module.exports = Producto;
