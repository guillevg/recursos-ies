// Notación científica paso a paso. Tres modos: escribir un número en
// notación científica (mover la coma y contar los saltos), pasar de la
// notación científica al número y comparar dos tamaños en una escala de
// potencias de 10. Y uno más con las potencias de la misma base (o del mismo
// exponente), escribiendo los factores uno a uno. Se trabaja con las cifras como texto, sin redondeos de la
// coma flotante. Cálculos separados del dibujo para probarlos con Node; el
// dibujo está en notacion.html.
"use strict";

const Notacion = (() => {
  // «384 400», «0,000007» o «60.250.000.000» → cifras y lugar de la coma.
  function leerNumero(texto) {
    let s = String(texto).trim().replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");  // puntos de miles
    s = s.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(s) || !/\d/.test(s)) return null;
    let [ent, dec = ""] = s.split(".");
    ent = ent.replace(/^0+(?=\d)/, "") || "0";
    return { cifras: ent + dec, coma: ent.length };   // la coma va tras `coma` cifras
  }

  // Número escrito con coma decimal y espacios de miles.
  function escribir(cifras, coma) {
    let ent = cifras.slice(0, coma).replace(/^0+(?=\d)/, "") || "0", dec = cifras.slice(coma).replace(/0+$/, "");
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return dec ? `${ent},${dec}` : ent;
  }

  function aCientifica({ numero }) {
    const n = leerNumero(numero);
    if (!n) return { error: "Escribe un número, con coma decimal si la tiene (por ejemplo, 384400 o 0,000007)." };
    const primera = n.cifras.search(/[1-9]/);
    if (primera < 0) return { error: "El 0 no se escribe en notación científica: escribe otro número." };
    // Para dibujarlo: sin ceros a la izquierda de la parte entera.
    let { cifras, coma } = n;
    if (cifras.length > 18) return { error: "Como mucho 18 cifras, para que se puedan dibujar." };
    const exponente = coma - (primera + 1);
    const resto = cifras.slice(primera + 1).replace(/0+$/, "");
    const mantisa = cifras[primera] + (resto ? "," + resto : "");
    return { cifras, coma, primera, exponente, mantisa, original: escribir(cifras, coma) };
  }

  function desdeCientifica({ mantisa, exponente }) {
    const m = leerNumero(mantisa);
    if (!m) return { error: "Escribe la primera parte como un número decimal (por ejemplo, 3,844)." };
    const ent = m.cifras.slice(0, m.coma).replace(/^0+/, "");
    if (ent.length !== 1 || ent === "0") return { error: "En notación científica, la primera parte tiene una sola cifra antes de la coma, y no es 0 (de 1 a 9,99…)." };
    if (!Number.isInteger(exponente) || Math.abs(exponente) > 15) return { error: "El exponente tiene que ser un número entero entre −15 y 15." };
    let cifras = ent + m.cifras.slice(m.coma).replace(/0+$/, ""), coma = 1;
    // Ceros que hay que añadir: a la derecha si la coma se va más allá, a la
    // izquierda si se va antes del principio.
    let derecha = 0, izquierda = 0;
    const nueva = coma + exponente;
    if (nueva > cifras.length) { derecha = nueva - cifras.length; cifras += "0".repeat(derecha); }
    if (nueva < 1) { izquierda = 1 - nueva; cifras = "0".repeat(izquierda) + cifras; coma += izquierda; }
    return { mantisa: escribir(ent + m.cifras.slice(m.coma), 1), exponente, cifras, comaInicial: coma, comaFinal: coma + exponente,
             derecha, izquierda, resultado: escribir(cifras, coma + exponente) };
  }

  // Dos cantidades m · 10^n; `ma`, `mb` como texto («3,844»).
  function comparar({ nombreA, ma, na, nombreB, mb, nb }) {
    const A = parseFloat(String(ma).replace(",", ".")), B = parseFloat(String(mb).replace(",", "."));
    if (!(A >= 1 && A < 10 && B >= 1 && B < 10)) return { error: "Las primeras partes tienen que estar entre 1 y 9,99… (notación científica)." };
    if (!Number.isInteger(na) || !Number.isInteger(nb) || Math.abs(na) > 40 || Math.abs(nb) > 40) return { error: "Los exponentes tienen que ser números enteros entre −40 y 40." };
    const la = na + Math.log10(A), lb = nb + Math.log10(B);
    const [mayor, menor] = la >= lb ? ["A", "B"] : ["B", "A"];
    const saltos = Math.abs(na - nb);
    const cociente = la >= lb ? (A / B) * 10 ** (na - nb) : (B / A) * 10 ** (nb - na);
    const exp = Math.floor(Math.log10(cociente) + 1e-12), man = cociente / 10 ** exp;
    return { nombreA, nombreB, A, na, B, nb, la, lb, mayor, menor, saltos, cociente, cocienteCient: [Math.round(man * 100) / 100, exp] };
  }

  // Potencias de la misma base (o del mismo exponente): producto a^m · a^n,
  // cociente a^m : a^n, potencia de una potencia (a^m)^n y a^n · b^n.
  function potencias({ tipo, a, m, n, b }) {
    const ent = x => Number.isInteger(x) && x >= 1;
    if (!ent(a) || a < 2 || a > 99) return { error: "La base tiene que ser un número entero entre 2 y 99." };
    if (!ent(n) || (tipo !== "exponente" && !ent(m))) return { error: "Los exponentes tienen que ser números enteros mayores que 0." };
    let base = a, exp;
    if (tipo === "producto") exp = m + n;
    else if (tipo === "cociente") { if (!(m > n)) return { error: "En el cociente, el primer exponente tiene que ser mayor que el segundo." }; exp = m - n; }
    else if (tipo === "potencia") exp = m * n;
    else if (tipo === "exponente") { if (!ent(b) || b < 2 || b > 99) return { error: "La segunda base tiene que ser un número entero entre 2 y 99." }; base = a * b; exp = n; }
    else return { error: "Elige el tipo de operación." };
    if (Math.max(tipo === "exponente" ? n : 0, m || 0, exp) > 12) return { error: "Para escribir los factores uno a uno, los exponentes tienen que ser como mucho 12." };
    const valor = base ** exp;
    return { tipo, a, m, n, b, base, exp, valor: valor <= 1e9 ? valor : null };
  }

  const calcular = { aCientifica, desdeCientifica, comparar, potencias };

  const EJEMPLOS = {
    aCientifica: [
      { etiqueta: "Tierra-Luna: 384 400 km", numero: "384400", texto: "La distancia media de la Tierra a la Luna es de 384 400 km. Exprésala en notación científica." },
      { etiqueta: "Glóbulo rojo: 0,000007 m", numero: "0,000007", texto: "Un glóbulo rojo mide unos 0,000007 m de diámetro. Exprésalo en notación científica." },
      { etiqueta: "60 250 000 000", numero: "60250000000", texto: "Expresa en notación científica: 60 250 000 000." },
      { etiqueta: "0,00001234", numero: "0,00001234", texto: "Expresa en notación científica: 0,00001234." },
    ],
    desdeCientifica: [
      { etiqueta: "2,2 · 10⁶ habitantes", mantisa: "2,2", exponente: 6, texto: "La población de Canarias es de unos 2,2 · 10⁶ habitantes. Escríbelo con todas sus cifras." },
      { etiqueta: "7 · 10⁻⁵ m", mantisa: "7", exponente: -5, texto: "Un cabello mide unos 7 · 10⁻⁵ m de grosor. Escríbelo como número decimal." },
      { etiqueta: "1,5 · 10⁸ km", mantisa: "1,5", exponente: 8, texto: "La distancia de la Tierra al Sol es de 1,5 · 10⁸ km. ¿Cuántos kilómetros son?" },
    ],
    comparar: [
      { etiqueta: "Cabello y glóbulo rojo", nombreA: "cabello", ma: "7", na: -5, nombreB: "glóbulo rojo", mb: "7", nb: -6, texto: "Un cabello mide 7 · 10⁻⁵ m y un glóbulo rojo, 7 · 10⁻⁶ m. ¿Cuántas veces más grueso es el cabello?" },
      { etiqueta: "Sol y Tierra", nombreA: "Sol", ma: "2", na: 30, nombreB: "Tierra", mb: "6", nb: 24, texto: "La masa del Sol es de unos 2 · 10³⁰ kg y la de la Tierra, de 6 · 10²⁴ kg. ¿Cuántas veces más masivo es el Sol?" },
      { etiqueta: "Luna y vuelta a la Tierra", nombreA: "Tierra-Luna", ma: "3,844", na: 5, nombreB: "vuelta a la Tierra", mb: "4", nb: 4, texto: "La Luna está a 3,844 · 10⁵ km y una vuelta a la Tierra mide unos 4 · 10⁴ km. ¿Cuántas vueltas a la Tierra son la distancia a la Luna?" },
    ],
    potencias: [
      { etiqueta: "2³ · 2⁴", tipo: "producto", a: 2, m: 3, n: 4, b: 0, texto: "Escribe como una sola potencia: 2³ · 2⁴." },
      { etiqueta: "5⁶ : 5²", tipo: "cociente", a: 5, m: 6, n: 2, b: 0, texto: "Escribe como una sola potencia: 5⁶ : 5²." },
      { etiqueta: "(3²)⁴", tipo: "potencia", a: 3, m: 2, n: 4, b: 0, texto: "Escribe como una sola potencia: (3²)⁴." },
      { etiqueta: "2³ · 5³", tipo: "exponente", a: 2, m: 0, n: 3, b: 5, texto: "Escribe como una sola potencia: 2³ · 5³." },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "potencias") {
      const tipo = ["producto", "cociente", "potencia", "exponente"][ent(0, 3)], a = [2, 3, 5, 7, 10][ent(0, 4)];
      if (tipo === "producto") return { tipo, a, m: ent(2, 5), n: ent(2, 5), b: 0 };
      if (tipo === "cociente") { const m = ent(4, 8); return { tipo, a, m, n: ent(2, m - 1), b: 0 }; }
      if (tipo === "potencia") return { tipo, a, m: ent(2, 4), n: ent(2, 3), b: 0 };
      const [x, y] = [[2, 5], [2, 3], [3, 5], [2, 7], [4, 5], [5, 3]][ent(0, 5)];
      return { tipo, a: x, m: 0, n: ent(2, 4), b: y };
    }
    const sig = () => String(ent(1, 9)) + (r() < 0.6 ? String(ent(0, 99)).padStart(2, "0").replace(/0+$/, "") : "");
    if (modo === "aCientifica") {
      const s = sig(), n = ent(-8, 9);
      const d = desdeCientifica({ mantisa: s.length > 1 ? s[0] + "," + s.slice(1) : s, exponente: n });
      return { numero: d.resultado.replace(/ /g, "") };
    }
    if (modo === "desdeCientifica") { const s = sig(); return { mantisa: s.length > 1 ? s[0] + "," + s.slice(1) : s, exponente: ent(-7, 9) }; }
    const n = ent(-9, 12);
    return { nombreA: "A", ma: String(ent(1, 9)), na: n + ent(1, 5), nombreB: "B", mb: String(ent(1, 9)), nb: n };
  }

  return { calcular, EJEMPLOS, azar, leerNumero, escribir };
})();

if (typeof module !== "undefined") module.exports = Notacion;
