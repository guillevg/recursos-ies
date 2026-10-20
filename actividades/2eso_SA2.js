// Actividades de repaso de la SA2 de 2º ESO (Proporciones y decisiones económicas).
// Mismo formato que 2eso_SA1.js. Números al azar; nunca los de la prueba
// escrita (reparto 27/18/15 → 54 €, casa rural 6 × 50 €, 30 € con IGIC y
// 15 %, recetas 3:2 y 5:3) ni los del reto (18/12/10 → 34 €); tampoco los
// destacados del banco que se trabajan en clase (escala 1:50 con 8 m, taxi
// de 4 € y 1,20 €/km, guagua de 450 €, 3×2 a 1,20 €, 2ª al 70 % a 20 €).
"use strict";

{
  // Euros: sin decimales si es exacto; si no, con dos (4,50 y no 4,5).
  const eur = x => Number.isInteger(Math.round(x * 100) / 100) ? miles(Math.round(x)) : miles(x.toFixed(2).replace(".", ","));
  const cerca = (x, y, tol = .005) => Number.isFinite(x) && Math.abs(x - y) < tol;
  const r2 = x => Math.round(x * 100) / 100;
  const pc = p => `${fmt(p)} %`;
  // «a, b y c»
  const lista = l => l.length > 1 ? `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}` : l[0];
  const NOMBRES = [["Ana", "Bea", "Carla"], ["Leo", "Sara", "Iván"], ["Nayra", "Aday", "Ruth"], ["Pablo", "Lucía", "Omar"]];

  // Tabla de valores (dos filas) para el enunciado.
  const tablaHTML = (ux, xs, uy, ys) => `<table class="tabla-valores"><tr><th>${ux}</th>${xs.map(v => `<td>${fmt(v)}</td>`).join("")}</tr><tr><th>${uy}</th>${ys.map(v => `<td>${fmt(v)}</td>`).join("")}</tr></table>`;
  // Datos de una tabla para proporcion.html#tabla («1 2 5», con coma decimal).
  const fila = l => l.map(fmt).join(" ");

  // Recoge los campos mal y devuelve el resultado de comprobar().
  const resultado = (mal, texto, explica) => mal.length ? { bien: false, campos: mal, texto, explica } : { bien: true, texto: "¡Correcto!", explica: "" };

  Repaso.tema("2eso", "SA2", {
    bloques: {
      A: ["unidad", "escalas", "reparto"],
      B: ["inversa"],
      C: ["tipo"],
      D: ["sumar"],
      E: ["aumentos", "antes", "encadenados"],
      F: ["barato", "ofertas"],
    },
    actividades: {
      unidad: {
        titulo: "Reducción a la unidad",
        sub: "Lo que vale 1, y después las que te pidan",
        herramienta: ["Proporcionalidad directa", "proporcion.html"],
        pista: "Divide para saber lo que corresponde a 1 (1 kg, 1 persona, 1 hora…). Después multiplica por la cantidad que te piden. Comprueba: si una cantidad crece, ¿la otra también?",
        nuevo() {
          const CTX = [
            { k: [1.2, 1.5, 1.8, 2, 2.4, 2.5, 3], a: [2, 3, 4, 5, 6, 8], x: [1, 12], dinero: true, ua: "kg", ub: "€",
              t: (a, b, x) => `En la frutería, ${a} kg de naranjas cuestan <span class="dato">${eur(b)} €</span>. ¿Cuánto cuestan ${x} kg?`,
              uno: "1 kg cuesta (€)", res: x => `${x} kg cuestan (€)` },
            { k: [25, 30, 40, 50, 60, 75], a: [2, 3, 4, 6, 8], x: [2, 12], ua: "personas", ub: "g",
              t: (a, b, x) => `Para un bizcocho para ${a} personas hacen falta <span class="dato">${b} g</span> de harina. ¿Cuánta harina hace falta para ${x} personas?`,
              uno: "Para 1 persona (g)", res: x => `Para ${x} personas (g)` },
            { k: [6, 8, 9, 12, 15], a: [2, 3, 4, 5, 6], x: [3, 20], ua: "min", ub: "L",
              t: (a, b, x) => `Un grifo abierto siempre igual echa <span class="dato">${b} litros</span> en ${a} minutos. ¿Cuántos litros echa en ${x} minutos?`,
              uno: "En 1 minuto (L)", res: x => `En ${x} minutos (L)` },
            { k: [8, 9, 10, 11, 12, 15], a: [2, 3, 4, 5, 6], x: [3, 40], dinero: true, ua: "h", ub: "€",
              t: (a, b, x) => `Por ${a} horas de trabajo, Marta cobra <span class="dato">${eur(b)} €</span>. ¿Cuánto cobrará por ${x} horas?`,
              uno: "Por 1 hora (€)", res: x => `Por ${x} horas (€)` },
            { k: [2.5, 3, 3.5, 4, 4.5], a: [2, 3, 4, 5], x: [2, 10], dinero: true, ua: "partidas", ub: "€",
              t: (a, b, x) => `Por ${a} partidas de bolos se pagan <span class="dato">${eur(b)} €</span>. ¿Cuánto se paga por ${x} partidas?`,
              uno: "1 partida cuesta (€)", res: x => `${x} partidas cuestan (€)` },
          ];
          const ctx = elegir(CTX), k = elegir(ctx.k), a = elegir(ctx.a), b = r2(a * k);
          let x; do x = azar(...ctx.x); while (x === a);
          const y = r2(k * x), f = ctx.dinero ? eur : fmt;
          return {
            html: ctx.t(a, b, x),
            campos: [{ id: "k", etiqueta: ctx.uno }, { id: "y", etiqueta: ctx.res(x) }],
            pasos: ["proporcion.html", "directa", { a, b, x, ua: ctx.ua, ub: ctx.ub }],
            _ok: { k: fmt(k), y: fmt(y) },
            comprobar(v) {
              const K = num(v.k), Y = num(v.y), mal = [];
              if (!cerca(K, k)) mal.push("k");
              if (!cerca(Y, y)) mal.push("y");
              if (!mal.length) return resultado(mal);
              if (mal.includes("k") && cerca(K, a / b, .01)) return resultado(mal, "Has dividido al revés.", `Para saber lo que corresponde a 1, divide ${f(b)} entre ${a}.`);
              if (mal.includes("y") && cerca(Y, a * b / x, .01)) return resultado(mal, "Así sería si fuera inversa.", `Si una cantidad crece, la otra también: ${x} ${ctx.ua} son ${x > a ? "más" : "menos"} que ${a} ${ctx.ua}, así que tiene que salir ${x > a ? "más" : "menos"} de ${f(b)} ${ctx.ub}.`);
              if (mal.includes("y") && cerca(Y, b + x - a, .01)) return resultado(mal, "Has sumado, pero hay que multiplicar.", `No se añade lo mismo que se añade a la otra cantidad: se multiplica lo que vale 1 por ${x}.`);
              if (mal.length === 1 && mal[0] === "y") return resultado(mal, "Lo de 1 está bien; revisa el final.", `Multiplica ${f(k)} por ${x}.`);
              return resultado(mal, "Todavía no.", `Empieza por lo que corresponde a 1: ${f(b)} : ${a}.`);
            },
            operaciones: `<p>${ctx.uno.replace(/ \(.*\)$/, "")}: ${f(b)} : ${a} = ${f(k)}</p>
                          <p>${ctx.res(x).replace(/ \(.*\)$/, "")}: ${f(k)} · ${x} = <b>${f(y)}</b></p>`,
          };
        },
      },

      escalas: {
        titulo: "Escalas",
        sub: "Lo que es 1 cm del plano en la realidad",
        herramienta: ["Escalas", "proporcion.html#escala"],
        pista: "En una escala 1 : 50 000, 1 cm del plano son 50 000 cm de la realidad. Pasa esos centímetros a la unidad que te piden (de cm a m se divide entre 100; de cm a km, entre 100 000). Después multiplica por los centímetros del plano o, para ir de la realidad al plano, divide.",
        variantes: [["todos", "Mezclados"], ["real", "Del plano a la realidad"], ["plano", "De la realidad al plano"]],
        nuevo(variante = "todos") {
          const sentido = variante === "todos" ? elegir(["real", "plano"]) : variante;
          const mapa = Math.random() < .55;
          let e, plano;
          // Sin la escala 1 : 50 con 8 m del banco.
          do {
            e = mapa ? elegir([20000, 25000, 50000, 100000, 200000]) : elegir([50, 100, 200]);
            plano = mapa ? elegir([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 2.5, 3.5, 4.5, 7.5]) : elegir([2, 3, 4, 5, 6, 2.5, 3.5, 4.5, 5.5, 7.5]);
          } while (!mapa && e === 50 && plano === 16);
          const unidad = mapa ? "km" : "m", f = mapa ? 100000 : 100, uno = e / f, real = r2(plano * uno * 1000) / 1000;
          const E = `1 : ${miles(e)}`;
          let html;
          if (mapa) html = sentido === "real"
            ? elegir([`En un mapa de senderos a escala <span class="dato">${E}</span>, el sendero del barranco mide <span class="dato">${fmt(plano)} cm</span>. ¿Cuántos kilómetros mide en la realidad?`,
                      `En un mapa a escala <span class="dato">${E}</span>, dos pueblos están a <span class="dato">${fmt(plano)} cm</span>. ¿Cuántos kilómetros los separan en la realidad?`])
            : elegir([`Dos pueblos están a <span class="dato">${fmt(real)} km</span>. ¿A cuántos centímetros están en un mapa a escala <span class="dato">${E}</span>?`,
                      `Un sendero mide <span class="dato">${fmt(real)} km</span>. ¿Cuánto mide en un mapa a escala <span class="dato">${E}</span>?`]);
          else html = sentido === "real"
            ? elegir([`En el plano de una vivienda a escala <span class="dato">${E}</span>, el salón mide <span class="dato">${fmt(plano)} cm</span> de largo. ¿Cuántos metros mide en la realidad?`,
                      `En el plano del instituto a escala <span class="dato">${E}</span>, el pasillo mide <span class="dato">${fmt(plano)} cm</span>. ¿Cuántos metros mide en la realidad?`])
            : elegir([`Una habitación mide <span class="dato">${fmt(real)} m</span> de largo. ¿Cuánto mide en un plano a escala <span class="dato">${E}</span>?`,
                      `La cancha del instituto mide <span class="dato">${fmt(real)} m</span> de ancho. ¿Cuánto mide en un plano a escala <span class="dato">${E}</span>?`]);
          const res = sentido === "real" ? real : plano;
          return {
            html,
            campos: [{ id: "k", etiqueta: `1 cm del plano son (${unidad})` }, { id: "y", etiqueta: sentido === "real" ? `En la realidad (${unidad})` : "En el plano (cm)" }],
            pasos: ["proporcion.html", "escala", { e, medida: sentido === "real" ? plano : real, sentido, unidad }],
            _ok: { k: fmt(uno), y: fmt(res) },
            comprobar(v) {
              const K = num(v.k), Y = num(v.y), mal = [];
              if (!cerca(K, uno, uno / 1000)) mal.push("k");
              if (!cerca(Y, res, .01)) mal.push("y");
              if (!mal.length) return resultado(mal);
              if (mal.includes("k") && cerca(K, e)) return resultado(mal, "Eso son centímetros.", `1 cm del plano son ${miles(e)} cm de la realidad: pásalos a ${unidad} dividiendo entre ${miles(f)}.`);
              if (mal.includes("k") && mapa && cerca(K, e / 100, .001)) return resultado(mal, "Eso son metros, no kilómetros.", `De cm a km se divide entre 100 000: ${miles(e)} : 100 000.`);
              if (mal.includes("y") && sentido === "real" && cerca(Y, plano * e)) return resultado(mal, "Eso son centímetros de la realidad.", `Pásalo a ${unidad}, o multiplica ${fmt(plano)} por lo que es 1 cm.`);
              if (mal.includes("y") && sentido === "plano" && cerca(Y, real * uno, .01)) return resultado(mal, "Has multiplicado; aquí hay que dividir.", `¿Cuántas veces caben ${fmt(uno)} ${unidad} en ${fmt(real)} ${unidad}?`);
              if (mal.length === 1 && mal[0] === "y") return resultado(mal, "Lo de 1 cm está bien; revisa el final.", sentido === "real" ? `Multiplica ${fmt(uno)} por ${fmt(plano)}.` : `Divide ${fmt(real)} entre ${fmt(uno)}.`);
              return resultado(mal, "Todavía no.", `1 cm del plano son ${miles(e)} cm de la realidad. ¿Cuántos ${unidad} son?`);
            },
            operaciones: `<p>1 cm del plano: ${miles(e)} cm = ${miles(e)} : ${miles(f)} = ${fmt(uno)} ${unidad}</p>
                          <p>${sentido === "real" ? `${fmt(plano)} · ${fmt(uno)} = <b>${fmt(real)} ${unidad}</b>` : `${fmt(real)} : ${fmt(uno)} = <b>${fmt(plano)} cm</b>`}</p>`,
          };
        },
      },

      reparto: {
        titulo: "Reparto proporcional",
        sub: "Quien pone más, recibe más",
        herramienta: ["Reparto proporcional", "proporcion.html#reparto"],
        pista: "Suma las partes para saber en cuántas partes iguales se divide el total. Calcula cuánto vale una parte y multiplícalo por las partes de cada uno. Al final, comprueba que lo repartido suma el total.",
        nuevo() {
          const n = Math.random() < .6 ? 3 : 2;
          let ps;
          do ps = Array.from({ length: n }, () => azar(1, 8)); while (new Set(ps).size < n);
          const suma = ps.reduce((s, p) => s + p, 0);
          const CTX = [
            { u: [3, 25], unidad: "€", t: (nom, ps, T) => `${lista(nom.map((x, i) => `${x} pone ${ps[i]} €`))} para comprar un décimo de lotería, que gana <span class="dato">${miles(T)} €</span>. Se reparten el premio de forma proporcional a lo que puso cada uno. ¿Cuánto le toca a cada uno?` },
            { u: [5, 20], unidad: "€", t: (nom, ps, T) => `En un puesto de la feria, ${lista(nom.map((x, i) => `${x} trabajó ${ps[i]} horas`))}. Ganaron <span class="dato">${miles(T)} €</span> y se los reparten según las horas que trabajó cada uno. ¿Cuánto le toca a cada uno?` },
            { u: [2, 9], unidad: "kg", fam: true, t: (nom, ps, T) => `Se reparten <span class="dato">${T} kg</span> de fruta entre ${n} familias, de forma proporcional a su número de hijos: ${lista(ps.map(String))}. ¿Cuántos kilos recibe cada familia?` },
          ];
          const ctx = elegir(CTX), u = azar(...ctx.u), T = suma * u, cada = ps.map(p => p * u);
          const nom = ctx.fam ? ps.map((_, i) => `Familia ${i + 1}`) : elegir(NOMBRES).slice(0, n);
          const iguales = T / n;
          return {
            html: ctx.t(nom, ps, T),
            campos: nom.map((x, i) => ({ id: `c${i}`, etiqueta: `${x} (${ctx.unidad})` })),
            pasos: ["proporcion.html", "reparto", { p1: ps[0], p2: ps[1], p3: ps[2] || 0, total: T, nombres: nom.join(", ") }],
            _ok: Object.fromEntries(cada.map((c, i) => [`c${i}`, String(c)])),
            comprobar(v) {
              const X = nom.map((_, i) => num(v[`c${i}`])), mal = X.flatMap((x, i) => cerca(x, cada[i]) ? [] : [`c${i}`]);
              if (!mal.length) return resultado(mal);
              if (X.every(x => cerca(x, iguales, .01))) return resultado(mal, "Has repartido a partes iguales.", "El reparto es proporcional: quien pone más (o trabaja más, o tiene más hijos) recibe más.");
              if (!cerca(X.reduce((s, x) => s + x, 0), T, .01)) return resultado(mal, `Lo repartido no suma ${miles(T)}.`, `En total hay ${ps.join(" + ")} = ${suma} partes. ¿Cuánto vale una parte?`);
              return resultado(mal, "Todavía no.", `Una parte vale ${miles(T)} : ${suma}. Multiplica por las partes de cada uno.`);
            },
            operaciones: `<p>Partes: ${ps.join(" + ")} = ${suma}</p>
                          <p>Una parte: ${miles(T)} : ${suma} = ${u} ${ctx.unidad}</p>
                          ${nom.map((x, i) => `<p>${x}: ${ps[i]} · ${u} = <b>${miles(cada[i])} ${ctx.unidad}</b></p>`).join("")}
                          <p>Comprobación: ${cada.map(miles).join(" + ")} = ${miles(T)}</p>`,
          };
        },
      },

      inversa: {
        titulo: "Proporcionalidad inversa",
        sub: "Más personas, menos tiempo",
        herramienta: ["Proporcionalidad inversa", "proporcion.html#inversa"],
        pista: "Piensa en lo que tardaría 1 sola persona (o 1 grifo): tarda más, así que se multiplica. Después reparte ese trabajo entre los que te piden: se divide. El producto de las dos cantidades no cambia.",
        nuevo() {
          const CTX = [
            { ua: "personas", ub: "horas", t: (a, b, x) => `${a} personas montan el escenario de la fiesta en <span class="dato">${b} horas</span>, todas al mismo ritmo. ¿Cuánto tardarían ${x} personas?`, uno: "1 persona sola (horas)", res: x => `${x} personas (horas)` },
            { ua: "grifos", ub: "horas", t: (a, b, x) => `${a} grifos iguales llenan una piscina en <span class="dato">${b} horas</span>. ¿Cuánto tardarían ${x} grifos iguales?`, uno: "1 grifo solo (horas)", res: x => `${x} grifos (horas)` },
            { ua: "excursionistas", ub: "días", t: (a, b, x) => `En un refugio hay comida para ${a} excursionistas durante <span class="dato">${b} días</span>. Si fueran ${x} excursionistas, ¿para cuántos días habría comida?`, uno: "1 excursionista (días)", res: x => `${x} excursionistas (días)` },
            { ua: "pintores", ub: "días", t: (a, b, x) => `${a} pintores pintan el instituto en <span class="dato">${b} días</span>, todos al mismo ritmo. ¿Cuántos días tardarían ${x} pintores?`, uno: "1 pintor solo (días)", res: x => `${x} pintores (días)` },
          ];
          // a · b = x · y con y entero: b = x · t e y = a · t (como la herramienta).
          let a, x; do { a = azar(2, 9); x = azar(2, 10); } while (a === x);
          const t = azar(1, 3), b = x * t, y = a * t, total = a * b, ctx = elegir(CTX);
          return {
            html: ctx.t(a, b, x),
            campos: [{ id: "k", etiqueta: ctx.uno }, { id: "y", etiqueta: ctx.res(x) }],
            pasos: ["proporcion.html", "inversa", { a, b, x, ua: ctx.ua, ub: ctx.ub }],
            _ok: { k: String(total), y: String(y) },
            comprobar(v) {
              const K = num(v.k), Y = num(v.y), mal = [];
              if (!cerca(K, total)) mal.push("k");
              if (!cerca(Y, y)) mal.push("y");
              if (!mal.length) return resultado(mal);
              if (mal.includes("y") && cerca(Y, b * x / a, .01)) return resultado(mal, "Así sería si fuera directa.", `Con ${x > a ? "más" : "menos"} ${ctx.ua}, ¿se tarda más o menos? Tiene que salir ${x > a ? "menos" : "más"} de ${b} ${ctx.ub}.`);
              if (mal.includes("k") && cerca(K, b / a, .01)) return resultado(mal, "Uno solo tarda más, no menos.", `Si ${a} ${ctx.ua} necesitan ${b} ${ctx.ub}, uno solo necesita ${a} veces más: se multiplica.`);
              if (mal.includes("y") && cerca(Y, b - (x - a), .01)) return resultado(mal, "Has restado, pero hay que multiplicar y dividir.", `Lo que no cambia es el producto: ${a} · ${b}.`);
              if (mal.length === 1 && mal[0] === "y") return resultado(mal, "Lo de uno solo está bien; revisa el final.", `Reparte ${total} entre ${x}.`);
              return resultado(mal, "Todavía no.", `Uno solo: ${a} · ${b}.`);
            },
            operaciones: `<p>${ctx.uno.replace(/ \(.*\)$/, "")}: ${a} · ${b} = ${total} ${ctx.ub}</p>
                          <p>${ctx.res(x).replace(/ \(.*\)$/, "")}: ${total} : ${x} = <b>${y} ${ctx.ub}</b></p>
                          <p>Comprobación: ${a} · ${b} = ${x} · ${y} = ${total}</p>`,
          };
        },
      },

      tipo: {
        titulo: "¿Directa, inversa o ninguna?",
        sub: "Antes de calcular, mira qué relación hay",
        herramienta: ["¿Es proporcional?", "proporcion.html#tabla"],
        pista: "Piensa qué pasa si una cantidad se duplica. Si la otra también se duplica, es directa (el cociente no cambia). Si se reduce a la mitad, es inversa (el producto no cambia). Si no pasa ninguna de las dos cosas, no es proporcional: suele haber algo fijo que se suma.",
        variantes: [["texto", "Situaciones"], ["tabla", "Tablas"]],
        nuevo(variante = "texto") {
          const SIT = [
            () => { const k = elegir([1.5, 2.5, 3, 3.5]); return { tipo: "directa", ux: "kg", uy: "€", xs: [1, 2, 3, 5], f: x => k * x, t: `En la frutería, el kilo de plátanos cuesta ${eur(k)} €. ¿Qué relación hay entre los kilos que compras y lo que pagas?` }; },
            () => { const k = azar(6, 12); return { tipo: "directa", ux: "entradas", uy: "€", xs: [1, 2, 4, 5], f: x => k * x, t: `Cada entrada del cine cuesta ${k} €. ¿Qué relación hay entre el número de entradas y lo que pagas?` }; },
            () => ({ tipo: "directa", ux: "lado (cm)", uy: "perímetro (cm)", xs: [1, 2, 3, 5], f: x => 4 * x, t: "¿Qué relación hay entre el lado de un cuadrado y su perímetro?" }),
            () => { const k = elegir([1.4, 1.5, 1.6]); return { tipo: "directa", ux: "litros", uy: "€", xs: [10, 20, 30, 40], f: x => k * x, t: `La gasolina está a ${eur(k)} € el litro. ¿Qué relación hay entre los litros que echas y lo que pagas?` }; },
            () => { const P = elegir([12, 24]); return { tipo: "inversa", ux: "amigos", uy: "porciones", xs: [1, 2, 3, 4, 6], f: x => P / x, t: `Una bandeja de ${P} porciones de pizza se reparte a partes iguales. ¿Qué relación hay entre el número de amigos y las porciones que come cada uno?` }; },
            () => { const T = elegir([600, 1200]); return { tipo: "inversa", ux: "personas", uy: "€ cada una", xs: [20, 30, 40, 60], f: x => T / x, t: `Alquilar una guagua para una excursión cuesta ${miles(T)} €, vayan los que vayan, y se paga a partes iguales. ¿Qué relación hay entre el número de personas y lo que paga cada una?` }; },
            () => { const D = elegir([120, 240]); return { tipo: "inversa", ux: "km/h", uy: "horas", xs: [40, 60, 80, 120], f: x => D / x, t: `Un trayecto mide ${D} km. ¿Qué relación hay entre la velocidad del coche y el tiempo que tarda en hacerlo?` }; },
            () => { const a = azar(2, 4), d = elegir([6, 8, 12]); return { tipo: "inversa", ux: "pintores", uy: "días", xs: [1, 2, 3, 4, 6], f: x => a * d / x, t: `${a} pintores pintan el instituto en ${d} días, todos al mismo ritmo. ¿Qué relación hay entre el número de pintores y los días que tardan?` }; },
            () => { const b = elegir([3, 3.5]), c = elegir([1.1, 1.3]); return { tipo: "ninguna", ux: "km", uy: "€", xs: [1, 2, 5, 10], f: x => b + c * x, t: `Un taxi cobra ${eur(b)} € al subir y ${eur(c)} € por cada kilómetro. ¿Qué relación hay entre los kilómetros y lo que se paga?` }; },
            () => { const a = azar(10, 14), h = a - elegir([6, 8]); return { tipo: "ninguna", ux: "Ana", uy: "su hermano", xs: [a, a + 4, a + 10, a + 20], f: x => x - (a - h), t: `Ana tiene ${a} años y su hermano ${h}. ¿Qué relación hay entre la edad de Ana y la de su hermano a lo largo de los años?` }; },
            () => ({ tipo: "ninguna", ux: "lado (cm)", uy: "área (cm²)", xs: [1, 2, 3, 4], f: x => x * x, t: "¿Qué relación hay entre el lado de un cuadrado y su área?" }),
            () => { const L = elegir([20, 24]), c = 2; return { tipo: "ninguna", ux: "horas", uy: "cm", xs: [1, 2, 3, 4], f: x => L - c * x, t: `Una vela de ${L} cm se gasta ${c} cm cada hora. ¿Qué relación hay entre las horas que lleva encendida y lo que mide?` }; },
            () => { const c = elegir([15, 20]), p = elegir([3, 4]); return { tipo: "ninguna", ux: "clases", uy: "€", xs: [2, 4, 6, 8], f: x => c + p * x, t: `Un gimnasio cobra ${c} € al mes más ${p} € por cada clase. ¿Qué relación hay entre las clases del mes y lo que pagas?` }; },
          ];
          const S = elegir(SIT)(), ys = S.xs.map(x => r2(S.f(x))), crece = ys[1] > ys[0];
          const html = variante === "texto" ? S.t
            : `¿Qué tipo de relación hay en esta tabla?${tablaHTML(S.ux, S.xs, S.uy, ys)}`;
          const ok = S.tipo, NOMBRE = { directa: "Es <b>proporcionalidad directa</b>.", inversa: "Es <b>proporcionalidad inversa</b>.", ninguna: "<b>No es proporcional</b>." };
          const [x1, x2] = S.xs, [y1, y2] = ys;
          const ejemplo = `${fmt(x1)} → ${fmt(y1)} y ${fmt(x2)} → ${fmt(y2)} (${S.ux} → ${S.uy})`;
          const porque = ok === "directa" ? `${S.uy} : ${S.ux} siempre da ${fmt(r2(y1 / x1))}: el cociente no cambia.`
            : ok === "inversa" ? `${S.ux} · ${S.uy} siempre da ${fmt(r2(x1 * y1))}: el producto no cambia.`
            : `Ni el cociente ni el producto se mantienen. ${ejemplo}.`;
          return {
            html,
            trabajo: `<div class="campos centrado"><div class="campo"><span class="etiqueta">Es proporcionalidad…</span>${ELEGIR("tipo", [["directa", "Directa"], ["inversa", "Inversa"], ["ninguna", "Ninguna"]], "Tipo de relación")}</div></div>`,
            pasos: ["proporcion.html", "tabla", { x: fila(S.xs), y: fila(ys), ux: S.ux, uy: S.uy }],
            _ok: { tipo: ok },
            comprobar(v) {
              if (v.tipo === ok) return resultado([]);
              const mal = ["tipo"];
              if (v.tipo === "directa" && !crece) return resultado(mal, "Cuando una crece, la otra decrece: no puede ser directa.", ok === "inversa" ? "¿El doble de una da la mitad de la otra?" : `¿El doble de una da la mitad de la otra? Mira: ${ejemplo}.`);
              if (v.tipo === "inversa" && crece) return resultado(mal, "Las dos crecen a la vez: no puede ser inversa.", ok === "directa" ? "¿El doble de una da el doble de la otra?" : `¿El doble de una da el doble de la otra? Mira: ${ejemplo}.`);
              if (v.tipo === "directa") return resultado(mal, "Las dos crecen, pero ¿el doble da el doble?", `Mira: ${ejemplo}. ¿Hay algo fijo que se suma?`);
              if (v.tipo === "inversa") return resultado(mal, "Una decrece, pero ¿el doble da la mitad?", `Mira: ${ejemplo}.`);
              return resultado(mal, "Compruébalo con dos valores.", ok === "directa" ? `${ejemplo}: ¿el doble da el doble?` : `${ejemplo}: ¿el doble da la mitad?`);
            },
            operaciones: `${variante === "texto" ? `<p>Por ejemplo (${S.ux} → ${S.uy}): ${S.xs.map((x, i) => `${fmt(x)} → ${fmt(ys[i])}`).join("; ")}</p>` : ""}
                          <p>${porque}</p><p>${NOMBRE[ok]}</p>`,
          };
        },
      },

      sumar: {
        titulo: "¿Sumar o multiplicar?",
        sub: "¿Tiene razón el compañero?",
        herramienta: ["¿Es proporcional?", "proporcion.html#tabla"],
        pista: "Si las dos cantidades son proporcionales, cuando una se multiplica por algo, la otra se multiplica por lo mismo: no se suma lo mismo a las dos. Pero hay cosas que crecen sumando, como las edades: los dos cumplen los mismos años.",
        nuevo() {
          const caso = elegir(["prop", "prop", "prop", "edad", "edad"]), razon = Math.random() < .35;
          let html, correcto, dicho, etiqueta, pasos, porque, aditivo, multi;
          if (caso === "prop") {
            const a = azar(2, 6), k = azar(2, 5), x = elegir([2 * a, 3 * a, a + 2, a + 3]), b = a * k;
            correcto = k * x; aditivo = b + (x - a); multi = correcto;
            const C = elegir([
              { ua: "kg", ub: "€", t: v => `En la frutería, ${a} kg de naranjas cuestan ${b} €. Un compañero dice: «${x} kg cuestan ${v} €».`, et: `${x} kg cuestan (€)` },
              { ua: "personas", ub: "huevos", t: v => `Una tortilla para ${a} personas lleva ${b} huevos. Un compañero dice: «Para ${x} personas hacen falta ${v} huevos».`, et: `Huevos para ${x} personas` },
              { ua: "cm de ancho", ub: "cm de alto", t: v => `Una foto mide ${a} cm de ancho y ${b} cm de alto. Se amplía hasta ${x} cm de ancho sin deformarla. Un compañero dice: «El alto será ${v} cm».`, et: "El alto (cm)" },
            ]);
            dicho = razon ? correcto : aditivo; html = `${C.t(dicho)} ¿Tiene razón?`; etiqueta = C.et;
            pasos = ["proporcion.html", "directa", { a, b, x, ua: C.ua, ub: C.ub }];
            porque = x % a === 0 ? `Es proporcional: ${x} es ${x / a} veces ${a}, así que ${b} se multiplica por lo mismo: ${b} · ${x / a} = <b>${correcto}</b>.`
              : `Es proporcional: no se suma, se multiplica. Lo que corresponde a 1 es ${b} : ${a} = ${k}, y ${k} · ${x} = <b>${correcto}</b>.`;
          } else {
            const h = azar(3, 6), a = h * elegir([2, 3]), A = 2 * a;   // Ana tiene el doble o el triple
            correcto = h + (A - a); multi = A / a * h; aditivo = correcto;
            dicho = razon ? correcto : multi;
            html = `${elegir(["Ana", "Nayra", "Lucía"])} tiene ${a} años y su hermano ${h}. Un compañero dice: «Cuando ella tenga ${A} años, su hermano tendrá ${dicho}». ¿Tiene razón?`;
            etiqueta = "Edad del hermano";
            pasos = ["proporcion.html", "tabla", { x: fila([a, a + 2, a + 5, A]), y: fila([h, h + 2, h + 5, correcto]), ux: "ella", uy: "su hermano" }];
            porque = `Las edades no son proporcionales: los dos cumplen los mismos años. Pasan ${A} − ${a} = ${A - a} años, así que el hermano tendrá ${h} + ${A - a} = <b>${correcto}</b>.`;
          }
          const si = razon ? "si" : "no";
          return {
            html,
            trabajo: `<div class="campos centrado"><div class="campo"><span class="etiqueta">¿Tiene razón?</span>${ELEGIR("razon", [["si", "Sí"], ["no", "No"]], "¿Tiene razón?")}</div></div>
              <div class="campos centrado"><div class="campo"><label for="f-v">${etiqueta}</label><input class="casilla" id="f-v" inputmode="decimal" autocomplete="off"></div></div>`,
            pasos,
            _ok: { razon: si, v: String(correcto) },
            comprobar(v) {
              const V = num(v.v), mal = [];
              if (v.razon !== si) mal.push("razon");
              if (!cerca(V, correcto)) mal.push("v");
              if (!mal.length) return resultado(mal);
              if (caso === "prop" && mal.includes("v") && cerca(V, aditivo)) return resultado(mal, "Has sumado lo mismo a las dos cantidades.", "Si es proporcional, no se suma: se multiplica las dos por lo mismo.");
              if (caso === "edad" && mal.includes("v") && cerca(V, multi)) return resultado(mal, "Has multiplicado las edades.", "Las edades no son proporcionales: los dos cumplen los mismos años.");
              if (mal.includes("razon") && razon) return resultado(mal, "Pues esta vez sí tiene razón.", caso === "prop" ? "Ha multiplicado las dos cantidades por lo mismo." : "Ha sumado a su hermano los mismos años que pasan para ella.");
              if (mal.includes("razon")) return resultado(mal, "Compruébalo antes de darle la razón.", caso === "prop" ? "¿Es proporcional? Entonces no se suma lo mismo a las dos." : "¿Si ella duplica su edad, su hermano también?");
              return resultado(mal, "Bien visto si tiene razón o no; revisa el número.", caso === "prop" ? "Calcula lo que corresponde a 1 y multiplica." : "¿Cuántos años pasan?");
            },
            operaciones: `<p>${porque}</p><p>${razon ? "El compañero <b>tiene razón</b>." : `El compañero <b>no tiene razón</b>: ${caso === "prop" ? "ha sumado cuando había que multiplicar" : "ha multiplicado cuando había que sumar"}.`}</p>`,
          };
        },
      },

      aumentos: {
        titulo: "Aumentos y descuentos",
        sub: "Con un solo número: el multiplicador",
        herramienta: ["Aumentos y descuentos", "porcentajes.html#variacion"],
        pista: "Un descuento del 12 % deja el 88 % del precio: se multiplica por 0,88. Una subida del 7 % lo deja en el 107 %: se multiplica por 1,07. Comprueba: con un descuento tiene que salir menos; con una subida, más.",
        variantes: [["todos", "Mezclados"], ["baja", "Descuentos"], ["sube", "Subidas"], ["igic", "Con IGIC"]],
        nuevo(variante = "todos") {
          const tipo = variante === "todos" ? elegir(["baja", "sube", "igic"]) : variante;
          let T, p, sentido, html;
          if (tipo === "baja") {
            T = azar(4, 60) * 5; p = elegir([5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 60]); sentido = "baja";
            const [cosa, verbo] = elegir([["Unas zapatillas", "tienen"], ["Una chaqueta", "tiene"], ["Una bicicleta", "tiene"], ["Una mochila", "tiene"], ["Unos auriculares", "tienen"], ["Un patinete", "tiene"]]);
            html = `${cosa} de <span class="dato">${T} €</span> ${verbo} un ${pc(p)} de descuento. ¿Cuánto pagas?`;
          } else if (tipo === "sube") {
            p = elegir([2, 3, 4, 5, 8, 10, 12, 15, 20, 25]); sentido = "sube";
            const c = elegir([
              [T = azar(40, 120), `La factura de la luz fue de <span class="dato">${T} €</span> y este mes sube un ${pc(p)}. ¿Cuánto hay que pagar este mes?`],
              [T = azar(30, 90) * 10, `Un alquiler de <span class="dato">${T} €</span> al mes sube un ${pc(p)}. ¿Cuánto se paga ahora al mes?`],
              [T = azar(8, 60), `Una entrada de concierto de <span class="dato">${T} €</span> sube un ${pc(p)}. ¿Cuánto cuesta ahora?`],
            ]);
            [T, html] = c;
          } else {
            do T = azar(10, 400); while (T === 30);
            p = 7; sentido = "sube";
            html = `${elegir(["Un móvil", "Una tableta", "Un patinete", "Una impresora", "Un balón"])} cuesta <span class="dato">${T} €</span> sin impuestos. ¿Cuánto cuesta con el IGIC general, del 7 %?`;
          }
          const m = r2((sentido === "sube" ? 100 + p : 100 - p) / 100), R = r2(T * m), cambio = r2(T * p / 100);
          return {
            html,
            campos: [{ id: "m", etiqueta: "Se multiplica por" }, { id: "r", etiqueta: "Precio final (€)" }],
            pasos: ["porcentajes.html", "variacion", { total: T, p, sentido }],
            _ok: { m: fmt(m), r: fmt(R) },
            comprobar(v) {
              const M = num(v.m), X = num(v.r), mal = [];
              if (!cerca(M, m)) mal.push("m");
              if (!cerca(X, R)) mal.push("r");
              if (!mal.length) return resultado(mal);
              if ((mal.includes("m") && cerca(M, p / 100)) || (mal.includes("r") && cerca(X, cambio))) return resultado(mal, sentido === "baja" ? "Eso es lo que te descuentan, no lo que pagas." : "Eso es lo que sube, no el precio final.", `Con ×${fmt(p / 100)} sale el ${pc(p)}. Lo que pagas es el ${sentido === "baja" ? 100 - p : 100 + p} % del precio.`);
              if (mal.includes("m") && p < 10 && cerca(M, 1 + p / 10)) return resultado(mal, `El ${pc(p)} es 0,0${p}, no 0,${p}.`, `${pc(p)} = ${p} : 100 = ${fmt(p / 100)}. El multiplicador es 1 + ${fmt(p / 100)}.`);
              if ((mal.includes("m") && cerca(M, 2 - m)) || (mal.includes("r") && cerca(X, T * (2 - m)))) return resultado(mal, sentido === "baja" ? "Es un descuento: tiene que salir menos." : "Es una subida: tiene que salir más.", sentido === "baja" ? `Te queda el ${100 - p} % del precio: se multiplica por un número menor que 1.` : `Pasa a ser el ${100 + p} % del precio: se multiplica por un número mayor que 1.`);
              if (mal.length === 1 && mal[0] === "r") return resultado(mal, "El multiplicador está bien; revisa la cuenta.", `${T} · ${fmt(m)} = ?`);
              return resultado(mal, "Todavía no.", sentido === "baja" ? `Si te descuentan el ${pc(p)}, ¿qué porcentaje del precio pagas?` : `Si sube un ${pc(p)}, ¿qué porcentaje del precio de antes es el nuevo?`);
            },
            operaciones: `<p>${sentido === "baja" ? `100 % − ${pc(p)} = ${100 - p} %` : `100 % + ${pc(p)} = ${100 + p} %`} → se multiplica por ${fmt(m)}</p>
                          <p>${T} · ${fmt(m)} = <b>${eur(R)} €</b></p>
                          <p>O bien: ${sentido === "baja" ? "descuento" : "subida"} = ${pc(p)} de ${T} = ${eur(cambio)} €, y ${T} ${sentido === "baja" ? "−" : "+"} ${eur(cambio)} = ${eur(R)} €</p>`,
          };
        },
      },

      antes: {
        titulo: "¿Cuánto era antes?",
        sub: "Del precio final al de antes: dividir",
        herramienta: ["¿Cuánto era antes?", "porcentajes.html#original"],
        pista: "El porcentaje se aplicó al precio de antes, no al final. Busca el multiplicador (por ejemplo, ×1,07 o ×0,88): precio de antes · multiplicador = precio final. Para volver atrás, divide el precio final entre el multiplicador.",
        variantes: [["todos", "Mezclados"], ["igic", "IGIC incluido"], ["baja", "Rebajado"], ["sube", "Después de subir"]],
        nuevo(variante = "todos") {
          const tipo = variante === "todos" ? elegir(["igic", "baja", "sube"]) : variante;
          let I, p, sentido, html;
          const final_ = () => r2(I * (sentido === "sube" ? 100 + p : 100 - p) / 100);
          if (tipo === "igic") {
            I = azar(10, 300); p = 7; sentido = "sube";
            html = `${elegir(["Unos auriculares cuestan", "Una cafetera cuesta", "Unas zapatillas cuestan", "Un reloj cuesta"])} <span class="dato">${eur(final_())} €</span> con el IGIC (7 %) incluido. ¿Cuál es el precio sin IGIC?`;
          } else if (tipo === "baja") {
            I = azar(4, 60) * 5; p = elegir([10, 12, 15, 20, 25, 30, 40]); sentido = "baja";
            const [cosa, rebajada] = elegir([["una camisa", "rebajada"], ["una chaqueta", "rebajada"], ["un pantalón", "rebajado"], ["una lámpara", "rebajada"]]);
            html = `Por ${cosa} ${rebajada} un ${pc(p)} has pagado <span class="dato">${eur(final_())} €</span>. ¿Cuánto costaba antes de la rebaja?`;
          } else {
            I = azar(10, 80); p = elegir([5, 8, 10, 15, 20, 25]); sentido = "sube";
            html = elegir([
              `Tras una subida del ${pc(p)}, el abono de guagua cuesta <span class="dato">${eur(final_())} €</span>. ¿Cuánto costaba antes de la subida?`,
              `Después de subir un ${pc(p)}, una entrada de cine cuesta <span class="dato">${eur(final_())} €</span>. ¿Cuánto costaba antes?`,
            ]);
          }
          const F_ = final_(), m = r2((sentido === "sube" ? 100 + p : 100 - p) / 100);
          return {
            html,
            campos: [{ id: "m", etiqueta: "Multiplicador" }, { id: "r", etiqueta: "Precio de antes (€)" }],
            pasos: ["porcentajes.html", "original", { final: F_, p, sentido }],
            _ok: { m: fmt(m), r: fmt(I) },
            comprobar(v) {
              const M = num(v.m), X = num(v.r), mal = [];
              if (!cerca(M, m)) mal.push("m");
              if (!cerca(X, I, .01)) mal.push("r");
              if (!mal.length) return resultado(mal);
              if (mal.includes("r") && cerca(X, F_ * (sentido === "sube" ? 1 - p / 100 : 1 + p / 100), .01))
                return resultado(mal, sentido === "sube" ? "Has quitado el porcentaje al precio final." : "Has sumado el porcentaje al precio final.", `El ${pc(p)} era del precio de antes, no de ${eur(F_)} €. Comprueba tu resultado: ${eur(X)} · ${fmt(m)} no da ${eur(F_)}.`);
              if (mal.includes("r") && cerca(X, F_ * m, .01)) return resultado(mal, "Has multiplicado; para volver atrás hay que dividir.", `Precio de antes · ${fmt(m)} = ${eur(F_)} → precio de antes = ${eur(F_)} : ${fmt(m)}.`);
              if (mal.length === 1 && mal[0] === "r") return resultado(mal, "El multiplicador está bien; revisa la cuenta.", `${eur(F_)} : ${fmt(m)} = ?`);
              return resultado(mal, "Todavía no.", `El precio final es el ${sentido === "sube" ? 100 + p : 100 - p} % del de antes.`);
            },
            operaciones: `<p>Precio de antes · ${fmt(m)} = ${eur(F_)} €</p>
                          <p>Precio de antes = ${eur(F_)} : ${fmt(m)} = <b>${eur(I)} €</b></p>
                          <p>Comprobación: ${eur(I)} · ${fmt(m)} = ${eur(F_)} €</p>`,
          };
        },
      },

      encadenados: {
        titulo: "Dos cambios seguidos",
        sub: "Los porcentajes no se suman",
        herramienta: ["Dos cambios seguidos", "porcentajes.html#encadenados"],
        pista: "Cada cambio tiene su multiplicador (subir un 20 % = ×1,20; bajar un 25 % = ×0,75). El segundo se aplica sobre el precio que dejó el primero, así que se multiplican los dos: ×1,20 · 0,75 = ×0,90. Sumar o restar los porcentajes no funciona.",
        nuevo() {
          let T, p1, s1, p2, s2, html, m, R;
          const mul = (p, s) => r2(1 + (s === "sube" ? p : -p) / 100);
          do {
            const c = elegir(["subeBaja", "dosBajas", "igic", "dosSubidas"]);
            if (c === "subeBaja") {
              T = azar(3, 16) * 5; p1 = elegir([10, 20, 25, 30]); s1 = "sube"; p2 = elegir([10, 20, 25, 30, 40]); s2 = "baja";
              html = `${elegir(["Una camiseta", "Una chaqueta", "Una mochila"])} de <span class="dato">${T} €</span> sube un ${pc(p1)} y después, en rebajas, baja un ${pc(p2)}. ¿Cuál es el precio final?`;
            } else if (c === "dosBajas") {
              T = azar(4, 30) * 5; p1 = elegir([10, 20, 30, 40]); s1 = "baja"; p2 = elegir([5, 10, 15, 20]); s2 = "baja";
              html = `${elegir(["Un abrigo", "Un patinete", "Una lámpara"])} de <span class="dato">${T} €</span> tiene un ${pc(p1)} de descuento y, en caja, otro ${pc(p2)} sobre el precio ya rebajado. ¿Cuánto pagas?`;
            } else if (c === "igic") {
              do T = azar(4, 40) * 5; while (T === 30);
              p1 = elegir([10, 20, 30]); s1 = "baja"; p2 = 7; s2 = "sube";
              html = `Un ${elegir(["reloj", "altavoz", "teclado"])} cuesta <span class="dato">${T} €</span> sin impuestos. Tiene un ${pc(p1)} de descuento y después se le aplica el IGIC (7 %). ¿Cuál es el precio final?`;
            } else {
              T = azar(2, 20) * 50; p1 = elegir([10, 20, 25, 50]); s1 = "sube"; p2 = elegir([10, 20, 40]); s2 = "sube";
              html = `Unas acciones que valían <span class="dato">${miles(T)} €</span> suben un ${pc(p1)} y, al año siguiente, otro ${pc(p2)}. ¿Cuánto valen ahora?`;
            }
            m = Math.round(mul(p1, s1) * mul(p2, s2) * 1e4) / 1e4; R = Math.round(T * m * 1e4) / 1e4;
          } while (Math.abs(R * 100 - Math.round(R * 100)) > 1e-6);   // precio final exacto en céntimos
          const m1 = mul(p1, s1), m2 = mul(p2, s2), medio = r2(T * m1);
          const sumado = (s1 === "sube" ? p1 : -p1) + (s2 === "sube" ? p2 : -p2), siSumara = r2(T * (1 + sumado / 100)), unico = r2((m - 1) * 100);
          const signo = p => p >= 0 ? `+${fmt(p)} %` : `−${fmt(-p)} %`;
          return {
            html,
            campos: [{ id: "m", etiqueta: "Multiplicador total" }, { id: "r", etiqueta: "Precio final (€)" }],
            pasos: ["porcentajes.html", "encadenados", { total: T, p1, s1, p2, s2 }],
            _ok: { m: fmt(m), r: fmt(R) },
            comprobar(v) {
              const M = num(v.m), X = num(v.r), mal = [];
              if (!cerca(M, m, .00005)) mal.push("m");
              if (!cerca(X, R, .011)) mal.push("r");
              if (!mal.length) return resultado(mal);
              if ((mal.includes("m") && cerca(M, 1 + sumado / 100, .00005)) || (mal.includes("r") && cerca(X, siSumara, .011)))
                return resultado(mal, "Has sumado los porcentajes.", `El ${pc(p2)} se aplica sobre el precio que dejó el primer cambio, no sobre ${miles(T)} €: multiplica ${fmt(m1)} · ${fmt(m2)}.`);
              if (mal.includes("r") && cerca(X, medio, .011)) return resultado(mal, "Ese es el precio después del primer cambio.", `Falta el segundo: ${eur(medio)} · ${fmt(m2)}.`);
              if (mal.includes("m") && (cerca(M, m1, .00005) || cerca(M, m2, .00005))) return resultado(mal, "Ese es el multiplicador de un solo cambio.", `Multiplica los dos: ${fmt(m1)} · ${fmt(m2)}.`);
              if (mal.length === 1 && mal[0] === "r") return resultado(mal, "El multiplicador está bien; revisa la cuenta.", `${miles(T)} · ${fmt(m)} = ?`);
              return resultado(mal, "Todavía no.", `Primero el multiplicador de cada cambio: ${s1 === "sube" ? "subir" : "bajar"} un ${pc(p1)} y ${s2 === "sube" ? "subir" : "bajar"} un ${pc(p2)}.`);
            },
            operaciones: `<p>Multiplicadores: ${fmt(m1)} y ${fmt(m2)} → ${fmt(m1)} · ${fmt(m2)} = ${fmt(m)}</p>
                          <p>${miles(T)} · ${fmt(m)} = <b>${eur(R)} €</b> (paso a paso: ${miles(T)} · ${fmt(m1)} = ${eur(medio)} €; ${eur(medio)} · ${fmt(m2)} = ${eur(R)} €)</p>
                          <p>Es un cambio único de ${signo(unico)}, no de ${signo(sumado)}${Math.abs(unico - sumado) > 1e-9 ? ` (sumando saldría ${eur(siSumara)} €)` : ""}.</p>`,
          };
        },
      },

      barato: {
        titulo: "¿Cuál sale más barato?",
        sub: "Comparar el precio de 1 unidad",
        herramienta: ["¿Cuál sale más barato?", "proporcion.html#barato"],
        pista: "Con cantidades distintas no se pueden comparar los precios tal cual. Calcula cuánto cuesta 1 unidad (1 yogur, 1 kg, 1 L) en cada oferta: precio entre cantidad. Si una viene en gramos o mililitros, pásala antes a kilos o litros.",
        variantes: [["mismas", "Mismas unidades"], ["cambio", "Cambiando unidades"]],
        nuevo(variante = "mismas") {
          let qa, qb, ua, ub, html, unidad;
          if (variante === "mismas") {
            // Precio de 1 unidad en céntimos, dentro de un rango real para cada producto.
            const [s, pl, lo, hi] = elegir([["yogur", "yogures", 25, 60], ["lata", "latas de refresco", 35, 90], ["rollo", "rollos de cocina", 30, 80], ["huevo", "huevos", 20, 45], ["botella", "botellas de agua", 20, 60]]);
            do { qa = elegir([2, 3, 4, 6, 8, 10, 12]); qb = elegir([2, 3, 4, 6, 8, 10, 12]); } while (qa === qb);
            do { ua = azar(lo, hi) / 100; ub = azar(lo, hi) / 100; } while (ua === ub || Math.abs(ua - ub) > .3 * Math.min(ua, ub));
            unidad = s;
            html = `En el supermercado A, un pack de ${qa} ${pl} cuesta <span class="dato">${eur(qa * ua)} €</span>. En el B, uno de ${qb} ${pl} cuesta <span class="dato">${eur(qb * ub)} €</span>. ¿Dónde sale más barato cada ${s}?`;
          } else {
            // [nombre, U, u, envases grandes, pequeños, precio de 1 U entre lo y hi €]
            const [nombre, U, u, grandes, peques, lo, hi] = elegir([
              ["El paquete de café", "kg", "g", [1, 2], [250, 500], 8, 20],
              ["El paquete de arroz", "kg", "g", [1, 2, 5], [500, 750], 1.2, 3.5],
              ["El aceite", "L", "mL", [1, 2, 3, 5], [250, 500, 750], 4, 12],
              ["El detergente", "L", "mL", [2, 3, 5], [500, 750], 1.5, 4],
            ]);
            // El precio de 1 kg o 1 L en céntimos múltiplos de 4: así los dos precios son exactos.
            const g = elegir(grandes), pq = elegir(peques);
            do { ua = azar(Math.ceil(lo * 25), Math.floor(hi * 25)) * 4 / 100; ub = azar(Math.ceil(lo * 25), Math.floor(hi * 25)) * 4 / 100; } while (ua === ub || Math.abs(ua - ub) > .3 * Math.min(ua, ub));
            unidad = U;
            const peqA = Math.random() < .5;   // cuál de los dos viene en g o mL
            [qa, qb] = peqA ? [pq / 1000, g] : [g, pq / 1000];
            const txt = q => q < 1 ? `${q * 1000} ${u}` : `${q} ${U}`;
            html = `${nombre} A, de ${txt(qa)}, cuesta <span class="dato">${eur(r2(qa * ua))} €</span>. El B, de ${txt(qb)}, cuesta <span class="dato">${eur(r2(qb * ub))} €</span>. ¿Cuál sale más barato por ${U === "kg" ? "kilo" : "litro"}?`;
          }
          const pa = r2(qa * ua), pb = r2(qb * ub), gana = ua < ub ? "A" : "B", masBaratoTotal = pa < pb ? "A" : "B";
          return {
            html,
            trabajo: `<div class="campos">
                <div class="campo"><label for="f-ua">A: 1 ${unidad} cuesta (€)</label><input class="casilla" id="f-ua" inputmode="decimal" autocomplete="off"></div>
                <div class="campo"><label for="f-ub">B: 1 ${unidad} cuesta (€)</label><input class="casilla" id="f-ub" inputmode="decimal" autocomplete="off"></div>
              </div>
              <div class="campos centrado"><div class="campo"><span class="etiqueta">¿Cuál sale más barato?</span>${ELEGIR("cual", [["A", "A"], ["B", "B"]], "¿Cuál sale más barato?")}</div></div>`,
            pasos: ["proporcion.html", "barato", { qa, pa, qb, pb, unidad }],
            _ok: { ua: fmt(ua), ub: fmt(ub), cual: gana },
            comprobar(v) {
              const A = num(v.ua), B = num(v.ub), mal = [];
              if (!cerca(A, ua, .006)) mal.push("ua");
              if (!cerca(B, ub, .006)) mal.push("ub");
              if (v.cual !== gana) mal.push("cual");
              if (!mal.length) return resultado(mal);
              if ((mal.includes("ua") && cerca(A, qa / pa, .01)) || (mal.includes("ub") && cerca(B, qb / pb, .01))) return resultado(mal, "Has dividido al revés.", "El precio de 1 unidad es el precio entre la cantidad.");
              if (variante === "cambio" && ((mal.includes("ua") && cerca(A, pa / (qa * 1000), .001)) || (mal.includes("ub") && cerca(B, pb / (qb * 1000), .001))))
                return resultado(mal, `Eso es lo que cuesta 1 ${unidad === "kg" ? "g" : "mL"}.`, `Pasa antes la cantidad a ${unidad}: 500 ${unidad === "kg" ? "g" : "mL"} = 0,5 ${unidad}.`);
              if (mal.length === 1 && mal[0] === "cual") return resultado(mal, v.cual === masBaratoTotal ? "Ese es el que cuesta menos en total." : "Compara los dos precios de 1 unidad.", v.cual === masBaratoTotal ? "Pero trae menos cantidad: lo que cuenta es el precio de 1 unidad." : `${eur(ua)} € frente a ${eur(ub)} €.`);
              return resultado(mal, "Todavía no.", "Divide el precio de cada oferta entre su cantidad.");
            },
            operaciones: `${variante === "cambio" ? `<p>En ${unidad}: A = ${fmt(qa)} ${unidad} y B = ${fmt(qb)} ${unidad}</p>` : ""}
                          <p>A: ${eur(pa)} : ${fmt(qa)} = ${eur(ua)} € cada ${unidad}</p>
                          <p>B: ${eur(pb)} : ${fmt(qb)} = ${eur(ub)} € cada ${unidad}</p>
                          <p>Sale más barato <b>${gana}</b>${gana !== masBaratoTotal ? ", aunque cueste más en total" : ""}.</p>`,
          };
        },
      },

      ofertas: {
        titulo: "Ofertas: 3×2 y 2ª unidad",
        sub: "El descuento de verdad",
        herramienta: ["Ofertas", "proporcion.html#oferta"],
        pista: "Calcula lo que pagas con la oferta y lo que costaría sin ella. El descuento real es lo que ahorras dividido entre lo que costaría sin oferta. Ojo: «2ª unidad al 70 %» no es un 70 % de descuento, porque la primera la pagas entera.",
        variantes: [["todas", "Mezcladas"], ["lleva", "3×2 y parecidas"], ["segunda", "2ª unidad"]],
        nuevo(variante = "todas") {
          const tipo = variante === "todas" ? elegir(["lleva", "segunda"]) : variante;
          const [cosa, pl, lo, hi] = elegir([["zumo", "zumos", 8, 25], ["camiseta", "camisetas", 80, 250], ["champú", "champús", 25, 60], ["pack de yogures", "packs de yogures", 15, 40], ["libreta", "libretas", 12, 35]]);
          let precio, a, b = 0;
          // Sin el 3×2 a 1,20 € ni la 2ª al 70 % a 20 € del banco.
          do {
            precio = hi >= 100 ? Math.round(azar(lo, hi) / 10) : azar(lo, hi) / 10;   // camisetas, a euros enteros
            if (tipo === "lleva") [a, b] = elegir([[3, 2], [3, 2], [2, 1], [4, 3]]); else a = elegir([50, 60, 70, 80]);
          } while ((tipo === "lleva" && a === 3 && precio === 1.2) || (tipo === "segunda" && a === 70 && precio === 20));
          const n = tipo === "lleva" ? a : 2, partes = tipo === "lleva" ? b : 2 - a / 100;
          const sin = r2(n * precio), total = r2(partes * precio), ahorro = r2(sin - total), real = Math.round(ahorro / sin * 1000) / 10;
          const html = tipo === "lleva"
            ? `Un supermercado anuncia «<b>llévate ${a} y paga ${b}</b>» en ${pl} de <span class="dato">${eur(precio)} €</span> la unidad. Si te llevas ${a}, ¿cuánto pagas? ¿Qué descuento real supone?`
            : `Una tienda anuncia «<b>2ª unidad al ${a} %</b>» en ${pl} de <span class="dato">${eur(precio)} €</span>. Si compras dos, ¿cuánto pagas? ¿Qué descuento real supone?`;
          const exacto = Math.abs(ahorro / sin * 1000 - Math.round(ahorro / sin * 1000)) < 1e-6;
          return {
            html,
            campos: [{ id: "t", etiqueta: "Pagas en total (€)" }, { id: "d", etiqueta: exacto ? "Descuento real (%)" : "Descuento real (%, con un decimal)" }],
            pasos: ["proporcion.html", "oferta", { precio, tipo, a, b }],
            _ok: { t: fmt(total), d: fmt(real) },
            comprobar(v) {
              const Tt = num(v.t), Dd = num(v.d), mal = [];
              if (!cerca(Tt, total)) mal.push("t");
              if (!cerca(Dd, real, .051)) mal.push("d");
              if (!mal.length) return resultado(mal);
              if (mal.includes("t") && cerca(Tt, sin)) return resultado(mal, "Eso costaría sin la oferta.", tipo === "lleva" ? `Solo pagas ${b}.` : `La segunda tiene un ${a} % de descuento.`);
              if (mal.includes("d") && tipo === "segunda" && cerca(Dd, a)) return resultado(mal, `No es un ${a} %: ese descuento es solo de la segunda unidad.`, `La primera la pagas entera. Compara lo que ahorras con lo que costarían las dos: ${eur(ahorro)} : ${eur(sin)}.`);
              if (mal.includes("d") && cerca(Dd, ahorro)) return resultado(mal, "Eso son los euros que ahorras.", `Pásalo a porcentaje: ${eur(ahorro)} : ${eur(sin)}.`);
              if (mal.includes("d") && cerca(Dd, 100 - real, .051)) return resultado(mal, "Ese es el porcentaje que pagas.", "El descuento es lo que no pagas.");
              if (mal.includes("d") && cerca(Dd, ahorro / total * 100, .06)) return resultado(mal, "Has dividido entre lo que pagas.", `El descuento se calcula sobre lo que costaría sin oferta: ${eur(ahorro)} : ${eur(sin)}.`);
              if (mal.length === 1 && mal[0] === "d") return resultado(mal, "Lo que pagas está bien; revisa el porcentaje.", `Ahorras ${eur(ahorro)} € de ${eur(sin)} €.`);
              return resultado(mal, "Todavía no.", `Sin oferta, ${n} ${pl} costarían ${n} · ${eur(precio)} €.`);
            },
            operaciones: `<p>Sin oferta: ${n} · ${eur(precio)} = ${eur(sin)} €</p>
                          <p>Con la oferta: ${tipo === "lleva" ? `${b} · ${eur(precio)}` : `${eur(precio)} + ${eur(precio)} · ${fmt(r2(1 - a / 100))}`} = <b>${eur(total)} €</b></p>
                          <p>Ahorras ${eur(ahorro)} €: ${eur(ahorro)} : ${eur(sin)} ${exacto ? "=" : "≈"} ${fmt(Math.round(ahorro / sin * 1000) / 1000)} → <b>${fmt(real)} %</b> de descuento${tipo === "segunda" ? `, no un ${a} %` : ""}.</p>`,
          };
        },
      },
    },
  });
}
