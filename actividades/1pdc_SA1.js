// Actividades de repaso de la SA1 de 1º PDC (Medir y calcular como en el laboratorio).
// Mismo formato que 2eso_SA1.js. La reducción a la unidad se toma tal cual de
// 2º ESO: se lee al usarla, porque los archivos de 2º ESO se cargan después de este. Números al azar; nunca los de
// las pruebas de números (20 % de 65, 12 de 48, 21 de 60, 12 % de 350; 0,607,
// 0,65, 0,7 y 0,76; 4,38, 9,04 y 2,96 a las décimas; 3 kg a 1,50 €, 2 a 1,50 € y
// 3,20 € entre 2; las sumas y restas de fracciones de las dos pruebas).
"use strict";

{
  const eur = x => Number.isInteger(Math.round(x * 100) / 100) ? miles(Math.round(x)) : miles(x.toFixed(2).replace(".", ","));
  const cerca = (x, y, tol = .005) => Number.isFinite(x) && Math.abs(x - y) < tol;
  const resultado = (mal, texto, explica) => mal.length ? { bien: false, campos: mal, texto, explica } : { bien: true, texto: "¡Correcto!", explica: "" };
  // Número entero n de unidades de 10^-p, escrito con p decimales («3,470»).
  const fijo = (n, p) => {
    const s = String(Math.abs(n)).padStart(p + 1, "0"), e = s.slice(0, s.length - p), d = s.slice(s.length - p);
    return (n < 0 ? "−" : "") + miles(e) + (p ? "," + d : "");
  };
  const campo = (id, etiqueta, modo = "decimal") => `<div class="campo"><label for="f-${id}">${etiqueta}</label><input class="casilla" id="f-${id}" inputmode="${modo}" autocomplete="off"></div>`;

  // ---------------------------------------------------------- decimales
  const LUGARES = ["décimas", "centésimas", "milésimas"];
  // Tabla de valor posicional con los dos números; resuelta, con los ceros que igualan las cifras.
  function posicionalHTML(nums, resuelto) {
    const p = Math.max(...nums.map(x => x.p));
    const fila = x => {
      const s = fijo(x.n, x.p), [e, d = ""] = s.split(",");
      const celdas = [...d.padEnd(p, " ")].map((c, i) => c === " " ? (resuelto ? `<td class="relleno">0</td>` : "<td></td>") : `<td>${c}</td>`);
      return `<tr><th>${s}</th><td>${e}</td>${celdas.join("")}</tr>`;
    };
    return `<table class="tabla-valores posicional"><tr><th></th><td><b>U</b></td>${LUGARES.slice(0, p).map(l => `<td><b>${l[0]}</b></td>`).join("")}</tr>${nums.map(fila).join("")}</table>
            <div class="leyenda"><span>U = unidades; ${LUGARES.slice(0, p).map(l => `${l[0]} = ${l}`).join("; ")}</span></div>`;
  }

  // Recta del redondeo: los dos candidatos en los extremos, la mitad y el número.
  function rectaRedondeoSVG({ x, bajo, alto, mitad, rotulos, resuelto, sube }) {
    const X = v => 60 + 480 * (v - bajo) / (alto - bajo), y = 70;
    let s = `<svg viewBox="0 0 600 150" role="img"><line class="eje" x1="40" y1="${y}" x2="560" y2="${y}"/>`;
    for (const [v, t, clase] of [[bajo, rotulos[0], ""], [alto, rotulos[1], ""], [mitad, rotulos[2], "guia"]]) {
      s += `<line class="${clase || "corte"}" x1="${X(v)}" y1="${y - 12}" x2="${X(v)}" y2="${y + 12}"/><text class="t-llave" x="${X(v)}" y="${y + 40}">${t}</text>`;
    }
    s += `<circle cx="${X(x)}" cy="${y}" r="7" class="c-naranja"/><text class="t-llave" x="${Math.min(Math.max(X(x), 70), 530)}" y="${y - (resuelto ? 50 : 22)}">${rotulos[3]}</text>`;
    if (resuelto) {
      // Flecha curva por encima de la recta: del número a su redondeo.
      const x1 = X(x), x2 = X(sube ? alto : bajo), cy = y - 48, y0 = y - 12;
      const dx = x2 - (x1 + x2) / 2, dy = y0 - cy, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, L = 12, w = 6;
      s += `<path class="flecha" d="M${x1},${y0} Q${(x1 + x2) / 2},${cy} ${x2},${y0}"/>`;
      s += `<path class="flecha-punta" d="M${x2},${y0} L${x2 - L * ux - w * uy},${y0 - L * uy + w * ux} L${x2 - L * ux + w * uy},${y0 - L * uy - w * ux} Z"/>`;
    }
    if (resuelto) s += `<circle cx="${X(sube ? alto : bajo)}" cy="${y}" r="9" class="c-azul" style="stroke: var(--fg); stroke-width: 1.5"/>`;
    return s + `</svg>`;
  }

  // ---------------------------------------------------------- fracciones
  const EXAMEN = ["2/3+1/4", "5/6-1/2", "1/4+2/9", "2/5+1/3", "3/4+1/6", "5/6-1/4", "7/10-2/5"];
  const multiplos = (b, hasta) => Array.from({ length: hasta / b }, (_, i) => (i + 1) * b);

  // ---------------------------------------------------------- porcentajes
  // Solo las dos reglas que se dan en clase, sin atajos ni recta doble:
  // el % de una cantidad: : 100 (el 1 %) y · el porcentaje;
  // qué % es: parte : todo · 100.
  const REGLA = {
    de: "Dividimos entre 100 para hallar el 1 % y después multiplicamos por el porcentaje que queremos calcular.",
    que: "Dividimos la parte entre el todo y multiplicamos por 100.",
  };
  // Barra del 100 %: cien trozos finos, como una fracción de denominador 100.
  // El 1 % (el primer trozo) en azul, con su valor fuera; el resto del
  // porcentaje en naranja, con su llave y su rótulo naranjas debajo.
  function cienSVG({ T, pc, P, uno, u, resuelto }) {
    const x0 = 130, bw = 450, y = 64, h = 44, sw = bw / 100;
    let s = `<svg viewBox="0 0 600 176" role="img">`;
    for (let i = 0; i < 100; i++) s += `<rect x="${x0 + i * sw}" y="${y}" width="${sw + .2}" height="${h}" class="${i === 0 ? "c-azul" : i < pc ? "c-naranja" : "c-blanco"}"/>`;
    for (let i = 1; i < 100; i++) s += `<line x1="${x0 + i * sw}" y1="${y}" x2="${x0 + i * sw}" y2="${y + h}" class="corte" style="stroke-width: ${i % 10 ? .5 : 1.4}"/>`;
    s += `<rect class="borde" x="${x0}" y="${y}" width="${bw}" height="${h}"/>`;
    const U = u ? " " + u : "", mid = x0 + bw / 2;
    // Llave de arriba: el total es el 100 %.
    s += `<path class="llave" d="M${x0},${y - 6} V${y - 14} H${x0 + bw} V${y - 6} M${mid},${y - 14} V${y - 20}"/>`;
    s += `<text class="t-llave" x="${mid}" y="${y - 26}">100 % = ${miles(T)}${U}</text>`;
    // El 1 %: el primer trozo, resaltado y con su valor fuera, a la izquierda.
    s += `<text class="t-llave t-azul" x="${x0 - 12}" y="${y + h / 2 + 7}" style="text-anchor: end">1 % = ${resuelto ? fmt(uno) : "?"}</text>`;
    // Llave de abajo: los pc trozos pintados.
    const x2 = x0 + pc * sw, m2 = (x0 + x2) / 2, yb = y + h;
    const texto = resuelto ? `${pc} % = ${pc} · ${fmt(uno)} = ${miles(P)}${U}` : `${pc} % = ?`;
    s += `<path class="llave" style="stroke: #b9690e" d="M${x0 + 1},${yb + 6} V${yb + 14} H${x2 - 1} V${yb + 6} M${m2},${yb + 14} V${yb + 20}"/>`;
    s += `<text class="t-llave t-naranja" x="${Math.min(Math.max(m2, 10 + texto.length * 5.5), 590 - texto.length * 5.5)}" y="${yb + 42}">${texto}</text>`;
    return s + `</svg>`;
  }

  function porcentajes(fijo) {
    return {
      titulo: { de: "El % de una cantidad", que: "¿Qué porcentaje es?", todas: "¿El % de… o qué %?" }[fijo],
      sub: { de: "Entre 100 y por el porcentaje", que: "La parte entre el todo, por 100", todas: "Primero, saber qué te piden" }[fijo],
      herramienta: ["Porcentajes con la recta doble", "porcentajes.html"],
      dibujoOculto: true,   // como en las fracciones: que hagan el suyo; el de la web, si lo piden
      pista: fijo === "todas"
        ? `<ul><li>Si te dan el porcentaje (el número con %), te piden una cantidad: ${REGLA.de.toLowerCase()}</li>
           <li>Si te dan dos cantidades, te piden el porcentaje: ${REGLA.que.toLowerCase()}</li></ul>
           <p>El resultado solo lleva % si es un porcentaje.</p>`
        : REGLA[fijo],
      nuevo() {
        const tipo = fijo === "todas" ? elegir(["de", "que"]) : fijo;
        let T, pc, P;
        do {
          T = elegir([20, 25, 40, 50, 60, 80, 200, 300, 400, 500]);
          pc = elegir([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80].filter(x => x * T % 100 === 0));
          P = pc * T / 100;
        } while ((pc === 20 && T === 65) || (P === 12 && T === 48) || (P === 21 && T === 60));
        const CTX = [
          { de: `Calcula el <span class="dato">${pc} %</span> de <span class="dato">${miles(T)}</span>.`,
            que: `¿Qué porcentaje es <span class="dato">${miles(P)}</span> de <span class="dato">${miles(T)}</span>?`, u: "" },
          { de: `En un instituto de <span class="dato">${miles(T)}</span> estudiantes, el <span class="dato">${pc} %</span> viene en guagua. ¿Cuántos estudiantes vienen en guagua?`,
            que: `En un instituto de <span class="dato">${miles(T)}</span> estudiantes, <span class="dato">${miles(P)}</span> vienen en guagua. ¿Qué porcentaje viene en guagua?`, u: "estudiantes" },
          { de: `Un yogur de <span class="dato">${miles(T)} g</span> tiene un <span class="dato">${pc} %</span> de fruta. ¿Cuántos gramos de fruta lleva?`,
            que: `Un yogur de <span class="dato">${miles(T)} g</span> lleva <span class="dato">${miles(P)} g</span> de fruta. ¿Qué porcentaje del yogur es fruta?`, u: "g" },
        ];
        const ctx = elegir(T >= 200 ? CTX : CTX.slice(0, 2)), uno = T / 100, cociente = P / T;
        const ok = tipo === "de" ? { r: String(P), u: "n" } : { r: String(pc), u: "pc" };
        // Las dos casillas de la regla y el resultado; en «mezclados», además, si es % o cantidad.
        const casillas = tipo === "de"
          ? [["c1", "El 1 %", fmt(uno)]]
          : [["c1", "La parte entre el todo", fmt(cociente)]];
        const conCasillas = fijo !== "todas";
        const trabajo = conCasillas
          ? `<div class="campos">${campo("c1", casillas[0][1])}${campo("r", tipo === "que" ? "El porcentaje (%)" : `El ${pc} %`)}</div>`
          : `<div class="campos">${campo("r", "Resultado")}</div>
             <div class="linea-op" style="margin-top: 1.4rem"><span class="op">Mi resultado es</span>${ELEGIR("u", [["pc", "un porcentaje (%)"], ["n", ctx.u ? `una cantidad (${ctx.u})` : "una cantidad"]], "¿Porcentaje o cantidad?")}</div>`;
        return {
          html: ctx[tipo],
          dibujo: fijo === "de" ? r => cienSVG({ T, pc, P, uno, u: ctx.u, resuelto: r }) : undefined,
          trabajo,
          _ok: conCasillas ? { c1: casillas[0][2], r: ok.r } : ok,
          comprobar(v) {
            const x = num(v.r), rBien = x === Number(ok.r);
            if (conCasillas) {
              const c = num(v.c1), cBien = cerca(c, tipo === "de" ? uno : cociente, 1e-6), mal = [];
              if (!cBien) mal.push("c1");
              if (!rBien) mal.push("r");
              if (!mal.length) return resultado(mal);
              if (!cBien) return resultado(mal, tipo === "de" ? "Primero el 1 %." : "Primero la división.", tipo === "de" ? `${miles(T)} : 100 = ?` : `Divide la parte entre el todo: ${miles(P)} : ${miles(T)}. Sale menos de 1.`);
              return resultado(mal, tipo === "de" ? `Ahora multiplica por ${pc}.` : "Ahora multiplica por 100.", tipo === "de" ? `${fmt(uno)} · ${pc} = ?` : `${fmt(cociente)} · 100 = ?`);
            }
            const uBien = v.u === ok.u;
            if (rBien && uBien) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (rBien) return tipo === "de"
              ? resultado(["u"], `Son ${miles(P)}, no ${miles(P)} %.`, `Te dan el porcentaje y te piden una cantidad: ${miles(P)} es una parte de ${miles(T)}. El símbolo % quiere decir «de cada 100».`)
              : resultado(["u"], `Es un porcentaje: ${pc} %.`, "Te dan dos cantidades y te piden el porcentaje.");
            const campos = uBien ? ["r"] : ["r", "u"];
            if (tipo === "de" && cerca(x, pc * 100 / T, 1e-6) && pc * 100 / T !== P) return resultado(campos, `Eso sería «¿qué porcentaje es ${pc} de ${miles(T)}?».`, `Aquí te dan el porcentaje. ${REGLA.de}`);
            if (tipo === "que" && cerca(x, P * T / 100, 1e-6)) return resultado(campos, `Has calculado el ${miles(P)} % de ${miles(T)}.`, `Aquí ${miles(P)} no es un porcentaje: es la parte. ${REGLA.que}`);
            if (tipo === "que" && cerca(x, cociente, 1e-6)) return resultado(campos, "Te falta multiplicar por 100.", REGLA.que);
            return resultado(campos, "Todavía no.", REGLA[tipo]);
          },
          operaciones: tipo === "de"
            ? `<p>${REGLA.de}</p><p>1 %: ${miles(T)} : 100 = ${fmt(uno)}</p><p>${pc} %: ${fmt(uno)} · ${pc} = <b>${miles(P)}</b>${ctx.u ? " " + ctx.u : ""}</p>`
            : `<p>${REGLA.que}</p><p>${miles(P)} : ${miles(T)} = ${fmt(cociente)}</p><p>${fmt(cociente)} · 100 = <b>${pc} %</b></p>`,
        };
      },
    };
  }

  const acts = {
    decimales: {
      titulo: "¿Qué decimal es mayor?",
      sub: "Más cifras no quiere decir más grande",
      herramienta: ["Decimales paso a paso", "decimales.html"],
      pista: "Compara primero la parte entera. Si es igual, añade ceros a la derecha hasta que los dos tengan las mismas cifras decimales: 0,7 = 0,70. Así comparas centésimas con centésimas: 70 es más que 67.",
      dibujoOculto: true,
      nuevo() {
        let a, b;
        do {
          const I = elegir([0, 0, 0, 1, 2, 3, 5, 12]), t = elegir(["largo", "largo", "ceros", "igual"]);
          if (t === "largo") {        // el corto es mayor: 0,7 y 0,67
            const d = azar(2, 9), p = elegir([2, 2, 3]);
            a = { n: I * 10 + d, p: 1 };
            b = { n: (I * 10 + d - 1) * 10 ** (p - 1) + azar(1, 10 ** (p - 1) - 1), p };
            if (b.n % 10 === 0) b.n += 1;
          } else if (t === "ceros") { // un cero detrás de la coma: 0,08 y 0,6
            const d = azar(1, 9), e = azar(1, 9);
            a = { n: I * 100 + d, p: 2 }; b = { n: I * 10 + e, p: 1 };
          } else {                    // iguales: 0,5 y 0,50
            const d = azar(1, 9);
            a = { n: I * 10 + d, p: 1 }; b = { n: (I * 10 + d) * 10, p: 2 };
          }
          if (Math.random() < .5) [a, b] = [b, a];
        } while ([a, b].some(x => ["0,607", "0,65", "0,7", "0,76"].includes(fijo(x.n, x.p))));
        const va = a.n / 10 ** a.p, vb = b.n / 10 ** b.p, A = fijo(a.n, a.p), B = fijo(b.n, b.p);
        const ok = Math.abs(va - vb) < 1e-12 ? "igual" : va > vb ? "a" : "b";
        const CTX = [
          () => `¿Qué número es mayor?`,
          () => `Una muestra de basalto pesa <span class="dato">${A} kg</span> y una de piedra pómez, <span class="dato">${B} kg</span>. ¿Cuál pesa más?`,
          () => `Un vaso tiene <span class="dato">${A} L</span> de zumo y otro, <span class="dato">${B} L</span>. ¿Cuál tiene más?`,
        ];
        const P = Math.max(a.p, b.p), ancho = x => fijo(x.n * 10 ** (P - x.p), P);
        return {
          html: elegir(CTX)(),
          pasos: ["decimales.html", "comparar", { a: A.replace(/ /g, ""), b: B.replace(/ /g, "") }],
          dibujo: r => posicionalHTML([a, b], r),
          trabajo: `<div class="linea-op">${ELEGIR("m", [["a", A], ["b", B], ["igual", "Son iguales"]], "¿Cuál es mayor?")}</div>`,
          _ok: { m: ok },
          comprobar(v) {
            if (v.m === ok) return { bien: true, texto: "¡Correcto!", explica: `Con las mismas cifras: ${ancho(a)} y ${ancho(b)}.` };
            const largo = a.p > b.p ? "a" : b.p > a.p ? "b" : null;
            if (ok !== "igual" && v.m === largo) return resultado(["m"], "Tiene más cifras, pero no es mayor.", `Iguala las cifras decimales con ceros: ${ancho(a)} y ${ancho(b)}. Ahora compara.`);
            if (ok === "igual") return resultado(["m"], "Mira bien: valen lo mismo.", `Un cero a la derecha de la última cifra decimal no cambia el número: ${A} y ${B}.`);
            if (v.m === "igual") return resultado(["m"], "No son iguales.", `Escríbelos con las mismas cifras: ${ancho(a)} y ${ancho(b)}.`);
            return resultado(["m"], "Todavía no.", `Escríbelos con las mismas cifras: ${ancho(a)} y ${ancho(b)}.`);
          },
          operaciones: `<p>${A} = ${ancho(a)} &nbsp;&nbsp; ${B} = ${ancho(b)}</p>
                        <p><b>${ok === "igual" ? `${A} = ${B}` : ok === "a" ? `${A} > ${B}` : `${B} > ${A}`}</b></p>`,
        };
      },
    },

    redondeo: {
      titulo: "Redondear",
      sub: "A las unidades, a las décimas o a las centésimas",
      herramienta: ["Decimales paso a paso", "decimales.html#redondeo"],
      pista: "Mira solo la cifra que va justo detrás de la que te piden. Si es 5 o más, la cifra pedida sube uno; si es 4 o menos, se queda igual. Después borra todas las cifras de detrás. A las décimas queda una cifra decimal aunque sea 0 (7,0, no 7).",
      dibujoOculto: true,
      variantes: [["todas", "Mezclados"], ["0", "A las unidades"], ["1", "A las décimas"], ["2", "A las centésimas"]],
      nuevo(variante = "todas") {
        const t = variante === "todas" ? elegir([0, 1, 1, 2]) : Number(variante);
        let p, n, q, R;
        do {
          p = t + elegir([1, 1, 2]); q = 10 ** (p - t);
          const entero = elegir([0, 1, 2, 3, 4, 7, 9, 12, 23, 48]);
          // la cifra decisiva: a veces justo 5, a veces 9 para que haya que llevar
          const resto = elegir([azar(1, q - 1), q / 2, q / 2 + (q > 10 ? azar(1, 9) : 0), azar(0, q / 2 - 1)]);
          const delante = elegir([azar(0, 10 ** t - 1), 10 ** t - 1]);
          n = (entero * 10 ** t + delante) * q + resto;
          if (n % 10 === 0) n += 1;
          R = Math.floor((2 * n + q) / (2 * q));
        } while (n < q || (t === 1 && ["4,38", "9,04", "2,96"].includes(fijo(n, p))));
        const T = Math.floor(n / q), sube = R > T, X = fijo(n, p), res = fijo(R, t), lugar = ["las unidades", "las décimas", "las centésimas"][t];
        const CTX = [
          () => `Redondea <span class="dato">${X}</span> a ${lugar}.`,
          () => `Una balanza marca <span class="dato">${X} g</span>. Redondea la masa a ${lugar}.`,
          () => `La calculadora da <span class="dato">${X}</span> como resultado de una densidad. Redondéalo a ${lugar}.`,
          () => `Un termómetro digital marca <span class="dato">${X} °C</span>. Redondea a ${lugar}.`,
        ];
        const cifra = String(n).padStart(p + 1, "0")[String(n).padStart(p + 1, "0").length - (p - t)];
        return {
          html: elegir(CTX)(),
          pasos: ["decimales.html", "redondeo", { x: X.replace(/ /g, ""), t: String(t) }],
          dibujo: r => rectaRedondeoSVG({ x: n / q, bajo: T, alto: T + 1, mitad: T + .5, sube,
            rotulos: [fijo(T, t), fijo(T + 1, t), fijo(T * 10 + 5, t + 1), X], resuelto: r }),
          campos: [{ id: "r", etiqueta: `Redondeado a ${lugar}` }],
          _ok: { r: res },
          comprobar(v) {
            const x = num(v.r), ok = Math.abs(x - R / 10 ** t) < 1e-9;
            // Redondear a las décimas es escribir una cifra decimal, aunque sea 0 (7,0 y no 7).
            const decs = (String(v.r).trim().replace(".", ",").split(",")[1] || "").length;
            if (ok && decs < t) return resultado(["r"], `Falta${t - decs > 1 ? "n" : ""} ${t - decs === 1 ? "una cifra decimal" : "dos cifras decimales"}.`, `Redondeado a ${lugar} se escribe con ${t === 1 ? "una cifra decimal" : "dos cifras decimales"}, aunque ${t - decs === 1 ? "sea un cero" : "sean ceros"}: ${res}.`);
            if (ok && decs > t) return resultado(["r"], "Sobran cifras decimales.", `Redondeado a ${lugar} se escribe con ${t === 0 ? "ninguna cifra decimal" : t === 1 ? "una cifra decimal" : "dos cifras decimales"}: ${res}.`);
            if (ok) return { bien: true, texto: "¡Correcto!", explica: "" };
            if (Math.abs(x - n / 10 ** p) < 1e-9) return resultado(["r"], "Así está sin redondear.", `Tienes que quedarte solo hasta ${lugar} y quitar las cifras de detrás.`);
            if (sube && Math.abs(x - T / 10 ** t) < 1e-9) return resultado(["r"], "Has cortado sin mirar la cifra siguiente.", `Detrás viene un ${cifra}, que es 5 o más: la última cifra que te quedas sube uno.`);
            if (!sube && Math.abs(x - (T + 1) / 10 ** t) < 1e-9) return resultado(["r"], "Aquí no hay que subir.", `Detrás viene un ${cifra}, que es menor que 5: se queda igual.`);
            for (const otra of [0, 1, 2, 3].filter(o => o !== t && o < p)) {
              const qq = 10 ** (p - otra);
              if (Math.abs(x - Math.floor((2 * n + qq) / (2 * qq)) / 10 ** otra) < 1e-9)
                return resultado(["r"], `Eso es redondear a ${["las unidades", "las décimas", "las centésimas", "las milésimas"][otra]}.`, `Te piden ${lugar}: ${t === 0 ? "ninguna cifra decimal" : t === 1 ? "una cifra decimal" : "dos cifras decimales"}.`);
            }
            return resultado(["r"], "Todavía no.", `Busca entre qué dos números está: ${fijo(T, t)} y ${fijo(T + 1, t)}. ¿A cuál está más cerca?`);
          },
          operaciones: `<p>${X} está entre ${fijo(T, t)} y ${fijo(T + 1, t)}; la mitad es ${fijo(T * 10 + 5, t + 1)}.</p>
                        <p>La cifra de detrás es ${cifra}: ${sube ? "5 o más, sube" : "menos de 5, se queda igual"}. &nbsp; <b>${X} ≈ ${res}</b></p>`,
        };
      },
    },

    fracciones: {
      titulo: "Sumar y restar fracciones",
      sub: "Con los múltiplos de los denominadores",
      herramienta: ["Sumar y restar fracciones con el mcm", "fracmcm.html"],
      pista: "En tu cuaderno, escribe los múltiplos de cada denominador (de 4: 4, 8, 12, 16…; de 6: 6, 12, 18…) hasta encontrar el primero que esté en las dos listas. Ese es el denominador común. Después, ¿por cuánto multiplicas cada denominador para llegar a él? Multiplica arriba y abajo por ese número.",
      variantes: [["todas", "Mezcladas"], ["+", "Sumar"], ["-", "Restar"]],
      nuevo(variante = "todas") {
        let e;
        do e = generarSuma([[2, 3], [2, 4], [2, 6], [3, 4], [3, 6], [4, 6], [2, 5], [4, 8], [3, 9], [5, 10], [6, 8], [2, 8], [3, 5], [4, 10], [6, 9], [4, 12]]);
        while ((variante !== "todas" && e.op !== variante) || EXAMEN.includes(`${e.a}/${e.b}${e.op}${e.c}/${e.d}`) || EXAMEN.includes(`${e.c}/${e.d}${e.op}${e.a}/${e.b}`));
        const { a, b, c, d, op, m, A, B, R } = e, k1 = m / b, k2 = m / d;
        return {
          html: `${op === "+" ? "Suma" : "Resta"} las fracciones. Busca primero el denominador común con los múltiplos.`,
          pasos: ["fracmcm.html", "suma", { a, b, op, c, d }],
          trabajo: `<div class="campos lineas">${campo("m", "Denominador común", "numeric")}${campo("k1", `${F(a, b)}: multiplico arriba y abajo por`, "numeric")}${campo("k2", `${F(c, d)}: multiplico arriba y abajo por`, "numeric")}</div>${lineaSuma(a, b, c, d, op)}`,
          _ok: { m: String(m), k1: String(k1), k2: String(k2), n1: String(A), d1: String(m), n2: String(B), d2: String(m), nr: String(R), dr: String(m) },
          comprobar(v) {
            const M = num(v.m), K1 = num(v.k1), K2 = num(v.k2);
            if (!(M > 0) || M % b || M % d) return resultado(["m"], `${v.m} no está en las dos listas de múltiplos.`, `Escribe los múltiplos de ${b} (${multiplos(b, 4 * b).join(", ")}…) y los de ${d} (${multiplos(d, 4 * d).join(", ")}…) hasta que uno se repita.`);
            const mal = [];
            if (K1 * b !== M) mal.push("k1");
            if (K2 * d !== M) mal.push("k2");
            if (mal.length) return resultado(mal, "Revisa por cuánto multiplicas.", `¿Qué número por ${mal[0] === "k1" ? b : d} da ${M}? Es ${M} : ${mal[0] === "k1" ? b : d}.`);
            const dd = ["d1", "d2"].filter(x => num(v[x]) !== M);
            if (dd.length) return resultado(dd, `Usa el denominador común: ${M}.`, `Las dos fracciones tienen que quedar con denominador ${M}.`);
            const r = revisarSuma(v, e);
            if (r.bien && M > m) r.explica = r.explica.replace(/^Está bien\. Con \d+ trozos también sale, y los números son más pequeños\. /, `Está bien. ${m} también está en las dos listas y es más pequeño: los números salen más fáciles. `);
            return r;
          },
          operaciones: `
            <p>Múltiplos de ${b}: ${multiplos(b, m).map(x => x === m ? `<b>${x}</b>` : x).join(", ")} &nbsp;&nbsp; Múltiplos de ${d}: ${multiplos(d, m).map(x => x === m ? `<b>${x}</b>` : x).join(", ")}</p>
            <p>${m} : ${b} = ${k1} → ${F(a, b)} = ${F(`${a} · ${k1}`, `${b} · ${k1}`)} = ${F(A, m)} &nbsp;&nbsp; ${m} : ${d} = ${k2} → ${F(c, d)} = ${F(`${c} · ${k2}`, `${d} · ${k2}`)} = ${F(B, m)}</p>
            <p>${F(A, m)} ${SIGNO(op)} ${F(B, m)} = ${F(`${A} ${SIGNO(op)} ${B}`, m)} = <b>${cierreSuma(R, m)}</b></p>`,
        };
      },
    },

    pcde: porcentajes("de"),
    pcque: porcentajes("que"),
    queme: porcentajes("todas"),

    kilo: {
      titulo: "¿El precio de 1 kg o el de todo?",
      sub: "«A 1,20 € el kilo» y «por 1,20 €» no son lo mismo",
      herramienta: ["Proporcionalidad directa", "proporcion.html"],
      pista: `<ul><li>«A tanto el kilo» es lo que cuesta 1 kg: para saber lo que pagas por varios kilos, multiplica.</li>
             <li>«Por tanto» es lo que pagas por todo: para saber lo que cuesta 1 kg, divide entre los kilos.</li></ul>
             <p>Comprueba: 1 kg tiene que costar menos que varios.</p>`,
      dibujoOculto: true,
      nuevo() {
        const PROD = [["papas", "kg", "el kilo"], ["plátanos", "kg", "el kilo"], ["tomates", "kg", "el kilo"], ["gofio", "kg", "el kilo"],
                      ["aceite", "L", "el litro"], ["cable", "m", "el metro"], ["tela", "m", "el metro"]];
        const tipo = elegir(["a", "por"]), [prod, u, el] = elegir(PROD);
        let n, p;
        do { n = azar(2, 6); p = elegir([0.8, 1.2, 1.25, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.5, 3, 3.5]); }
        while ((p === 1.5 && n <= 3) || (p === 1.6 && n === 2));
        const t = Math.round(n * p * 100) / 100;
        const html = tipo === "a"
          ? `Compro <span class="dato">${n} ${u}</span> de ${prod} a <span class="dato">${eur(p)} €</span> ${el}. ¿Cuánto pago en total?`
          : `Compro <span class="dato">${n} ${u}</span> de ${prod} por <span class="dato">${eur(t)} €</span>. ¿Cuánto cuesta 1 ${u}?`;
        const resp = tipo === "a" ? t : p, op = tipo === "a" ? "mul" : "div";
        const tabla = r => `<table class="tabla-valores"><tr><th>${u}</th>${tipo === "a" ? `<td>1</td><td>${n}</td>` : `<td>${n}</td><td>1</td>`}</tr>
                            <tr><th>€</th>${tipo === "a" ? `<td>${eur(p)}</td><td>${r ? eur(t) : "?"}</td>` : `<td>${eur(t)}</td><td>${r ? eur(p) : "?"}</td>`}</tr></table>`;
        return {
          html,
          dibujo: tabla,
          pasos: ["proporcion.html", "directa", tipo === "a" ? { a: 1, b: p, x: n, ua: u, ub: "€" } : { a: n, b: t, x: 1, ua: u, ub: "€" }],
          trabajo: `<div class="linea-op"><span class="op">Para saberlo,</span>${ELEGIR("op", [["mul", "multiplico"], ["div", "divido"]], "¿Multiplico o divido?")}</div>
                    <div class="campos" style="margin-top: 1.4rem">${campo("r", tipo === "a" ? "Pago en total (€)" : `1 ${u} cuesta (€)`)}</div>`,
          _ok: { op, r: fmt(resp) },
          comprobar(v) {
            const x = num(v.r), mal = [];
            if (v.op !== op) mal.push("op");
            if (!cerca(x, resp)) mal.push("r");
            if (!mal.length) return resultado(mal);
            if (tipo === "a" && (v.op === "div" || cerca(x, p / n))) return resultado(mal, `«A ${eur(p)} € ${el}» ya es lo que cuesta 1 ${u}.`, `Cada ${u} cuesta ${eur(p)} €: ${n} ${u} cuestan ${n} veces eso.`);
            if (tipo === "por" && (v.op === "mul" || cerca(x, t * n))) return resultado(mal, `«Por ${eur(t)} €» es lo que pagas por todo.`, `Los ${eur(t)} € son por los ${n} ${u}: repártelos entre ${n}. 1 ${u} tiene que costar menos que ${eur(t)} €.`);
            if (mal.length === 1 && mal[0] === "r") return resultado(mal, "La operación es la buena; revisa la cuenta.", tipo === "a" ? `${n} · ${eur(p)} = ?` : `${eur(t)} : ${n} = ?`);
            return resultado(mal, "Todavía no.", "¿Te dan lo que cuesta 1 o lo que cuesta todo?");
          },
          operaciones: tipo === "a"
            ? `<p>${eur(p)} € es lo que cuesta 1 ${u}.</p><p>${n} · ${eur(p)} = <b>${eur(t)} €</b></p>`
            : `<p>${eur(t)} € es lo que cuestan los ${n} ${u}.</p><p>${eur(t)} : ${n} = <b>${eur(p)} €</b> cada ${u}</p>`,
        };
      },
    },
  };

  // La de 2º ESO, tal cual.
  const prestadas = [["unidad", "2eso/SA2", "unidad"]];
  for (const [k, tema, a, cambios] of prestadas)
    Object.defineProperty(acts, k, { enumerable: true, get: () => ({ ...Repaso.temas[tema].actividades[a], ...cambios }) });

  Repaso.tema("1pdc", "SA1", {
    bloques: {
      A: ["decimales", "redondeo", "fracciones"],
      B: ["pcde", "pcque", "queme"],
      C: ["kilo", "unidad"],
    },
    actividades: acts,
  });
}
