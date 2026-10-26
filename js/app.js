// Web de repaso del alumnado: vistas y progreso. Los cursos, temas y bloques
// llegan de la PD en datos.js (TEMAS, lo genera scripts/publicar_alumnado.py);
// las actividades, de actividades/*.js (Repaso.tema). Direcciones con # para
// poder enlazar un tema o una actividad: #2eso, #2eso/SA1, #2eso/SA1/rectangulos.
"use strict";

const $ = s => document.querySelector(s);
const vista = () => $("#vista");

// Progreso en este navegador: aciertos seguidos por actividad (máx. META). No sale de aquí.
const META = 10;
const progreso = (() => {
  let p = {};
  try { p = JSON.parse(localStorage.getItem("repaso-progreso") || "{}"); } catch (e) {}
  return {
    get: k => p[k] || 0,
    set(k, v) { p[k] = Math.min(v, META); try { localStorage.setItem("repaso-progreso", JSON.stringify(p)); } catch (e) {} },
  };
})();

const clave = (c, t, a) => `${c}/${t}/${a}`;
const nombreCorto = c => c.nombre.split(" · ")[0];
const nombreTema = t => `${t.id}. ${t.titulo}`;   // «SA1. Números para entender el mundo»
const numeroTema = t => t.id.replace(/^SA_?/, "");

// Iconos de trazo (24×24), con el color del texto.
const TRAZOS = {
  atras: '<path d="M15 5l-7 7 7 7"/>',
  hecho: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pista: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  dibujo: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M9 7v10M15 7v10"/>',
  sonido: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mudo: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
  otro: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};
const icono = n => `<svg class="icono" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TRAZOS[n]}</svg>`;
// Parada del camino: anillo que se llena hasta p (0-100); lleno, dorado y con ✓.
const anillo = (p, dentro, etiqueta) => `<span class="anillo${p >= 100 ? " lleno" : ""}" style="--p:${p}" role="img" aria-label="${etiqueta}"><span>${p >= 100 ? icono("hecho") : dentro}</span></span>`;
const volver = (texto, href) => `<a class="atras" href="${href}">${icono("atras")}${texto}</a>`;

function cabecera(c) {
  $("#cursos").innerHTML = TEMAS.cursos.map(x =>
    `<a href="#${x.id}"${x.id === c.id ? ' aria-current="page"' : ""}>${nombreCorto(x)}</a>`).join("");
}

function inicio(c) {
  document.title = `Repaso de ${nombreCorto(c)}`;
  vista().innerHTML = `
    <h1 class="vh">Temas</h1>
    <ol class="camino">${c.temas.map(t => {
      const def = Repaso.temas[`${c.id}/${t.id}`];
      if (!def) return `<li class="parada apagada"><span class="anillo"><span>${numeroTema(t)}</span></span><span class="nombre">${nombreTema(t)}</span></li>`;
      const acts = Object.values(def.bloques).flat(), hechas = acts.filter(a => progreso.get(clave(c.id, t.id, a)) >= META).length;
      return `<li><a class="parada" href="#${c.id}/${t.id}">${anillo(Math.round(100 * hechas / acts.length), numeroTema(t), `${hechas} de ${acts.length} superadas`)}<span class="nombre">${nombreTema(t)}</span></a></li>`;
    }).join("")}</ol>`;
}

function tema(c, t, def) {
  document.title = nombreTema(t);
  vista().innerHTML = `
    ${volver("Temas", `#${c.id}`)}
    <h1>${nombreTema(t)}</h1>
    <ol class="camino">${t.bloques.map(b => {
      const acts = def.bloques[b.letra] || [];
      return `<li class="hito${acts.length ? "" : " apagado"}"><span class="letra"><span>${b.letra}</span></span>${b.titulo}</li>` + acts.map(a => {
        const p = progreso.get(clave(c.id, t.id, a));
        return `<li><a class="parada" href="#${c.id}/${t.id}/${a}">${anillo(Math.round(100 * p / META), "", p >= META ? "Superada" : `${p} de ${META}`)}<span class="nombre">${def.actividades[a].titulo}</span></a></li>`;
      }).join("");
    }).join("")}</ol>`;
}

function actividad(c, t, def, claveAct) {
  const A = def.actividades[claveAct], k = clave(c.id, t.id, claveAct);
  let variante = A.variantes ? A.variantes[0][0] : undefined;
  let ej = A.nuevo(variante), resuelto = false, fallos = 0;
  document.title = A.titulo;

  function campoHTML(x) {
    if (x.potencia) return `<div class="campo"><label for="f-${x.id}">${x.etiqueta}</label><div class="potencia"><input class="casilla" id="f-${x.id}" inputmode="decimal" autocomplete="off"><span class="x">· 10</span><input class="casilla exp" id="f-${x.potencia}" inputmode="numeric" autocomplete="off" aria-label="Exponente"></div></div>`;
    return `<div class="campo"><label for="f-${x.id}">${x.etiqueta}</label><input class="casilla" id="f-${x.id}" inputmode="decimal" autocomplete="off"></div>`;
  }
  // La meta: META segmentos que se pintan de dorado con cada acierto seguido;
  // el recién ganado (nuevo) da un salto y, si es el último, salta toda la barra.
  const meta = (nuevo = -1) => {
    const p = progreso.get(k), m = $("#meta");
    m.setAttribute("aria-label", p >= META ? "Superada" : `${p} de ${META} seguidos`);
    m.innerHTML = Array.from({ length: META }, (_, i) => `<i style="--i:${i}" class="${i < p ? "on" : ""}${i === nuevo ? " nuevo" : ""}"></i>`).join("");
    m.classList.toggle("completa", nuevo === META - 1);
  };
  // Casillas y grupos de botones de opción (data-elegir), cada uno con su valor.
  const entradas = () => [...document.querySelectorAll("#trabajo input:not([type=radio]), #trabajo [data-elegir]")];
  const grupo = el => el.dataset && "elegir" in el.dataset;
  const valor = el => grupo(el) ? el.querySelector("input:checked")?.value ?? "" : el.value;
  const ayuda = (id, nombre, ic, extra = "") => `<button type="button" id="${id}" aria-label="${nombre}" title="${nombre}"${extra}>${icono(ic)}</button>`;

  function pintar() {
    resuelto = false; fallos = 0;
    const oculto = !!ej.dibujo && (ej.dibujoOculto ?? A.dibujoOculto);
    vista().innerHTML = `
      ${volver(nombreTema(t), `#${c.id}/${t.id}`)}
      <form id="form" novalidate>
        <div class="meta" id="meta" role="img"></div>
        <h1 class="titulo-ej">${A.titulo}</h1>
        ${A.variantes ? `<div class="variantes" role="group" aria-label="Tipo de problema">${A.variantes.map(([v, txt]) => `<button type="button" data-var="${v}" aria-pressed="${v === variante}">${txt}</button>`).join("")}</div>` : ""}
        <p class="enunciado">${ej.html}</p>
        ${ej.dibujo ? `<div class="dibujo" id="dibujo"${oculto ? " hidden" : ""}>${ej.dibujo(false)}</div>` : ""}
        <div id="trabajo">${ej.trabajo || `<div class="campos">${ej.campos.map(campoHTML).join("")}</div>`}</div>
        <div class="acciones"><button class="principal" type="submit" id="b-comprobar">Comprobar</button></div>
        <div id="salida"></div>
        <div class="ayudas">
          ${ayuda("b-pista", "Pista", "pista")}
          ${oculto ? ayuda("b-dibujo", "Dibujo", "dibujo", ' aria-controls="dibujo" aria-pressed="false"') : ""}
          ${ayuda("b-otro", "Otro ejercicio", "otro")}
        </div>
      </form>`;
    meta();
    document.querySelectorAll("[data-var]").forEach(b => b.addEventListener("click", () => { variante = b.dataset.var; ej = A.nuevo(variante); pintar(); }));
    $("#form").addEventListener("submit", comprobar);
    if (oculto) $("#b-dibujo").addEventListener("click", () => {
      const d = $("#dibujo"); d.hidden = !d.hidden;
      $("#b-dibujo").setAttribute("aria-pressed", String(!d.hidden));
    });
    $("#b-pista").addEventListener("click", () => {
      if ($("#pista")) return;
      // El paso a paso solo si la herramienta puede abrir este mismo ejercicio
      // (ej.pasos: datos y enunciado en el ancla); nunca la herramienta entera.
      let enlace = "";
      if (ej.pasos) {
        const [pag, modo, datos] = ej.pasos, q = new URLSearchParams(Object.entries(datos).map(([x, y]) => [x, String(y)]));
        if (modo) q.set("texto", textoPlano(ej.html));
        const href = `herramientas/${pag}#${modo ? modo + "?" : ""}${q}`;
        enlace = `<p><a href="${href}" target="_blank" rel="noopener">Ver este ejercicio paso a paso</a></p>`;
      }
      $("#b-pista").setAttribute("aria-pressed", "true");
      $("#salida").insertAdjacentHTML("afterbegin", `<div class="aviso pista" id="pista">${A.pista.startsWith("<") ? A.pista : `<p>${A.pista}</p>`}${enlace}</div>`);
      $("#pista a")?.addEventListener("click", ev => { ev.preventDefault(); ventana(ev.currentTarget.href, A.herramienta[0]); });
    });
    $("#b-otro").addEventListener("click", () => { if (!resuelto) progreso.set(k, 0); ej = A.nuevo(variante); pintar(); });
    const primera = entradas()[0];
    (grupo(primera) ? primera.querySelector("input") : primera).focus({ preventScroll: true });
  }

  function comprobar(e) {
    e.preventDefault();
    if (resuelto) { ej = A.nuevo(variante); pintar(); return; }
    const v = {};
    entradas().forEach(i => { v[i.id.slice(2)] = valor(i); i.classList.remove("mal", "bien"); });
    if (Object.values(v).some(x => x.trim() === "")) { $("#salida").innerHTML = `<div class="aviso mal"><p>Contesta todo antes de comprobar.</p></div>`; return; }
    const r = ej.comprobar(v);
    entradas().forEach(i => i.classList.add((r.campos || []).includes(i.id.slice(2)) ? "mal" : "bien"));
    if (!r.bien) fallos++;
    const antes = progreso.get(k);
    if (r.bien) progreso.set(k, antes + 1);
    else if (fallos >= 2) progreso.set(k, 0);
    resuelto = r.bien || fallos >= 2;   // con dos fallos seguidos se enseña la solución
    let html = `<div class="aviso ${r.bien ? "bien" : "mal"}"><p><strong>${r.texto}</strong></p>${r.explica ? `<p class="explica">${r.explica}</p>` : ""}</div>`;
    if (resuelto) {
      $("#b-comprobar").textContent = "Siguiente";
      if (ej.dibujo) $("#dibujo").innerHTML = ej.dibujo(true);
      if (ej.operaciones) html += `<div class="operaciones"><h3>Las operaciones</h3>${ej.operaciones}</div>`;
      else if (!r.bien) html += `<div class="operaciones"><h3>Solución</h3><p>${ej.solucion}</p></div>`;
    }
    $("#salida").innerHTML = html;
    meta(r.bien && antes < META ? antes : -1);
    if (r.bien) antes + 1 === META ? Celebrar.meta() : Celebrar.acierto(Math.min(antes + 1, META));
    else Celebrar.fallo();
  }

  pintar();
}

// La herramienta paso a paso, en una ventana sobre el ejercicio (se cierra con
// la ✕, con Esc o pulsando fuera) para no perder el sitio en la tanda.
function ventana(href, titulo) {
  const v = $("#ventana");
  if (!v.showModal) { window.open(href, "_blank", "noopener"); return; }
  $("#ventana-titulo").textContent = titulo;
  $("#ventana-marco").title = titulo;
  $("#ventana-marco").src = href;
  v.showModal();
  $("#ventana-cerrar").focus();
}
// Cargada la herramienta, el foco pasa dentro para que las flechas funcionen ya;
// Esc dentro de ella también cierra la ventana.
function ventanaCargada() {
  const v = $("#ventana"), w = $("#ventana-marco").contentWindow;
  if (!v.open) return;
  try {
    w.focus();
    w.document.addEventListener("keydown", ev => { if (ev.key === "Escape") v.close(); });
  } catch (e) {}
}
// Botón de la cabecera para silenciar los sonidos de acierto.
function botonSonido() {
  const b = $("#sonido");
  b.innerHTML = icono(Celebrar.sonido ? "sonido" : "mudo");
  b.setAttribute("aria-pressed", String(Celebrar.sonido));
}
document.addEventListener("DOMContentLoaded", () => {
  botonSonido();
  $("#sonido").addEventListener("click", () => { Celebrar.alternar(); botonSonido(); });
  const v = $("#ventana");
  $("#ventana-cerrar").addEventListener("click", () => v.close());
  v.addEventListener("click", ev => { if (ev.target === v) v.close(); });   // fuera de la ventana
  v.addEventListener("close", () => { $("#ventana-marco").src = "about:blank"; });
  $("#ventana-marco").addEventListener("load", ventanaCargada);
});

// #curso/tema/actividad → la vista que toca. Sin curso, el último elegido.
function mostrar() {
  const [cid, tid, aid] = decodeURIComponent(location.hash.slice(1)).split("/");
  let guardado = null;
  try { guardado = localStorage.getItem("repaso-curso"); } catch (e) {}
  const c = TEMAS.cursos.find(x => x.id === cid) || TEMAS.cursos.find(x => x.id === guardado) || TEMAS.cursos[0];
  try { localStorage.setItem("repaso-curso", c.id); } catch (e) {}
  cabecera(c);
  const t = c.temas.find(x => x.id === tid), def = t && Repaso.temas[`${c.id}/${t.id}`];
  if (def && aid && def.actividades[aid]) actividad(c, t, def, aid);
  else if (def) tema(c, t, def);
  else inicio(c);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", mostrar);
document.addEventListener("DOMContentLoaded", mostrar);
