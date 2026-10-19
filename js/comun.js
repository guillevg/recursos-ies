// Web de repaso del alumnado: utilidades, dibujos y registro de los temas.
// Cada archivo de actividades/ llama a Repaso.tema(curso, sa, { bloques, actividades }).
// Sin DOM: se carga también en Node para los tests (tests/test_alumnado.py).
"use strict";

const Repaso = {
  temas: {},   // "2eso/SA1" → { bloques: { A: [claves] }, actividades: { clave: {...} } }
  tema(curso, sa, def) { this.temas[`${curso}/${sa}`] = def; },
};

// ---------------------------------------------------------------- utilidades
const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const elegir = l => l[Math.floor(Math.random() * l.length)];
const mcd = (a, b) => b ? mcd(b, a % b) : Math.abs(a);
const mcm = (a, b) => a / mcd(a, b) * b;
const num = t => { const s = String(t).trim().replace(/\s/g, "").replace(",", ".").replace("%", "").replace("−", "-"); return s === "" ? NaN : Number(s); };
const fmt = x => { const r = Math.round(x * 1e6) / 1e6; return String(r).replace(".", ","); };
const miles = s => String(s).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const F = (n, d) => `<span class="f"><span>${n}</span><span>${d}</span></span>`;
const FIN = (idn, idd) => `<span class="fin"><input class="casilla" id="f-${idn}" inputmode="numeric" autocomplete="off" aria-label="Numerador"><i></i><input class="casilla" id="f-${idd}" inputmode="numeric" autocomplete="off" aria-label="Denominador"></span>`;
// Paréntesis altos alrededor de algo con fracciones (como \left( \right) de LaTeX).
const PF = html => `<span class="pg">(</span>${html}<span class="pg">)</span>`;
const SIGNO = op => op === "+" ? "+" : "−";
function fraccion(t) { const m = String(t).trim().match(/^(\d+)\s*\/\s*(\d+)$/); return m && +m[2] ? [+m[1], +m[2]] : null; }
function irreducible(_, b) { let n; do { n = azar(1, b - 1); } while (mcd(n, b) !== 1); return n; }


// ---------------------------------------------------------------- dibujos (SVG en texto)
// Rectángulo de cols × filas celdas. clase(j, i) da el color de cada celda;
// cortes: "v"/"h" con trazo continuo y "V"/"H" con el corte nuevo (discontinuo).
function rectSVG({ cols, filas, clase, cortes = "vh", tachadas = () => false }) {
  const W = 200, H = 130, cw = W / cols, ch = H / filas;
  let s = `<svg viewBox="-2 -2 ${W + 4} ${H + 4}" role="img">`;
  for (let j = 0; j < cols; j++) for (let i = 0; i < filas; i++) {
    s += `<rect x="${j * cw}" y="${i * ch}" width="${cw + .3}" height="${ch + .3}" class="${clase(j, i) || "c-blanco"}"/>`;
    if (tachadas(j, i)) s += `<line class="tachon" x1="${j * cw + 3}" y1="${(i + 1) * ch - 3}" x2="${(j + 1) * cw - 3}" y2="${i * ch + 3}"/>`;
  }
  const v = cortes.includes("v") ? "corte" : cortes.includes("V") ? "corte-nuevo" : null;
  const h = cortes.includes("h") ? "corte" : cortes.includes("H") ? "corte-nuevo" : null;
  if (v) for (let j = 1; j < cols; j++) s += `<line class="${v}" x1="${j * cw}" y1="0" x2="${j * cw}" y2="${H}"/>`;
  if (h) for (let i = 1; i < filas; i++) s += `<line class="${h}" x1="0" y1="${i * ch}" x2="${W}" y2="${i * ch}"/>`;
  return s + `<rect class="borde" x="0" y="0" width="${W}" height="${H}"/></svg>`;
}

// Modelo de barras de una cantidad: d trozos, n pintados; llave arriba (el
// total) y llave abajo sobre los trozos [desde, hasta); u = valor de un trozo.
function cantidadSVG({ d, n, arriba, abajo, desde, hasta, u = null }) {
  const x0 = 20, bw = 560, y = 46, h = 46, sw = bw / d;
  let s = `<svg viewBox="0 0 600 146" role="img">`;
  for (let i = 0; i < d; i++) {
    s += `<rect x="${x0 + i * sw}" y="${y}" width="${sw}" height="${h}" class="${i < n ? "c-azul" : "c-blanco"}"/>`;
    if (u !== null) s += `<text class="t-seg ${i < n ? "sobre" : ""}" x="${x0 + (i + .5) * sw}" y="${y + h / 2 + 6}">${miles(fmt(u))}</text>`;
  }
  for (let i = 1; i < d; i++) s += `<line class="corte" x1="${x0 + i * sw}" y1="${y}" x2="${x0 + i * sw}" y2="${y + h}"/>`;
  s += `<rect class="borde" x="${x0}" y="${y}" width="${bw}" height="${h}"/>`;
  const mid = x0 + bw / 2;
  s += `<path class="llave" d="M${x0},${y - 6} V${y - 14} H${x0 + bw} V${y - 6} M${mid},${y - 14} V${y - 20}"/>`;
  s += `<text class="t-llave" x="${mid}" y="${y - 26}">${arriba}</text>`;
  const x1 = x0 + desde * sw + 3, x2 = x0 + hasta * sw - 3, m2 = (x1 + x2) / 2, yb = y + h;
  s += `<path class="llave" d="M${x1},${yb + 6} V${yb + 14} H${x2} V${yb + 6} M${m2},${yb + 14} V${yb + 20}"/>`;
  s += `<text class="t-llave" x="${Math.min(Math.max(m2, 70), 530)}" y="${yb + 40}">${abajo}</text>`;
  return s + `</svg>`;
}

// ---------------------------------------------------------------- sumas y restas
// Comprueba la línea a/b ± c/d = n1/d1 ± n2/d2 = nr/dr (cualquier denominador
// común vale; se avisa si hay uno más pequeño). Devuelve el resultado de comprobar().
function revisarSuma(v, { a, b, c, d, op }) {
  const [n1, d1, n2, d2, nr, dr] = ["n1", "d1", "n2", "d2", "nr", "dr"].map(k => num(v[k]));
  const m = mcm(b, d), signo = op === "+" ? 1 : -1;
  if (nr === a + signo * c && dr === b + signo * d && op === "+")
    return { bien: false, campos: ["nr", "dr"], texto: "No se suman los denominadores.", explica: "Solo se pueden juntar trozos del mismo tamaño: primero hay que cortar las dos fracciones en trozos iguales." };
  if (d1 !== d2) return { bien: false, campos: ["d1", "d2"], texto: "Las dos fracciones tienen que tener el mismo denominador.", explica: "Así los trozos son del mismo tamaño y se pueden contar juntos." };
  if (d1 % b || d1 % d) return { bien: false, campos: ["d1", "d2"], texto: `${d1} no sirve como denominador común.`, explica: `Tiene que ser múltiplo de ${b} y de ${d} a la vez.` };
  const mal = [];
  if (n1 * b !== a * d1) mal.push("n1");
  if (n2 * d !== c * d2) mal.push("n2");
  if (mal.length) { const [x, y] = mal[0] === "n1" ? [a, b] : [c, d];
    return { bien: false, campos: mal, texto: mal.length === 2 ? "Revisa las dos fracciones equivalentes." : "Revisa la fracción equivalente.", explica: `Para pasar ${F(x, y)} a trozos de ${F(1, d1)}, multiplica arriba y abajo por el mismo número: ${d1} : ${y} = ${d1 / y}.` }; }
  if (dr !== d1) return { bien: false, campos: ["dr"], texto: "El denominador del resultado no cambia.", explica: `Son ${d1 > 0 ? "trozos de " + F(1, d1) : "los mismos trozos"}: solo se cuentan.` };
  if (nr !== n1 + signo * n2) return { bien: false, campos: ["nr"], texto: op === "+" ? "Cuenta los trozos de las dos." : "Quita los trozos de la segunda.", explica: `${n1} ${SIGNO(op)} ${n2} = ?` };
  let explica = "";
  if (d1 > m) explica += `Está bien. Con ${m} trozos también sale, y los números son más pequeños. `;
  const g = mcd(nr, dr);
  if (g > 1 && nr > 0) explica += `Se puede simplificar: ${F(nr, dr)} = ${F(nr / g, dr / g)}.`;
  return { bien: true, texto: "¡Correcto!", explica };
}

function lineaSuma(a, b, c, d, op) {
  return `<div class="linea-op">${F(a, b)}<span class="op">${SIGNO(op)}</span>${F(c, d)}<span class="op">=</span>${FIN("n1", "d1")}<span class="op">${SIGNO(op)}</span>${FIN("n2", "d2")}<span class="op">=</span>${FIN("nr", "dr")}</div>`;
}

function generarSuma(pares) {
  let [b, d] = elegir(pares);
  if (Math.random() < .5) [b, d] = [d, b];
  let a = irreducible(1, b), c = irreducible(1, d), op = Math.random() < .5 ? "+" : "-";
  if (op === "-" && a * d < c * b) [a, b, c, d] = [c, d, a, b];
  const m = mcm(b, d), A = a * m / b, B = c * m / d, R = op === "+" ? A + B : A - B;
  return { a, b, c, d, op, m, A, B, R };
}

function cierreSuma(R, m) {
  const g = mcd(R, m);
  let s = `${F(R, m)}`;
  if (g > 1) s += ` = ${F(R / g, m / g)}`;
  if (R > m && R % m) s += ` (${Math.floor(R / m)} entero y ${F(R % m, m)})`;
  return s;
}

// ---------------------------------------------------------------- números racionales y otras ayudas
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = mcd(Math.abs(n), d) || 1; return { n: n / g, d: d / g }; };
const qSum = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const qRes = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const qMul = (x, y) => Q(x.n * y.n, x.d * y.d);
const qDiv = (x, y) => Q(x.n * y.d, x.d * y.n);
const qF = x => x.d === 1 ? `${x.n < 0 ? "−" : ""}${Math.abs(x.n)}` : `${x.n < 0 ? "−" : ""}${F(Math.abs(x.n), x.d)}`;
const qIgual = (x, n, d) => d !== 0 && Number.isFinite(n) && Number.isFinite(d) && x.n * d === n * x.d;
const fracAzar = (maxD = 6) => { const d = azar(2, maxD); return Q(irreducible(0, d), d); };
const sg = n => n < 0 ? `−${-n}` : `${n}`;            // entero suelto
const ent = n => n < 0 ? `(−${-n})` : `${n}`;         // entero dentro de una expresión
const NUM = (id, clase = "") => `<input class="casilla num ${clase}" id="f-${id}" inputmode="numeric" autocomplete="off" aria-label="Respuesta">`;
const SELECT = (id, opciones) => `<select class="casilla" id="f-${id}"><option value="">Elige…</option>${opciones.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>`;
const pot = (b, e) => `${b}<sup>${e}</sup>`;
// Nota de simplificación de una respuesta en forma de fracción ya comprobada como correcta.
// Texto plano de un trozo de HTML de los ejercicios (fracciones como a/b), para
// pasarlo en la dirección a las herramientas paso a paso.
function textoPlano(html) {
  return html.replace(/<span class="f"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, "$1/$2")
    .replace(/<sup>([^<]*)<\/sup>/g, "^$1").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function notaSimplificar(n, d) { const g = mcd(n, d); return g > 1 ? `Está bien. Simplificada: ${F(n, d)} = ${qF(Q(n, d))}.` : ""; }

// Recta doble: porcentajes arriba y cantidades abajo. Marca 0, la referencia
// (100 %, o 1 % si el porcentaje es menor que 1) y el porcentaje p.
function rectaDobleSVG({ p, N, r, incognita, resuelto }) {
  const peq = p < 1, maxP = peq ? 1 : Math.max(100, p), ref = peq ? 1 : 100;
  const x = q => 40 + 520 * q / maxP, y1 = 52, y2 = 108;
  let s = `<svg viewBox="0 0 600 168" role="img"><line class="eje" x1="40" y1="${y1}" x2="560" y2="${y1}"/><line class="eje" x1="40" y1="${y2}" x2="560" y2="${y2}"/>`;
  const paso = peq ? .1 : maxP > 300 ? 50 : 10;
  for (let i = 0; i * paso <= maxP + 1e-9; i++) { const q = i * paso; s += `<line class="corte" x1="${x(q)}" y1="${y1 - 5}" x2="${x(q)}" y2="${y1 + 5}"/><line class="corte" x1="${x(q)}" y1="${y2 - 5}" x2="${x(q)}" y2="${y2 + 5}"/>`; }
  const marca = (q, arriba, abajo, lejos) => {
    s += `<line class="guia" x1="${x(q)}" y1="${y1}" x2="${x(q)}" y2="${y2}"/>`;
    s += `<text class="t-llave" x="${x(q)}" y="${y1 - (lejos ? 34 : 14)}">${arriba}</text><text class="t-llave" x="${x(q)}" y="${y2 + (lejos ? 50 : 28)}">${abajo}</text>`;
  };
  marca(0, "0 %", "0", false);
  marca(ref, `${ref} %`, miles(fmt(peq ? N / 100 : N)), false);
  const cerca = Math.min(Math.abs(x(p) - x(0)), Math.abs(x(p) - x(ref))) < 70;
  marca(p, incognita === "p" && !resuelto ? "? %" : `${fmt(p)} %`, incognita === "r" && !resuelto ? "?" : miles(fmt(r)), cerca);
  return s + `</svg>`;
}

// Barra de N unidades partidas en b trozos; grupos de a trozos alternando colores.
function vasosSVG({ N, b, a, unidad }) {
  const W = 560, celdas = N * b, cw = W / celdas, H = 40;
  let s = `<svg viewBox="-2 -2 ${W + 4} ${H + 30}" role="img">`;
  for (let i = 0; i < celdas; i++) s += `<rect x="${i * cw}" y="0" width="${cw + .3}" height="${H}" class="${Math.floor(i / a) % 2 ? "c-naranja" : "c-azul"}"/>`;
  for (let i = 1; i < celdas; i++) s += `<line class="${i % b ? "corte-nuevo" : "corte"}" x1="${i * cw}" y1="0" x2="${i * cw}" y2="${H}"/>`;
  for (let k = 0; k < N; k++) s += `<text class="t-seg" x="${(k + .5) * b * cw}" y="${H + 22}">1 ${unidad}</text>`;
  return s + `<rect class="borde" x="0" y="0" width="${W}" height="${H}"/></svg>`;
}

function opsPorcentaje(p, N, r) {
  const P = fmt(p), R = `<b>${miles(fmt(r))}</b>`, L = [];
  if (p === 50) L.push(`El 50 % es la mitad: ${miles(N)} : 2 = ${R}`);
  else if (p === 25) L.push(`El 25 % es la cuarta parte: ${miles(N)} : 4 = ${R}`);
  else if (p === 75) L.push(`El 25 % es la cuarta parte: ${miles(N)} : 4 = ${miles(fmt(N / 4))}`, `El 75 % son tres veces el 25 %: 3 · ${miles(fmt(N / 4))} = ${R}`);
  else if (p < 1) L.push(`1 % de ${miles(N)} = ${miles(N)} : 100 = ${miles(fmt(N / 100))}`, `El ${P} % es ${P} veces el 1 %: ${P} · ${miles(fmt(N / 100))} = ${R}`);
  else {
    const h = Math.floor(p / 100), t = Math.floor(p % 100 / 10), u = p % 10, partes = [], valores = [];
    if (h) { L.push(`100 % de ${miles(N)} = ${miles(N)}`); partes.push(`${h * 100} %`); valores.push(miles(fmt(h * N))); }
    if (t) { L.push(`10 % de ${miles(N)} = ${miles(N)} : 10 = ${miles(fmt(N / 10))}`); partes.push(`${t * 10} %`); valores.push(miles(fmt(t * N / 10))); }
    if (u) { L.push(`1 % de ${miles(N)} = ${miles(N)} : 100 = ${miles(fmt(N / 100))}`); partes.push(`${u} %`); valores.push(miles(fmt(u * N / 100))); }
    if (partes.length > 1) L.push(`${P} % = ${partes.join(" + ")} → ${valores.join(" + ")} = ${R}`);
    else { const [k, base] = h ? [h, N] : t ? [t, N / 10] : [u, N / 100]; if (k === 1) L[L.length - 1] = L[L.length - 1].replace(/= ([^=]+)$/, "= <b>$1</b>"); else L.push(`${P} % = ${k} · ${partes[0].replace(/^\d+/, m => m / k)} → ${k} · ${miles(fmt(base))} = ${R}`); }
  }
  return L.map(l => `<p>${l}</p>`).join("");
}


if (typeof module !== "undefined") module.exports = { Repaso };
