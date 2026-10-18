// Jerarquía de las operaciones, paso a paso: se lee una expresión con
// enteros, decimales y fracciones, y se resuelve operación a operación
// (primero los paréntesis, después multiplicaciones y divisiones, después
// sumas y restas, y de izquierda a derecha), con números exactos. También
// calcula lo que saldría operando de izquierda a derecha sin respetar la
// jerarquía, para comparar. Sin dibujo: lo muestra jerarquia.html.
"use strict";

const Jerarquia = (() => {
  // ------------------------------------------------------- números exactos
  const mcd = (x, y) => y === 0n ? (x < 0n ? -x : x) : mcd(y, x % y);
  function Q(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error("división entre 0");
    if (d < 0n) { n = -n; d = -d; }
    const g = mcd(n, d) || 1n;
    return { n: n / g, d: d / g };
  }
  const op = {
    "+": (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d),
    "−": (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d),
    "·": (a, b) => Q(a.n * b.n, a.d * b.d),
    ":": (a, b) => Q(a.n * b.d, a.d * b.n),
  };
  // Decimal exacto si el denominador solo tiene 2 y 5 (y pocas cifras).
  function comoDecimal(q) {
    let d = q.d, k = 0n;
    while (d % 2n === 0n) { d /= 2n; k++; }
    let j = 0n; while (d % 5n === 0n) { d /= 5n; j++; }
    if (d !== 1n) return null;
    const cifras = k > j ? k : j;
    if (cifras > 4n) return null;
    const escala = 10n ** cifras, m = q.n * escala / q.d, neg = m < 0n, a = (neg ? -m : m).toString().padStart(Number(cifras) + 1, "0");
    const ent = a.slice(0, a.length - Number(cifras)), dec = a.slice(a.length - Number(cifras)).replace(/0+$/, "");
    return (neg ? "−" : "") + ent + (dec ? "," + dec : "");
  }

  // --------------------------------------------------------------- lectura
  // Tokens: números («12», «2,5», «3/4» como fracción), + − · : y paréntesis.
  function tokens(texto) {
    if (/\d[\s]+[\d(]|\)\s*[\d(]/.test(texto)) throw new Error("Falta una operación entre dos números (o entre un número y un paréntesis).");
    const s = texto.replace(/\s+/g, "").replace(/[*×x]/g, "·").replace(/÷/g, ":").replace(/-/g, "−");
    const out = [];
    let i = 0;
    while (i < s.length) {
      const m = s.slice(i).match(/^(\d+)(?:[,.](\d+))?(?:\/(\d+))?/);
      if (m) {
        if (m[2] !== undefined && m[3] !== undefined) throw new Error("Una fracción no puede tener decimales: escribe 5/2 en vez de 2,5/1.");
        let v, txt = m[0].replace(".", ",");
        if (m[3] !== undefined) { if (m[3] === "0") throw new Error("Hay una fracción con denominador 0."); v = Q(m[1], m[3]); }
        else if (m[2] !== undefined) v = Q(m[1] + m[2], 10n ** BigInt(m[2].length));
        else v = Q(m[1]);
        out.push({ t: "num", v, txt, fraccion: m[3] !== undefined });
        i += m[0].length;
      } else if ("+−·:".includes(s[i])) { out.push({ t: s[i] }); i++; }
      else if ("([{".includes(s[i])) { out.push({ t: "(", forma: s[i] }); i++; }
      else if (")]}".includes(s[i])) { out.push({ t: ")", forma: s[i] }); i++; }
      else throw new Error(`No entiendo «${s[i]}». Usa números, + − · : y paréntesis.`);
    }
    return out;
  }

  // Árbol: { tipo: "num", v, txt } | { tipo: "op", op, izq, der } | { tipo: "par", dentro }.
  function leer(texto) {
    const ts = tokens(texto);
    let i = 0;
    const ver = () => ts[i] && ts[i].t;
    function expr() {
      let n = term();
      while (ver() === "+" || ver() === "−") { const o = ts[i++].t; n = { tipo: "op", op: o, izq: n, der: term() }; }
      return n;
    }
    function term() {
      let n = factor();
      while (ver() === "·" || ver() === ":") { const o = ts[i++].t; n = { tipo: "op", op: o, izq: n, der: factor() }; }
      return n;
    }
    function factor() {
      const t = ts[i++];
      if (!t) throw new Error("Falta un número al final.");
      if (t.t === "num") return { tipo: "num", v: t.v, txt: t.txt, fraccion: t.fraccion };
      if (t.t === "−") {   // número negativo: −3 o −(…)
        const f = factor();
        if (f.tipo === "num") return { tipo: "num", v: Q(-f.v.n, f.v.d), txt: "−" + f.txt, fraccion: f.fraccion };
        return { tipo: "op", op: "·", izq: { tipo: "num", v: Q(-1), txt: "−1" }, der: f };
      }
      if (t.t === "(") {
        const d = expr();
        if (ver() !== ")") throw new Error("Falta cerrar un paréntesis.");
        const cierra = ts[i++].forma;
        if ({ "(": ")", "[": "]", "{": "}" }[t.forma] !== cierra) throw new Error(`El ${t.forma} se cierra con ${cierra}: no coinciden.`);
        return { tipo: "par", dentro: d, forma: t.forma };
      }
      throw new Error(`Sobra «${t.t}» o falta un número.`);
    }
    const arbol = expr();
    if (i < ts.length) throw new Error(ts[i].t === ")" ? "Sobra un paréntesis de cierre." : "Falta una operación entre dos números.");
    return arbol;
  }

  // ------------------------------------------------------------- resolución
  // Un número, o un número entre paréntesis (como «(−3)»).
  const listo = n => n.tipo === "num" || (n.tipo === "par" && n.dentro.tipo === "num");
  const valor = n => n.tipo === "num" ? n.v : n.dentro.v;
  const esFraccion = n => (n.tipo === "num" ? n : n.dentro).fraccion;
  // Operaciones que se pueden hacer ya (sus dos lados son números), con su
  // profundidad de paréntesis y su orden de izquierda a derecha.
  function candidatas(n, prof = 0, camino = [], out = []) {
    if (n.tipo === "op") {
      candidatas(n.izq, prof, [...camino, "izq"], out);
      if (listo(n.izq) && listo(n.der)) out.push({ camino, prof, op: n.op, orden: out.length });
      candidatas(n.der, prof, [...camino, "der"], out);
    } else if (n.tipo === "par") candidatas(n.dentro, prof + 1, [...camino, "dentro"], out);
    return out;
  }
  const en = (n, camino) => camino.reduce((x, k) => x[k], n);
  function sustituir(n, camino, nuevo) {
    if (!camino.length) return nuevo;
    const [k, ...resto] = camino;
    return { ...n, [k]: sustituir(n[k], resto, nuevo) };
  }
  // Quita los paréntesis que solo encierran un número positivo.
  function limpiar(n) {
    if (n.tipo === "op") return { ...n, izq: limpiar(n.izq), der: limpiar(n.der) };
    if (n.tipo === "par") {
      const d = limpiar(n.dentro);
      if (d.tipo === "par") return d;   // ((x)) → (x)
      return d.tipo === "num" && d.v.n >= 0n ? d : { ...n, dentro: d };
    }
    return n;
  }
  const escribirQ = q => q.d === 1n ? (q.n < 0n ? "−" + (-q.n) : String(q.n)) : (q.n < 0n ? "−" : "") + (q.n < 0n ? -q.n : q.n) + "/" + q.d;
  // Operaciones que quedan fuera de los paréntesis.
  function fuera(n) {
    const c = [];
    (function rec(m) { if (m.tipo === "op") { c.push(m.op); rec(m.izq); rec(m.der); } })(n);
    return c;
  }

  function resolver(texto) {
    let arbol;
    try { arbol = leer(texto); } catch (e) { return { error: e.message }; }
    const pasos = [];
    let n = arbol;
    try {
      for (let k = 0; n.tipo !== "num"; k++) {
        if (k >= 11) return { error: "Hay demasiadas operaciones para verlas paso a paso (como mucho, 11)." };
        if (n.tipo === "par") { n = n.dentro; continue; }
        const cs = candidatas(n);
        if (!cs.length) throw new Error("sin operaciones");
        const maxProf = Math.max(...cs.map(c => c.prof));
        const elegida = cs.filter(c => c.prof === maxProf).sort((a, b) => a.orden - b.orden)[0];
        const nodo = en(n, elegida.camino);
        const a = valor(nodo.izq), b = valor(nodo.der), v = op[nodo.op](a, b);
        const resto = fuera(n), mult = nodo.op === "·" || nodo.op === ":";
        const porque = elegida.prof > 0 ? "parentesis"
          : mult && resto.some(o => o === "+" || o === "−") ? "prioridad"
          : resto.filter(o => (o === "·" || o === ":") === mult).length > 1 ? "izquierda" : "unica";
        // El resultado se escribe como fracción si se operaba con fracciones.
        const fraccion = v.d !== 1n && (esFraccion(nodo.izq) || esFraccion(nodo.der) || comoDecimal(v) === null);
        const txt = v.d === 1n ? escribirQ(v) : fraccion ? escribirQ(v) : comoDecimal(v);
        const tx = m => (m.tipo === "num" ? m : m.dentro).txt;
        pasos.push({ arbol: n, camino: elegida.camino, op: nodo.op, a, b, resultado: v, porque, ta: tx(nodo.izq), tb: tx(nodo.der), tr: txt });
        // Un resultado negativo dentro de la expresión va entre paréntesis.
        const nuevo = { tipo: "num", v, fraccion, txt };
        const yaEntreParentesis = elegida.camino.at(-1) === "dentro";
        n = limpiar(sustituir(n, elegida.camino, v.n < 0n && elegida.camino.length && !yaEntreParentesis ? { tipo: "par", dentro: nuevo } : nuevo));
      }
    } catch (e) { return { error: /división/.test(e.message) ? "Hay una división entre 0." : "No sé resolver esta expresión: revisa cómo está escrita." }; }
    return { arbol, pasos, resultado: n.v, alReves: izquierdaADerecha(arbol) };
  }

  // Operando de izquierda a derecha, sin jerarquía (pero sí con paréntesis):
  // el error típico que se quiere mostrar.
  function izquierdaADerecha(n) {
    try {
      const plano = m => {
        if (m.tipo === "num") return [m.v];
        if (m.tipo === "par") return [valorIaD(m.dentro)];
        return [...plano(m.izq), m.op, ...plano(m.der)];
      };
      const valorIaD = m => { const l = plano(m); let v = l[0]; for (let k = 1; k < l.length; k += 2) v = op[l[k]](v, l[k + 1]); return v; };
      return valorIaD(n);
    } catch (e) { return null; }
  }

  const calcular = { resolver: ({ expresion }) => resolver(expresion) };

  const EJEMPLOS = {
    resolver: [
      { etiqueta: "8 − 4 · (−3) + 5", expresion: "8 - 4 · (-3) + 5", texto: "Calcula, respetando la jerarquía de las operaciones." },
      { etiqueta: "[(−7 + 3) · (−5)] − 18 : (−2)", expresion: "[(-7 + 3) · (-5)] - 18 : (-2)", texto: "Calcula, respetando la jerarquía de las operaciones." },
      { etiqueta: "1/2 + 2/3 · 3/4", expresion: "1/2 + 2/3 · 3/4", texto: "Calcula respetando la jerarquía de las operaciones." },
      { etiqueta: "(1/2 + 2/3) · 3/4", expresion: "(1/2 + 2/3) · 3/4", texto: "Calcula y compara con el anterior." },
      { etiqueta: "El error de Nerea", expresion: "2/3 + 1/3 · 3/2", texto: "Nerea calcula 2/3 + 1/3 = 1 y después 1 · 3/2 = 3/2. ¿Es correcto?" },
      { etiqueta: "2,5 · (1,2 − 0,8) + 0,3 : 0,1", expresion: "2,5 · (1,2 - 0,8) + 0,3 : 0,1", texto: "Calcula con decimales, respetando la jerarquía." },
    ],
  };

  function azar(_, r = Math.random) {
    const ent = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const n = () => { const v = ent(-9, 12); return v < 0 ? `(−${-v})` : String(v || 2); };
    const plantillas = [
      () => `${n()} + ${n()} · ${n()}`,
      () => `${n()} − ${ent(2, 9) * 2} : ${n().replace(/^0$/, "2")}`.replace(": 0", ": 2"),
      () => `(${n()} + ${n()}) · ${n()} − ${n()}`,
      () => `${n()} · ${n()} − ${n()} · ${n()}`,
      () => `[${n()} − (${n()} + ${n()})] · ${n()}`,
    ];
    for (;;) { const e = plantillas[ent(0, plantillas.length - 1)](); if (!resolver(e).error) return { expresion: e }; }
  }

  return { calcular, EJEMPLOS, azar, leer, resolver, comoDecimal, escribirQ };
})();

if (typeof module !== "undefined") module.exports = Jerarquia;
