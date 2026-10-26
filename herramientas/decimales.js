// Decimales paso a paso: comparar dos decimales (colocarlos por la coma,
// igualar las cifras con ceros y buscar la primera cifra distinta) y
// redondear (entre qué dos números está, la mitad y la cifra que decide).
// Las cifras se tratan como texto y enteros, sin redondeos de la coma
// flotante. Cálculos separados del dibujo para probarlos con Node; el dibujo
// está en decimales.html. Acompaña al bloque A de la SA1 de 1º PDC.
"use strict";

const Decimales = (() => {
  const LUGARES = ["décimas", "centésimas", "milésimas", "diezmilésimas"];
  const ENTEROS = ["U", "D", "C", "UM"];

  // «0,67», «0.67» o «12» → { ent: "0", dec: "67" }.
  function leer(texto) {
    const s = String(texto ?? "").trim().replace(/\s/g, "").replace(".", ",");
    const m = s.match(/^(\d+)(?:,(\d*))?$/);
    if (!m) return null;
    return { ent: m[1].replace(/^0+(?=\d)/, ""), dec: m[2] || "" };
  }
  const escribir = (ent, dec) => ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (dec ? "," + dec : "");
  // Entero n de unidades de 10^-p, escrito con p decimales («3,470»).
  function fijo(n, p) {
    const s = String(n).padStart(p + 1, "0");
    return escribir(s.slice(0, s.length - p), p ? s.slice(s.length - p) : "");
  }

  function comparar({ a, b }) {
    const A = leer(a), B = leer(b);
    if (!A || !B) return { error: "Escribe dos números positivos, con coma decimal si la tienen (por ejemplo, 0,7 y 0,67)." };
    if (A.dec.length > 3 || B.dec.length > 3) return { error: "Como mucho tres cifras decimales, para que se puedan dibujar." };
    if (A.ent.length > 4 || B.ent.length > 4) return { error: "Como mucho cuatro cifras en la parte entera." };
    const p = Math.max(1, A.dec.length, B.dec.length);
    const da = A.dec.padEnd(p, "0"), db = B.dec.padEnd(p, "0");
    const va = Number(A.ent + da), vb = Number(B.ent + db);   // en unidades de 10^-p
    let donde = null;                                          // "entera" o el índice de la primera décima distinta
    if (Number(A.ent) !== Number(B.ent)) donde = "entera";
    else for (let i = 0; i < p; i++) if (da[i] !== db[i]) { donde = i; break; }
    const mayor = va === vb ? "igual" : va > vb ? "a" : "b";
    return { A, B, p, da, db, va, vb, donde, mayor, textoA: escribir(A.ent, A.dec), textoB: escribir(B.ent, B.dec),
             anchoA: escribir(A.ent, da), anchoB: escribir(B.ent, db), lugar: LUGARES[p - 1] };
  }

  function redondeo({ x, t }) {
    const X = leer(x);
    t = Number(t);
    if (!X) return { error: "Escribe un número positivo con coma decimal (por ejemplo, 23,95)." };
    if (![0, 1, 2].includes(t)) return { error: "Elige a qué redondear: unidades, décimas o centésimas." };
    if (X.ent.length > 4 || X.dec.length > 4) return { error: "Como mucho cuatro cifras en la parte entera y cuatro decimales." };
    if (X.dec.length <= t) return { error: `Ese número no tiene más cifras que las ${t === 0 ? "unidades" : LUGARES[t - 1]}: no hay nada que redondear.` };
    const p = X.dec.length, q = 10 ** (p - t), n = Number(X.ent + X.dec);
    const T = Math.floor(n / q), R = Math.floor((2 * n + q) / (2 * q)), cifra = Number(X.dec[t]);
    return { X, t, p, n, q, T, R, cifra, sube: R > T, mitadJusta: n * 2 === (2 * T + 1) * q,
             original: escribir(X.ent, X.dec), bajo: fijo(T, t), alto: fijo(T + 1, t), mitad: fijo(10 * T + 5, t + 1), res: fijo(R, t),
             lugar: ["las unidades", "las décimas", "las centésimas"][t], lugarCifra: LUGARES[t] };
  }

  const calcular = { comparar, redondeo };

  const EJEMPLOS = {
    comparar: [
      { etiqueta: "0,7 y 0,67", a: "0,7", b: "0,67", texto: "¿Qué número es mayor, 0,7 o 0,67?" },
      { etiqueta: "0,08 y 0,6", a: "0,08", b: "0,6", texto: "¿Qué número es mayor, 0,08 o 0,6?" },
      { etiqueta: "2,5 y 2,50", a: "2,5", b: "2,50", texto: "¿Cuál es mayor, 2,5 o 2,50?" },
      { etiqueta: "1,305 y 1,35", a: "1,305", b: "1,35", texto: "Una muestra pesa 1,305 kg y otra, 1,35 kg. ¿Cuál pesa más?" },
    ],
    redondeo: [
      { etiqueta: "3,476 a las décimas", x: "3,476", t: "1", texto: "Redondea 3,476 a las décimas." },
      { etiqueta: "23,95 a las décimas", x: "23,95", t: "1", texto: "Una balanza marca 23,95 g. Redondea a las décimas." },
      { etiqueta: "7,4 a las unidades", x: "7,4", t: "0", texto: "Redondea 7,4 a las unidades." },
      { etiqueta: "1,2345 a las centésimas", x: "1,2345", t: "2", texto: "La calculadora da 1,2345. Redondea a las centésimas." },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const cifras = k => Array.from({ length: k }, (_, i) => String(i === k - 1 ? ent(1, 9) : ent(0, 9))).join("");
    if (modo === "comparar") {
      const e = String([0, 0, 1, 2, 5][ent(0, 4)]);
      return { a: `${e},${cifras(ent(1, 3))}`, b: `${r() < .8 ? e : ent(0, 9)},${cifras(ent(1, 3))}` };
    }
    const t = ent(0, 2);
    return { x: `${ent(0, 60)},${cifras(t + ent(1, 2))}`, t: String(t) };
  }

  return { calcular, EJEMPLOS, azar, leer, fijo, LUGARES, ENTEROS };
})();

if (typeof module !== "undefined") module.exports = Decimales;
