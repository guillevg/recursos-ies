// Modelo de barras (partes y todo) para problemas de fracciones, paso a paso.
// Tres modos: la fracción de una cantidad, el total a partir de una parte y
// «de lo que queda» (dos fracciones encadenadas y lo que sobra al final).
// Los cálculos (`calcular`) están separados del dibujo para poder probarlos
// con Node (tests/test_web_barras.js); el dibujo usa Pasos (pasos.js).
"use strict";

const Barras = (() => {
  // ------------------------------------------------------------- cálculos
  // Cada función devuelve los números del problema o { error } si los datos
  // no tienen sentido (fracción mayor que 1, nada que repartir…).
  function cantidad({ a, b, total }) {
    if (!(b >= 1 && a >= 0 && a <= b)) return { error: "La fracción tiene que estar entre 0 y 1: el numerador no puede ser mayor que el denominador." };
    if (!(total > 0)) return { error: "El total tiene que ser mayor que 0." };
    const u = total / b;
    return { a, b, total, u, parte: a * u, resto: (b - a) * u };
  }

  // `conocida`: "pintada" (sé cuánto son los a/b) o "resto" (sé cuánto queda).
  function parte({ a, b, conocida, valor }) {
    if (!(b >= 2 && a >= 1 && a < b)) return { error: "La fracción tiene que ser menor que 1 y mayor que 0 (por ejemplo, 3/5)." };
    if (!(valor > 0)) return { error: "La cantidad conocida tiene que ser mayor que 0." };
    const k = conocida === "resto" ? b - a : a;
    const u = valor / k;
    return { a, b, conocida, valor, k, u, total: b * u, pintada: a * u, resto: (b - a) * u };
  }

  // Primero se va a/b del total; después, c/d de lo que quedaba; al final
  // quedan `final`.
  function queda({ a, b, c, d, final }) {
    if (!(b >= 2 && a >= 1 && a < b)) return { error: "La primera fracción tiene que ser menor que 1 y mayor que 0." };
    if (!(d >= 2 && c >= 1 && c < d)) return { error: "La segunda fracción tiene que ser menor que 1 y mayor que 0." };
    if (!(final > 0)) return { error: "Lo que queda al final tiene que ser mayor que 0." };
    const u2 = final / (d - c);          // un trozo de lo que quedaba
    const resto = d * u2;                 // lo que quedaba tras el primero
    const u1 = resto / (b - a);           // un trozo del total
    const total = b * u1;
    return { a, b, c, d, final, u2, resto, u1, total, primero: a * u1, segundo: c * u2 };
  }

  const calcular = { cantidad, parte, queda };

  // ------------------------------------------------------------- ejemplos
  // Los del banco de la SA1 (cuaderno del alumnado, bloque A) y algunos más.
  const EJEMPLOS = {
    cantidad: [
      { etiqueta: "Cine: 7/10 de 500", a: 7, b: 10, total: 500,
        texto: "Un cine tiene 500 butacas y se han ocupado los 7/10. ¿Cuántos espectadores hay? ¿Cuántas butacas quedan libres?" },
      { etiqueta: "Libro: 3/5 de 360", a: 3, b: 5, total: 360,
        texto: "He leído los 3/5 de un libro de 360 páginas. ¿Cuántas páginas he leído? ¿Cuántas me quedan?" },
      { etiqueta: "Padre: 2/5 de 35", a: 2, b: 5, total: 35,
        texto: "La edad de Marcos es los 2/5 de la de su padre, que tiene 35 años. ¿Cuántos años tiene Marcos?" },
    ],
    parte: [
      { etiqueta: "Pradera: el resto son 4000", a: 3, b: 5, conocida: "resto", valor: 4000,
        texto: "Un jardinero siega por la mañana los 3/5 de una pradera. Por la tarde siega el resto, que son 4000 m². ¿Cuántos m² tiene la pradera?" },
      { etiqueta: "Juan: le quedan 28 €", a: 5, b: 12, conocida: "resto", valor: 28,
        texto: "Juan ha gastado 5/12 de su dinero y vuelve a casa con 28 €. ¿Cuánto tenía? ¿Cuánto ha gastado?" },
      { etiqueta: "Equipo: 3/4 son 18", a: 3, b: 4, conocida: "pintada", valor: 18,
        texto: "En un equipo, los 3/4 de los jugadores son de la isla: 18 jugadores. ¿Cuántos jugadores tiene el equipo?" },
    ],
    queda: [
      { etiqueta: "Caramelos: 1/2 y 1/2", a: 1, b: 2, c: 1, d: 2, final: 50,
        texto: "Un vendedor vende por la mañana la mitad de sus caramelos y por la tarde la mitad de los que le quedaban. Le sobran 50. ¿Cuántos tenía?" },
      { etiqueta: "Excursión: 2/5 y 1/3", a: 2, b: 5, c: 1, d: 3, final: 24,
        texto: "En una excursión, el primer día se recorren los 2/5 del camino y el segundo, 1/3 de lo que quedaba. El tercero se recorren los últimos 24 km. ¿Cuánto mide el camino?" },
      { etiqueta: "Depósito: 1/4 y 2/3", a: 1, b: 4, c: 2, d: 3, final: 15,
        texto: "De un depósito se gasta primero 1/4 del agua y después 2/3 de lo que quedaba. Quedan 15 litros. ¿Cuántos litros tenía?" },
    ],
  };

  // Datos al azar con resultados enteros.
  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "cantidad") {
      const b = ent(3, 10), a = ent(1, b - 1);
      return { a, b, total: b * ent(2, 30) };
    }
    if (modo === "parte") {
      const b = ent(3, 10), a = ent(1, b - 1), conocida = r() < 0.5 ? "pintada" : "resto";
      const k = conocida === "resto" ? b - a : a;
      return { a, b, conocida, valor: k * ent(2, 25) };
    }
    const b = ent(2, 6), a = ent(1, b - 1), d = ent(2, 5), c = ent(1, d - 1);
    // final = (d − c)·u2 y resto = d·u2 tiene que repartirse en b − a trozos.
    const paso = (b - a) / Pasos.mcd(b - a, d);
    const u2 = paso * ent(1, Math.max(1, Math.floor(20 / paso)));
    return { a, b, c, d, final: (d - c) * u2 };
  }

  return { calcular, EJEMPLOS, azar };
})();

if (typeof module !== "undefined") module.exports = Barras;
