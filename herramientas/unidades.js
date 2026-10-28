// Cambio de unidades paso a paso. Tres modos: por qué cada escalón es ×10 en
// longitud, ×100 en superficie y ×1000 en volumen (una línea, un cuadrado y
// un cubo partidos en trozos de la unidad siguiente); cambiar de unidad con
// la escalera (contar escalones y mover la coma) y pasar de volumen a litros
// por el puente 1 dm³ = 1 L. Las cifras se tratan como texto, sin redondeos
// de la coma flotante. Cálculos separados del dibujo para probarlos con Node;
// el dibujo está en unidades.html. Acompaña al bloque D de la SA1 de 1º PDC.
"use strict";

const Unidades = (() => {
  const PREFIJOS = ["k", "h", "da", "", "d", "c", "m"];
  // Cada escalera: sus unidades de mayor a menor, los ceros de cada escalón
  // y cómo se llama lo que mide.
  const ESCALERAS = {
    longitud: { base: "m", ceros: 1, mide: "longitud" },
    masa: { base: "g", ceros: 1, mide: "masa" },
    capacidad: { base: "L", ceros: 1, mide: "capacidad" },
    superficie: { base: "m²", ceros: 2, mide: "superficie" },
    volumen: { base: "m³", ceros: 3, mide: "volumen" },
  };
  const unidades = magnitud => PREFIJOS.map(p => p + ESCALERAS[magnitud].base);

  // Escalera de los litros con el volumen al lado: la posición de cada
  // unidad en la de capacidad (1 m³ = 1 kL, 1 dm³ = 1 L, 1 cm³ = 1 mL).
  const LITROS = { kL: 0, hL: 1, daL: 2, L: 3, dL: 4, cL: 5, mL: 6, "m³": 0, "dm³": 3, "cm³": 6 };
  const PUENTE = { "m³": "kL", "dm³": "L", "cm³": "mL" };
  const esVolumen = u => u.endsWith("³");

  // «2,5», «2.5» o «1 500» → { cifras, coma } (la coma va tras `coma` cifras).
  function leer(texto) {
    let s = String(texto ?? "").trim().replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");   // puntos de miles
    s = s.replace(".", ",");
    const m = s.match(/^(\d*)(?:,(\d*))?$/);
    if (!m || !/\d/.test(s)) return null;
    const ent = m[1].replace(/^0+(?=\d)/, "") || "0", dec = m[2] || "";
    return { cifras: ent + dec, coma: ent.length };
  }
  // Número escrito con coma decimal y espacios de miles.
  function escribir(cifras, coma) {
    let ent = cifras.slice(0, coma).replace(/^0+(?=\d)/, "") || "0";
    const dec = cifras.slice(coma).replace(/0+$/, "");
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return dec ? `${ent},${dec}` : ent;
  }

  // Mover la coma `lugares` (positivo, a la derecha), con ceros de relleno.
  // Devuelve lo necesario para dibujarlo en cajas.
  function moverComa(n, lugares) {
    let cifras = n.cifras, coma = n.coma, izquierda = 0, derecha = 0;
    // Sin ceros sobrantes a la derecha de los decimales, salvo los de la parte entera.
    const fin = Math.max(coma, cifras.replace(/0+$/, "").length);
    cifras = cifras.slice(0, fin);
    const nueva = coma + lugares;
    if (nueva > cifras.length) { derecha = nueva - cifras.length; cifras += "0".repeat(derecha); }
    if (nueva < 1) { izquierda = 1 - nueva; cifras = "0".repeat(izquierda) + cifras; coma += izquierda; }
    // Ceros a la izquierda que sobran tras mover la coma a la derecha (0,5 → 05).
    return { cifras, comaInicial: coma, comaFinal: coma + lugares, izquierda, derecha, resultado: escribir(cifras, coma + lugares) };
  }

  const MAX_CIFRAS = 14;

  // La magnitud se deduce de la unidad de partida.
  const magnitudDe = u => Object.keys(ESCALERAS).find(m => unidades(m).includes(u));

  function cambiar({ numero, desde, hasta }) {
    const magnitud = magnitudDe(desde), otra = magnitudDe(hasta);
    if (!magnitud || !otra) return { error: "Elige las dos unidades en las listas." };
    if (magnitud !== otra) return { error: `${desde} mide ${ESCALERAS[magnitud].mide} y ${hasta} mide ${ESCALERAS[otra].mide}: no miden lo mismo, así que no se puede pasar de una a otra.` };
    if (desde === hasta) return { error: "Elige dos unidades distintas." };
    const us = unidades(magnitud), i = us.indexOf(desde), j = us.indexOf(hasta);
    const n = leer(numero);
    if (!n) return { error: "Escribe un número, con coma decimal si la tiene (por ejemplo, 2,5)." };
    if (n.cifras.length > 8) return { error: "Como mucho 8 cifras, para que se puedan dibujar." };
    const { ceros } = ESCALERAS[magnitud], escalones = j - i, lugares = escalones * ceros;
    const m = moverComa(n, lugares);
    if (m.cifras.length > MAX_CIFRAS) return { error: "Salen demasiadas cifras para dibujarlas: prueba con dos unidades más cercanas." };
    return { magnitud, us, i, j, desde, hasta, escalones, ceros, lugares, original: escribir(n.cifras, n.coma),
             factor: 10 ** (Math.abs(escalones) * ceros), ...m };
  }

  function litros({ numero, desde, hasta }) {
    if (!(desde in LITROS) || !(hasta in LITROS)) return { error: "Elige dos unidades de volumen (m³, dm³, cm³) o de capacidad (kL … mL)." };
    const n = leer(numero);
    if (!n) return { error: "Escribe un número, con coma decimal si la tiene (por ejemplo, 1,5)." };
    if (n.cifras.length > 8) return { error: "Como mucho 8 cifras, para que se puedan dibujar." };
    // Si una de las dos es de volumen, se cruza por su puente; el resto del
    // camino va por la escalera de los litros (×10 cada escalón).
    const puenteDesde = esVolumen(desde) ? PUENTE[desde] : null, puenteHasta = esVolumen(hasta) ? PUENTE[hasta] : null;
    const a = LITROS[desde], b = LITROS[hasta], escalones = b - a;
    const m = moverComa(n, escalones);
    if (m.cifras.length > MAX_CIFRAS) return { error: "Salen demasiadas cifras para dibujarlas: prueba con dos unidades más cercanas." };
    return { desde, hasta, a, b, escalones, lugares: escalones, puenteDesde, puenteHasta, original: escribir(n.cifras, n.coma),
             factor: 10 ** Math.abs(escalones), ...m };
  }

  // Una unidad y la siguiente (más pequeña): 1 m = 10 dm, 1 m² = 100 dm², 1 m³ = 1000 dm³.
  const PAREJAS = { "m-dm": ["m", "dm"], "dm-cm": ["dm", "cm"], "cm-mm": ["cm", "mm"], "km-hm": ["km", "hm"] };
  const LITRO = { "m-dm": "1 m³ = 1000 dm³ = 1000 L", "dm-cm": "1 dm³ = 1 L y 1 cm³ = 1 mL" };
  function porque({ pareja }) {
    if (!(pareja in PAREJAS)) return { error: "Elige una unidad y la siguiente." };
    const [g, p] = PAREJAS[pareja];
    return { pareja, g, p, litro: LITRO[pareja] ?? null };
  }

  const calcular = { porque, cambiar, litros };

  const EJEMPLOS = {
    porque: [
      { etiqueta: "1 m y 1 dm", pareja: "m-dm", texto: "¿Por qué 1 m = 10 dm, pero 1 m² = 100 dm² y 1 m³ = 1000 dm³?" },
      { etiqueta: "1 dm y 1 cm", pareja: "dm-cm", texto: "¿Cuántos cubitos de 1 cm de lado caben en un cubo de 1 dm de lado?" },
      { etiqueta: "1 cm y 1 mm", pareja: "cm-mm", texto: "¿Cuántos mm² tiene 1 cm²?" },
    ],
    cambiar: [
      { etiqueta: "2,5 km a m", numero: "2,5", desde: "km", hasta: "m", texto: "Pasa 2,5 km a metros." },
      { etiqueta: "350 g a kg", numero: "350", desde: "g", hasta: "kg", texto: "Pasa 350 g a kilogramos." },
      { etiqueta: "75 cm a m", numero: "75", desde: "cm", hasta: "m", texto: "Pasa 75 cm a metros." },
      { etiqueta: "1,2 L a mL", numero: "1,2", desde: "L", hasta: "mL", texto: "Pasa 1,2 L a mililitros." },
      { etiqueta: "0,5 hm² a m²", numero: "0,5", desde: "hm²", hasta: "m²", texto: "Una finca mide 0,5 hm² (media hectárea). ¿Cuántos metros cuadrados son?" },
      { etiqueta: "3 m² a cm²", numero: "3", desde: "m²", hasta: "cm²", texto: "Pasa 3 m² a centímetros cuadrados." },
      { etiqueta: "2 dm³ a cm³", numero: "2", desde: "dm³", hasta: "cm³", texto: "Pasa 2 dm³ a centímetros cúbicos." },
    ],
    litros: [
      { etiqueta: "1,5 m³ a L", numero: "1,5", desde: "m³", hasta: "L", texto: "¿Cuántos litros caben en un depósito de 1,5 m³?" },
      { etiqueta: "500 mL a L", numero: "500", desde: "mL", hasta: "L", texto: "Disolvemos 20 g de sal en 500 mL de agua. ¿Cuántos litros de disolución son?" },
      { etiqueta: "5 cm³ a mL", numero: "5", desde: "cm³", hasta: "mL", texto: "Una jeringa tiene 5 cm³. ¿Cuántos mililitros son?" },
      { etiqueta: "144 m³ a L", numero: "144", desde: "m³", hasta: "L", texto: "Un aula tiene 144 m³ de aire. ¿Cuántos litros son?" },
      { etiqueta: "250 L a m³", numero: "250", desde: "L", hasta: "m³", texto: "Un bidón tiene 250 L. ¿Qué parte de un metro cúbico es?" },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const numero = () => {
      const t = ent(0, 2);
      if (t === 0) return String(ent(1, 999));
      if (t === 1) return `${ent(0, 99)},${ent(1, 9)}`;
      return `${ent(0, 9)},${ent(0, 9)}${ent(1, 9)}`;
    };
    if (modo === "porque") return { pareja: ["m-dm", "dm-cm", "cm-mm"][ent(0, 2)] };
    if (modo === "litros") {
      const todas = Object.keys(LITROS);
      let desde, hasta;
      do { desde = todas[ent(0, todas.length - 1)]; hasta = todas[ent(0, todas.length - 1)]; }
      while (desde === hasta || Math.abs(LITROS[desde] - LITROS[hasta]) > 6);
      return { numero: numero(), desde, hasta };
    }
    const magnitud = Object.keys(ESCALERAS)[ent(0, 4)], us = unidades(magnitud), c = ESCALERAS[magnitud].ceros;
    const maxEsc = Math.floor(6 / c);   // como mucho 6 lugares de coma
    let i, j;
    do { i = ent(0, 6); j = ent(0, 6); } while (i === j || Math.abs(i - j) > maxEsc);
    return { numero: numero(), desde: us[i], hasta: us[j] };
  }

  return { calcular, EJEMPLOS, azar, leer, escribir, unidades, magnitudDe, ESCALERAS, LITROS, PUENTE, PAREJAS };
})();

if (typeof module !== "undefined") module.exports = Unidades;
