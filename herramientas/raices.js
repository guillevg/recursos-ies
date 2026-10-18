// Raíces cuadradas con cuadrados, paso a paso: el lado de un cuadrado de
// área N está entre los lados de los cuadrados perfectos que lo rodean, y se
// afina hasta las décimas. Cálculos separados del dibujo para probarlos con
// Node; el dibujo está en raices.html.
"use strict";

const Raices = (() => {
  // Trabajamos en centésimas para comparar sin errores de coma flotante:
  // (a/10)² ≤ N  ⇔  a² ≤ 100·N.
  function lado({ area }) {
    if (!(area > 0) || area > 10000) return { error: "El área tiene que ser mayor que 0 y, como mucho, 10 000." };
    const cent = Math.round(area * 100);
    if (Math.abs(cent - area * 100) > 1e-6) return { error: "Usa como mucho dos decimales en el área (por ejemplo, 0,09)." };
    let n = Math.floor(Math.sqrt(area) + 1e-9);
    while ((n + 1) * (n + 1) * 100 <= cent) n++;
    while (n * n * 100 > cent) n--;
    const exacta = n * n * 100 === cent;
    // Décimas: el mayor a con a² ≤ 100·N (a = lado en décimas).
    let a = n * 10;
    while ((a + 1) * (a + 1) <= cent) a++;
    const decimas = [];
    for (let t = n * 10; t <= Math.min(a + 1, n * 10 + 10); t++) decimas.push({ lado: t / 10, cuadrado: t * t / 100 });
    const exactaDecimas = a * a === cent;
    const raiz = Math.sqrt(area);
    // Redondeo a las décimas: √N < a,5 décimas ⇔ 100·N < (a + 0,5)² ⇔ 4·100·N < (2a + 1)².
    const redondeo = 4 * cent < (2 * a + 1) ** 2 ? a / 10 : (a + 1) / 10;
    return { area, n, exacta, a, decimas, exactaDecimas, raiz, redondeo,
             cercaDe: 4 * area < (2 * n + 1) ** 2 ? n : n + 1 };
  }

  const calcular = { lado };

  const EJEMPLOS = {
    lado: [
      { etiqueta: "√30", area: 30, texto: "Sin calculadora, ¿entre qué dos números enteros está √30? Después, redondea a las décimas." },
      { etiqueta: "√200", area: 200, texto: "Sin calculadora, ¿entre qué dos números enteros está √200?" },
      { etiqueta: "Terreno de 225 m²", area: 225, texto: "Un terreno cuadrado tiene 225 m² de área. ¿Cuánto mide su lado?" },
      { etiqueta: "Baldosa de 0,09 m²", area: 0.09, texto: "Una baldosa cuadrada tiene 0,09 m² de superficie. ¿Cuánto mide su lado?" },
    ],
  };

  function azar(_, r = Math.random) {
    const n = 2 + Math.floor(r() * 14);
    return { area: n * n + 1 + Math.floor(r() * 2 * n) };
  }

  return { calcular, EJEMPLOS, azar };
})();

if (typeof module !== "undefined") module.exports = Raices;
