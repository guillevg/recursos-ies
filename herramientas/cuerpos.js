// Cuerpos geométricos, paso a paso: el volumen de un prisma contando
// cubitos por capas, el desarrollo y el área de una caja, el desarrollo, el
// área y el volumen de un cilindro, y el volumen y el área de una pirámide
// de base cuadrada. Los cálculos están separados del dibujo para poder
// probarlos con Node; el dibujo (cuerpos.html) usa Pasos (pasos.js).
"use strict";

const Cuerpos = (() => {
  const PI = 3.14;                                 // como en el cuaderno
  const red = v => Math.round(v * 1e6) / 1e6;
  const pos = (...vs) => vs.every(v => Number.isFinite(v) && v > 0);
  // Litros que caben en un volumen dado en la unidad cúbica de `u`.
  const LITROS = { cm: 0.001, dm: 1, m: 1000 };

  // ------------------------------------------------------------- cálculos
  // Prisma de a × b cubitos de base y h capas.
  function volumen({ a, b, h, u }) {
    if (![a, b, h].every(v => Number.isInteger(v) && v >= 1 && v <= 8)) return { error: "Para contar cubitos, las tres medidas tienen que ser números enteros del 1 al 8." };
    if (!(u in LITROS)) return { error: "Elige la unidad: cm, dm o m." };
    return { a, b, h, u, capa: a * b, v: a * b * h, litros: red(a * b * h * LITROS[u]) };
  }

  // Caja (ortoedro) de largo a, ancho b y alto c.
  function desarrollo({ a, b, c }) {
    if (!pos(a, b, c)) return { error: "Escribe las tres medidas de la caja (mayores que 0)." };
    const ab = red(a * b), ac = red(a * c), bc = red(b * c);
    return { a, b, c, ab, ac, bc, area: red(2 * (ab + ac + bc)), v: red(a * b * c), cubo: a === b && b === c };
  }

  function cilindro({ r, h }) {
    if (!pos(r, h)) return { error: "Escribe el radio y la altura (mayores que 0)." };
    const largo = red(2 * PI * r), lateral = red(largo * h), base = red(PI * r * r);
    return { r, h, largo, lateral, base, area: red(lateral + 2 * base), v: red(base * h) };
  }

  // Pirámide de base cuadrada de lado l y altura h.
  function piramide({ l, h }) {
    if (!pos(l, h)) return { error: "Escribe el lado de la base y la altura (mayores que 0)." };
    const prisma = red(l * l * h), ap2 = red(h * h + l * l / 4), ap = Math.sqrt(ap2), cara = red(l * ap / 2);
    return { l, h, base: red(l * l), prisma, v: red(prisma / 3), ap2, ap, exacta: Number.isInteger(red(ap * 100)), cara, lateral: red(4 * cara), area: red(4 * cara + l * l) };
  }

  const calcular = { volumen, desarrollo, cilindro, piramide };

  // ------------------------------------------------------------- ejemplos
  // Del banco de la SA7 (bloques C, D y E) y algunos más.
  const EJEMPLOS = {
    volumen: [
      { etiqueta: "Cubitos: 4 × 3 y 5 capas", a: 4, b: 3, h: 5, u: "cm",
        texto: "Con cubitos de 1 cm de arista se construye un prisma: la base es un rectángulo de 4 × 3 cubitos y tiene 5 capas. ¿Cuántos cubitos tiene?" },
      { etiqueta: "Prisma de 5 × 3 × 2 m", a: 5, b: 3, h: 2, u: "m",
        texto: "Calcula el volumen de un prisma rectangular de 5 m × 3 m × 2 m. ¿Cuántos cubos de 1 m de arista caben en cada capa? ¿Cuántas capas hay?" },
      { etiqueta: "Aljibe de 4 × 3 × 2 m", a: 4, b: 3, h: 2, u: "m",
        texto: "Un aljibe tiene forma de prisma rectangular de 4 m × 3 m y 2 m de profundidad. ¿Cuántos litros de agua caben cuando está lleno?" },
    ],
    desarrollo: [
      { etiqueta: "Caja de 10 × 6 × 4", a: 10, b: 6, c: 4, texto: "Dibuja el desarrollo de una caja con tapa de 10 cm × 6 cm × 4 cm. ¿Cuánto cartón hace falta?" },
      { etiqueta: "Caja de zapatos", a: 30, b: 20, c: 12, texto: "Una caja de zapatos mide 30 cm × 20 cm × 12 cm. ¿Cuánto cartón se necesita para construirla, sin contar solapes?" },
      { etiqueta: "Cubo de 5", a: 5, b: 5, c: 5, texto: "Calcula el área total de un cubo de 5 cm de arista, sumando el área de sus 6 caras." },
    ],
    cilindro: [
      { etiqueta: "Radio 3, altura 10", r: 3, h: 10, texto: "Calcula la superficie total de un cilindro de radio 3 cm y altura 10 cm (π ≈ 3,14)." },
      { etiqueta: "Radio 2, altura 5", r: 2, h: 5, texto: "Calcula el volumen de un cilindro de 2 m de radio y 5 m de altura (π ≈ 3,14)." },
      { etiqueta: "Silo: 1,5 y 4", r: 1.5, h: 4, texto: "Un silo de millo tiene forma cilíndrica, con 1,5 m de radio y 4 m de altura. Calcula su volumen (π ≈ 3,14)." },
    ],
    piramide: [
      { etiqueta: "Lado 10, altura 12", l: 10, h: 12, texto: "Una pirámide de base cuadrada de 10 m de lado tiene 12 m de altura. Calcula su volumen, su apotema y su área total." },
      { etiqueta: "Lado 8, altura 3", l: 8, h: 3, texto: "Una pirámide de base cuadrada de 8 cm de lado tiene 3 cm de altura. Calcula su volumen, su apotema y su área total." },
      { etiqueta: "Tejado: 8 y 2,5", l: 8, h: 2.5, texto: "El tejado a cuatro aguas de una casa es una pirámide de base cuadrada de 8 m de lado y 2,5 m de altura. ¿Qué superficie hay que cubrir de tejas?" },
    ],
  };

  // Datos al azar con números enteros.
  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "volumen") return { a: ent(2, 6), b: ent(2, 5), h: ent(2, 6), u: ["cm", "dm", "m"][ent(0, 2)] };
    if (modo === "desarrollo") return { a: ent(4, 12), b: ent(3, 9), c: ent(2, 8) };
    if (modo === "cilindro") return { r: ent(1, 6), h: ent(2, 12) };
    const [m, h] = [[3, 4], [5, 12], [8, 15], [6, 8], [4, 3]][ent(0, 4)];
    return { l: 2 * m, h };
  }

  return { calcular, EJEMPLOS, azar, PI };
})();

if (typeof module !== "undefined") module.exports = Cuerpos;
