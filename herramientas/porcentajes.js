// Porcentajes con la recta doble (arriba, los porcentajes; abajo, las
// cantidades), paso a paso. Tres modos: el tanto por ciento de una
// cantidad (también mayor que 100 % y menor que 1 %), qué porcentaje es una
// parte y aumentos o descuentos con su multiplicador. Cálculos separados del
// dibujo para probarlos con Node; el dibujo está en porcentajes.html.
"use strict";

const Porcentajes = (() => {
  const redondo = x => Math.round(x * 1e9) / 1e9;

  // Porcentaje de referencia para calcular p % de cabeza: el 25 % (la
  // cuarta parte), el 10 % (la décima parte), el 5 % (la mitad del 10 %), el
  // 1 % (la centésima parte) o, para porcentajes con decimales, el 0,1 % o
  // el 0,01 %.
  function referencia(p) {
    if (Number.isInteger(p)) {
      if (p % 25 === 0) return 25;
      if (p % 10 === 0) return 10;
      if (p % 5 === 0) return 5;
      return 1;
    }
    return Number.isInteger(redondo(p * 10)) ? 0.1 : 0.01;
  }

  function de({ p, total }) {
    if (!(p > 0) || p > 1000) return { error: "El porcentaje tiene que ser mayor que 0 (y, como mucho, 1000 %)." };
    if (!Number.isInteger(redondo(p * 100))) return { error: "Usa como mucho dos decimales en el porcentaje (por ejemplo, 0,08 %)." };
    if (!(total > 0)) return { error: "La cantidad tiene que ser mayor que 0." };
    const base = referencia(p), vBase = redondo(total * base / 100), veces = redondo(p / base);
    return { p, total, base, vBase, veces, resultado: redondo(total * p / 100), multiplicador: redondo(p / 100) };
  }

  function que({ parte, total }) {
    if (!(total > 0) || !(parte >= 0)) return { error: "El total tiene que ser mayor que 0 y la parte, positiva." };
    const p = redondo(parte / total * 100);
    if (p > 1000) return { error: "La parte es más de diez veces el total: demasiado para dibujarlo." };
    return { parte, total, uno: redondo(total / 100), p, decimal: redondo(parte / total) };
  }

  // `sentido`: "sube" o "baja".
  function variacion({ total, p, sentido }) {
    if (!(total > 0)) return { error: "La cantidad tiene que ser mayor que 0." };
    if (!(p > 0) || (sentido === "baja" && p > 100) || p > 500) return { error: sentido === "baja" ? "Un descuento tiene que estar entre 0 y 100 %." : "El aumento tiene que estar entre 0 y 500 %." };
    const cambio = de({ p, total });
    if (cambio.error) return cambio;
    const final_ = sentido === "baja" ? 100 - p : 100 + p;
    return { total, p, sentido, cambio, pFinal: redondo(final_), resultado: redondo(total * final_ / 100), multiplicador: redondo(final_ / 100) };
  }

  // Dos cambios seguidos: cada uno se aplica sobre el resultado del anterior.
  function encadenados({ total, p1, s1, p2, s2 }) {
    const malo = (p, s) => !(p > 0) || (s === "baja" && p >= 100) || p > 500;
    if (!(total > 0)) return { error: "La cantidad tiene que ser mayor que 0." };
    if (malo(p1, s1) || malo(p2, s2)) return { error: "Cada porcentaje tiene que ser mayor que 0 (y un descuento, menor que 100 %)." };
    const m1 = redondo(1 + (s1 === "sube" ? p1 : -p1) / 100), m2 = redondo(1 + (s2 === "sube" ? p2 : -p2) / 100);
    const medio = redondo(total * m1), final_ = redondo(medio * m2), m = redondo(m1 * m2);
    const sumado = (s1 === "sube" ? p1 : -p1) + (s2 === "sube" ? p2 : -p2);
    return { total, p1, s1, p2, s2, m1, m2, medio, final: final_, m, cambio: redondo((m - 1) * 100), sumado, siSumara: redondo(total * (1 + sumado / 100)) };
  }

  // El precio original a partir del final, sabiendo cuánto subió o bajó.
  function original({ final: f, p, sentido }) {
    if (!(f > 0)) return { error: "La cantidad final tiene que ser mayor que 0." };
    if (!(p > 0) || (sentido === "baja" && p >= 100) || p > 500) return { error: "El porcentaje tiene que ser mayor que 0 (y un descuento, menor que 100 %)." };
    const pFinal = redondo(sentido === "sube" ? 100 + p : 100 - p), m = redondo(pFinal / 100);
    const inicio = redondo(f / m), uno = redondo(f / pFinal);
    return { final: f, p, sentido, pFinal, m, inicio, uno, malo: redondo(sentido === "sube" ? f * (1 - p / 100) : f * (1 + p / 100)) };
  }

  const calcular = { de, que, variacion, encadenados, original };

  const EJEMPLOS = {
    de: [
      { etiqueta: "IGIC: 7 % de 200 €", p: 7, total: 200, texto: "El IGIC general en Canarias es del 7 %. ¿Cuánto se paga de IGIC por un producto de 200 €?" },
      { etiqueta: "25 % de 60 €", p: 25, total: 60, texto: "Una chaqueta de 60 € tiene un 25 % de descuento. ¿Cuánto te descuentan?" },
      { etiqueta: "140 % de 3000", p: 140, total: 3000, texto: "La población de un pueblo de 3000 habitantes ha aumentado un 140 %. ¿Cuántos habitantes más tiene?" },
      { etiqueta: "0,08 % de 500 000", p: 0.08, total: 500000, texto: "El 0,08 % de una población de 500 000 personas padece una enfermedad rara. ¿A cuántas afecta?" },
    ],
    que: [
      { etiqueta: "6 de 30 alumnos", parte: 6, total: 30, texto: "En una clase de 30 alumnos han faltado 6. ¿Qué porcentaje de la clase ha faltado?" },
      { etiqueta: "17 de 20 preguntas", parte: 17, total: 20, texto: "Marta ha acertado 17 de 20 preguntas. ¿Qué porcentaje ha acertado?" },
      { etiqueta: "63 € de 28 €", parte: 63, total: 28, texto: "¿Qué porcentaje de 28 € son 63 €?" },
    ],
    variacion: [
      { etiqueta: "Chaqueta: −25 %", total: 60, p: 25, sentido: "baja", texto: "Una chaqueta cuesta 60 €. ¿Cuánto cuesta con un 25 % de descuento?" },
      { etiqueta: "Bicicleta: −12 %", total: 250, p: 12, sentido: "baja", texto: "Una bicicleta de 250 € se rebaja un 12 %. ¿Cuánto cuesta ahora?" },
      { etiqueta: "Pueblo: +140 %", total: 3000, p: 140, sentido: "sube", texto: "Un pueblo de 3000 habitantes aumenta un 140 %. ¿Cuántos habitantes tiene ahora?" },
    ],
  };

  EJEMPLOS.encadenados = [
    { etiqueta: "Camiseta: +20 % y −25 %", total: 18, p1: 20, s1: "sube", p2: 25, s2: "baja", texto: "Una camiseta de 18 € sube un 20 % y después, en rebajas, baja un 25 %. ¿Cuál es el precio final?" },
    { etiqueta: "−30 % y −15 %: ¿un 45 %?", total: 80, p1: 30, s1: "baja", p2: 15, s2: "baja", texto: "Un artículo de 80 € tiene un 30 % de descuento y otro 15 % en caja. ¿Es lo mismo que un 45 % de descuento?" },
    { etiqueta: "−10 % y después IGIC", total: 60, p1: 10, s1: "baja", p2: 7, s2: "sube", texto: "Un producto de 60 € sin impuestos tiene un 10 % de descuento y después se le aplica el IGIC del 7 %. ¿Cuál es el precio final?" },
  ];
  EJEMPLOS.original = [
    { etiqueta: "Auriculares: 214 € con IGIC", final: 214, p: 7, sentido: "sube", texto: "Unos auriculares cuestan 214 € con el IGIC del 7 % incluido. ¿Cuál era el precio sin impuestos?" },
    { etiqueta: "Camisa: 74,80 € con un 12 % menos", final: 74.8, p: 12, sentido: "baja", texto: "Por una camisa rebajada un 12 % se han pagado 74,80 €. ¿Cuál era su precio inicial?" },
    { etiqueta: "Se vende a 54 € (+35 %)", final: 54, p: 35, sentido: "sube", texto: "Un comerciante vende un artículo a 54 €, un 35 % más caro de lo que le costó. ¿Cuánto le costó?" },
  ];

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const p = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 2, 3, 7, 12, 150, 120][ent(0, 15)];
    if (modo === "de") return { p, total: ent(2, 50) * 20 };
    if (modo === "encadenados") {
      const baja = () => r() < 0.5 ? "baja" : "sube", s1 = baja(), s2 = baja();
      const q = () => [10, 20, 25, 30, 40, 50][ent(0, 5)];
      return { total: ent(2, 20) * 20, p1: q(), s1, p2: q(), s2 };
    }
    if (modo === "original") {
      const sentido = r() < 0.5 ? "baja" : "sube", p = [5, 10, 20, 25, 40, 50][ent(0, 5)];
      return { final: ent(2, 20) * (sentido === "sube" ? 100 + p : 100 - p) / 10, p, sentido };
    }
    if (modo === "que") { const total = [20, 25, 40, 50, 80, 200][ent(0, 5)]; return { parte: total * [10, 20, 25, 40, 50, 75, 5][ent(0, 6)] / 100, total }; }
    const baja = r() < 0.5;
    return { total: ent(2, 40) * 20, p: baja ? [10, 15, 20, 25, 30, 40, 50][ent(0, 6)] : p, sentido: baja ? "baja" : "sube" };
  }

  return { calcular, EJEMPLOS, azar, referencia };
})();

if (typeof module !== "undefined") module.exports = Porcentajes;
