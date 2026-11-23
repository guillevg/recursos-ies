// Actividades de repaso de la SA4 de 2º ESO (El lenguaje de las incógnitas).
// Mismo formato que 2eso_SA1.js. Números al azar; nunca los de la prueba
// escrita (3x + 7 = x + 19; 4(x − 2) − (x − 5) y 3x − 3; (x + 1)/2 − (x − 3)/3 = 2;
// coches y motos con 25 vehículos y 80 ruedas) ni los de la evaluación inicial
// (3x − 2 y x² + 1 con x = 4); tampoco los destacados del banco que se trabajan
// en clase (cromos 36 con el triple, consecutivos que suman 63, x/2 + x/3 = 10).
"use strict";

{
  const X = "<i>x</i>", Y = "<i>y</i>";
  const resultado = (mal, texto, explica) => mal.length ? { bien: false, campos: mal, texto, explica } : { bien: true, texto: "¡Correcto!", explica: "" };
  const mezclar = l => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const masMenos = b => b < 0 ? `− ${-b}` : `+ ${b}`;
  // a·x: «x», «−x», «3x», «−3x».
  const tx = (a, v = X) => a === 1 ? v : a === -1 ? `−${v}` : `${sg(a)}${v}`;
  // ax + b con los signos bien puestos (sin a, solo el número).
  const lin = (a, b, v = X) => !a ? sg(b) : tx(a, v) + (b ? ` ${masMenos(b)}` : "");
  const ec = (izq, der) => `<span class="expr">${izq} = ${der}</span>`;
  // Casilla que admite negativos: el teclado numérico del móvil no siempre trae el menos.
  const CAS = (id, etiqueta) => `<input class="casilla num" id="f-${id}" inputmode="text" autocomplete="off" aria-label="${etiqueta}">`;
  const unaX = `<div class="linea-op">${X}<span class="op">=</span>${CAS("x", "Solución")}</div>`;
  const campo = (id, etiqueta) => `<div class="campo"><label for="f-${id}">${etiqueta}</label><input class="casilla" id="f-${id}" inputmode="text" autocomplete="off"></div>`;
  const campos = (...l) => `<div class="campos centrado">${l.map(([id, e]) => campo(id, e)).join("")}</div>`;
  const vfmt = v => fmt(v).replace(/^-/, "−");
  const P = l => l.map(x => `<p>${x}</p>`).join("");
  // Opciones al azar para ELEGIR: devuelve [opciones, valor de la correcta].
  function opciones(correcta, otras) {
    const l = mezclar([correcta, ...otras]);
    return [l.map((t, i) => [String(i), t]), String(l.indexOf(correcta))];
  }
  // Con el valor que ha puesto, cuánto vale cada miembro (para que vea que no se igualan).
  function sustituir(V, L, R) {
    if (!Number.isFinite(V)) return "Escribe un número.";
    return `Con ${X} = ${vfmt(V)}, el primer miembro vale ${vfmt(L(V))} y el segundo ${vfmt(R(V))}: no son iguales.`;
  }

  // ------------------------------------------------------------ dibujo de la balanza
  // a cajas y b pesas a la izquierda; c cajas y d pesas a la derecha (como ecuaciones.html).
  function balanzaSVG({ a, b, c, d }, x = null) {
    const filas = (n, k) => Math.ceil(n / k);
    const alto = Math.max(44, ...[[a, b], [c, d]].map(([cj, ps]) => Math.max(filas(cj, 3) * 44, filas(ps, 5) * 19)));
    const yp = 10 + alto;
    let s = `<svg viewBox="0 0 600 ${yp + 92}" role="img" aria-label="Balanza equilibrada: ${a} cajas y ${b} pesas en un platillo; ${c} cajas y ${d} pesas en el otro">`;
    s += `<rect class="bal-hierro" x="145" y="${yp + 26}" width="310" height="7" rx="2"/>`;
    s += `<polygon class="bal-pie" points="300,${yp + 30} 276,${yp + 84} 324,${yp + 84}"/><rect class="bal-hierro" x="255" y="${yp + 84}" width="90" height="6" rx="2"/>`;
    [[150, a, b], [450, c, d]].forEach(([xc, cj, ps]) => {
      const x0 = xc - 120;
      s += `<rect class="bal-hierro" x="${xc - 3}" y="${yp + 4}" width="6" height="24"/><rect class="bal-hierro" x="${x0}" y="${yp}" width="240" height="6" rx="2"/>`;
      for (let i = 0; i < cj; i++) {
        const bx = x0 + 6 + (i % 3) * 44, by = yp - 42 - Math.floor(i / 3) * 44;
        s += `<rect class="c-azul caja" x="${bx}" y="${by}" width="40" height="40" rx="4"/><text class="t-seg" x="${bx + 20}" y="${by + 26}">${x === null ? "?" : x}</text>`;
      }
      const xp = x0 + 6 + Math.min(cj, 3) * 44 + (cj ? 6 : 0);
      for (let i = 0; i < ps; i++) {
        const cx = xp + 10 + (i % 5) * 19, cy = yp - 10 - Math.floor(i / 5) * 19;
        s += `<circle class="pesa" cx="${cx}" cy="${cy}" r="8.5"/><text class="t-pesa" x="${cx}" y="${cy + 4}">1</text>`;
      }
    });
    return s + `</svg>`;
  }

  // ------------------------------------------------------------ ecuaciones al azar
  // Cada tipo devuelve { izq, der, x, L, R, pasos } (L y R: los dos miembros como funciones).
  const ECUACIONES = {
    unpaso() {
      const forma = azar(1, 4);
      if (forma === 1) { const x = azar(-5, 15), b = azar(2, 15), c = x + b;
        return { izq: lin(1, b), der: sg(c), x, L: v => v + b, R: () => c, pasos: [`Restamos ${b} en los dos miembros: ${lin(1, b)} − ${b} = ${sg(c)} − ${b}`, `${X} = <b>${sg(x)}</b>`] }; }
      if (forma === 2) { const x = azar(2, 20), b = azar(2, 15), c = x - b;
        return { izq: lin(1, -b), der: sg(c), x, L: v => v - b, R: () => c, pasos: [`Sumamos ${b} en los dos miembros: ${lin(1, -b)} + ${b} = ${sg(c)} + ${b}`, `${X} = <b>${sg(x)}</b>`] }; }
      if (forma === 3) { const a = azar(2, 9), x = elegir([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]), c = a * x;
        return { izq: tx(a), der: sg(c), x, L: v => a * v, R: () => c, pasos: [`Dividimos los dos miembros entre ${a}: ${X} = ${sg(c)} : ${a}`, `${X} = <b>${sg(x)}</b>`] }; }
      const a = azar(2, 8), c = elegir([-4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]), x = a * c;
      return { izq: F(X, a), der: sg(c), x, L: v => v / a, R: () => c, pasos: [`Multiplicamos los dos miembros por ${a}: ${X} = ${sg(c)} · ${a}`, `${X} = <b>${sg(x)}</b>`] };
    },
    dospasos() {
      const x = azar(-6, 12), b = elegir([-1, 1]) * azar(1, 15);
      if (Math.random() < .7) {
        const a = azar(2, 8), c = a * x + b;
        return { izq: lin(a, b), der: sg(c), x, L: v => a * v + b, R: () => c,
          pasos: [`${b > 0 ? "Restamos" : "Sumamos"} ${Math.abs(b)} en los dos miembros: ${tx(a)} = ${sg(c - b)}`, `Dividimos entre ${a}: ${X} = ${sg(c - b)} : ${a} = <b>${sg(x)}</b>`] };
      }
      const a = azar(2, 6), t = elegir([-3, -2, -1, 1, 2, 3, 4, 5]), xx = a * t, c = t + b;
      return { izq: `${F(X, a)} ${masMenos(b)}`, der: sg(c), x: xx, L: v => v / a + b, R: () => c,
        pasos: [`${b > 0 ? "Restamos" : "Sumamos"} ${Math.abs(b)} en los dos miembros: ${F(X, a)} = ${sg(t)}`, `Multiplicamos por ${a}: ${X} = ${sg(t)} · ${a} = <b>${sg(xx)}</b>`] };
    },
    doslados() {
      let a, b, c, d, x;
      do { a = azar(2, 7); c = azar(1, 6); x = azar(-6, 10); b = azar(-12, 12); d = a * x + b - c * x; }
      while (a === c || (a === 3 && b === 7 && c === 1 && d === 19) || Math.abs(d) > 40);
      const k = a - c;
      return { izq: lin(a, b), der: lin(c, d), x, L: v => a * v + b, R: v => c * v + d,
        pasos: [`${c > 0 ? "Restamos" : "Sumamos"} ${tx(Math.abs(c))} en los dos miembros: ${lin(k, b)} = ${sg(d)}`,
                ...(b ? [`${b > 0 ? "Restamos" : "Sumamos"} ${Math.abs(b)} en los dos miembros: ${tx(k)} = ${sg(d - b)}`] : []),
                k === 1 ? `${X} = <b>${sg(x)}</b>` : `Dividimos entre ${k}: ${X} = ${sg(d - b)} : ${ent(k)} = <b>${sg(x)}</b>`] };
    },
    parentesis() {
      if (Math.random() < .5) {
        let a, b, x, c;
        do { a = azar(2, 6); b = elegir([-1, 1]) * azar(1, 8); x = azar(-5, 10); c = a * (x + b); } while (x + b === 0);
        return { izq: `${a}(${lin(1, b)})`, der: sg(c), x, L: v => a * (v + b), R: () => c,
          pasos: [`Quitamos el paréntesis: ${lin(a, a * b)} = ${sg(c)}`, `${a * b > 0 ? "Restamos" : "Sumamos"} ${Math.abs(a * b)}: ${tx(a)} = ${sg(c - a * b)}`, `Dividimos entre ${a}: ${X} = <b>${sg(x)}</b>`] };
      }
      // e − (x − b) = cx + d → e − x + b = cx + d
      let e, b, c, x, d;
      do { e = azar(2, 15); b = azar(1, 9); c = azar(1, 4); x = azar(-4, 8); d = e + b - x - c * x; } while (Math.abs(d) > 30);
      const k = c + 1;
      return { izq: `${e} − (${lin(1, -b)})`, der: lin(c, d), x, L: v => e - (v - b), R: v => c * v + d,
        pasos: [`Quitamos el paréntesis; el menos de delante cambia los dos signos: ${e} − ${X} + ${b} = ${lin(c, d)}`, `Juntamos: ${lin(-1, e + b)} = ${lin(c, d)}`,
                `Sumamos ${X} y restamos ${sg(d)} en los dos miembros: ${sg(e + b)} − ${ent(d)} = ${tx(c)} + ${X}, es decir, ${sg(e + b - d)} = ${tx(k)}`, `Dividimos entre ${k}: ${X} = <b>${sg(x)}</b>`] };
    },
    denominadores() {
      const forma = azar(1, 3);
      if (forma === 3) {
        const a = azar(2, 6), b = elegir([-1, 1]) * azar(1, 9), c = elegir([-3, -2, -1, 1, 2, 3, 4, 5, 6]), x = a * c - b;
        return { izq: F(lin(1, b), a), der: sg(c), x, L: v => (v + b) / a, R: () => c,
          pasos: [`Multiplicamos los dos miembros por ${a}: ${lin(1, b)} = ${sg(a * c)}`, `${b > 0 ? "Restamos" : "Sumamos"} ${Math.abs(b)}: ${X} = <b>${sg(x)}</b>`] };
      }
      let a, b, t, x, c, m;
      do { [a, b] = elegir([[2, 3], [2, 5], [3, 4], [2, 4], [3, 6], [4, 6], [2, 6], [4, 5]]); m = mcm(a, b); t = azar(1, 5); x = m * t;
        c = forma === 1 ? x / a + x / b : x / a - x / b; } while (forma === 1 && a === 2 && b === 3 && c === 10);
      const p = m / a, q = m / b, s = forma === 1 ? "+" : "−", k = forma === 1 ? p + q : p - q;
      return { izq: `${F(X, a)} ${s} ${F(X, b)}`, der: sg(c), x, L: v => forma === 1 ? v / a + v / b : v / a - v / b, R: () => c,
        pasos: [`Multiplicamos los dos miembros por ${m}, el mínimo común múltiplo de ${a} y ${b}: ${tx(p)} ${s} ${tx(q)} = ${sg(m * c)}`, `${tx(k)} = ${sg(m * c)}`, k === 1 ? `${X} = <b>${sg(x)}</b>` : `Dividimos entre ${k}: ${X} = <b>${sg(x)}</b>`] };
    },
  };

  const NOMBRES = [["Ana", "Leo"], ["Nayra", "Aday"], ["Sara", "Iván"], ["Ruth", "Omar"], ["Carla", "Pablo"], ["Lucía", "Acerina"]];
  const VECES = { 2: "el doble", 3: "el triple", 4: "el cuádruple" };

  Repaso.tema("2eso", "SA4", {
    bloques: {
      A: ["valor", "traducir"],
      B: ["modelizar"],
      C: ["equivalentes", "reducir"],
      D: ["balanza", "resolver", "problemas"],
      E: ["sistemas"],
      F: ["solucion", "error"],
    },
    actividades: {
      valor: {
        titulo: "Valor numérico",
        sub: "Cambiar la letra por un número",
        pista: "Escribe la expresión cambiando la letra por el número, entre paréntesis si es negativo. Después calcula respetando la jerarquía: primero las potencias, luego los productos y al final las sumas y restas.",
        nuevo() {
          let tipo, x, a, b;
          do { tipo = elegir(["lineal", "lineal", "cuadrado", "parentesis"]); x = elegir([-4, -3, -2, -1, 2, 3, 4, 5, 6]); a = azar(2, 6); b = elegir([-1, 1]) * azar(1, 9); }
          while ((tipo === "lineal" && a === 3 && x === 4 && (b === -2 || b === 5)) || (tipo === "cuadrado" && x === 4 && b === 1) || (tipo === "parentesis" && x + b === 0));
          let expr, sust, medio, v, trampas = [];
          if (tipo === "lineal") {
            expr = lin(a, b); v = a * x + b;
            sust = `${a} · ${ent(x)} ${masMenos(b)}`; medio = `${sg(a * x)} ${masMenos(b)}`;
            if (x < 0) trampas.push([a * -x + b, `Cuidado con el signo: ${X} vale ${sg(x)}.`, `${a} · ${ent(x)} = ${sg(a * x)}`]);
          } else if (tipo === "cuadrado") {
            expr = `${X}<sup>2</sup> ${masMenos(b)}`; v = x * x + b;
            sust = `${ent(x)}<sup>2</sup> ${masMenos(b)}`; medio = `${x * x} ${masMenos(b)}`;
            if (x < 0) trampas.push([-x * x + b, "Un número negativo al cuadrado da positivo.", `${ent(x)}<sup>2</sup> = ${ent(x)} · ${ent(x)} = ${x * x}`]);
            trampas.push([2 * x + b, `${X}<sup>2</sup> es ${X} · ${X}, no 2 · ${X}.`, `${ent(x)}<sup>2</sup> = ${x * x}`]);
          } else {
            expr = `${a}(${lin(1, b)})`; v = a * (x + b);
            sust = `${a} · (${sg(x)} ${masMenos(b)})`; medio = `${a} · ${ent(x + b)}`;
            trampas.push([a * x + b, "El número de fuera multiplica a todo el paréntesis.", `Primero el paréntesis: ${sg(x)} ${masMenos(b)} = ${sg(x + b)}`]);
          }
          return {
            html: `Calcula el valor numérico de la expresión cuando ${X} = ${sg(x)}. <span class="expr">${expr}</span>`,
            trabajo: `<div class="linea-op"><span>Valor</span><span class="op">=</span>${CAS("v", "Valor")}</div>`,
            _ok: { v: String(v) },
            comprobar(r) {
              const V = num(r.v);
              if (V === v) return resultado([]);
              const t = trampas.find(([w]) => w === V && w !== v);
              return t ? resultado(["v"], t[1], t[2]) : resultado(["v"], "Todavía no.", `Escribe primero la expresión con ${ent(x)} en lugar de ${X}.`);
            },
            operaciones: `<p>${sust} = ${medio} = <b>${sg(v)}</b></p>`,
          };
        },
      },

      traducir: {
        titulo: "Del texto a la expresión",
        sub: "Elige la expresión que dice lo mismo",
        pista: "Lee la frase despacio y busca la operación que se hace la última: si es «el doble de la suma», primero se suma y después se multiplica, y hace falta un paréntesis.",
        nuevo() {
          let n, frase, bien, otras;
          do { n = azar(2, 9);
          const FRASES = [
            [`el doble de un número más ${n}`, `2${X} + ${n}`, [[`2(${X} + ${n})`, "Esa es el doble de la suma: ahí se suma primero."], [`${X}<sup>2</sup> + ${n}`, `«El doble» es por 2, no al cuadrado.`], [`${X} + 2 + ${n}`, "«El doble» es multiplicar por 2, no sumar 2."]]],
            [`el doble de la suma de un número y ${n}`, `2(${X} + ${n})`, [[`2${X} + ${n}`, "Ahí solo se duplica el número, no la suma."], [`${X} + 2 · ${n}`, "Ahí solo se duplica el " + n + "."], [`2${X} · ${n}`, "Es el doble de una suma: dentro del paréntesis hay un +."]]],
            [`el triple de un número menos ${n}`, `3${X} − ${n}`, [[`${n} − 3${X}`, "El orden importa en la resta: primero el triple, y a eso se le quita " + n + "."], [`3(${X} − ${n})`, "Ese es el triple de la resta."], [`${X}<sup>3</sup> − ${n}`, "«El triple» es por 3, no al cubo."]]],
            [`${n} menos el triple de un número`, `${n} − 3${X}`, [[`3${X} − ${n}`, `El orden importa en la resta: a ${n} se le quita el triple.`], [`3(${n} − ${X})`, "Ese es el triple de la resta."], [`${n}${X} − 3`, `Ahí se multiplica ${n} por el número.`]]],
            [`la mitad de un número más ${n}`, `${F(X, 2)} + ${n}`, [[F(`${X} + ${n}`, 2), "Esa es la mitad de la suma."], [`2${X} + ${n}`, "La mitad es dividir entre 2, no multiplicar."], [`${F(X, n)} + 2`, "Has cambiado los números de sitio."]]],
            [`el cuadrado de un número menos ${n}`, `${X}<sup>2</sup> − ${n}`, [[`(${X} − ${n})<sup>2</sup>`, "Ese es el cuadrado de la resta."], [`2${X} − ${n}`, "El cuadrado es multiplicar el número por sí mismo, no por 2."], [`${X} − ${n}<sup>2</sup>`, `Lo que va al cuadrado es el número, no el ${n}.`]]],
            ["un número más su siguiente", `${X} + (${X} + 1)`, [[`${X} + 1`, "Ese es solo el siguiente: falta sumarle el número."], [`${X} · (${X} + 1)`, "Pide la suma, no el producto."], [`${X} + ${X}`, "El siguiente de un número es una unidad más."]]],
            [`${n} veces la diferencia entre un número y 1`, `${n}(${X} − 1)`, [[`${n}${X} − 1`, "Ahí solo se multiplica el número, no la diferencia."], [`${X} − ${n}`, "Faltan las veces: es una multiplicación."], [`${n}(1 − ${X})`, "El orden importa en la resta: al número se le quita 1."]]],
          ];
          [frase, bien, otras] = elegir(FRASES);
          } while (new Set([bien, ...otras.map(o => o[0])]).size < 4);   // con n = 3, «3x − 3» saldría dos veces
          const [ops, ok] = opciones(bien, otras.map(o => o[0]));
          return {
            html: `Llamamos ${X} a un número. ¿Qué expresión es «${frase}»?`,
            trabajo: `<div class="campos centrado"><div class="campo">${ELEGIR("t", ops, "Expresión")}</div></div>`,
            _ok: { t: ok },
            comprobar(v) {
              if (v.t === ok) return resultado([]);
              const o = otras.find(x => x[0] === ops.find(([k]) => k === v.t)?.[1]);
              return resultado(["t"], "Esa no es.", o ? o[1] : "");
            },
            solucion: `«${frase}» = <b>${bien}</b>`,
          };
        },
      },

      modelizar: {
        titulo: "Situaciones con letras",
        sub: "La expresión de una situación y su valor",
        pista: "Piensa en cómo lo calcularías con un número concreto (por ejemplo, con 2) y escribe las mismas operaciones con la letra. Después, para el valor, cambia la letra por el número que te dan.",
        nuevo() {
          const CTX = [
            () => { const p = azar(5, 9), q = azar(2, 4), x0 = azar(3, 8);
              return { t: `Una entrada de cine cuesta ${p} € y unas palomitas, ${q} €. Van ${X} amigos y cada uno compra entrada y palomitas.`, q: "¿Cuánto pagan entre todos?", bien: `(${p} + ${q})${X}`,
                otras: [`${p} + ${q}${X}`, `${p}${X} + ${q}`, `${p} + ${q} + ${X}`], x0, v: (p + q) * x0, pregunta: `¿Cuánto pagan si van ${x0} amigos?`, u: "€" }; },
            () => { const c = elegir([20, 25, 30, 40]), m = elegir([15, 18, 20, 25, 30]), x0 = azar(2, 12);
              return { t: `Un gimnasio cobra ${c} € de matrícula y ${m} € cada mes.`, q: `¿Cuánto se paga en total por ${X} meses?`, bien: `${c} + ${m}${X}`,
                otras: [`(${c} + ${m})${X}`, `${c}${X} + ${m}`, `${c} + ${m} + ${X}`], x0, v: c + m * x0, pregunta: `¿Cuánto se paga por ${x0} meses?`, u: "€" }; },
            () => { const k = azar(2, 9), x0 = azar(8, 14);
              return { t: `Lucía tiene ${X} años. Su madre tiene ${k} años más que el triple de la edad de Lucía.`, q: "¿Qué edad tiene la madre?", bien: `3${X} + ${k}`,
                otras: [`3(${X} + ${k})`, `${X} + 3 · ${k}`, `3${X} − ${k}`], x0, v: 3 * x0 + k, pregunta: `¿Qué edad tiene la madre si Lucía tiene ${x0} años?`, u: "años" }; },
            () => { const k = azar(2, 6), x0 = azar(3, 9);
              return { t: `Un rectángulo mide ${X} cm de ancho, y de largo, ${k} cm más que de ancho.`, q: "¿Cuánto mide su perímetro?", bien: `2${X} + 2(${X} + ${k})`,
                otras: [`${X}(${X} + ${k})`, `2${X} + ${k}`, `${X} + (${X} + ${k})`], x0, v: 2 * x0 + 2 * (x0 + k), pregunta: `¿Cuánto mide el perímetro si el ancho es ${x0} cm?`, u: "cm" }; },
            () => { const n = elegir([50, 60, 80, 100]), dias = azar(3, 6), x0 = azar(2, Math.floor(n / dias / 2));
              return { t: `Marcos tenía ${n} € y ha gastado ${X} € cada día durante ${dias} días.`, q: "¿Cuánto dinero le queda?", bien: `${n} − ${dias}${X}`,
                otras: [`${dias}${X} − ${n}`, `${n} − ${X} − ${dias}`, `${dias}(${n} − ${X})`], x0, v: n - dias * x0, pregunta: `¿Cuánto le queda si gastó ${x0} € cada día?`, u: "€" }; },
          ];
          const S = elegir(CTX)();
          const [ops, ok] = opciones(S.bien, S.otras);
          return {
            html: `${S.t} ${S.q}`,
            trabajo: `<div class="campos centrado"><div class="campo"><span class="etiqueta">La expresión</span>${ELEGIR("t", ops, "Expresión")}</div></div>
              <div class="campos centrado">${campo("v", `${S.pregunta} (${S.u})`)}</div>`,
            _ok: { t: ok, v: String(S.v) },
            comprobar(r) {
              const mal = [];
              if (r.t !== ok) mal.push("t");
              if (num(r.v) !== S.v) mal.push("v");
              if (!mal.length) return resultado([]);
              if (mal.length === 1 && mal[0] === "v") return resultado(mal, "La expresión está bien; revisa el valor.", `Cambia ${X} por ${S.x0} en la expresión.`);
              return resultado(mal, "Revisa la expresión.", "Prueba con un número concreto: ¿qué operaciones harías? Escríbelas con la letra.");
            },
            solucion: `${S.bien} → con ${X} = ${S.x0}: <b>${S.v} ${S.u}</b>`,
          };
        },
      },

      equivalentes: {
        titulo: "¿Son equivalentes?",
        sub: "Dos expresiones que valen siempre lo mismo",
        pista: "Dale a la letra dos valores (por ejemplo, 2 y 3) y calcula las dos expresiones. Si alguna vez no coinciden, no son equivalentes. Si coinciden, transforma una en la otra para asegurarte.",
        nuevo() {
          const si = Math.random() < .5, a = azar(2, 6), b = azar(2, 9), c = azar(2, 6), k = azar(8, 20);
          const PARES = [
            () => [`${a}(${X} + ${b})`, v => a * (v + b), si ? `${a}${X} + ${a * b}` : `${a}${X} + ${b}`, si ? v => a * v + a * b : v => a * v + b,
              `El ${a} multiplica a los dos términos del paréntesis: ${a}(${X} + ${b}) = ${a}${X} + ${a * b}.`],
            () => [`${a}${X} + ${c}${X}`, v => (a + c) * v, si ? `${a + c}${X}` : `${a + c}${X}<sup>2</sup>`, si ? v => (a + c) * v : v => (a + c) * v * v,
              `Se suman los ${X}: ${a} + ${c} = ${a + c} veces ${X}. Al sumar no aparece ningún cuadrado.`],
            () => [`${X} · ${X}`, v => v * v, si ? `${X}<sup>2</sup>` : `2${X}`, si ? v => v * v : v => 2 * v,
              `${X} · ${X} es ${X}<sup>2</sup>; 2${X} es ${X} + ${X}.`],
            () => [`${X} + ${X} + ${X}`, v => 3 * v, si ? `3${X}` : `${X}<sup>3</sup>`, si ? v => 3 * v : v => v ** 3,
              `Sumar tres veces ${X} es 3${X}; ${X}<sup>3</sup> es multiplicar ${X} · ${X} · ${X}.`],
            () => [`${k} − (${X} − ${b})`, v => k - (v - b), si ? `${k + b} − ${X}` : `${k - b} − ${X}`, si ? v => k + b - v : v => k - b - v,
              `El menos de delante del paréntesis cambia los dos signos: ${k} − ${X} + ${b} = ${k + b} − ${X}.`],
            () => [`${a + c}${X} + ${b} − ${c}${X}`, v => (a + c) * v + b - c * v, si ? `${a}${X} + ${b}` : `${a + 2 * c}${X} + ${b}`, si ? v => a * v + b : v => (a + 2 * c) * v + b,
              `${a + c}${X} − ${c}${X} = ${a}${X}, y el ${b} se queda como está.`],
          ];
          const [e1, f1, e2, f2, porque] = elegir(PARES)();
          const prueba = [2, 3].map(v => `Con ${X} = ${v}: ${vfmt(f1(v))} y ${vfmt(f2(v))}`).join("; ");
          const ok = si ? "si" : "no";
          return {
            html: `¿Son equivalentes estas dos expresiones? <span class="expr">${e1} &nbsp; y &nbsp; ${e2}</span>`,
            trabajo: `<div class="campos centrado"><div class="campo">${ELEGIR("eq", [["si", "Sí"], ["no", "No"]], "¿Son equivalentes?")}</div></div>`,
            _ok: { eq: ok },
            comprobar: v => v.eq === ok ? resultado([]) : resultado(["eq"], si ? "Sí que lo son." : "No lo son.", si ? `Pruébalo: ${prueba}.` : `Busca un valor en el que no coincidan. ${prueba}.`),
            operaciones: `<p>${prueba}.</p><p>${porque} ${si ? "<b>Son equivalentes.</b>" : "<b>No son equivalentes.</b>"}</p>`,
          };
        },
      },

      reducir: {
        titulo: "Reducir expresiones",
        sub: "Juntar los términos con x y los números",
        variantes: [["sumar", "Sumar y restar"], ["parentesis", "Con paréntesis"]],
        pista: "Junta por un lado los términos con x y por otro los números sueltos. Si hay un paréntesis, quítalo primero: el número de fuera multiplica a todo lo de dentro, y un menos delante cambia todos los signos.",
        nuevo(variante) {
          let expr, A, B, pasos, trampa;
          if (variante === "sumar") {
            let a, b, c, d;
            do { a = azar(2, 9); c = elegir([-1, 1]) * azar(1, 8); b = elegir([-1, 1]) * azar(1, 12); d = elegir([-1, 1]) * azar(1, 12); } while (a + c === 0 || b + d === 0);
            expr = `${tx(a)} ${masMenos(b)} ${c < 0 ? "−" : "+"} ${tx(Math.abs(c))} ${masMenos(d)}`;
            A = a + c; B = b + d;
            pasos = [`Términos con ${X}: ${tx(a)} ${c < 0 ? "−" : "+"} ${tx(Math.abs(c))} = ${tx(A)}`, `Números: ${sg(b)} ${masMenos(d)} = ${sg(B)}`];
            trampa = (x, y) => x === A + B || y === A + B ? ["No se pueden juntar.", `Los términos con ${X} y los números sueltos van por separado.`] : null;
          } else {
            let k, b, c, d;
            do { k = azar(2, 6); b = elegir([-1, 1]) * azar(1, 6); c = azar(1, 5); d = elegir([-1, 1]) * azar(1, 9); }
            while (k === c || k * b + d === 0 || (k === 4 && b === -2 && c === 1 && d === 5));
            // k(x + b) − (cx − d)
            expr = `${k}(${lin(1, b)}) − (${lin(c, -d)})`;
            A = k - c; B = k * b + d;
            pasos = [`Quitamos los paréntesis: ${lin(k, k * b)} − ${tx(c)} ${masMenos(d)}`, `Términos con ${X}: ${tx(k)} − ${tx(c)} = ${tx(A)}`, `Números: ${sg(k * b)} ${masMenos(d)} = ${sg(B)}`];
            trampa = (x, y) => x === k + c ? ["Cuidado con el segundo paréntesis.", `El menos de delante cambia el signo de todo lo de dentro, también el de ${tx(c)}.`]
              : y === k * b - d ? ["Cuidado con el segundo paréntesis.", `El menos de delante cambia también el signo del ${sg(-d)}.`]
              : y === b + d ? ["Cuidado con el primer paréntesis.", `El ${k} multiplica también al ${sg(b)}: ${k} · ${ent(b)} = ${sg(k * b)}.`] : null;
          }
          return {
            html: `Reduce la expresión hasta que quede un término con ${X} y un número. <span class="expr">${expr}</span>`,
            trabajo: campos(["a", `Número que multiplica a ${X}`], ["b", "Número suelto (con su signo)"]),
            _ok: { a: String(A), b: String(B) },
            comprobar(v) {
              const a = num(v.a), b = num(v.b), mal = [];
              if (a !== A) mal.push("a");
              if (b !== B) mal.push("b");
              if (!mal.length) return resultado([]);
              const t = trampa(a, b);
              if (t) return resultado(mal, ...t);
              return resultado(mal, mal.length === 2 ? "Revisa los dos." : mal[0] === "a" ? `Revisa los términos con ${X}.` : "Revisa los números sueltos.", "");
            },
            operaciones: P([...pasos, `<b>${lin(A, B)}</b>`]),
          };
        },
      },

      balanza: {
        titulo: "Ecuaciones con la balanza",
        sub: "Quitar lo mismo de los dos platillos",
        herramienta: ["Ecuaciones con la balanza", "ecuaciones.html"],
        variantes: [["uno", "Cajas en un platillo"], ["dos", "Cajas en los dos"]],
        pista: "La balanza sigue equilibrada si haces lo mismo en los dos platillos. Quita las cajas que estén en los dos, después las pesas que estén en los dos, y reparte las pesas que quedan entre las cajas que quedan.",
        nuevo(variante) {
          let k, comunes, x, sobran;
          do {
            k = azar(1, 4); comunes = variante === "uno" ? 0 : azar(1, Math.min(2, 6 - k));
            x = azar(1, Math.floor(20 / k)); sobran = azar(0, Math.min(6, 20 - k * x));
          } while (variante === "uno" && k === 1 && sobran === 0);
          let d = { a: comunes + k, b: sobran, c: comunes, d: sobran + k * x };
          if (Math.random() < .4) d = { a: d.c, b: d.d, c: d.a, d: d.b };
          const { a, b, c } = d, dd = d.d, pesas = Math.min(b, dd), M = k * x;
          const pasos = [`${ec(lin(a, b), lin(c, dd))}`];
          if (comunes) pasos.push(`Quitamos ${comunes === 1 ? "una caja" : comunes + " cajas"} de cada platillo: ${a > c ? `${lin(k, b)} = ${sg(dd)}` : `${sg(b)} = ${lin(k, dd)}`}`);
          if (pesas) pasos.push(`Quitamos ${pesas === 1 ? "una pesa" : pesas + " pesas"} de cada platillo: ${a > c ? `${tx(k)} = ${M}` : `${M} = ${tx(k)}`}`);
          if (k > 1) pasos.push(`Repartimos las ${M} pesas en ${k} montones iguales, uno por caja: ${X} = ${M} : ${k} = <b>${x}</b>`);
          else pasos.push(`La caja se queda sola: pesa <b>${x} kg</b>.`);
          return {
            html: `La balanza está equilibrada. Las cajas son iguales y cada pesa es de 1 kg. ¿Cuánto pesa cada caja?`,
            dibujo: res => balanzaSVG(d, res ? x : null),
            trabajo: `<div class="linea-op"><span>Cada caja pesa</span>${CAS("x", "Peso de cada caja")}<span>kg</span></div>`,
            pasos: ["ecuaciones.html", "balanza", d],
            _ok: { x: String(x) },
            comprobar(v) {
              const V = num(v.x);
              if (V === x) return resultado([]);
              if (k > 1 && V === M) return resultado(["x"], `Esas son las pesas que pesan lo mismo que ${k} cajas.`, `Ahora repártelas entre las ${k} cajas.`);
              if (V === Math.max(b, dd) / k || V === Math.max(b, dd) / Math.max(a, c)) return resultado(["x"], "Antes de repartir, quita lo que hay en los dos platillos.", "Las cajas y las pesas que están en los dos lados se pueden quitar.");
              return resultado(["x"], "Todavía no.", Number.isFinite(V) ? `Si cada caja pesara ${vfmt(V)} kg, un platillo pesaría ${vfmt(a * V + b)} kg y el otro ${vfmt(c * V + dd)} kg: la balanza no estaría equilibrada.` : "");
            },
            operaciones: P(pasos) + `<p>Comprobación: los dos platillos pesan ${a * x + b} kg.</p>`,
          };
        },
      },

      resolver: {
        titulo: "Resolver ecuaciones",
        sub: "De un paso a los denominadores",
        variantes: [["unpaso", "Un paso"], ["dospasos", "Dos pasos"], ["doslados", "x en los dos miembros"], ["parentesis", "Paréntesis"], ["denominadores", "Denominadores"]],
        pista: "Lo que hagas en un miembro, hazlo en el otro (como en la balanza): suma, resta, multiplica o divide los dos por lo mismo hasta que la x se quede sola. Al final, comprueba: con tu solución, los dos miembros tienen que valer lo mismo.",
        nuevo(variante) {
          const E = ECUACIONES[variante]();
          return {
            html: `Resuelve la ecuación y comprueba la solución. ${ec(E.izq, E.der)}`,
            trabajo: unaX,
            _ok: { x: String(E.x) },
            comprobar(v) {
              const V = num(v.x);
              return V === E.x ? resultado([]) : resultado(["x"], "No es la solución.", sustituir(V, E.L, E.R));
            },
            operaciones: P([ec(E.izq, E.der), ...E.pasos, `Comprobación: con ${X} = ${sg(E.x)}, los dos miembros valen ${vfmt(E.R(E.x))}.`]),
          };
        },
      },

      problemas: {
        titulo: "Problemas con ecuaciones",
        sub: "Plantear, resolver y comprobar",
        herramienta: ["Diagrama de barras con incógnita", "ecuaciones.html"],
        variantes: [["reparto", "Repartos"], ["consecutivos", "Números consecutivos"], ["edades", "Edades"], ["compras", "Compras"]],
        pista: "Llama x a lo que no sabes (si hay dos cantidades, a la más pequeña) y escribe las demás cantidades con x. Busca en el enunciado dos cosas que sean iguales: esa es la ecuación. Al final, comprueba la solución en el enunciado, no en la ecuación.",
        nuevo(variante) {
          if (variante === "reparto") {
            let m, k, x;
            do { m = azar(1, 4); k = m === 1 ? azar(2, 12) : elegir([0, 0, azar(1, 10)]); x = azar(4, 30); } while (m === 3 && k === 0 && x === 9);
            const [n1, n2] = elegir(NOMBRES), total = (m + 1) * x + k, y = m * x + k;
            const [cosa, u] = elegir([["cromos", "cromos"], ["canicas", "canicas"], ["€ ahorrados", "€"], ["puntos en el partido", "puntos"]]);
            const relacion = m === 1 ? `${k} ${u} más que ${n1}` : `${VECES[m]} que ${n1}${k ? ` y ${k} ${u} más` : ""}`;
            const ecuacion = `${X} + ${k ? `(${lin(m, k)})` : tx(m)} = ${total}`;
            return {
              html: `Entre ${n1} y ${n2} tienen ${total} ${cosa}. ${n2} tiene ${relacion}. ¿Cuántos tiene cada uno?`,
              trabajo: campos(["p", `${n1} (${u})`], ["s", `${n2} (${u})`]),
              pasos: ["ecuaciones.html", "barras", { m, k, total, n1, n2 }],
              _ok: { p: String(x), s: String(y) },
              comprobar(v) {
                const p = num(v.p), s = num(v.s), mal = [];
                if (p !== x) mal.push("p");
                if (s !== y) mal.push("s");
                if (!mal.length) return resultado([]);
                if (p === y && s === x) return resultado(mal, "Los tienes cambiados.", `${n2} es quien tiene más.`);
                if (Number.isFinite(p) && Number.isFinite(s) && p + s !== total) return resultado(mal, `Entre los dos tienen que sumar ${total}.`, `${vfmt(p)} + ${vfmt(s)} = ${vfmt(p + s)}`);
                return resultado(mal, `Suman ${total}, pero ${n2} no tiene ${relacion}.`, "Llama x a lo que tiene quien menos tiene.");
              },
              operaciones: P([`${n1}: ${X}; ${n2}: ${lin(m, k)}`, ecuacion, `${k ? `${lin(m + 1, k)} = ${total} → ` : ""}${tx(m + 1)} = ${total - k} → ${X} = ${total - k} : ${m + 1} = <b>${x}</b>`,
                `${n1} tiene <b>${x}</b> y ${n2}, <b>${y}</b>. Comprobación: ${x} + ${y} = ${total}.`]),
            };
          }
          if (variante === "consecutivos") {
            let n, x, pares;
            do { n = elegir([2, 3]); pares = Math.random() < .3; x = pares ? 2 * azar(3, 30) : azar(5, 60); }
            while (!pares && ((n === 3 && x === 20) || (n === 2 && x === 47)));
            const paso = pares ? 2 : 1, nums = Array.from({ length: n }, (_, i) => x + i * paso), S = nums.reduce((s, v) => s + v, 0);
            const terminos = nums.map((_, i) => i ? `(${X} + ${i * paso})` : X).join(" + ");
            return {
              html: `La suma de ${n === 2 ? "dos" : "tres"} números ${pares ? "pares " : ""}consecutivos es ${S}. ¿Cuál es el menor?`,
              trabajo: `<div class="linea-op"><span>El menor es</span>${CAS("x", "El menor")}</div>`,
              _ok: { x: String(x) },
              comprobar(v) {
                const V = num(v.x);
                if (V === x) return resultado([]);
                if (n === 3 && V === x + paso) return resultado(["x"], "Ese es el del medio.", "Piden el menor.");
                return resultado(["x"], "No es.", Number.isFinite(V) ? `${nums.map((_, i) => V + i * paso).join(" + ")} = ${n * V + paso * n * (n - 1) / 2}, no ${S}.` : "");
              },
              operaciones: P([`${terminos} = ${S}`, `${lin(n, paso * n * (n - 1) / 2)} = ${S} → ${tx(n)} = ${S - paso * n * (n - 1) / 2} → ${X} = <b>${x}</b>`, `Los números son ${nums.join(", ").replace(/, (\d+)$/, " y $1")}.`]),
            };
          }
          if (variante === "edades") {
            const [madre, hijo, deMadre, deHijo] = elegir([["Una madre", "su hijo", "la madre", "el hijo"], ["Un padre", "su hija", "el padre", "la hija"], ["Una tía", "su sobrino", "la tía", "el sobrino"]]);
            let html, ecuacion, M, pasos, x;
            if (Math.random() < .5) {
              x = azar(5, 15); const dif = azar(20, 32), n = dif - x; M = x + dif;
              html = `${madre} tiene ${dif} años más que ${hijo}. Dentro de ${n} años, tendrá el doble de la edad de ${hijo}. ¿Qué edad tiene cada uno ahora?`;
              ecuacion = `${X} + ${dif} + ${n} = 2(${X} + ${n})`;
              pasos = [`Ahora: ${deHijo}, ${X}; ${deMadre}, ${lin(1, dif)}. Dentro de ${n} años: ${lin(1, n)} y ${lin(1, dif + n)}.`, ecuacion, `${lin(1, dif + n)} = ${lin(2, 2 * n)} → ${X} = ${dif + n} − ${2 * n} = <b>${x}</b>`];
            } else {
              x = azar(10, 16); const dif = 2 * azar(9, x - 1), nn = x - dif / 2; M = x + dif;
              html = `${madre} tiene ${dif} años más que ${hijo}. Hace ${nn === 1 ? "un año" : nn + " años"}, tenía el triple de la edad de ${hijo}. ¿Qué edad tiene cada uno ahora?`;
              ecuacion = `${X} + ${dif} − ${nn} = 3(${X} − ${nn})`;
              pasos = [`Ahora: ${deHijo}, ${X}; ${deMadre}, ${lin(1, dif)}. Hace ${nn === 1 ? "un año" : nn + " años"}: ${lin(1, -nn)} y ${lin(1, dif - nn)}.`, ecuacion, `${lin(1, dif - nn)} = ${lin(3, -3 * nn)} → ${tx(2)} = ${dif - nn + 3 * nn} → ${X} = <b>${x}</b>`];
            }
            return {
              html,
              trabajo: campos(["h", `Edad ${deHijo.replace(/^el /, "del ").replace(/^la /, "de la ")} (años)`], ["m", `Edad ${deMadre.replace(/^el /, "del ").replace(/^la /, "de la ")} (años)`]),
              _ok: { h: String(x), m: String(M) },
              comprobar(v) {
                const h = num(v.h), m = num(v.m), mal = [];
                if (h !== x) mal.push("h");
                if (m !== M) mal.push("m");
                if (!mal.length) return resultado([]);
                if (h === x) return resultado(mal, "La edad pequeña está bien.", `Súmale la diferencia: ${M - x} años.`);
                return resultado(mal, "Compruébalo en el enunciado.", "Escribe las dos edades de ahora con x, y después las de entonces (sumando o restando los años a las dos).");
              },
              operaciones: P([...pasos, `${deHijo.replace(/^./, c => c.toUpperCase())} tiene <b>${x}</b> años y ${deMadre}, <b>${M}</b>.`]),
            };
          }
          // compras
          let k, p, B;
          do { k = azar(2, 9); p = azar(1, 9); B = elegir([10, 20, 50]); } while (k * p >= B || (k === 8 && B === 50 && p === 5));
          const r = B - k * p;
          const [cosa, cosas] = elegir([["cuaderno", "cuadernos"], ["bolígrafo", "bolígrafos"], ["entrada", "entradas"], ["helado", "helados"], ["libreta", "libretas"]]);
          return {
            html: `Compro ${k} ${cosas} iguales y pago con un billete de ${B} €. Me devuelven ${r} €. ¿Cuánto cuesta cada ${cosa}?`,
            trabajo: `<div class="linea-op"><span>Cada ${cosa} cuesta</span>${CAS("x", "Precio")}<span>€</span></div>`,
            _ok: { x: String(p) },
            comprobar(v) {
              const V = num(v.x);
              if (V === p) return resultado([]);
              if (cerca4(V, B / k)) return resultado(["x"], "Has repartido el billete entero.", `Pero te devuelven ${r} €: has gastado menos.`);
              if (cerca4(V, (B + r) / k)) return resultado(["x"], `Los ${r} € de la vuelta no se gastan: se restan.`, "");
              return resultado(["x"], "No es.", Number.isFinite(V) ? `${k} · ${vfmt(V)} = ${vfmt(k * V)} €; con un billete de ${B} € te devolverían ${vfmt(B - k * V)} €.` : "");
            },
            operaciones: P([`${tx(k)} + ${r} = ${B}`, `${tx(k)} = ${B} − ${r} = ${k * p} → ${X} = ${k * p} : ${k} = <b>${p}</b>`, `Cada ${cosa} cuesta <b>${p} €</b>.`]),
          };
        },
      },

      sistemas: {
        titulo: "Sistemas de ecuaciones",
        sub: "Dos incógnitas, dos condiciones",
        variantes: [["numeros", "Números"], ["patas", "Patas y ruedas"], ["precios", "Precios"]],
        pista: "Haz una tabla de tanteo: da un valor a la primera incógnita, calcula la segunda con la primera condición y mira si se cumple la segunda. O despeja una incógnita en la ecuación más sencilla y sustitúyela en la otra.",
        nuevo(variante) {
          let html, sis, x, y, lx, ly, c1, c2, pasos;
          if (variante === "numeros") {
            x = azar(6, 40); y = azar(1, x - 1); const s = x + y, d = x - y;
            html = `Dos números suman ${s} y su diferencia es ${d}. ¿Cuáles son?`;
            sis = [`${X} + ${Y} = ${s}`, `${X} − ${Y} = ${d}`]; lx = "El mayor"; ly = "El menor";
            c1 = (a, b) => a + b === s; c2 = (a, b) => a - b === d;
            pasos = [`De la primera: ${Y} = ${s} − ${X}`, `En la segunda: ${X} − (${s} − ${X}) = ${d} → 2${X} − ${s} = ${d} → 2${X} = ${s + d} → ${X} = <b>${x}</b>`, `${Y} = ${s} − ${x} = <b>${y}</b>`];
          } else if (variante === "patas") {
            const [lugar, A, B, pa, pb, que, uds] = elegir([["En una granja escuela hay", "gallinas", "conejos", 2, 4, "patas", "animales"], ["En un aparcamiento de bicis hay", "bicicletas", "triciclos", 2, 3, "ruedas", "vehículos"],
              ["En un aula hay", "mesas", "taburetes", 4, 3, "patas", "muebles (las mesas tienen 4 patas y los taburetes, 3)"], ["En un terrario hay", "arañas", "escarabajos", 8, 6, "patas", "bichos (las arañas tienen 8 patas y los escarabajos, 6)"]]);
            x = azar(3, 20); y = azar(3, 20);
            const n = x + y, L = pa * x + pb * y;
            html = `${lugar} ${A} y ${B}: en total, ${n} ${uds.replace(" (", ` y ${L} ${que} (`)}${uds.includes("(") ? "" : ` y ${L} ${que}`}. ¿Cuántos hay de cada?`;
            sis = [`${X} + ${Y} = ${n}`, `${pa}${X} + ${pb}${Y} = ${L}`]; lx = A.replace(/^./, c => c.toUpperCase()); ly = B.replace(/^./, c => c.toUpperCase());
            c1 = (a, b) => a + b === n; c2 = (a, b) => pa * a + pb * b === L;
            pasos = [`${X}: ${A}; ${Y}: ${B}.`, `De la primera: ${Y} = ${n} − ${X}`, `En la segunda: ${pa}${X} + ${pb}(${n} − ${X}) = ${L} → ${lin(pa - pb, pb * n)} = ${L} → ${tx(pa - pb)} = ${sg(L - pb * n)}${pa - pb === 1 ? "" : ` → ${X} = <b>${x}</b>`}`, `${Y} = ${n} − ${x} = <b>${y}</b>`];
          } else {
            // [un A, As, el A] y lo mismo de B
            const [[uA, As, elA], [uB, Bs, elB]] = elegir([[["Un bocadillo", "bocadillos", "el bocadillo"], ["un zumo", "zumos", "el zumo"]], [["Un cuaderno", "cuadernos", "el cuaderno"], ["un bolígrafo", "bolígrafos", "el bolígrafo"]],
              [["Un kilo de manzanas", "kilos de manzanas", "el kilo de manzanas"], ["uno de plátanos", "kilos de plátanos", "el kilo de plátanos"]], [["Una entrada de adulto", "entradas de adulto", "la entrada de adulto"], ["una infantil", "infantiles", "la entrada infantil"]]]);
            let a, b;
            do { x = azar(2, 9); y = azar(1, 6); a = azar(2, 4); b = azar(2, 3); } while (x === y || a === b);
            const s = x + y, T = a * x + b * y;
            html = `${uA} y ${uB} cuestan ${s} € entre los dos. ${a} ${As} y ${b} ${Bs} cuestan ${T} €. ¿Cuánto cuesta cada uno?`;
            sis = [`${X} + ${Y} = ${s}`, `${a}${X} + ${b}${Y} = ${T}`];
            const de = el => el.replace(/^el /, "del ").replace(/^la /, "de la ");
            lx = `Precio ${de(elA)} (€)`; ly = `Precio ${de(elB)} (€)`;
            c1 = (p, q) => p + q === s; c2 = (p, q) => a * p + b * q === T;
            pasos = [`De la primera: ${Y} = ${s} − ${X}`, `En la segunda: ${a}${X} + ${b}(${s} − ${X}) = ${T} → ${lin(a - b, b * s)} = ${T} → ${tx(a - b)} = ${sg(T - b * s)}${a - b === 1 ? "" : ` → ${X} = <b>${x}</b>`}`, `${Y} = ${s} − ${x} = <b>${y}</b>`];
          }
          return {
            html,
            trabajo: campos(["x", lx], ["y", ly]),
            _ok: { x: String(x), y: String(y) },
            comprobar(v) {
              const p = num(v.x), q = num(v.y), mal = [];
              if (p !== x) mal.push("x");
              if (q !== y) mal.push("y");
              if (!mal.length) return resultado([]);
              if (p === y && q === x) return resultado(mal, "Los tienes cambiados.", "");
              if (c1(p, q)) return resultado(mal, "Cumplen la primera condición, pero no la segunda.", "Prueba con otros valores que sumen lo mismo.");
              if (c2(p, q)) return resultado(mal, "Cumplen la segunda condición, pero no la primera.", "");
              return resultado(mal, "No cumplen ninguna de las dos condiciones.", "");
            },
            operaciones: `<p class="expr">${sis.join("<br>")}</p>` + P([...pasos, "Comprobación: los dos valores cumplen las dos condiciones del enunciado."]),
          };
        },
      },

      solucion: {
        titulo: "¿Es solución?",
        sub: "Comprobar sin resolver",
        pista: "No hace falta resolver la ecuación: cambia la x por el número en los dos miembros y calcula. Si los dos valen lo mismo, es solución.",
        nuevo() {
          const E = ECUACIONES[elegir(["doslados", "doslados", "parentesis"])]();
          const si = Math.random() < .5, k = si ? E.x : E.x + elegir([-2, -1, 1, 2]);
          const ok = si ? "si" : "no";
          return {
            html: `¿Es ${X} = ${sg(k)} solución de esta ecuación? ${ec(E.izq, E.der)}`,
            trabajo: `<div class="campos centrado"><div class="campo">${ELEGIR("s", [["si", "Sí"], ["no", "No"]], "¿Es solución?")}</div></div>`,
            _ok: { s: ok },
            comprobar: v => v.s === ok ? resultado([]) : resultado(["s"], si ? "Sí que lo es." : "No lo es.", `Con ${X} = ${sg(k)}, el primer miembro vale ${vfmt(E.L(k))} y el segundo ${vfmt(E.R(k))}.`),
            operaciones: `<p>Con ${X} = ${sg(k)}: primer miembro, ${vfmt(E.L(k))}; segundo miembro, ${vfmt(E.R(k))}.</p><p>${si ? "Valen lo mismo: <b>es solución</b>." : `No valen lo mismo: <b>no es solución</b> (la solución es ${X} = ${sg(E.x)}).`}</p>`,
          };
        },
      },

      error: {
        titulo: "Encuentra el error",
        sub: "Una resolución con un fallo",
        pista: "Repasa cada paso: ¿se ha hecho lo mismo en los dos miembros? Fíjate sobre todo en los signos al pasar un término y en si se divide o se resta al final.",
        nuevo() {
          let a, b, c, d, x;
          do { a = azar(3, 8); c = azar(1, a - 1); x = azar(-5, 9); b = elegir([-1, 1]) * azar(1, 12); d = a * x + b - c * x; } while (Math.abs(d) > 40 || a - c === 1 || d === b || d - b - (a - c) === x);
          const k = a - c, linea = azar(1, 3);
          const L = [];
          // Paso 1: quitar cx de los dos miembros. Error: sumarlo.
          const k1 = linea === 1 ? a + c : k;
          L.push(`${lin(k1, b)} = ${sg(d)}`);
          // Paso 2: quitar b. Error: cambiarlo de miembro sin cambiar el signo.
          const r2 = linea === 2 ? d + b : d - b;
          L.push(`${tx(k1)} = ${sg(r2)}`);
          // Paso 3: dividir. Error: restar en vez de dividir.
          L.push(linea === 3 ? `${X} = ${sg(r2)} − ${ent(k1)} = ${sg(r2 - k1)}` : `${X} = ${sg(r2)} : ${ent(k1)} = ${qF(Q(r2, k1))}`);
          const POR_QUE = { 1: `Para quitar ${tx(c)} del segundo miembro hay que restarlo también en el primero: ${tx(a)} − ${tx(c)} = ${tx(k)}.`,
            2: `Para quitar el ${sg(b)} del primer miembro hay que ${b > 0 ? "restar" : "sumar"} ${Math.abs(b)} en los dos: ${sg(d)} ${b > 0 ? "−" : "+"} ${Math.abs(b)} = ${sg(d - b)}.`,
            3: `${tx(k)} es ${k} por ${X}: se divide entre ${k}, no se resta.` };
          return {
            html: `Esta resolución tiene un error en uno de sus pasos. ¿En cuál? ¿Cuál es la solución correcta? ${ec(lin(a, b), lin(c, d))}
              <span class="expr">${L.map((l, i) => `(${i + 1}) &nbsp; ${l}`).join("<br>")}</span>`,
            trabajo: `<div class="campos centrado"><div class="campo"><span class="etiqueta">El error está en el paso</span>${ELEGIR("l", [["1", "1"], ["2", "2"], ["3", "3"]], "Paso con el error")}</div></div>${unaX}`,
            _ok: { l: String(linea), x: String(x) },
            comprobar(v) {
              const mal = [];
              if (v.l !== String(linea)) mal.push("l");
              if (num(v.x) !== x) mal.push("x");
              if (!mal.length) return resultado([]);
              if (mal.includes("l")) return resultado(mal, "El error está en otro paso.", "Comprueba en cada paso que se ha hecho lo mismo en los dos miembros.");
              return resultado(mal, "Has encontrado el error; revisa la solución.", sustituir(num(v.x), w => a * w + b, w => c * w + d));
            },
            operaciones: P([`El error está en el paso ${linea}. ${POR_QUE[linea]}`, `${lin(k, b)} = ${sg(d)} → ${tx(k)} = ${sg(d - b)} → ${X} = <b>${sg(x)}</b>`]),
          };
        },
      },
    },
  });

  // Igualdad con tolerancia para precios (divisiones que no son exactas).
  function cerca4(v, w) { return Number.isFinite(v) && Math.abs(v - w) < .005; }
}
