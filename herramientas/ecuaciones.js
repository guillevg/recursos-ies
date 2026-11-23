// Ecuaciones de primer grado, paso a paso: la balanza (ax + b = cx + d con
// cajas iguales y pesas de 1 kg) y el diagrama de barras con una incógnita
// (dos cantidades, una en función de la otra, y su total). Los cálculos
// están separados del dibujo para poder probarlos con Node; el dibujo
// (ecuaciones.html) usa Pasos (pasos.js).
"use strict";

const Ecuaciones = (() => {
  const entero = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

  // Un miembro de la ecuación: a cajas (x) y b unidades.
  function miembro(a, b) {
    const cajas = a === 0 ? "" : a === 1 ? "x" : `${a}x`;
    if (!cajas) return String(b);
    return b === 0 ? cajas : `${cajas} + ${b}`;
  }

  // ------------------------------------------------------------- cálculos
  // Balanza: a cajas y b pesas en el platillo izquierdo; c cajas y d pesas
  // en el derecho. Se quitan las cajas comunes, después las pesas comunes y
  // se reparte entre las cajas que quedan.
  function balanza({ a, b, c, d }) {
    if (!(entero(a, 0, 6) && entero(c, 0, 6))) return { error: "En cada platillo caben de 0 a 6 cajas (números enteros)." };
    if (!(entero(b, 0, 20) && entero(d, 0, 20))) return { error: "En cada platillo caben de 0 a 20 pesas de 1 kg (números enteros)." };
    if (a === c) return { error: b === d
      ? "Los dos platillos tienen lo mismo: la balanza está equilibrada pesen lo que pesen las cajas."
      : "Hay las mismas cajas en los dos platillos y distintas pesas: esa balanza no puede estar equilibrada." };
    const x = (d - b) / (a - c);
    if (!(x > 0)) return { error: "Con esos datos, cada caja tendría que pesar 0 kg o menos: en una balanza de verdad no puede ser." };
    const cajas = Math.min(a, c), pesas = Math.min(b, d);
    const lado = a > c ? "izq" : "der";            // el platillo donde quedan las cajas
    return { a, b, c, d, x, cajas, pesas, lado, k: Math.abs(a - c), m: Math.abs(d - b), entera: Number.isInteger(x),
             peso: a * x + b };
  }

  // Barras: la primera cantidad es x; la segunda, m veces la primera más
  // k; entre las dos suman `total`.
  function barras({ m, k, total }) {
    if (!entero(m, 1, 6)) return { error: "La segunda cantidad tiene que ser de 1 a 6 veces la primera." };
    if (!(k >= 0)) return { error: "Lo que tiene de más no puede ser negativo." };
    if (!(total > k)) return { error: "El total tiene que ser mayor que lo que la segunda cantidad tiene de más." };
    const x = (total - k) / (m + 1);
    return { m, k, total, x, trozos: m + 1, iguales: total - k, segunda: m * x + k };
  }

  const calcular = { balanza, barras };

  // ------------------------------------------------------------- ejemplos
  // El primero de cada modo es del banco de la SA4 (D04 y D14).
  const EJEMPLOS = {
    balanza: [
      { etiqueta: "3 cajas y 2 = 1 caja y 8", a: 3, b: 2, c: 1, d: 8,
        texto: "En un platillo hay 3 cajas iguales y 2 pesas de 1 kg; en el otro, 1 caja y 8 pesas. La balanza está equilibrada. ¿Cuánto pesa cada caja?" },
      { etiqueta: "2 cajas y 5 = 13", a: 2, b: 5, c: 0, d: 13,
        texto: "Dos cajas iguales y 5 pesas de 1 kg pesan lo mismo que 13 pesas. ¿Cuánto pesa cada caja?" },
      { etiqueta: "4 cajas = 1 caja y 12", a: 4, b: 0, c: 1, d: 12,
        texto: "Cuatro cajas iguales pesan lo mismo que una caja y 12 pesas de 1 kg. ¿Cuánto pesa cada caja?" },
      { etiqueta: "2 cajas y 9 = 5 cajas y 3", a: 2, b: 9, c: 5, d: 3,
        texto: "En un platillo hay 2 cajas y 9 pesas de 1 kg; en el otro, 5 cajas y 3 pesas. ¿Cuánto pesa cada caja?" },
    ],
    barras: [
      { etiqueta: "Cromos: el triple, 36", m: 3, k: 0, total: 36, n1: "Hermano", n2: "Marta",
        texto: "Entre Marta y su hermano tienen 36 cromos, y Marta tiene el triple que su hermano. ¿Cuántos tiene cada uno?" },
      { etiqueta: "Ahorros: el doble y 5 más, 41", m: 2, k: 5, total: 41, n1: "Eva", n2: "Luis",
        texto: "Luis tiene ahorrado el doble que Eva y 5 € más. Entre los dos tienen 41 €. ¿Cuánto tiene cada uno?" },
      { etiqueta: "Merienda: 2 € más, 8 €", m: 1, k: 2, total: 8, n1: "Refresco", n2: "Bocadillo",
        texto: "Un bocadillo cuesta 2 € más que un refresco. Las dos cosas juntas cuestan 8 €. ¿Cuánto cuesta cada una?" },
      { etiqueta: "Edades: 4 veces y 3 más, 48", m: 4, k: 3, total: 48, n1: "Nieta", n2: "Abuelo",
        texto: "Un abuelo tiene 3 años más que el cuádruple de la edad de su nieta. Entre los dos suman 48 años. ¿Qué edad tiene cada uno?" },
    ],
  };

  // Datos al azar con solución entera.
  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "balanza") {
      const k = ent(1, 4), comunes = ent(0, Math.min(2, 6 - k)), x = ent(1, Math.floor(20 / k));
      const sobran = ent(0, Math.min(6, 20 - k * x));
      const d = { a: comunes + k, b: sobran, c: comunes, d: sobran + k * x };
      return r() < 0.3 ? { a: d.c, b: d.d, c: d.a, d: d.b } : d;
    }
    const m = ent(1, 4), k = r() < 0.4 ? 0 : ent(1, 10), x = ent(2, 20);
    return { m, k, total: (m + 1) * x + k, n1: "Primera", n2: "Segunda" };
  }

  return { calcular, miembro, EJEMPLOS, azar };
})();

if (typeof module !== "undefined") module.exports = Ecuaciones;
