// Proporcionalidad paso a paso. Siete modos: directa (recta doble y
// reducción a la unidad), escalas (lo que es 1 cm del plano), inversa
// (barras de tiempo: juntar en lo que tardaría uno solo y repartir; el
// producto no cambia), ¿es proporcional? (cocientes y productos de una
// tabla), reparto proporcional (barras), «¿cuál sale más barato?» (precio
// por unidad) y ofertas (3×2, 2ª unidad: el descuento real). Cálculos separados del dibujo para
// probarlos con Node; el dibujo está en proporcion.html.
"use strict";

const Proporcion = (() => {
  const r9 = x => Math.round(x * 1e9) / 1e9;

  // a de la primera magnitud corresponden a b de la segunda; ¿cuánto a x?
  function directa({ a, b, x, ua = "", ub = "" }) {
    if (!(a > 0 && b > 0 && x > 0)) return { error: "Las tres cantidades tienen que ser mayores que 0." };
    const k = r9(b / a);
    return { a, b, x, ua, ub, k, y: r9(x * k), veces: r9(x / a) };
  }

  // a (p. ej. personas) tardan b (p. ej. horas); ¿cuánto tardan x?
  // El dibujo: una barra de b por cada uno; juntas, lo que tardaría uno solo
  // (total); cortada en x trozos, lo de cada uno con x. `piezas` son los
  // tramos de esa barra larga entre los cortes de las dos situaciones: cada
  // uno sale de la fila i (desde oi) y llega a la fila j (desde oj).
  function inversa({ a, b, x, ua = "", ub = "" }) {
    if (!(a > 0 && b > 0 && x > 0)) return { error: "Las tres cantidades tienen que ser mayores que 0." };
    const total = r9(a * b), y = r9(total / x);
    const filas = Number.isInteger(a) && Number.isInteger(x) && a <= 16 && x <= 16;
    const cortes = [...new Set([...Array.from({ length: a + 1 }, (_, i) => r9(i * b)), ...Array.from({ length: x + 1 }, (_, j) => r9(j * y))])]
      .filter(c => c <= total).sort((p, q) => p - q);
    const piezas = filas ? cortes.slice(0, -1).map((s, k) => {
      const i = Math.min(a - 1, Math.floor(r9(s / b))), j = Math.min(x - 1, Math.floor(r9(s / y)));
      return { s, len: r9(cortes[k + 1] - s), i, oi: r9(s - i * b), j, oj: r9(s - j * y) };
    }).filter(p => p.len > 0) : [];
    // Las horas sueltas (marcas dentro de las barras) solo si son pocas y caen en los cortes.
    const horas = filas && total <= 60 && Number.isInteger(total) && Number.isInteger(b) && Number.isInteger(y);
    return { a, b, x, ua, ub, total, y, filas, piezas, horas };
  }

  // Reparto de `total` proporcional a p1, p2 (y p3, si no es 0).
  function reparto({ p1, p2, p3 = 0, total, nombres = "A, B, C" }) {
    const ps = [p1, p2, p3].filter((p, i) => i < 2 || p > 0);
    if (ps.some(p => !(p > 0)) || !(total > 0)) return { error: "Las partes y el total tienen que ser mayores que 0." };
    if (!ps.every(Number.isInteger) || ps.reduce((s, p) => s + p, 0) > 40) return { error: "Usa partes enteras que sumen, como mucho, 40 (para poder dibujarlas)." };
    const suma = ps.reduce((s, p) => s + p, 0), u = r9(total / suma);
    const ns = String(nombres).split(",").map(s => s.trim()).filter(Boolean);
    return { ps, total, suma, u, cada: ps.map(p => r9(p * u)), nombres: ps.map((_, i) => ns[i] ?? "ABC"[i]) };
  }

  // Dos ofertas: qa unidades por pa euros y qb por pb. `unidad`: «kg», «yogur»…
  function barato({ qa, pa, qb, pb, unidad = "unidad" }) {
    if (!(qa > 0 && pa > 0 && qb > 0 && pb > 0)) return { error: "Las cantidades y los precios tienen que ser mayores que 0." };
    const ua = r9(pa / qa), ub = r9(pb / qb);
    return { qa, pa, qb, pb, unidad, ua, ub, gana: ua < ub ? "A" : ua > ub ? "B" : "igual", ahorro: r9(Math.abs(ua - ub)) };
  }

  // Escala 1 : e. sentido "real": se da la medida del plano (cm) y se busca
  // la real, en `unidad` (m o km); "plano": al revés. `uno`: lo que es 1 cm
  // del plano en la realidad, en esa unidad.
  const FACTOR = { m: 100, km: 100000 };
  function escala({ e, medida, sentido = "real", unidad = "m" }) {
    if (!(e > 1 && medida > 0)) return { error: "La escala (1 : e) necesita e mayor que 1, y la medida tiene que ser mayor que 0." };
    if (!FACTOR[unidad]) return { error: "La unidad de la realidad tiene que ser m o km." };
    if (sentido !== "real" && sentido !== "plano") return { error: "Elige qué se busca: la medida real o la del plano." };
    const f = FACTOR[unidad], uno = r9(e / f);
    const plano = sentido === "real" ? medida : r9(medida / uno), real = sentido === "real" ? r9(medida * uno) : medida;
    return { e, medida, sentido, unidad, f, uno, plano, real };
  }

  // ¿Es proporcional? Tabla de valores x → y (texto: «1 2 5», con coma decimal).
  // Directa si y : x no cambia; inversa si x · y no cambia; si no, ninguna
  // (`suma`: la diferencia no cambia, como en las edades de dos hermanos).
  const lista = t => String(t).trim().split(/[\s;]+/).filter(Boolean).map(v => Number(v.replace(",", ".")));
  function tabla({ x, y, ux = "", uy = "" }) {
    const xs = lista(x), ys = lista(y);
    if (xs.length !== ys.length || xs.length < 2 || xs.length > 6) return { error: "Escribe de 2 a 6 valores en cada fila, los mismos arriba que abajo, separados por espacios." };
    if (![...xs, ...ys].every(v => Number.isFinite(v) && v > 0)) return { error: "Todos los valores tienen que ser números mayores que 0 (con coma decimal: 5,2)." };
    const cocientes = xs.map((v, i) => r9(ys[i] / v)), productos = xs.map((v, i) => r9(v * ys[i])), difs = xs.map((v, i) => r9(ys[i] - v));
    const igual = l => l.every(v => Math.abs(v - l[0]) < 1e-6);
    const tipo = igual(cocientes) ? "directa" : igual(productos) ? "inversa" : "ninguna";
    // La diferencia, sin signo: la mayor menos la menor.
    return { xs, ys, ux, uy, cocientes, productos, difs: difs.map(Math.abs), tipo, suma: tipo === "ninguna" && igual(difs) };
  }

  // Ofertas: «lleva a, paga b» (tipo "lleva": 3×2) o «2ª unidad al a % de
  // descuento» (tipo "segunda"). `paga`: la parte de cada unidad que se paga.
  function oferta({ precio, tipo = "lleva", a, b = 0 }) {
    if (!(precio > 0)) return { error: "El precio de una unidad tiene que ser mayor que 0." };
    let paga;
    if (tipo === "lleva") {
      if (!(Number.isInteger(a) && Number.isInteger(b) && b >= 1 && a > b && a <= 8)) return { error: "En «lleva a, paga b», a y b son enteros, con b < a ≤ 8." };
      paga = Array.from({ length: a }, (_, i) => i < b ? 1 : 0);
    } else if (tipo === "segunda") {
      if (!(a > 0 && a <= 100)) return { error: "El descuento de la 2ª unidad tiene que estar entre 0 y 100 %." };
      paga = [1, r9(1 - a / 100)];
    } else return { error: "Elige el tipo de oferta." };
    const n = paga.length, partes = r9(paga.reduce((s, v) => s + v, 0));
    const sin = r9(n * precio), total = r9(partes * precio), ahorro = r9(sin - total);
    return { precio, tipo, a, b, paga, n, partes, sin, total, ahorro, real: r9(ahorro / sin * 100), unidad: r9(total / n), paga100: r9(partes / n * 100) };
  }

  const calcular = { directa, escala, inversa, tabla, reparto, barato, oferta };

  const EJEMPLOS = {
    directa: [
      { etiqueta: "Plátanos: 6 kg, 9 €", a: 6, b: 9, x: 4, ua: "kg", ub: "€", texto: "En un puesto del mercado, 6 kg de plátanos cuestan 9 €. ¿Cuánto cuestan 4 kg?" },
      { etiqueta: "Mojo: 4 personas, 200 g", a: 4, b: 200, x: 10, ua: "personas", ub: "g", texto: "Para un mojo para 4 personas hacen falta 200 g de pimientos. ¿Cuántos gramos hacen falta para 10 personas?" },
      { etiqueta: "Depósito: 5 h, 800 L", a: 5, b: 800, x: 8, ua: "h", ub: "L", texto: "Un depósito se llena a ritmo constante: en 5 horas entran 800 litros. ¿Cuántos litros entran en 8 horas?" },
    ],
    inversa: [
      { etiqueta: "Playa: 4 personas, 6 h", a: 4, b: 6, x: 3, ua: "personas", ub: "h", texto: "4 personas limpian una playa en 6 horas, todas al mismo ritmo. ¿Cuánto tardarían 3 personas?" },
      { etiqueta: "Escenario: 6 personas, 4 h", a: 6, b: 4, x: 8, ua: "personas", ub: "h", texto: "6 personas montan el escenario de la fiesta en 4 horas. ¿Cuánto tardarían 8 personas?" },
      { etiqueta: "Muro: 6 obreros, 15 días", a: 6, b: 15, x: 9, ua: "obreros", ub: "días", texto: "6 obreros levantan un muro en 15 días. ¿Cuántos días tardarían 9 obreros?" },
    ],
    escala: [
      { etiqueta: "Mapa 1 : 50 000, 6 cm", e: 50000, medida: 6, sentido: "real", unidad: "km", texto: "En un mapa a escala 1 : 50 000, dos pueblos están a 6 cm. ¿Cuántos kilómetros los separan en la realidad?" },
      { etiqueta: "Plano 1 : 50, salón de 4,5 m", e: 50, medida: 4.5, sentido: "plano", unidad: "m", texto: "En el plano de una casa a escala 1 : 50, ¿cuánto mide un salón de 4,5 m de largo?" },
      { etiqueta: "Plano 1 : 200, 4,5 cm", e: 200, medida: 4.5, sentido: "real", unidad: "m", texto: "En el plano de un instituto a escala 1 : 200, la cancha mide 4,5 cm de ancho. ¿Cuánto mide en la realidad?" },
    ],
    tabla: [
      { etiqueta: "Queso: kg y €", x: "1 2 3 5", y: "2,4 4,8 7,2 12", ux: "kg", uy: "€", texto: "1, 2, 3 y 5 kg de queso cuestan 2,40; 4,80; 7,20 y 12 €. ¿Es una proporcionalidad?" },
      { etiqueta: "Trayecto: km/h y horas", x: "60 80 100 120", y: "2 1,5 1,2 1", ux: "km/h", uy: "h", texto: "A 60, 80, 100 y 120 km/h, un mismo trayecto se hace en 2; 1,5; 1,2 y 1 horas. ¿Qué tipo de proporcionalidad hay?" },
      { etiqueta: "Taxi: km y €", x: "1 2 5 10", y: "4 5,2 8,8 14,8", ux: "km", uy: "€", texto: "Un taxi cobra 4 € por 1 km, 5,20 € por 2 km, 8,80 € por 5 km y 14,80 € por 10 km. ¿Es proporcional?" },
    ],
    reparto: [
      { etiqueta: "Mangos: 10, 6 y 4 €", p1: 10, p2: 6, p3: 4, total: 40, nombres: "Ana, Bea, Carla", texto: "Ana pone 10 €, Bea 6 € y Carla 4 € para una caja de 40 mangos, que se reparten de forma proporcional a lo que puso cada una." },
      { etiqueta: "Patatas: 3, 4 y 6 hijos", p1: 3, p2: 4, p3: 6, total: 65, nombres: "Familia 1, Familia 2, Familia 3", texto: "Se reparten 65 kg de patatas entre tres familias, de forma proporcional a su número de hijos: 3, 4 y 6." },
      { etiqueta: "Premio: 2 y 3 horas", p1: 2, p2: 3, p3: 0, total: 150, nombres: "Leo, Sara", texto: "Leo trabajó 2 horas y Sara 3 en un puesto de la feria, y ganaron 150 €. Se lo reparten según las horas." },
    ],
    barato: [
      { etiqueta: "Yogures: 6 por 3,60 € o 4 por 2 €", qa: 6, pa: 3.6, qb: 4, pb: 2, unidad: "yogur", texto: "En un supermercado, un pack de 6 yogures cuesta 3,60 €; en otro, uno de 4 cuesta 2,00 €. ¿Dónde sale más barato cada yogur?" },
      { etiqueta: "Arroz: 1 kg o 0,5 kg", qa: 1, pa: 2.4, qb: 0.5, pb: 1.3, unidad: "kg", texto: "Un paquete de arroz de 1 kg cuesta 2,40 € y otro de 500 g cuesta 1,30 €. ¿Cuál sale más barato por kilo?" },
      { etiqueta: "Detergente: 5 L o 2 L", qa: 5, pa: 12, qb: 2, pb: 5.5, unidad: "L", texto: "Un bote de detergente de 5 L cuesta 12 € y uno de 2 L, 5,50 €. ¿Cuál tiene mejor precio por litro?" },
    ],
    oferta: [
      { etiqueta: "Zumos: 3×2", precio: 1.2, tipo: "lleva", a: 3, b: 2, texto: "Un supermercado anuncia «llévate 3 y paga 2» en unos zumos de 1,20 € la unidad. ¿Qué descuento real supone?" },
      { etiqueta: "Camisetas: 2ª al 70 %", precio: 20, tipo: "segunda", a: 70, texto: "Una tienda anuncia «2ª unidad al 70 %» en unas camisetas de 20 €. Si compras dos, ¿qué descuento real supone?" },
      { etiqueta: "Galletas: 2ª a mitad de precio", precio: 2.4, tipo: "segunda", a: 50, texto: "Unas galletas de 2,40 € tienen la 2ª unidad a mitad de precio. ¿Qué descuento real supone comprar dos?" },
    ],
  };

  function azar(modo, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    if (modo === "directa") { const a = ent(2, 8), k = ent(2, 15); return { a, b: a * k, x: ent(2, 12), ua: "", ub: "" }; }
    // a · b = x · y con y entero: b = x · t e y = a · t.
    if (modo === "inversa") { let a, x; do { a = ent(2, 8); x = ent(2, 10); } while (a === x); const t = ent(1, 3); return { a, b: x * t, x, ua: "", ub: "" }; }
    if (modo === "escala") { const e = [50, 100, 200, 25000, 50000, 100000][ent(0, 5)], km = e > 1000; return { e, medida: ent(2, 12), sentido: r() < .5 ? "real" : "plano", unidad: km ? "km" : "m" }; }
    if (modo === "tabla") {
      const xs = [1, 2, 3, 4, 6].slice(0, ent(3, 5)), k = ent(2, 9), t = ["directa", "inversa", "ninguna"][ent(0, 2)];
      const ys = xs.map(v => t === "directa" ? k * v : t === "inversa" ? 12 * k / v : v + k);
      return { x: xs.join(" "), y: ys.map(v => String(Math.round(v * 100) / 100).replace(".", ",")).join(" "), ux: "", uy: "" };
    }
    if (modo === "oferta") {
      const precio = ent(5, 40) / 5, a = ent(2, 4);
      return r() < .5 ? { precio, tipo: "lleva", a, b: a - 1 } : { precio, tipo: "segunda", a: [50, 60, 70][ent(0, 2)], b: 0 };
    }
    if (modo === "reparto") { const ps = [ent(1, 8), ent(1, 8), r() < 0.6 ? ent(1, 8) : 0]; const s = ps.reduce((a, b) => a + b, 0); return { p1: ps[0], p2: ps[1], p3: ps[2], total: s * ent(2, 20), nombres: "A, B, C" }; }
    const qa = ent(2, 8), qb = ent(2, 8);
    return { qa, pa: Math.round(qa * ent(50, 300)) / 100, qb, pb: Math.round(qb * ent(50, 300)) / 100, unidad: "unidad" };
  }

  return { calcular, EJEMPLOS, azar };
})();

if (typeof module !== "undefined") module.exports = Proporcion;
