// Motor común de las herramientas de aula «paso a paso» (modelo de barras,
// …). Cada página construye su escena (SVG o HTML) marcando con la clase
// `verK` lo que aparece en el paso K, y una lista de pasos [título, texto
// HTML]; `Pasos.iniciar` pone la escena en el paso 0 y se encarga de los
// botones, los puntos, el teclado y las clases s1, s2… de la escena.
// Requiere en la página: #escena, #titulo-paso, #texto-paso, #anterior,
// #siguiente y #puntos (ver barras.html).
"use strict";

const Pasos = (() => {
  const SVGNS = "http://www.w3.org/2000/svg";

  // Elemento SVG con atributos; si se da `padre`, se añade a él.
  function svg(tag, attrs = {}, padre = null) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (padre) padre.appendChild(n);
    return n;
  }

  const mcd = (x, y) => y === 0 ? Math.abs(x) : mcd(y, x % y);

  // Fracción escrita (numerador sobre denominador).
  const frac = (n, d, extra = "") => `<span class="f ${extra}"><span>${n}</span><span>${d}</span></span>`;

  // Número con coma decimal y, como mucho, dos decimales (sin ceros sobrantes).
  const num = x => {
    const r = Math.round(x * 100) / 100;
    return (Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, "")).replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  const esEntero = x => Math.abs(x - Math.round(x)) < 1e-9;

  // --------------------------------------------------- dibujo de barras
  // Lienzo SVG de 800 de ancho y `alto` de alto dentro de #escena (vacía).
  const X0 = 40, ANCHO = 720, ALTO = 56;
  function lienzo(alto) {
    const escena = document.getElementById("escena");
    escena.className = "escena";
    escena.innerHTML = "";
    return svg("svg", { viewBox: `0 0 800 ${alto}` }, escena);
  }

  // Barra de `partes` trozos iguales entre x y x + w, a la altura y.
  // `color(k)` da la clase de cada trozo ("azul", "naranja azul desde3"…);
  // `cortes` es la clase de las líneas de corte ("" si se ven desde el paso 0).
  function barra(g, { x = X0, y, w = ANCHO, h = ALTO, partes, color = () => "blanco", cortes = "" }) {
    const p = w / partes;
    for (let k = 0; k < partes; k++) svg("rect", { x: x + k * p, y, width: p + 0.3, height: h, class: "parte " + color(k) }, g);
    for (let k = 1; k < partes; k++) svg("line", { x1: x + k * p, y1: y, x2: x + k * p, y2: y + h, class: "corte " + cortes }, g);
    svg("rect", { x, y, width: w, height: h, class: "contorno" }, g);
    return p;
  }

  // Texto dentro de cada trozo de `desde` a `hasta` (sin incluir).
  function valores(g, { x = X0, y, h = ALTO, p, desde, hasta, texto, clase = "" }) {
    for (let k = desde; k < hasta; k++) {
      const t = svg("text", { x: x + (k + 0.5) * p, y: y + h / 2, class: `valor ${p < 46 ? "pequeno" : ""} ${clase}` }, g);
      t.textContent = typeof texto === "function" ? texto(k) : texto;
    }
  }

  // Llave encima (arriba = true) o debajo de una barra de altura h, entre x1
  // y x2, con un rótulo.
  function llave(g, { x1, x2, y, h = ALTO, arriba, texto, clase = "", suave = false }) {
    const s = arriba ? -1 : 1, y0 = arriba ? y - 6 : y + h + 6, y1 = y0 + s * 10;
    const grupo = svg("g", { class: clase }, g);
    svg("path", { d: `M ${x1 + 2} ${y0} V ${y1} H ${x2 - 2} V ${y0} M ${(x1 + x2) / 2} ${y1} V ${y1 + s * 6}`, class: "llave" }, grupo);
    const t = svg("text", { x: (x1 + x2) / 2, y: arriba ? y1 - 12 : y1 + 26, class: "rotulo-llave" + (suave ? " suave" : "") }, grupo);
    t.textContent = texto;
    return grupo;
  }

  // Texto suelto en el lienzo.
  function texto(g, { x, y, t, clase = "", ancla = "middle" }) {
    const n = svg("text", { x, y, class: clase, "text-anchor": ancla }, g);
    n.textContent = t;
    return n;
  }

  // Recta doble: dos rectas paralelas (arriba y abajo, 80 de separación)
  // entre los valores `min` y `max` de la de arriba. Devuelve
  // marca(v, abajo, clase, fuerte, { etiqueta, repite }), que dibuja la guía
  // vertical, las muescas y los rótulos (arriba, formato(v) o `etiqueta`;
  // abajo, `abajo`), y x(v).
  function rectaDoble(g, { y, max, min = 0, clase = "", formato = v => num(v) }) {
    const y2 = y + 80, x = v => X0 + (v - min) / (max - min) * ANCHO;
    // La clase recta-doble acota sus estilos (pasos.css) a la propia recta.
    const grupo = svg("g", { class: "recta-doble " + clase }, g);
    svg("line", { x1: X0, y1: y, x2: X0 + ANCHO, y2: y, class: "eje" }, grupo);
    svg("line", { x1: X0, y1: y2, x2: X0 + ANCHO, y2: y2, class: "eje" }, grupo);
    const usados = [];
    // `repite`: misma posición que una marca anterior (no se desplaza).
    function marca(v, abajo, clase = "", fuerte = false, { etiqueta = null, repite = false } = {}) {
      const xx = x(v);
      // Si el rótulo quedaría encima de otro, se sube (o se baja) un poco.
      const cerca = usados.filter(u => Math.abs(u - xx) < 46).length - (repite ? 1 : 0);
      if (!repite) usados.push(xx);
      const m = svg("g", { class: clase }, grupo);
      svg("line", { x1: xx, y1: y, x2: xx, y2: y2, class: "guia" + (fuerte ? " fuerte" : "") }, m);
      svg("line", { x1: xx, y1: y - 7, x2: xx, y2: y + 7, class: "muesca" }, m);
      svg("line", { x1: xx, y1: y2 - 7, x2: xx, y2: y2 + 7, class: "muesca" }, m);
      texto(m, { x: xx, y: y - 14 - cerca * 18, t: etiqueta ?? formato(v), clase: "etq" + (fuerte ? " fuerte" : "") });
      texto(m, { x: xx, y: y2 + 26 + cerca * 18, t: abajo, clase: "etq" + (fuerte ? " fuerte" : "") });
      return m;
    }
    return { marca, x, y2 };
  }

  let estado = { escena: null, pasos: [], paso: 0, bloqueado: false };

  function ir(n) {
    const { escena, pasos } = estado;
    if (!escena) return;
    estado.paso = Math.max(0, Math.min(pasos.length - 1, n));
    if (estado.bloqueado) estado.paso = 0;
    const paso = estado.paso;
    for (let k = 1; k <= 12; k++) escena.classList.toggle("s" + k, paso >= k);
    const [titulo, texto] = pasos[paso];
    document.getElementById("titulo-paso").textContent = `Paso ${paso + 1} de ${pasos.length} · ${titulo}`;
    document.getElementById("texto-paso").innerHTML = texto;
    document.getElementById("anterior").disabled = paso === 0;
    document.getElementById("siguiente").disabled = paso === pasos.length - 1 || estado.bloqueado;
    document.getElementById("puntos").innerHTML = pasos.map((_, k) => `<i class="${k <= paso ? "hecho" : ""}"></i>`).join("");
  }

  // `bloqueado`: datos imposibles; se queda en el paso 0, que explica el aviso.
  function iniciar(escena, pasos, bloqueado = false) {
    estado = { escena, pasos, paso: 0, bloqueado };
    ir(0);
  }

  // ------------------------------------------------------------ proyectar
  // Modo proyección: solo el enunciado, el dibujo, la explicación y los
  // botones de paso, a pantalla completa si el navegador lo permite. Se sale
  // con Esc o con la cruz, y se vuelve a la página con los datos y ejemplos.
  function proyectar(si) {
    document.body.classList.toggle("proyectando", si);
    const lleno = document.fullscreenElement;
    if (si && !lleno && document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen().catch(() => {});   // sin pantalla completa, se queda en la ventana
    if (!si && lleno && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => {
    const boton = document.createElement("button");
    boton.type = "button"; boton.id = "proyectar"; boton.className = "proyectar";
    boton.textContent = "⛶ Proyectar"; boton.title = "Ver solo el dibujo y la explicación, a pantalla completa (Esc para salir)";
    boton.addEventListener("click", () => proyectar(true));
    document.querySelector(".controles").appendChild(boton);
    const cerrar = document.createElement("button");
    cerrar.type = "button"; cerrar.className = "cerrar-proyeccion"; cerrar.textContent = "✕";
    cerrar.setAttribute("aria-label", "Salir de la proyección");
    cerrar.addEventListener("click", () => proyectar(false));
    document.body.appendChild(cerrar);
    // Si el navegador sale de la pantalla completa (Esc), se sale también de la proyección.
    document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) document.body.classList.remove("proyectando"); });
    document.getElementById("anterior").addEventListener("click", () => ir(estado.paso - 1));
    document.getElementById("siguiente").addEventListener("click", () => ir(estado.paso + 1));
    document.addEventListener("keydown", ev => {
      if (ev.key === "Escape" && document.body.classList.contains("proyectando")) { proyectar(false); return; }
      if (["INPUT", "SELECT", "TEXTAREA"].includes(ev.target.tagName)) return;
      if (ev.target.tagName === "BUTTON" && ev.key === " ") return;  // el botón ya reacciona solo
      if (ev.key === "ArrowRight" || ev.key === " ") { ev.preventDefault(); ir(estado.paso + 1); }
      if (ev.key === "ArrowLeft") { ev.preventDefault(); ir(estado.paso - 1); }
    });
  });

  // ------------------------------------------- herramienta con varios modos
  // `modos`: { nombre: { campos: {dato: idDelCampo}, calcular(datos),
  // dibujar(resultado) -> pasos, ejemplos: [{etiqueta, texto, ...datos}],
  // azar() -> datos } }. Los campos de texto (select, o los que se declaren
  // en `textos`) se leen como texto; el resto, como número. Requiere en la
  // página: botones [data-modo], bloques [data-para], #entrada, #ejemplos y
  // #enunciado. Devuelve elegir(modo, datos) para las pruebas.
  function montar(modos, inicial) {
    let modo = inicial, enunciado = "";
    const leer = () => {
      const datos = {};
      for (const [k, id] of Object.entries(modos[modo].campos)) {
        const campo = document.getElementById(id);
        datos[k] = campo.tagName === "SELECT" || campo.type === "text" ? campo.value : Number(campo.value);
      }
      return datos;
    };
    const poner = datos => {
      for (const [k, id] of Object.entries(modos[modo].campos)) if (datos[k] !== undefined) document.getElementById(id).value = datos[k];
    };
    const construir = () => {
      const r = modos[modo].calcular(leer());
      document.getElementById("enunciado").textContent = enunciado;
      if (r.error) {
        lienzo(60);
        iniciar(document.getElementById("escena"), [["Revisa los datos", `<p class="aviso">${r.error}</p>`]], true);
        return;
      }
      iniciar(document.getElementById("escena"), modos[modo].dibujar(r));
    };
    function elegir(m, datos = null) {
      modo = m;
      document.querySelectorAll("[data-modo]").forEach(bt => bt.setAttribute("aria-selected", bt.dataset.modo === m));
      document.querySelectorAll("[data-para]").forEach(s => s.hidden = s.dataset.para !== m);
      const ej = document.getElementById("ejemplos");
      ej.innerHTML = "<span>Ejemplos:</span>";
      for (const e of modos[m].ejemplos) {
        const bt = document.createElement("button");
        bt.type = "button"; bt.textContent = e.etiqueta;
        bt.addEventListener("click", () => { poner(e); enunciado = e.texto ?? ""; construir(); });
        ej.appendChild(bt);
      }
      if (modos[m].azar) {
        const az = document.createElement("button");
        az.type = "button"; az.textContent = "Al azar";
        az.addEventListener("click", () => { poner(modos[modo].azar()); enunciado = ""; construir(); });
        ej.appendChild(az);
      }
      const e0 = datos ?? modos[m].ejemplos[0];
      poner(e0); enunciado = e0.texto ?? "";
      construir();
    }
    document.querySelectorAll("[data-modo]").forEach(bt => bt.addEventListener("click", () => elegir(bt.dataset.modo)));
    document.getElementById("entrada").addEventListener("submit", ev => { ev.preventDefault(); enunciado = ""; construir(); });
    document.querySelectorAll(".entrada input, .entrada select").forEach(i => i.addEventListener("change", () => { enunciado = ""; construir(); }));
    // Modo inicial desde el ancla (barras.html#queda) o el primero.
    const ancla = typeof location !== "undefined" ? location.hash.slice(1) : "";
    elegir(ancla in modos ? ancla : inicial);
    return elegir;
  }

  return { svg, mcd, frac, num, esEntero, iniciar, ir, X0, ANCHO, ALTO, lienzo, barra, valores, llave, texto, rectaDoble, montar };
})();

if (typeof module !== "undefined") module.exports = Pasos;
