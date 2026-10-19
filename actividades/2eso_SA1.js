// Actividades de repaso de la SA1 de 2º ESO (Números para entender el mundo).
// Las letras de los bloques son las de la PD (los títulos llegan en datos.js). Cada actividad: titulo, sub, herramienta [nombre, página de
// herramientas/], pista, [variantes, dibujoOculto] y nuevo(variante) → un
// ejercicio { html, trabajo | campos, [dibujo(resuelto)], [pasos: [página, modo, datos]
// para abrir la herramienta con este mismo ejercicio], _ok, comprobar(valores),
// operaciones | solucion }. Números al azar; nunca los de las pruebas escritas.
"use strict";

Repaso.tema("2eso", "SA1", {
  bloques: {
    A: ["rectangulos", "cantidad", "queda"],
    B: ["notacion"],
    C: ["formas"],
    D: ["porcentaje", "quepc"],
    E: ["jerarquia", "inversa"],
    F: ["producto", "combinadas"],
    G: ["mayormenor", "factorcomun", "potencias"],
  },
  actividades: {
    rectangulos: {
      titulo: "Sumar y restar con rectángulos",
      sub: "Cortes cruzados para tener trozos iguales",
      herramienta: ["Sumar y restar fracciones con rectángulos", "fracciones.html"],
      pista: "La primera fracción tiene cortes verticales y la segunda, horizontales. Si en tu cuaderno cortas cada rectángulo también en el otro sentido, los dos quedan con trozos iguales: cuenta cuántos trozos hay y cuántos están pintados.",
      nuevo() {
        const e = generarSuma([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6], [3, 8]]);
        const { a, b, c, d, op, m, A, B, R } = e, N = b * d;
        return {
          html: `${op === "+" ? "Suma" : "Resta"} las fracciones. Usa los rectángulos para encontrar trozos iguales.`,
          dibujo(resuelto) {
            // Los cortes nuevos (discontinuos) solo en la corrección: antes los hace el alumnado en papel.
            const rA = rectSVG({ cols: b, filas: d, clase: j => j < a ? "c-azul" : "", cortes: resuelto ? "vH" : "v" });
            const rB = rectSVG({ cols: b, filas: d, clase: (j, i) => i < c ? "c-naranja" : "", cortes: resuelto ? "hV" : "h" });
            let s = `<div class="rects"><figure>${rA}<figcaption>${F(a, b)}</figcaption></figure><span class="signo">${SIGNO(op)}</span><figure>${rB}<figcaption>${F(c, d)}</figcaption></figure>`;
            s += `</div>`;
            if (resuelto) {
              // Si pasa de un entero, dos rectángulos juntos con una sola fracción centrada debajo.
              const nR = op === "+" && R > N ? 2 : 1;
              let rs = "";
              for (let r = 0; r < nR; r++) {
                const idx = (j, i) => r * N + j * d + i;
                const clase = op === "+"
                  ? (j, i) => idx(j, i) < A ? "c-azul" : idx(j, i) < A + B ? "c-naranja" : ""
                  : (j, i) => idx(j, i) < A - B ? "c-azul" : idx(j, i) < A ? "c-quitado" : "";
                const tach = op === "-" ? (j, i) => idx(j, i) >= A - B && idx(j, i) < A : () => false;
                rs += rectSVG({ cols: b, filas: d, clase, cortes: "vh", tachadas: tach });
              }
              s += `<div class="rects res${nR === 2 ? " dos" : ""}"><span class="signo">=</span><figure><div class="par">${rs}</div><figcaption>${F(R, N)}</figcaption></figure>`;
              s += `</div>`;
            }
            return s;
          },
          trabajo: lineaSuma(a, b, c, d, op),
          pasos: ["fracciones.html", null, { a, b, op, c, d }],
          _ok: { n1: String(A), d1: String(m), n2: String(B), d2: String(m), nr: String(R), dr: String(m) },
          comprobar: v => revisarSuma(v, e),
          operaciones: `
            <p>Con los cortes cruzados, cada rectángulo queda en ${b} · ${d} = <b>${N}</b> trozos iguales.</p>
            <p>${F(a, b)} = ${F(`${a} · ${d}`, `${b} · ${d}`)} = ${F(A, N)} &nbsp;&nbsp; ${F(c, d)} = ${F(`${c} · ${b}`, `${d} · ${b}`)} = ${F(B, N)}</p>
            <p>${F(A, N)} ${SIGNO(op)} ${F(B, N)} = ${F(`${A} ${SIGNO(op)} ${B}`, N)} = <b>${cierreSuma(R, N)}</b></p>`,
        };
      },
    },

    cantidad: {
      titulo: "Fracción de una cantidad",
      sub: "Cuántos son, cuántos quedan y cuál era el total",
      herramienta: ["Fracciones con el modelo de barras", "barras.html"],
      pista: "Dibuja en tu cuaderno una barra con tantos trozos como dice el denominador. Mira qué cantidad conoces: ¿el total o solo una parte? Con eso calcula cuánto vale un trozo, y después cuenta los trozos que te piden.",
      dibujoOculto: true,   // que hagan su propio dibujo; el de la web, solo si lo piden
      variantes: [["todas", "Mezcladas"], ["parte", "¿Cuántos son?"], ["quedan", "¿Cuántos quedan?"], ["total", "¿Cuál era el total?"]],
      nuevo(variante = "todas") {
        const tipo = variante === "todas" ? elegir(["parte", "quedan", "total"]) : variante;
        const CTX = {
          parte: [
            { t: (f, X) => `En un aparcamiento de <span class="dato">${X}</span> plazas están ocupadas ${f}. ¿Cuántas plazas están ocupadas?`, u: "plazas", pint: "ocupadas", max: 40 },
            { t: (f, X) => `Un cine tiene <span class="dato">${X}</span> butacas y se han vendido ${f} de las entradas. ¿Cuántas entradas se han vendido?`, u: "entradas", pint: "vendidas", max: 50 },
            { t: (f, X) => `En un instituto de <span class="dato">${X}</span> estudiantes, ${f} llegan en guagua. ¿Cuántos estudiantes llegan en guagua?`, u: "estudiantes", pint: "en guagua", max: 80 },
          ],
          quedan: [
            { t: (f, X) => `He leído ${f} de un libro de <span class="dato">${X}</span> páginas. ¿Cuántas páginas me quedan por leer?`, u: "páginas", pint: "leído", max: 40 },
            { t: (f, X) => `De un depósito de <span class="dato">${X}</span> litros se han gastado ${f}. ¿Cuántos litros quedan?`, u: "litros", pint: "gastado", max: 60 },
            { t: (f, X) => `Una ruta de senderismo mide <span class="dato">${X}</span> km y ya hemos recorrido ${f}. ¿Cuántos kilómetros nos faltan?`, u: "km", pint: "recorrido", max: 4 },
          ],
          total: [
            { t: (f, X) => `He leído ${f} de un libro y me quedan <span class="dato">${X}</span> páginas. ¿Cuántas páginas tiene el libro?`, u: "páginas", pint: "leído", max: 40 },
            { t: (f, X) => `Ana se ha gastado ${f} de su dinero y le quedan <span class="dato">${X}</span> €. ¿Cuánto dinero tenía?`, u: "€", pint: "gastado", max: 12 },
            { t: (f, X) => `Llevamos recorridos ${f} de una ruta y nos faltan <span class="dato">${X}</span> km. ¿Cuánto mide la ruta?`, u: "km", pint: "recorrido", max: 5 },
          ],
        };
        let ctx, d, n, u, k, X;
        do {   // sin los datos de la prueba escrita (5/8 de 240; 2/9 y quedan 35)
          ctx = elegir(CTX[tipo]); d = azar(3, 10); n = irreducible(1, d); k = d - n; u = azar(2, Math.max(2, ctx.max));
          X = tipo === "total" ? k * u : d * u;
        } while ((n === 5 && d === 8 && X === 240) || (n === 2 && d === 9 && X === 35));
        const total = d * u, parte = n * u, resto = k * u;
        const pregunta = { parte, quedan: resto, total }[tipo];
        const U = ctx.u, f = F(n, d);
        const llaves = {
          parte: r => ({ arriba: `${miles(X)} ${U}`, abajo: r ? `${miles(parte)} ${U}` : "?", desde: 0, hasta: n }),
          quedan: r => ({ arriba: `${miles(X)} ${U}`, abajo: r ? `${miles(resto)} ${U}` : "?", desde: n, hasta: d }),
          total: r => ({ arriba: r ? `${miles(total)} ${U}` : `? ${U}`, abajo: `${miles(X)} ${U}`, desde: n, hasta: d }),
        }[tipo];
        return {
          html: ctx.t(f, miles(X)),
          pasos: tipo === "total" ? ["barras.html", "parte", { a: n, b: d, conocida: "resto", valor: X }] : ["barras.html", "cantidad", { a: n, b: d, total: X }],
          dibujo: r => cantidadSVG({ d, n, ...llaves(r), u: r ? u : null }) + `<div class="leyenda"><span><i style="background:var(--azul)"></i>${ctx.pint} ${PF(f)}</span><span><i style="background:var(--celda)"></i>el resto ${PF(F(k, d))}</span></div>`,
          campos: [{ id: "u", etiqueta: `Un trozo ${PF(F(1, d))}` }, { id: "r", etiqueta: `Respuesta (${U})` }],
          _ok: { u: String(u), r: String(pregunta) },
          comprobar(v) {
            const uu = num(v.u), r = num(v.r);
            if (r === pregunta && uu === u) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (uu !== u) {
              if (tipo === "total" && uu * n === X) return { bien: false, campos: ["u"], texto: `Los ${miles(X)} ${U} no son ${f}.`, explica: `Son lo que queda: ${F(k, d)}, es decir, ${k} trozos. Reparte entre ${k}.` };
              return { bien: false, campos: r === pregunta ? ["u"] : ["u", "r"], texto: "Revisa cuánto vale un trozo.", explica: tipo === "total" ? `Los ${miles(X)} ${U} son ${k} trozos.` : `El total son ${d} trozos iguales.` };
            }
            if (r === u) return { bien: false, campos: ["r"], texto: `Eso es un trozo, ${F(1, d)}.`, explica: tipo === "total" ? `El total son ${d} trozos.` : `Te piden ${tipo === "parte" ? f : "lo que queda"}: ¿cuántos trozos son?` };
            if (tipo === "quedan" && r === parte) return { bien: false, campos: ["r"], texto: `Eso es lo ${ctx.pint}, ${f}.`, explica: "Te preguntan por lo que queda: los trozos sin pintar." };
            if (tipo === "parte" && r === resto) return { bien: false, campos: ["r"], texto: "Eso es lo que no está pintado.", explica: `Te piden ${f}: los trozos pintados.` };
            if (tipo === "total" && r === X + u) return { bien: false, campos: ["r"], texto: "Te falta parte de la barra.", explica: `Lo ${ctx.pint} son ${n} trozos, no uno.` };
            return { bien: false, campos: ["r"], texto: "Todavía no.", explica: "Fíjate en la llave con el interrogante: ¿cuántos trozos abarca?" };
          },
          operaciones: {
            parte: `<p>${f} de ${miles(X)} = ${miles(X)} : ${d} · ${n}</p>
                    <p>Un trozo: ${miles(X)} : ${d} = ${miles(u)}</p>
                    <p>${n} trozos: ${n} · ${miles(u)} = <b>${miles(parte)} ${U}</b></p>`,
            quedan: `<p>Queda ${F(d, d)} − ${f} = ${F(k, d)} del total.</p>
                     <p>Un trozo: ${miles(X)} : ${d} = ${miles(u)}</p>
                     <p>Quedan ${k} trozos: ${k} · ${miles(u)} = <b>${miles(resto)} ${U}</b></p>
                     <p>También: ${miles(X)} − ${n} · ${miles(u)} = ${miles(X)} − ${miles(parte)} = ${miles(resto)}</p>`,
            total: `<p>Queda ${F(d, d)} − ${f} = ${F(k, d)}, y eso son ${miles(X)} ${U}.</p>
                    <p>Un trozo: ${miles(X)} : ${k} = ${miles(u)}</p>
                    <p>El total son ${d} trozos: ${d} · ${miles(u)} = <b>${miles(total)} ${U}</b></p>`,
          }[tipo],
        };
      },
    },

    queda: {
      titulo: "Lo que queda",
      sub: "Dos fracciones seguidas: «de lo que quedaba»",
      herramienta: ["Fracciones con el modelo de barras", "barras.html#quedan"],
      pista: "Dibuja una barra con el total. Después de la primera parte, lo que queda es la barra nueva: córtala en trozos iguales para la segunda.",
      nuevo() {
        const b = elegir([3, 4, 5]), a = azar(1, b - 1), d = elegir([2, 3, 4, 5]), c = azar(1, d - 1);
        const total = b * d * elegir([10, 20, 30, 50]);
        const resto1 = total * (b - a) / b, quedan = resto1 * (d - c) / d;
        const ctx = elegir([
          [`Un depósito tiene <span class="dato">${miles(total)}</span> litros de agua. El lunes se gastan ${F(a, b)} del depósito y el martes ${F(c, d)} de lo que quedaba.`, "¿Cuántos litros quedan?", "litros"],
          [`Una librería recibe <span class="dato">${miles(total)}</span> cuadernos. En septiembre vende ${F(a, b)} y en octubre ${F(c, d)} de los que le quedaban.`, "¿Cuántos cuadernos le quedan?", "cuadernos"],
        ]);
        return {
          html: `${ctx[0]} ${ctx[1]}`,
          campos: [{ id: "r1", etiqueta: `Quedan (${ctx[2]})` }],
          pasos: ["barras.html", "quedan", { a, b, c, d, total }],
          _ok: { r1: String(quedan) },
          comprobar(v) {
            const x = num(v.r1);
            if (x === quedan) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (Math.abs(x - total * (1 - a / b - c / d)) < 1e-9) return { bien: false, campos: ["r1"], texto: "Has restado las dos fracciones del total.", explica: "La segunda fracción es «de lo que quedaba», no del total. ¿Cuánto quedaba tras el primer día?" };
            return { bien: false, campos: ["r1"], texto: "Todavía no.", explica: "Calcula primero cuánto queda después del primer día." };
          },
          operaciones: `<p>Primero queda ${F(b - a, b)}: ${miles(total)} : ${b} · ${b - a} = ${miles(resto1)}</p>
                        <p>Después queda ${F(d - c, d)} de eso: ${miles(resto1)} : ${d} · ${d - c} = <b>${miles(quedan)}</b></p>`,
        };
      },
    },

    porcentaje: {
      titulo: "Porcentajes de cabeza",
      sub: "Con el 10 %, el 1 %, la mitad y la cuarta parte",
      herramienta: ["Porcentajes con la recta doble", "porcentajes.html"],
      pista: "El 10 % es dividir entre 10 y el 1 %, entre 100. Parte el porcentaje en trozos fáciles (24 % = 20 % + 4 %) y suma. El 50 % es la mitad y el 25 %, la cuarta parte.",
      dibujoOculto: true,
      variantes: [["facil", "Fáciles"], ["cualquiera", "Cualquiera"], ["extremos", "Más de 100 % o menos de 1 %"]],
      nuevo(variante = "facil") {
        let p, N;
        if (variante === "facil") { p = elegir([10, 20, 30, 5, 1, 50, 25, 75]); N = { 1: 100, 5: 20, 10: 10, 20: 10, 30: 10, 50: 2, 25: 4, 75: 4 }[p] * azar(3, 60); }
        else if (variante === "cualquiera") { do p = azar(11, 95); while (p % 10 === 0 || [25, 50, 75].includes(p)); N = 100 * elegir([1, 2, 3, 4, 5, 8, 10, 20, 25, 40, 50]); }
        else if (Math.random() < .5) { p = elegir([120, 125, 140, 150, 180, 200, 250, 300]); N = 20 * azar(1, 50); }
        else { p = elegir([.5, .1, .2, .8, .05, .08, .3]); N = 10000 * elegir([1, 2, 5, 10, 50]); }
        const r = Math.round(p * N * 100) / 10000;
        return {
          html: `Calcula de cabeza: <span class="dato">${fmt(p)} %</span> de <span class="dato">${miles(N)}</span>`,
          pasos: ["porcentajes.html", "de", { p, total: N }],
          dibujo: res => rectaDobleSVG({ p, N, r, incognita: "r", resuelto: res }),
          campos: [{ id: "r", etiqueta: "Resultado" }],
          _ok: { r: fmt(r) },
          comprobar(v) {
            const x = num(v.r);
            if (Math.abs(x - r) < 1e-9) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (Math.abs(x - p * N) < 1e-9 || Math.abs(x - N / p) < 1e-9) return { bien: false, campos: ["r"], texto: "Te falta dividir entre 100.", explica: "Por ciento quiere decir «de cada 100»." };
            if (p > 100 && Math.abs(x - (r - N)) < 1e-9) return { bien: false, campos: ["r"], texto: `Te falta el 100 %: el total entero.`, explica: `Un ${fmt(p)} % es más que el total: el resultado tiene que ser mayor que ${miles(N)}.` };
            return { bien: false, campos: ["r"], texto: "Todavía no.", explica: "Calcula primero el 10 % o el 1 % y construye el porcentaje a partir de ahí." };
          },
          operaciones: opsPorcentaje(p, N, r),
        };
      },
    },

    quepc: {
      titulo: "¿Qué porcentaje es?",
      sub: "Una parte del total, de cada 100",
      herramienta: ["Porcentajes con la recta doble", "porcentajes.html"],
      pista: "Escribe la parte como fracción del total y pásala a centésimas. También puedes dividir la parte entre el total y multiplicar por 100.",
      dibujoOculto: true,
      nuevo() {
        const CTX = [
          { T: [20, 25], t: (P, T) => `En una clase de ${T} estudiantes, hoy han faltado ${P}. ¿Qué porcentaje de la clase ha faltado?` },
          { T: [20, 25, 40, 50], t: (P, T) => `En un examen de ${T} preguntas he acertado ${P}. ¿Qué porcentaje de las preguntas he acertado?` },
          { T: [20, 25, 50], t: (P, T) => `De ${T} tiros a canasta, Laura ha encestado ${P}. ¿Qué porcentaje de acierto tiene?` },
          { T: [200, 300, 400, 500, 1000, 2000], t: (P, T) => `En un pueblo de ${miles(T)} habitantes, ${miles(P)} tienen más de 65 años. ¿Qué porcentaje de la población es?` },
        ];
        const ctx = elegir(CTX), T = elegir(ctx.T), validos = [];
        for (let q = 1; q < 100; q++) if (q * T % 100 === 0) validos.push(q);
        const pc = elegir(validos), P = pc * T / 100, g = mcd(P, T);
        return {
          html: ctx.t(P, T),
          pasos: ["porcentajes.html", "que", { parte: P, total: T }],
          dibujo: res => rectaDobleSVG({ p: pc, N: T, r: P, incognita: "p", resuelto: res }),
          campos: [{ id: "pc", etiqueta: "Porcentaje (%)" }],
          _ok: { pc: String(pc) },
          comprobar(v) {
            const x = num(v.pc);
            if (x === pc) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (x === P && P !== pc) return { bien: false, campos: ["pc"], texto: "Eso es la cantidad, no el porcentaje.", explica: `Te preguntan cuántos serían de cada 100.` };
            if (Math.abs(x - pc / 100) < 1e-9) return { bien: false, campos: ["pc"], texto: "Eso es el número decimal.", explica: "Para pasarlo a porcentaje, multiplica por 100." };
            return { bien: false, campos: ["pc"], texto: "Todavía no.", explica: `Empieza escribiendo la fracción ${F(P, T)}.` };
          },
          operaciones: `<p>${F(miles(P), miles(T))}${g > 1 ? ` = ${F(P / g, T / g)}` : ""} = ${F(pc, 100)} = <b>${pc} %</b></p>
                        <p>O bien: ${miles(P)} : ${miles(T)} = ${fmt(P / T)}, y ${fmt(P / T)} · 100 = <b>${pc} %</b></p>`,
        };
      },
    },

    jerarquia: {
      titulo: "Jerarquía de las operaciones",
      sub: "Con números enteros y paréntesis",
      herramienta: ["Jerarquía de las operaciones", "jerarquia.html"],
      pista: "Primero los paréntesis. Después las multiplicaciones y divisiones, de izquierda a derecha. Las sumas y restas, al final. Cuidado con los signos: menos por menos es más, y restar un negativo es sumar.",
      nuevo() {
        const t = azar(1, 4); let expr, pasos, R, LR, signo = false;
        if (t === 1) {
          const a = azar(2, 15), b = azar(2, 9), c = azar(2, 9), d = azar(1, 12);
          expr = `${a} − ${b} · (−${c}) + ${d}`; R = a + b * c + d; LR = (a - b) * -c + d;
          pasos = [`${b} · (−${c}) = −${b * c}`, `${a} − (−${b * c}) + ${d} = ${a} + ${b * c} + ${d} = <b>${sg(R)}</b>`];
        } else if (t === 2) {
          const a = azar(5, 30), b = azar(2, 9), c = azar(2, 6), d = azar(2, 6), e = azar(2, 6), bc = b * c;
          expr = `${a} − ${bc} : (−${c}) + ${d} · (−${e})`; R = a + b - d * e; LR = ((a - bc) / -c + d) * -e;
          pasos = [`${bc} : (−${c}) = −${b}`, `${d} · (−${e}) = −${d * e}`, `${a} − (−${b}) + (−${d * e}) = ${a} + ${b} − ${d * e} = <b>${sg(R)}</b>`];
        } else if (t === 3) {
          const a = azar(3, 12), b = azar(1, 9), c = azar(2, 6), d = azar(2, 9), e = azar(2, 5), de = d * e, s = -a + b, P = s * -c;
          expr = `[(−${a} + ${b}) · (−${c})] − ${de} : (−${e})`; R = P + d; LR = P - d; signo = true;
          pasos = [`−${a} + ${b} = ${sg(s)}`, `${ent(s)} · (−${c}) = ${sg(P)}`, `${de} : (−${e}) = −${d}`, `${sg(P)} − (−${d}) = ${sg(P)} + ${d} = <b>${sg(R)}</b>`];
        } else {
          const a = azar(2, 20), b = azar(2, 6), c = azar(1, 9), d = azar(1, 12), e = azar(2, 9), f = azar(2, 5), ef = e * f, s = c - d, P = b * s;
          expr = `${a} + ${b} · (${c} − ${d}) − ${ef} : ${f}`; R = a + P - e; LR = ((a + b) * s - ef) / f;
          pasos = [`${c} − ${d} = ${sg(s)}`, `${b} · ${ent(s)} = ${sg(P)}`, `${ef} : ${f} = ${e}`, `${a} + ${ent(P)} − ${e} = <b>${sg(R)}</b>`];
        }
        return {
          html: `Calcula respetando la jerarquía de las operaciones:<span class="expr">${expr}</span>`,
          pasos: ["jerarquia.html", "resolver", { expresion: expr.replace(/−/g, "-") }],
          campos: [{ id: "r", etiqueta: "Resultado" }],
          _ok: { r: String(R) },
          comprobar(v) {
            const x = num(v.r);
            if (x === R) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (signo && x === LR) return { bien: false, campos: ["r"], texto: "Revisa el signo del último paso.", explica: "Restar un número negativo es sumar: − (−3) = + 3." };
            if (x === LR) return { bien: false, campos: ["r"], texto: "Has hecho las operaciones de izquierda a derecha.", explica: "Las multiplicaciones y divisiones van antes que las sumas y restas." };
            if (x === -R) return { bien: false, campos: ["r"], texto: "Casi: el signo está al revés.", explica: "Revisa los signos de cada multiplicación y división." };
            return { bien: false, campos: ["r"], texto: "Todavía no.", explica: "Escribe la expresión en tu cuaderno y resuélvela paso a paso, una operación cada vez." };
          },
          operaciones: pasos.map(p => `<p>${p}</p>`).join(""),
        };
      },
    },

    inversa: {
      titulo: "Comprobar con la operación inversa",
      sub: "La suma deshace la resta; la multiplicación, la división",
      herramienta: ["Jerarquía de las operaciones", "jerarquia.html"],
      pista: "Para comprobar una resta, suma el resultado y lo que se restó: tiene que salir el primer número. Para una división, multiplica el resultado por el divisor. Para una raíz cuadrada, eleva el resultado al cuadrado.",
      nuevo() {
        const tipo = elegir(["resta", "division", "raiz"]);
        let enun, inv, valor, debe, real, c;
        if (tipo === "resta") {
          const a = azar(120, 999), b = azar(30, a - 20); real = a - b;
          c = real + elegir([0, 0, 0, 10, -10, 1, -1]); enun = `${a} − ${b} = ${c}`; inv = `${c} + ${b}`; valor = c + b; debe = a;
        } else if (tipo === "division") {
          const b = azar(3, 19); real = azar(4, 40); const a = b * real;
          c = real + elegir([0, 0, 0, 1, -1, 10]); enun = `${a} : ${b} = ${c}`; inv = `${c} · ${b}`; valor = c * b; debe = a;
        } else {
          real = azar(11, 25); const a = real * real;
          c = real + elegir([0, 0, 0, 1, -1]); enun = `√${a} = ${c}`; inv = `${pot(c, 2)}`; valor = c * c; debe = a;
        }
        const correcta = c === real;
        return {
          html: `Alguien ha calculado <span class="dato">${enun}</span>. Compruébalo con la operación inversa: ¿es correcto?`,
          trabajo: `<div class="linea-op"><span>${inv}</span><span class="op">=</span>${NUM("v", "ancho")}</div>
                    <div class="campos centrado"><div class="campo"><label for="f-ok">¿Es correcto?</label>${SELECT("ok", [["si", "Sí, es correcto"], ["no", "No, está mal"]])}</div></div>`,
          _ok: { v: String(valor), ok: correcta ? "si" : "no" },
          comprobar(v) {
            const x = num(v.v), ok = v.ok === (correcta ? "si" : "no");
            if (x !== valor) return { bien: false, campos: ok ? ["v"] : ["v", "ok"], texto: "Revisa la cuenta de la comprobación.", explica: `Calcula ${inv}.` };
            if (!ok) return { bien: false, campos: ["ok"], texto: "Compara con el número del principio.", explica: `La comprobación da ${valor}. ¿Coincide con ${debe}?` };
            return { bien: true, texto: "¡Correcto!", explica: correcta ? `${valor} = ${debe}: la operación está bien.` : `${valor} no es ${debe}: la operación está mal. Lo correcto es ${real}.` };
          },
          operaciones: `<p>Comprobación: ${inv} = ${valor}</p><p>${valor === debe ? `Sale ${debe}, el número del principio: <b>es correcto</b>.` : `Tendría que salir ${debe}: <b>está mal</b>. Lo correcto es ${enun.replace(/= \d+$/, "= " + real)}.`}</p>`,
        };
      },
    },

    producto: {
      titulo: "Multiplicar y dividir fracciones",
      sub: "Fracción de una fracción, la inversa y cuántas caben",
      herramienta: ["Multiplicar y dividir fracciones", "producto.html"],
      pista: "Para multiplicar: numerador por numerador y denominador por denominador. Para dividir: multiplica por la inversa de la segunda (dale la vuelta). «¿Cuántos caben?» es una división.",
      variantes: [["multiplicar", "Multiplicar"], ["dividir", "Dividir"], ["caben", "¿Cuántos caben?"]],
      nuevo(variante = "multiplicar") {
        if (variante === "multiplicar") {
          const x = fracAzar(5), y = fracAzar(5), R = qMul(x, y), pn = x.n * y.n, pd = x.d * y.d;
          return {
            html: `Multiplica. En el dibujo, lo naranja es ${qF(y)} de los ${qF(x)} azules.`,
            pasos: ["producto.html", "deUna", { a: y.n, b: y.d, c: x.n, d: x.d }],
            dibujo: res => `<div class="rects uno"><figure>${rectSVG({ cols: x.d, filas: y.d, clase: (j, i) => j < x.n ? (i < y.n ? "c-naranja" : "c-azul") : "", cortes: res ? "vh" : "vH" })}<figcaption>${res ? F(pn, pd) : `${qF(y)} de ${qF(x)}`}</figcaption></figure></div>`,
            trabajo: `<div class="linea-op">${qF(x)}<span class="op">·</span>${qF(y)}<span class="op">=</span>${FIN("rn", "rd")}</div>`,
            _ok: { rn: String(pn), rd: String(pd) },
            comprobar(v) {
              const n = num(v.rn), d = num(v.rd);
              if (qIgual(R, n, d)) return { bien: true, texto: "¡Correcto!", explica: notaSimplificar(n, d) };
              if (n === x.n * y.d && d === x.d * y.n) return { bien: false, campos: ["rn", "rd"], texto: "Eso sería dividir.", explica: "Para multiplicar, numerador por numerador y denominador por denominador." };
              return { bien: false, campos: ["rn", "rd"], texto: "Todavía no.", explica: `Cuenta en el dibujo: ¿cuántos trozos hay en total y cuántos son naranjas?` };
            },
            operaciones: `<p>${qF(x)} · ${qF(y)} = ${F(`${x.n} · ${y.n}`, `${x.d} · ${y.d}`)} = <b>${F(pn, pd)}</b>${mcd(pn, pd) > 1 ? ` = ${qF(R)}` : ""}</p>
                          <p>En el dibujo: el rectángulo tiene ${x.d} · ${y.d} = ${pd} trozos y ${pn} son naranjas.</p>`,
          };
        }
        if (variante === "dividir") {
          let x, y; do { x = fracAzar(6); y = fracAzar(6); } while (x.n === y.n && x.d === y.d);
          const R = qDiv(x, y), pn = x.n * y.d, pd = x.d * y.n;
          return {
            html: "Divide multiplicando por la inversa.",
            pasos: ["producto.html", "caben", { a: x.n, b: x.d, c: y.n, d: y.d }],
            trabajo: `<div class="linea-op">${qF(x)}<span class="op">:</span>${qF(y)}<span class="op">=</span>${qF(x)}<span class="op">·</span>${FIN("in", "id")}<span class="op">=</span>${FIN("rn", "rd")}</div>`,
            _ok: { in: String(y.d), id: String(y.n), rn: String(pn), rd: String(pd) },
            comprobar(v) {
              const mal = [], n = num(v.rn), d = num(v.rd);
              if (!(num(v.in) === y.d && num(v.id) === y.n)) mal.push("in", "id");
              if (!qIgual(R, n, d)) mal.push("rn", "rd");
              if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: notaSimplificar(n, d) };
              if (qIgual(qMul(x, y), n, d)) return { bien: false, campos: mal, texto: "Te falta dar la vuelta a la segunda fracción.", explica: `La inversa de ${qF(y)} es ${F(y.d, y.n)}.` };
              return { bien: false, campos: mal, texto: mal.length === 2 && mal[0] === "in" ? "Revisa la inversa." : "Revisa el resultado.", explica: `La inversa se obtiene cambiando el numerador por el denominador.` };
            },
            operaciones: `<p>Dividir entre ${qF(y)} es multiplicar por su inversa, ${F(y.d, y.n)}.</p>
                          <p>${qF(x)} : ${qF(y)} = ${qF(x)} · ${F(y.d, y.n)} = ${F(`${x.n} · ${y.d}`, `${x.d} · ${y.n}`)} = <b>${F(pn, pd)}</b>${mcd(pn, pd) > 1 ? ` = ${qF(R)}` : ""}</p>`,
          };
        }
        let a, b, N; do { b = azar(2, 5); a = irreducible(0, b); N = azar(2, 8); } while ((N * b) % a || N * b > 40);
        const ans = N * b / a;
        const ctx = elegir([
          { t: `¿Cuántos vasos de ${F(a, b)} de litro se pueden llenar con ${N} litros de zumo?`, que: "vasos", uno: "vaso", u: "l", ud: "litro" },
          { t: `Un rollo de ${N} m de cable se corta en trozos de ${F(a, b)} de metro. ¿Cuántos trozos salen?`, que: "trozos", uno: "trozo", u: "m", ud: "metro" },
          { t: `Una garrafa tiene ${N} litros de agua. ¿Cuántas botellas de ${F(a, b)} de litro se llenan?`, que: "botellas", uno: "botella", u: "l", ud: "litro" },
        ]);
        return {
          html: ctx.t,
          pasos: ["producto.html", "caben", { a: N, b: 1, c: a, d: b }],
          dibujoOculto: true,
          dibujo: () => vasosSVG({ N, b, a, unidad: ctx.u }) + `<div class="leyenda"><span>Cada ${ctx.ud}, en ${b} trozos de ${F(1, b)}. Cada color es ${a === 1 ? "un trozo" : `un grupo de ${a} trozos`}: ${ctx.uno === "trozo" ? "un trozo de cable" : `un${ctx.uno === "vaso" ? "" : "a"} ${ctx.uno}`}.</span></div>`,
          campos: [{ id: "r", etiqueta: `Respuesta (${ctx.que})` }],
          _ok: { r: String(ans) },
          comprobar(v) {
            const x = num(v.r);
            if (x === ans) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (Math.abs(x - N * a / b) < 1e-9) return { bien: false, campos: ["r"], texto: `Has multiplicado por ${F(a, b)}.`, explica: `La pregunta es cuántas veces cabe ${F(a, b)} en ${N}: es una división.` };
            if (x === N * b && a > 1) return { bien: false, campos: ["r"], texto: `Esos son los trozos de ${F(1, b)}.`, explica: `Cada ${ctx.uno} necesita ${a} de esos trozos.` };
            return { bien: false, campos: ["r"], texto: "Todavía no.", explica: `Calcula ${N} : ${F(a, b)}.` };
          },
          operaciones: `<p>${N} : ${F(a, b)} = ${N} · ${F(b, a)} = ${F(N * b, a)} = <b>${ans} ${ctx.que}</b></p>
                        <p>Cada ${ctx.ud} tiene ${b} trozos de ${F(1, b)}: en ${N} hay ${N * b}. Cada ${ctx.uno} usa ${a}: ${N * b} : ${a} = ${ans}.</p>`,
        };
      },
    },

    combinadas: {
      titulo: "Operaciones combinadas con fracciones",
      sub: "Paréntesis, después · y :, después + y −",
      herramienta: ["Jerarquía de las operaciones", "jerarquia.html"],
      pista: "Igual que con enteros: primero los paréntesis, después multiplicaciones y divisiones, y al final sumas y restas. Haz una operación cada vez y escribe el resultado antes de seguir.",
      nuevo() {
        let x, y, z, w, n, R, LR, expr, pasos, t;
        do {
          t = azar(1, 4); x = fracAzar(6); y = fracAzar(6); z = fracAzar(6); w = fracAzar(6); n = azar(1, 3);
          if (t === 1) { const P = qMul(y, z); R = qSum(x, P); LR = qMul(qSum(x, y), z);
            expr = `${qF(x)}<span class="op">+</span>${qF(y)}<span class="op">·</span>${qF(z)}`;
            pasos = [`Primero la multiplicación: ${qF(y)} · ${qF(z)} = ${qF(P)}`, `Después la suma: ${qF(x)} + ${qF(P)} = <b>${qF(R)}</b>`]; }
          else if (t === 2) { const S = qSum(x, y); R = qMul(S, z); LR = qSum(x, qMul(y, z));
            expr = `<span class="op pg">(</span>${qF(x)}<span class="op">+</span>${qF(y)}<span class="op pg">)</span><span class="op">·</span>${qF(z)}`;
            pasos = [`Primero el paréntesis: ${qF(x)} + ${qF(y)} = ${qF(S)}`, `Después la multiplicación: ${qF(S)} · ${qF(z)} = <b>${qF(R)}</b>`]; }
          else if (t === 3) { const S = qSum(z, w), D = qDiv(y, S); R = qRes(x, D); LR = qDiv(qRes(x, y), S);
            expr = `${qF(x)}<span class="op">−</span>${qF(y)}<span class="op">:</span><span class="op pg">(</span>${qF(z)}<span class="op">+</span>${qF(w)}<span class="op pg">)</span>`;
            pasos = [`El paréntesis: ${qF(z)} + ${qF(w)} = ${qF(S)}`, `La división: ${qF(y)} : ${qF(S)} = ${qF(y)} · ${qF(Q(S.d, S.n))} = ${qF(D)}`, `La resta: ${qF(x)} − ${qF(D)} = <b>${qF(R)}</b>`]; }
          else { const S = qSum(y, z), P = qMul(x, S); R = qRes(Q(n), P); LR = qMul(qRes(Q(n), x), S);
            expr = `${n}<span class="op">−</span>${qF(x)}<span class="op">·</span><span class="op pg">(</span>${qF(y)}<span class="op">+</span>${qF(z)}<span class="op pg">)</span>`;
            pasos = [`El paréntesis: ${qF(y)} + ${qF(z)} = ${qF(S)}`, `La multiplicación: ${qF(x)} · ${qF(S)} = ${qF(P)}`, `La resta: ${n} − ${qF(P)} = <b>${qF(R)}</b>`]; }
        } while (R.n <= 0 || R.d > 60 || R.n > 120 || (LR.n === R.n && LR.d === R.d));
        return {
          html: "Calcula respetando la jerarquía de las operaciones.",
          pasos: ["jerarquia.html", "resolver", { expresion: textoPlano(expr).replace(/−/g, "-") }],
          trabajo: `<div class="linea-op">${expr}<span class="op">=</span>${FIN("rn", "rd")}</div><p class="nota-linea">Si sale un número entero, escribe 1 abajo.</p>`,
          _ok: { rn: String(R.n), rd: String(R.d) },
          comprobar(v) {
            const a = num(v.rn), b = num(v.rd);
            if (qIgual(R, a, b)) return { bien: true, texto: "¡Correcto!", explica: notaSimplificar(a, b) };
            if (qIgual(LR, a, b)) return t === 2
              ? { bien: false, campos: ["rn", "rd"], texto: "No has empezado por el paréntesis.", explica: "Lo que está entre paréntesis se calcula antes que nada." }
              : { bien: false, campos: ["rn", "rd"], texto: "Has hecho las operaciones de izquierda a derecha.", explica: "La multiplicación y la división van antes que la suma y la resta." };
            return { bien: false, campos: ["rn", "rd"], texto: "Todavía no.", explica: "Hazlo en tu cuaderno, una operación cada vez." };
          },
          operaciones: pasos.map(p => `<p>${p}</p>`).join(""),
        };
      },
    },

    mayormenor: {
      titulo: "¿Mayor o menor?",
      sub: "Multiplicar y dividir por números menores que 1",
      herramienta: ["Multiplicar y dividir fracciones", "producto.html"],
      pista: "Multiplicar por un número menor que 1 hace el resultado más pequeño; por uno mayor que 1, más grande. Con la división pasa al revés: dividir entre 0,5 es ver cuántas mitades caben, y caben el doble.",
      nuevo() {
        const OPS = [["·", .5, ": 2"], ["·", .25, ": 4"], ["·", .2, ": 5"], ["·", .8, null], ["·", 1.2, null], ["·", 1.5, null], ["·", 2.5, null],
                     [":", .5, "· 2"], [":", .25, "· 4"], [":", .2, "· 5"], [":", .1, "· 10"], [":", 2, null], [":", 4, null], [":", 5, null]];
        const [op, k, eq] = elegir(OPS), N = 20 * azar(1, 20);
        const r = Math.round((op === "·" ? N * k : N / k) * 1000) / 1000, mayor = op === "·" ? k > 1 : k < 1;
        const regla = `${op === "·" ? "Multiplicas por" : "Divides entre"} ${fmt(k)}, que es ${k < 1 ? "menor" : "mayor"} que 1: el resultado es ${mayor ? "mayor" : "menor"} que ${N}.`;
        return {
          html: "Primero decide sin calcular si el resultado será mayor o menor. Después calcúlalo.",
          trabajo: `<div class="linea-op"><span>${N} ${op} ${fmt(k)}</span><span class="op">es</span>${SELECT("mm", [["mayor", "mayor"], ["menor", "menor"]])}<span class="op">que ${N}</span></div>
                    <div class="linea-op"><span>${N} ${op} ${fmt(k)}</span><span class="op">=</span>${NUM("r", "ancho")}</div>`,
          _ok: { mm: mayor ? "mayor" : "menor", r: fmt(r) },
          comprobar(v) {
            const mal = [];
            if (v.mm !== (mayor ? "mayor" : "menor")) mal.push("mm");
            if (Math.abs(num(v.r) - r) > 1e-9) mal.push("r");
            if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: regla };
            if (mal[0] === "mm") return { bien: false, campos: mal, texto: "Piensa otra vez si crece o decrece.", explica: k < 1 ? (op === "·" ? `Multiplicar por ${fmt(k)} es quedarse con una parte.` : `¿Cuántas veces cabe ${fmt(k)} en ${N}? Más de ${N}.`) : (op === "·" ? `Multiplicar por ${fmt(k)} es tomar más de una vez el número.` : `Repartir entre ${fmt(k)} da partes más pequeñas.`) };
            return { bien: false, campos: mal, texto: "Bien pensado, pero revisa el cálculo.", explica: eq ? `${op === "·" ? "Multiplicar por" : "Dividir entre"} ${fmt(k)} es lo mismo que ${eq.replace(":", "dividir entre").replace("·", "multiplicar por")}.` : "" };
          },
          operaciones: `<p>${regla}</p><p>${N} ${op} ${fmt(k)}${eq ? ` = ${N} ${eq}` : ""} = <b>${fmt(r)}</b></p>`,
        };
      },
    },

    factorcomun: {
      titulo: "Sacar factor común",
      sub: "Cálculo mental con la propiedad distributiva",
      herramienta: ["Jerarquía de las operaciones", "jerarquia.html"],
      pista: "Busca el número que se repite en los dos productos: ese es el factor común. Lo sacas fuera y dentro del paréntesis quedan los otros dos números. Así la cuenta se hace de cabeza.",
      nuevo() {
        const a = azar(101, 999), op = Math.random() < .5 ? "+" : "-";
        let b, c;
        if (op === "+") { const s = elegir([10, 100]); b = azar(2, s - 2); c = s - b; }
        else { const dif = elegir([1, 10, 100]); c = azar(2, 12); b = c + dif; }
        const s = op === "+" ? b + c : b - c, R = a * s;
        return {
          html: "Saca factor común y calcula de cabeza.",
          trabajo: `<div class="linea-op"><span>${a} · ${b} ${SIGNO(op)} ${a} · ${c}</span><span class="op">=</span>${NUM("f")}<span class="op">· (</span>${NUM("x")}<span class="op">${SIGNO(op)}</span>${NUM("y")}<span class="op">) =</span>${NUM("r", "ancho")}</div>`,
          _ok: { f: String(a), x: String(b), y: String(c), r: String(R) },
          comprobar(v) {
            const f = num(v.f), x = num(v.x), y = num(v.y), r = num(v.r), mal = [];
            if (f !== a) mal.push("f");
            const par = op === "+" ? (x === b && y === c) || (x === c && y === b) : x === b && y === c;
            if (!par) mal.push("x", "y");
            if (r !== R) mal.push("r");
            if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (mal[0] === "f") return { bien: false, campos: mal, texto: "El factor común es el número que se repite.", explica: `Aparece en ${a} · ${b} y en ${a} · ${c}.` };
            if (mal[0] === "x") return { bien: false, campos: mal, texto: "Revisa lo que queda dentro del paréntesis.", explica: op === "-" ? "En una resta importa el orden." : "Son los números que acompañan al factor común." };
            return { bien: false, campos: mal, texto: "Revisa la última cuenta.", explica: `Primero el paréntesis: ${b} ${SIGNO(op)} ${c} = ${s}.` };
          },
          operaciones: `<p>${a} · ${b} ${SIGNO(op)} ${a} · ${c} = ${a} · (${b} ${SIGNO(op)} ${c}) = ${a} · ${s} = <b>${miles(R)}</b></p>`,
        };
      },
    },

    potencias: {
      titulo: "Potencias de la misma base",
      sub: "Producto, cociente y potencia de una potencia",
      herramienta: ["Notación científica paso a paso", "notacion.html"],
      pista: "Escribe cada potencia como una multiplicación y cuenta los factores. Al multiplicar potencias de la misma base, los exponentes se suman; al dividir, se restan; en una potencia de una potencia, se multiplican.",
      variantes: [["todas", "Mezcladas"], ["producto", "Producto"], ["cociente", "Cociente"], ["potencia", "Potencia de potencia"], ["exponente", "Mismo exponente"]],
      nuevo(variante = "todas") {
        const tipo = variante === "todas" ? elegir(["producto", "cociente", "potencia", "exponente"]) : variante;
        const a = elegir([2, 3, 5, 7, 10]), rep = (b, k) => Array(k).fill(b).join(" · ");
        let base = a, exp, expr, desarrollo, m, n, b2;
        if (tipo === "producto") { m = azar(2, 5); n = azar(2, 5); exp = m + n; expr = `${pot(a, m)} · ${pot(a, n)}`;
          desarrollo = `(${rep(a, m)}) · (${rep(a, n)}) = ${pot(a, exp)}: hay ${m} + ${n} = ${exp} factores.`; }
        else if (tipo === "cociente") { m = azar(4, 8); n = azar(2, m - 1); exp = m - n; expr = `${pot(a, m)} : ${pot(a, n)}`;
          desarrollo = `Se simplifican ${n} factores de arriba con ${n} de abajo: quedan ${m} − ${n} = ${exp}.`; }
        else if (tipo === "potencia") { m = azar(2, 4); n = azar(2, 3); exp = m * n; expr = `(${pot(a, m)})<sup>${n}</sup>`;
          desarrollo = `${Array(n).fill(pot(a, m)).join(" · ")} = ${pot(a, Array(n).fill(m).join(" + "))} = ${pot(a, exp)}`; }
        else { [m, b2] = elegir([[2, 5], [2, 3], [3, 5], [2, 7], [4, 5], [5, 3]]); n = azar(2, 4); base = m * b2; exp = n; expr = `${pot(m, n)} · ${pot(b2, n)}`;
          desarrollo = `${pot(m, n)} · ${pot(b2, n)} = (${m} · ${b2})<sup>${n}</sup> = ${pot(base, n)}: se juntan los factores por parejas.`; }
        const valor = base ** exp, pideValor = valor <= 100000;
        return {
          html: `Escribe como una sola potencia${pideValor ? " y calcula su valor" : ""}.`,
          trabajo: `<div class="linea-op"><span>${expr}</span><span class="op">=</span><span class="potencia-in">${NUM("b")}${NUM("e", "sup")}</span>${pideValor ? `<span class="op">=</span>${NUM("v", "ancho")}` : ""}</div>`,
          _ok: pideValor ? { b: String(base), e: String(exp), v: String(valor) } : { b: String(base), e: String(exp) },
          comprobar(v) {
            const b = num(v.b), e = num(v.e), mal = [];
            if (b !== base) mal.push("b");
            if (e !== exp) mal.push("e");
            if (pideValor && num(v.v) !== valor) mal.push("v");
            if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (mal.includes("b")) return { bien: false, campos: mal, texto: tipo === "exponente" ? "La base es el producto de las dos bases." : "La base no cambia.", explica: tipo === "exponente" ? `${m} · ${b2} = ${base}` : `Todos los factores son ${a}.` };
            if (mal.includes("e")) {
              const regla = { producto: "se suman", cociente: "se restan", potencia: "se multiplican", exponente: "no cambia" }[tipo];
              return { bien: false, campos: mal, texto: tipo === "exponente" ? "El exponente no cambia." : `Los exponentes ${regla}.`, explica: "Si dudas, escríbelo como multiplicación y cuenta los factores." };
            }
            return { bien: false, campos: mal, texto: "La potencia está bien; revisa el valor.", explica: `${pot(base, exp)} = ${rep(base, exp)}` };
          },
          operaciones: `<p>${desarrollo}</p><p>${expr} = <b>${pot(base, exp)}</b>${valor <= 1e12 ? ` = ${miles(valor)}` : ""}</p>`,
        };
      },
    },

    notacion: {
      titulo: "Escribir en notación científica",
      sub: "Mover la coma y contar los saltos",
      herramienta: ["Notación científica paso a paso", "notacion.html"],
      pista: "Mueve la coma hasta que quede una sola cifra distinta de cero delante. El exponente es el número de saltos: positivo si el número era grande, negativo si era pequeño.",
      nuevo() {
        const cifras = elegir([1, 2, 3]);
        let dig = String(azar(1, 9));
        for (let i = 1; i < cifras; i++) dig += azar(i === cifras - 1 ? 1 : 0, 9);
        const e = Math.random() < .5 ? azar(4, 9) : -azar(3, 7);
        let escrito;
        if (e > 0) { const ent = dig.padEnd(e + 1, "0"); escrito = miles(ent.slice(0, e + 1)) + (dig.length > e + 1 ? "," + dig.slice(e + 1) : ""); }
        else escrito = "0," + "0".repeat(-e - 1) + dig;
        const mant = Number(dig[0] + "." + (dig.slice(1) || "0"));
        const que = elegir(e > 0
          ? ["kilómetros de distancia", "habitantes", "litros de agua", "bytes"]
          : ["metros (el tamaño de una célula)", "gramos", "segundos", "metros (el grosor de un hilo)"]);
        return {
          html: `Escribe en notación científica: <span class="dato">${escrito}</span> ${que}.`,
          pasos: ["notacion.html", "aCientifica", { numero: escrito.replace(/[\s\u202f]/g, "") }],
          campos: [{ id: "m", etiqueta: "Número", potencia: "e" }],
          _ok: { m: fmt(mant), e: String(e) },
          comprobar(v) {
            const m = num(v.m), ex = num(v.e), mal = [];
            if (Math.abs(m - mant) > 1e-9) mal.push("m");
            if (ex !== e) mal.push("e");
            if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: `La coma se mueve ${Math.abs(e)} lugares hacia la ${e > 0 ? "izquierda" : "derecha"}.` };
            if (m >= 10 || m < 1) return { bien: false, campos: ["m"], texto: "El primer número tiene que estar entre 1 y 10.", explica: "Deja una sola cifra, distinta de cero, delante de la coma." };
            if (ex === -e) return { bien: false, campos: ["e"], texto: "El signo del exponente está al revés.", explica: e > 0 ? "Es un número grande: el exponente es positivo." : "Es un número menor que 1: el exponente es negativo." };
            return { bien: false, campos: mal, texto: "Todavía no.", explica: "Cuenta los saltos de la coma uno a uno." };
          },
          solucion: `${fmt(mant)} · 10<sup>${e}</sup>`,
        };
      },
    },

    formas: {
      titulo: "La misma cantidad, tres formas",
      sub: "Fracción, decimal y porcentaje",
      herramienta: ["Porcentajes con la recta doble", "porcentajes.html"],
      pista: "Porcentaje es «de cada 100». Para pasar una fracción a decimal, divide el numerador entre el denominador; para pasar el decimal a porcentaje, multiplica por 100.",
      nuevo() {
        const [n, d] = elegir([[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,8],[3,8],[5,8],[7,8],[3,10],[7,10],[9,10],[1,20],[3,20],[7,20],[4,25],[6,25],[1,50]]);
        const dec = n / d, pc = 100 * n / d;
        const igualFrac = t => { const f = fraccion(t); return f && f[0] * d === f[1] * n; };
        if (Math.random() < .5) return {
          html: `Escribe ${F(n, d)} como número decimal y como porcentaje.`,
          campos: [{ id: "dec", etiqueta: "Decimal" }, { id: "pc", etiqueta: "Porcentaje (%)" }],
          _ok: { dec: fmt(dec), pc: fmt(pc) },
          comprobar(v) {
            const mal = [];
            if (Math.abs(num(v.dec) - dec) > 1e-9) mal.push("dec");
            if (Math.abs(num(v.pc) - pc) > 1e-9) mal.push("pc");
            if (!mal.length) return { bien: true, texto: "¡Correcto!", explica: `${n} : ${d} = ${fmt(dec)}, que son ${fmt(pc)} de cada 100.` };
            if (mal.length === 1 && mal[0] === "pc" && Math.abs(num(v.pc) - dec) < 1e-9) return { bien: false, campos: mal, texto: "Has escrito el decimal en el porcentaje.", explica: "El porcentaje dice cuántos de cada 100: multiplica el decimal por 100." };
            return { bien: false, campos: mal, texto: mal.length === 2 ? "Revisa las dos respuestas." : "Una está bien, revisa la otra.", explica: "Empieza por el decimal: numerador entre denominador." };
          },
          solucion: `${F(n, d)} = ${fmt(dec)} = ${fmt(pc)} %`,
        };
        return {
          html: `Escribe <span class="dato">${fmt(pc)} %</span> como número decimal y como fracción.`,
          campos: [{ id: "dec", etiqueta: "Decimal" }, { id: "fr", etiqueta: "Fracción (a/b)" }],
          _ok: { dec: fmt(dec), fr: `${n}/${d}` },
          comprobar(v) {
            const mal = [];
            if (Math.abs(num(v.dec) - dec) > 1e-9) mal.push("dec");
            if (!igualFrac(v.fr)) mal.push("fr");
            const f = fraccion(v.fr);
            if (!mal.length) {
              const simp = mcd(f[0], f[1]) === 1;
              return { bien: true, texto: "¡Correcto!", explica: simp ? `${fmt(pc)}/100 simplificada es ${n}/${d}.` : `Está bien. Simplificada del todo queda ${F(n, d)}.` };
            }
            if (!f && !mal.includes("dec")) return { bien: false, campos: ["fr"], texto: "Escribe la fracción con una barra, por ejemplo 3/4.", explica: "" };
            return { bien: false, campos: mal, texto: mal.length === 2 ? "Revisa las dos respuestas." : "Una está bien, revisa la otra.", explica: `${fmt(pc)} % quiere decir ${fmt(pc)} de cada 100.` };
          },
          solucion: `${fmt(pc)} % = ${fmt(dec)} = ${F(n, d)}`,
        };
      },
    },
  },
});
