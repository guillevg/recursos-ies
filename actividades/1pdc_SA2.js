// Actividades de repaso de la SA2 de 1º PDC (¿De qué está hecho todo?), bloque C:
// átomos e iones, como en la ficha del bloque. Del diagrama a los datos
// (p, n, e, Z, A, carga y el símbolo completo) y del símbolo a las partículas.
// Solo Z ≤ 20 (capas 2, 8, 8, 2) y, para los iones, las cargas habituales.
// El diagrama es el de la ficha: protón rojo con «+»,
// neutrón claro y liso, electrón azul con «−».
"use strict";

{
  const resultado = (mal, texto, explica) => mal.length ? { bien: false, campos: mal, texto, explica } : { bien: true, texto: "¡Correcto!", explica: "" };
  const campo = (id, etiqueta, modo = "numeric") => `<div class="campo"><label for="f-${id}">${etiqueta}</label><input class="casilla" id="f-${id}" inputmode="${modo}" autocomplete="off"></div>`;

  // Los 118 elementos: símbolo, nombre, columna y fila de la tabla (las filas 9
  // y 10 son los lantánidos y los actínidos, debajo). Descargado el 2026-11-19:
  // símbolo y posición de Periodic-Table-JSON (github.com/Bowserinator), nombre
  // en castellano de Wikidata (etiqueta «es»); los símbolos coinciden en las dos.
  const TABLA_DATOS = "H hidrógeno 1 1|He helio 18 1|Li litio 1 2|Be berilio 2 2|B boro 13 2|C carbono 14 2|N nitrógeno 15 2|O oxígeno 16 2|F flúor 17 2|Ne neón 18 2|Na sodio 1 3|Mg magnesio 2 3|Al aluminio 13 3|Si silicio 14 3|P fósforo 15 3|S azufre 16 3|Cl cloro 17 3|Ar argón 18 3|K potasio 1 4|Ca calcio 2 4|Sc escandio 3 4|Ti titanio 4 4|V vanadio 5 4|Cr cromo 6 4|Mn manganeso 7 4|Fe hierro 8 4|Co cobalto 9 4|Ni níquel 10 4|Cu cobre 11 4|Zn zinc 12 4|Ga galio 13 4|Ge germanio 14 4|As arsénico 15 4|Se selenio 16 4|Br bromo 17 4|Kr kriptón 18 4|Rb rubidio 1 5|Sr estroncio 2 5|Y itrio 3 5|Zr circonio 4 5|Nb niobio 5 5|Mo molibdeno 6 5|Tc tecnecio 7 5|Ru rutenio 8 5|Rh rodio 9 5|Pd paladio 10 5|Ag plata 11 5|Cd cadmio 12 5|In indio 13 5|Sn estaño 14 5|Sb antimonio 15 5|Te telurio 16 5|I yodo 17 5|Xe xenón 18 5|Cs cesio 1 6|Ba bario 2 6|La lantano 3 9|Ce cerio 4 9|Pr praseodimio 5 9|Nd neodimio 6 9|Pm prometio 7 9|Sm samario 8 9|Eu europio 9 9|Gd gadolinio 10 9|Tb terbio 11 9|Dy disprosio 12 9|Ho holmio 13 9|Er erbio 14 9|Tm tulio 15 9|Yb iterbio 16 9|Lu lutecio 17 9|Hf hafnio 4 6|Ta tántalo 5 6|W wolframio 6 6|Re renio 7 6|Os osmio 8 6|Ir iridio 9 6|Pt platino 10 6|Au oro 11 6|Hg mercurio 12 6|Tl talio 13 6|Pb plomo 14 6|Bi bismuto 15 6|Po polonio 16 6|At ástato 17 6|Rn radón 18 6|Fr francio 1 7|Ra radio 2 7|Ac actinio 3 10|Th torio 4 10|Pa protactinio 5 10|U uranio 6 10|Np neptunio 7 10|Pu plutonio 8 10|Am americio 9 10|Cm curio 10 10|Bk berkelio 11 10|Cf californio 12 10|Es einstenio 13 10|Fm fermio 14 10|Md mendelevio 15 10|No nobelio 16 10|Lr lawrencio 17 10|Rf rutherfordio 4 7|Db dubnio 5 7|Sg seaborgio 6 7|Bh bohrio 7 7|Hs hasio 8 7|Mt meitnerio 9 7|Ds darmstatio 10 7|Rg roentgenio 11 7|Cn copernicio 12 7|Nh nihonio 13 7|Fl flerovio 14 7|Mc moscovio 15 7|Lv livermorio 16 7|Ts teneso 17 7|Og oganesón 18 7";
  const TABLA_PERIODICA = TABLA_DATOS.split("|").map((f, i) => { const [sim, nombre, x, y] = f.split(" "); return { z: i + 1, sim, nombre, x: +x, y: +y }; });

  // Para los ejercicios, solo Z ≤ 20: número másico del isótopo más abundante
  // (IUPAC) y cargas de sus iones habituales (el H⁺ se deja fuera: sin
  // electrones no hay capas).
  const MASA_IONES = [
    [1, []], [4, []], [7, [1]], [9, [2]], [11, []], [12, []], [14, [-3]], [16, [-2]], [19, [-1]], [20, []],
    [23, [1]], [24, [2]], [27, [3]], [28, []], [31, [-3]], [32, [-2]], [35, [-1]], [40, []], [39, [1]], [40, [2]],
  ];
  const elemento = z => { const [a, iones] = MASA_IONES[z - 1], { sim, nombre } = TABLA_PERIODICA[z - 1]; return { z, sim, nombre, a, iones }; };

  // Átomo o ion al azar; la mitad de las veces, un ion (si el elemento lo forma).
  function particulaAzar() {
    const E = elemento(azar(1, 20)), q = E.iones.length && Math.random() < .5 ? elegir(E.iones) : 0;
    return { ...E, q, p: E.z, n: E.a - E.z, e: E.z - q };
  }

  // Carga escrita: «+», «2+», «3−» (como en la notación); con signo delante, «+2», «−3».
  const textoCarga = q => q === 0 ? "" : `${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "−"}`;
  const cargaConSigno = q => q === 0 ? "0" : `${q > 0 ? "+" : "−"}${Math.abs(q)}`;
  // Lee «0», «+», «-», «2+», «+2», «2-», «−2», «2» (sin signo, positiva). null si no se entiende.
  function leerCarga(t) {
    const s = String(t).replace(/\s/g, "").replace(/[−–]/g, "-");
    if (s === "" || s === "0") return 0;
    const m = s.match(/^([+-]?)(\d*)([+-]?)$/);
    if (!m || (m[1] && m[3]) || (!m[1] && !m[3] && !m[2])) return null;
    const n = m[2] === "" ? 1 : Number(m[2]);
    return (m[1] === "-" || m[3] === "-" ? -1 : 1) * n;
  }

  // Notación ᴬ_Z X^q en HTML.
  const notacion = x => `<span class="nota-quim"><span class="nq-a">${x.p + x.n}</span><span class="nq-z">${x.p}</span><span class="nq-x">${x.sim}</span><span class="nq-q">${textoCarga(x.q)}</span></span>`;
  // Las cuatro casillas del símbolo completo, cada una en su sitio.
  const NOTACION_IN = `<span class="nota-quim entrada" role="group" aria-label="Símbolo completo">
      <input class="casilla nq-a" id="f-sa" inputmode="numeric" autocomplete="off" aria-label="Número másico (arriba a la izquierda)">
      <input class="casilla nq-z" id="f-sz" inputmode="numeric" autocomplete="off" aria-label="Número atómico (abajo a la izquierda)">
      <input class="casilla nq-x" id="f-sx" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Símbolo del elemento">
      <input class="casilla nq-q" id="f-sq" autocomplete="off" data-opcional aria-label="Carga (arriba a la derecha; vacía si es neutro)">
    </span>`;

  // Tabla periódica completa, en la ventana (botón de las ayudas). Cada casilla, número atómico y símbolo; al tocarla,
  // su nombre debajo. Lantánidos y actínidos en dos filas aparte, con su hueco marcado.
  const TABLA = (() => {
    const celda = {}; TABLA_PERIODICA.forEach(e => { celda[`${e.x},${e.y}`] = e; });
    const fila = y => `<tr>${Array.from({ length: 18 }, (_, i) => {
      const e = celda[`${i + 1},${y}`];
      if (e) return `<td><button type="button" data-elemento="${e.z} · ${e.sim} · ${e.nombre}" title="${e.nombre}"><small>${e.z}</small><b>${e.sim}</b></button></td>`;
      if (i === 2 && (y === 6 || y === 7)) return `<td class="hueco">${y === 6 ? "57‑71" : "89‑103"}</td>`;
      return `<td class="vacia"></td>`;
    }).join("")}</tr>`;
    return `<div class="tabla-periodica">
      <table>${[1, 2, 3, 4, 5, 6, 7].map(fila).join("")}<tr class="separa"><td colspan="18"></td></tr>${[9, 10].map(fila).join("")}</table>
      <p class="elemento-elegido" aria-live="polite">Toca un elemento para ver su nombre.</p></div>`;
  })();
  // Al tocar una casilla, su nombre debajo de la tabla (solo en el navegador).
  if (typeof document !== "undefined") document.addEventListener("click", ev => {
    const b = ev.target.closest && ev.target.closest("[data-elemento]");
    if (!b) return;
    const t = b.closest(".tabla-periodica");
    t.querySelectorAll("[aria-pressed]").forEach(x => x.removeAttribute("aria-pressed"));
    b.setAttribute("aria-pressed", "true");
    t.querySelector(".elemento-elegido").textContent = b.dataset.elemento;
  });

  // ---------------------------------------------------------- el diagrama
  // Núcleo: los n puntos de una red hexagonal más cercanos a un centro (se
  // prueban tres centros y se queda el grupo más redondo), como en la ficha.
  function nucleo(n, d) {
    const h = Math.sqrt(3) / 2, m = Math.ceil(Math.sqrt(n)) + 2, red = [];
    for (let i = -m; i <= m; i++) for (let j = -m; j <= m; j++) red.push([i + j / 2, j * h]);
    let mejor = null;
    for (const [cx, cy] of [[0, 0], [.5, 0], [.5, h / 3]]) {
      const orden = red.map(([x, y]) => [Math.round(((x - cx) ** 2 + (y - cy) ** 2) * 1e6), Math.atan2(x - cx, y - cy), x, y])
        .sort((p, q) => p[0] - q[0] || p[1] - q[1]).slice(0, n);
      const sx = orden.reduce((s, p) => s + p[2], 0) / n, sy = orden.reduce((s, p) => s + p[3], 0) / n;
      const pts = orden.map(p => [p[2] - sx, p[3] - sy]), r2 = pts.map(([x, y]) => x * x + y * y);
      const nota = [Math.round(Math.max(...r2) * 1e6), r2.reduce((s, x) => s + x, 0)];
      if (!mejor || nota[0] < mejor[0][0] || (nota[0] === mejor[0][0] && nota[1] < mejor[0][1])) mejor = [nota, pts];
    }
    return mejor[1].map(([x, y]) => [x * d * .96, y * d * .96])
      .sort((p, q) => Math.round((p[0] ** 2 + p[1] ** 2) * 1e4) - Math.round((q[0] ** 2 + q[1] ** 2) * 1e4) || Math.atan2(p[0], p[1]) - Math.atan2(q[0], q[1]));
  }
  // Protones (true) y neutrones (false) mezclados: cada partícula toma el tipo
  // que menos se repite entre sus vecinas ya puestas (a igualdad, el que más queda).
  function tipos(pts, z, d) {
    const t = [], quedan = [z, pts.length - z];
    pts.forEach(([x, y], k) => {
      const vecinas = t.filter((_, j) => Math.hypot(pts[j][0] - x, pts[j][1] - y) < 1.2 * d);
      const ip = vecinas.filter(v => v).length, in_ = vecinas.length - ip;
      const p = quedan[1] === 0 ? true : quedan[0] === 0 ? false : ip !== in_ ? ip < in_ : quedan[0] / z >= quedan[1] / (pts.length - z);
      t.push(p); quedan[p ? 0 : 1]--;
    });
    return t;
  }
  const capas = e => [2, 8, 8, 2].reduce((c, cap) => { const k = Math.min(e - c.reduce((s, x) => s + x, 0), cap); return k > 0 ? [...c, k] : c; }, []);

  function atomoSVG(x) {
    const rp = .34, pts = nucleo(x.p + x.n, 2 * rp), tp = tipos(pts, x.p, 2 * rp);
    const rn = Math.max(...pts.map(([a, b]) => Math.hypot(a, b))) + rp, r1 = Math.max(rn + 1.2, 2.3), dr = 1, re = .25;
    const reparto = capas(x.e), R = r1 + (reparto.length - 1) * dr + .6, k = 30, P = v => (v * k).toFixed(1);
    // «+» y «−» como trazos (no texto): quedan centrados con cualquier fuente.
    const signo = (cx, cy, l, mas) => `<path class="signo" d="M${P(cx - l)},${P(cy)} H${P(cx + l)}${mas ? ` M${P(cx)},${P(cy - l)} V${P(cy + l)}` : ""}"/>`;
    // Ancho fijo por unidad: un átomo pequeño se ve pequeño (en el móvil, como mucho, todo el ancho).
    let s = `<svg class="atomo-svg" width="${P(2 * R * 1.3)}" viewBox="${P(-R)} ${P(-R)} ${P(2 * R)} ${P(2 * R)}" role="img" aria-label="Diagrama de un átomo">`;
    reparto.forEach((_, i) => { s += `<circle class="capa" cx="0" cy="0" r="${P(r1 + i * dr)}"/>`; });
    pts.forEach(([a, b], i) => {
      s += `<circle class="${tp[i] ? "proton" : "neutron"}" cx="${P(a)}" cy="${P(-b)}" r="${P(rp)}"/>`;
      if (tp[i]) s += signo(a, -b, rp * .55, true);
    });
    reparto.forEach((n, i) => {
      for (let j = 0; j < n; j++) {
        const t = (90 + 23 * i) * Math.PI / 180 + j * 2 * Math.PI / n, cx = (r1 + i * dr) * Math.cos(t), cy = -(r1 + i * dr) * Math.sin(t);
        s += `<circle class="electron" cx="${P(cx)}" cy="${P(cy)}" r="${P(re)}"/>` + signo(cx, cy, re * .55, false);
      }
    });
    return s + `</svg>`;
  }
  const LEYENDA = `<div class="leyenda leyenda-atomo"><span><i class="proton"></i>protón (+)</span><span><i class="neutron"></i>neutrón (sin carga)</span><span><i class="electron"></i>electrón (−)</span></div>`;
  const tipoParticula = x => x.q === 0 ? `átomo de ${x.nombre}` : `ion ${x.q > 0 ? "positivo (catión)" : "negativo (anión)"} de ${x.nombre}`;
  const ganaPierde = x => x.q === 0 ? "átomo neutro: tantos electrones como protones" : x.q > 0
    ? `ha perdido ${x.q} electr${x.q > 1 ? "ones" : "ón"}: carga ${textoCarga(x.q)}` : `ha ganado ${-x.q} electr${x.q < -1 ? "ones" : "ón"}: carga ${textoCarga(x.q)}`;

  const REGLAS = `<ul><li><b>Z</b> = protones. Dice qué elemento es: búscalo en la tabla periódica.</li>
    <li><b>A</b> = protones + neutrones. Por eso, neutrones = A − Z.</li>
    <li>Átomo neutro: electrones = protones. Si <b>pierde</b> electrones, la carga es <b>+</b>; si los <b>gana</b>, <b>−</b>. Na<sup>+</sup> ha perdido 1; O<sup>2−</sup> ha ganado 2.</li>
    <li>El símbolo completo: arriba a la izquierda, A; abajo, Z; arriba a la derecha, la carga (en un átomo neutro, nada).</li></ul>`;

  const acts = {
    diagrama: {
      titulo: "Del diagrama a los datos",
      modal: { nombre: "Tabla periódica", icono: "tabla", html: TABLA },
      sub: "Protones, neutrones, electrones y el símbolo completo",
      pista: REGLAS + `<p>En el núcleo, las bolas con + son protones y las lisas, neutrones. Los electrones son las bolitas de las capas.</p>`,
      nuevo() {
        const x = particulaAzar(), A = x.p + x.n;
        return {
          html: `Mira el diagrama. ¿Cuántas partículas de cada tipo tiene? ¿Cuánto valen Z, A y la carga? Escribe su símbolo completo, como ${notacion({ p: 11, n: 12, sim: "Na", q: 1 })}.`,
          dibujo: r => atomoSVG(x) + LEYENDA + (r ? `<p class="pie-atomo">${notacion(x)} · ${tipoParticula(x)}</p>` : ""),
          trabajo: `<div class="campos">${campo("p", "Protones")}${campo("n", "Neutrones")}${campo("e", "Electrones")}</div>
                    <div class="campos" style="margin-top: 1rem">${campo("z", "Z")}${campo("a", "A")}${campo("q", "Carga", "text")}</div>
                    <div class="linea-op" style="margin-top: 1.4rem"><span class="op">Símbolo completo:</span>${NOTACION_IN}</div>`,
          _ok: { p: String(x.p), n: String(x.n), e: String(x.e), z: String(x.p), a: String(A), q: cargaConSigno(x.q), sx: x.sim, sq: textoCarga(x.q), sz: String(x.p), sa: String(A) },
          comprobar(v) {
            const [p, n, e, z, a, sz, sa] = ["p", "n", "e", "z", "a", "sz", "sa"].map(c => num(v[c])), q = leerCarga(v.q), sq = leerCarga(v.sq);
            const sx = String(v.sx).trim(), malos = [];
            const fallo = (c, texto, explica) => malos.push([c, texto, explica]);
            if (p !== x.p) fallo("p", "Cuenta otra vez los protones.", "Son las bolas del núcleo que llevan +.");
            if (n !== x.n) fallo("n", "Cuenta otra vez los neutrones.", "Son las bolas lisas del núcleo, sin signo.");
            if (e !== x.e) fallo("e", "Cuenta otra vez los electrones.", `Son las bolitas de las capas: suma las de todas las capas${capas(x.e).length > 1 ? ` (${capas(x.e).join(" + ")})` : ""}.`);
            if (z !== x.p) fallo("z", "Z es el número de protones.", z === x.e ? "No el de electrones: en un ion no coinciden." : "Cuenta las bolas con + del núcleo.");
            if (a !== A) fallo("a", "A son los protones más los neutrones.", a === x.p + x.e ? "Los electrones no cuentan en el número másico." : `${x.p} + ${x.n} = ?`);
            if (q !== x.q) fallo("q", "Revisa la carga.", q === -x.q && q !== null ? `Al revés: ${x.q > 0 ? "le faltan electrones, así que hay más cargas + que −" : "le sobran electrones, así que hay más cargas − que +"}.`
              : `Compara protones y electrones: ${x.p} − ${x.e} = ${x.q}. ${x.q === 0 ? "Si son iguales, la carga es 0." : ""}`);
            if (x.n > 0 && sa === x.p && sz === A) { fallo("sa", "Están cambiados A y Z.", "Arriba a la izquierda va A (el más grande) y abajo, Z."); malos.push(["sz"]); }
            else {
              if (sa !== A) fallo("sa", "Revisa el número de arriba del símbolo.", "Arriba a la izquierda va A, el número másico.");
              if (sz !== x.p) fallo("sz", "Revisa el número de abajo del símbolo.", "Abajo a la izquierda va Z, el número atómico.");
            }
            if (sx !== x.sim) fallo("sx", sx.toLowerCase() === x.sim.toLowerCase() ? "El símbolo se escribe así: " + x.sim + "." : "Ese no es el elemento.",
              sx.toLowerCase() === x.sim.toLowerCase() ? "La primera letra va en mayúscula y la segunda, si la hay, en minúscula." : `Busca en la tabla periódica la casilla con Z = ${x.p}.`);
            if (sq !== x.q) fallo("sq", "Revisa la carga del símbolo.", x.q === 0 ? "En un átomo neutro, arriba a la derecha no se escribe nada." : `Se escribe ${textoCarga(x.q)}: primero el número (si no es 1) y después el signo.`);
            if (!malos.length) {
              const otra = /^[+−-]\d/.test(String(v.sq).trim()) ? `Está bien. Lo habitual es escribirla con el signo detrás: ${textoCarga(x.q)}.` : "";
              return { bien: true, texto: "¡Correcto!", explica: otra };
            }
            const [, texto, explica] = malos.find(m => m.length > 1);
            return resultado([...new Set(malos.map(m => m[0]))], texto, explica);
          },
          operaciones: `<p>Protones: ${x.p} → <b>Z = ${x.p}</b>, ${x.nombre}</p><p>Neutrones: ${x.n} → <b>A = ${x.p} + ${x.n} = ${A}</b></p>
            <p>Electrones: ${x.e} (${capas(x.e).join(", ")}) → ${ganaPierde(x)}</p><p>Símbolo completo: <b>${notacion(x)}</b></p>`,
        };
      },
    },

    simbolo: {
      titulo: "Del símbolo a las partículas",
      sub: "Protones, neutrones y electrones a partir de A, Z y la carga",
      pista: REGLAS,
      nuevo() {
        const x = particulaAzar(), A = x.p + x.n;
        return {
          html: `¿Cuántos protones, neutrones y electrones tiene ${notacion(x)}?`,
          trabajo: `<div class="campos">${campo("p", "Protones")}${campo("n", "Neutrones")}${campo("e", "Electrones")}</div>`,
          _ok: { p: String(x.p), n: String(x.n), e: String(x.e) },
          comprobar(v) {
            const [p, n, e] = ["p", "n", "e"].map(c => num(v[c])), mal = [];
            if (p !== x.p) mal.push("p");
            if (n !== x.n) mal.push("n");
            if (e !== x.e) mal.push("e");
            if (!mal.length) return resultado(mal);
            if (p === A) return resultado(mal, "Los protones son Z, el número de abajo.", `A (arriba) cuenta protones y neutrones juntos.`);
            if (p !== x.p) return resultado(mal, "Los protones son Z.", `Z es el número de abajo a la izquierda: ${x.p}.`);
            if (n === A) return resultado(mal, "A no son solo los neutrones.", `A cuenta protones y neutrones: neutrones = A − Z = ${A} − ${x.p}.`);
            if (n !== x.n) return resultado(mal, "Neutrones = A − Z.", `${A} − ${x.p} = ?`);
            if (x.q && e === x.p) return resultado(mal, "Es un ion: no tiene tantos electrones como protones.", `La carga ${textoCarga(x.q)} dice que ha ${x.q > 0 ? "perdido" : "ganado"} ${Math.abs(x.q)}.`);
            if (x.q && e === x.p + x.q) return resultado(mal, "Al revés.", `Con carga ${textoCarga(x.q)} ha ${x.q > 0 ? "perdido" : "ganado"} electrones: ${x.p} ${x.q > 0 ? "−" : "+"} ${Math.abs(x.q)}.`);
            return resultado(mal, "Revisa los electrones.", x.q ? `Parte de los ${x.p} protones: la carga ${textoCarga(x.q)} dice cuántos electrones ha ${x.q > 0 ? "perdido" : "ganado"}.` : "Sin carga, es un átomo neutro: tantos electrones como protones.");
          },
          operaciones: `<p>Protones = Z = <b>${x.p}</b></p><p>Neutrones = A − Z = ${A} − ${x.p} = <b>${x.n}</b></p>
            <p>Electrones: ${x.q ? `${x.p} ${x.q > 0 ? "−" : "+"} ${Math.abs(x.q)} = <b>${x.e}</b> (${ganaPierde(x)})` : `<b>${x.e}</b>, tantos como protones (átomo neutro)`}</p>
            <div class="dibujo">${atomoSVG(x)}${LEYENDA}<p class="pie-atomo">${notacion(x)} · ${tipoParticula(x)}</p></div>`,
        };
      },
    },
  };

  Repaso.tema("1pdc", "SA2", {
    bloques: { C: ["diagrama", "simbolo"] },
    actividades: acts,
  });
}
