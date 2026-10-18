// Web de repaso del alumnado: vistas y progreso. Los cursos, temas y bloques
// llegan de la PD en datos.js (TEMAS, lo genera scripts/publicar_alumnado.py);
// las actividades, de actividades/*.js (Repaso.tema). Direcciones con # para
// poder enlazar un tema o una actividad: #2eso, #2eso/SA1, #2eso/SA1/rectangulos.
"use strict";

const $ = s => document.querySelector(s);
const vista = () => $("#vista");

// Progreso en este navegador: aciertos seguidos por actividad (máx. 5). No sale de aquí.
const progreso = (() => {
  let p = {};
  try { p = JSON.parse(localStorage.getItem("repaso-progreso") || "{}"); } catch (e) {}
  return {
    get: k => p[k] || 0,
    set(k, v) { p[k] = Math.min(v, 5); try { localStorage.setItem("repaso-progreso", JSON.stringify(p)); } catch (e) {} },
  };
})();

const clave = (c, t, a) => `${c}/${t}/${a}`;
const nombreCorto = c => c.nombre.split(" · ")[0];
const estado = k => { const p = progreso.get(k); return `<span class="estado ${p >= 5 ? "hecho" : ""}">${p >= 5 ? "Superada" : p ? `${p} de 5` : "Empezar"}</span>`; };
const migas = partes => `<nav class="migas" aria-label="Estás en">${partes.map(([t, href]) =>
  href ? `<a href="${href}">${t}</a> <span aria-hidden="true">›</span>` : `<span>${t}</span>`).join(" ")}</nav>`;

function cabecera(c) {
  $("#cursos").innerHTML = TEMAS.cursos.map(x =>
    `<a href="#${x.id}"${x.id === c.id ? ' aria-current="page"' : ""}>${nombreCorto(x)}</a>`).join("");
}

function inicio(c) {
  document.title = `Repaso de ${nombreCorto(c)}`;
  vista().innerHTML = `
    <h1>Repaso de ${c.nombre}</h1>
    <p class="intro">Elige un tema y practica a tu ritmo. Cada ejercicio cambia los números cada vez, así que puedes repetirlo tantas veces como quieras. Si te atascas, pide una pista o míralo paso a paso.</p>
    <ul class="lista">${c.temas.map((t, i) => {
      const def = Repaso.temas[`${c.id}/${t.id}`];
      if (!def) return `<li><div class="fila"><span class="letra">${i + 1}</span><span class="titulo">${t.titulo}</span><span class="estado">Pronto</span></div></li>`;
      const acts = Object.values(def.bloques).flat(), hechas = acts.filter(a => progreso.get(clave(c.id, t.id, a)) >= 5).length;
      return `<li><a href="#${c.id}/${t.id}"><span class="letra">${i + 1}</span><span><span class="titulo">${t.titulo}</span><span class="sub">${acts.length} actividades</span></span><span class="estado">${hechas} de ${acts.length} superadas</span></a></li>`;
    }).join("")}</ul>
    <p class="pie">Tu progreso se guarda solo en este navegador: no se envía a ningún sitio.</p>`;
}

function tema(c, t, def) {
  document.title = t.titulo;
  const con = t.bloques.filter(b => (def.bloques[b.letra] || []).length), sin = t.bloques.filter(b => !(def.bloques[b.letra] || []).length);
  vista().innerHTML = `
    ${migas([[nombreCorto(c), `#${c.id}`], [t.titulo]])}
    <h1>${t.titulo}</h1>
    <p class="intro">Los mismos bloques que en tu cuaderno. Una actividad está superada cuando aciertas cinco ejercicios seguidos.</p>
    ${con.map(b => `<h2>${b.letra} · ${b.titulo}</h2><ul class="lista">${def.bloques[b.letra].map((a, i) => {
      const A = def.actividades[a];
      return `<li><a href="#${c.id}/${t.id}/${a}"><span class="letra">${b.letra}${i + 1}</span><span><span class="titulo">${A.titulo}</span><span class="sub">${A.sub}</span></span>${estado(clave(c.id, t.id, a))}</a></li>`;
    }).join("")}</ul>`).join("")}
    ${sin.length ? `<h2>Próximamente</h2><ul class="lista">${sin.map(b => `<li><div class="fila"><span class="letra">${b.letra}</span><span class="titulo">${b.titulo}</span><span class="estado">Pronto</span></div></li>`).join("")}</ul>` : ""}`;
}

function actividad(c, t, def, claveAct) {
  const A = def.actividades[claveAct], k = clave(c.id, t.id, claveAct);
  const bloque = t.bloques.find(b => (def.bloques[b.letra] || []).includes(claveAct));
  let variante = A.variantes ? A.variantes[0][0] : undefined;
  let ej = A.nuevo(variante), resuelto = false, fallos = 0;
  document.title = A.titulo;

  function campoHTML(x) {
    if (x.potencia) return `<div class="campo"><label for="f-${x.id}">${x.etiqueta}</label><div class="potencia"><input class="casilla" id="f-${x.id}" inputmode="decimal" autocomplete="off"><span class="x">· 10</span><input class="casilla exp" id="f-${x.potencia}" inputmode="numeric" autocomplete="off" aria-label="Exponente"></div></div>`;
    return `<div class="campo"><label for="f-${x.id}">${x.etiqueta}</label><input class="casilla" id="f-${x.id}" inputmode="decimal" autocomplete="off"></div>`;
  }
  const puntos = () => { const p = progreso.get(k); return `<span class="puntos" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${i < p ? "on" : ""}"></i>`).join("")}</span><span>${p >= 5 ? "Actividad superada. Puedes seguir practicando." : `${p} de 5 seguidos`}</span>`; };
  const entradas = () => [...document.querySelectorAll("#trabajo input, #trabajo select")];

  function pintar() {
    resuelto = false; fallos = 0;
    const oculto = !!ej.dibujo && (ej.dibujoOculto ?? A.dibujoOculto);
    vista().innerHTML = `
      ${migas([[nombreCorto(c), `#${c.id}`], [t.titulo, `#${c.id}/${t.id}`], [`Bloque ${bloque.letra}`]])}
      <h1>${A.titulo}</h1>
      ${A.variantes ? `<div class="variantes" role="group" aria-label="Tipo de problema">${A.variantes.map(([v, txt]) => `<button type="button" data-var="${v}" aria-pressed="${v === variante}">${txt}</button>`).join("")}</div>` : ""}
      <form class="ejercicio" id="form" novalidate>
        <p class="enunciado">${ej.html}</p>
        ${ej.dibujo ? `<div class="dibujo" id="dibujo"${oculto ? " hidden" : ""}>${ej.dibujo(false)}</div>` : ""}
        <div id="trabajo">${ej.trabajo || `<div class="campos">${ej.campos.map(campoHTML).join("")}</div>`}</div>
        <div class="acciones">
          <button class="btn principal" type="submit" id="b-comprobar">Comprobar</button>
          <button class="btn" type="button" id="b-pista">Pista</button>
          ${oculto ? `<button class="btn" type="button" id="b-dibujo" aria-controls="dibujo" aria-expanded="false">Ver el dibujo</button>` : ""}
          <button class="btn" type="button" id="b-otro">Otro ejercicio</button>
        </div>
        <div id="salida"></div>
        <div class="marcador" id="marcador">${puntos()}</div>
      </form>`;
    document.querySelectorAll("[data-var]").forEach(b => b.addEventListener("click", () => { variante = b.dataset.var; ej = A.nuevo(variante); pintar(); }));
    $("#form").addEventListener("submit", comprobar);
    if (oculto) $("#b-dibujo").addEventListener("click", () => {
      const d = $("#dibujo"); d.hidden = !d.hidden;
      $("#b-dibujo").textContent = d.hidden ? "Ver el dibujo" : "Ocultar el dibujo";
      $("#b-dibujo").setAttribute("aria-expanded", !d.hidden);
    });
    $("#b-pista").addEventListener("click", () => {
      if ($("#pista")) return;
      // Con ej.pasos, la herramienta se abre con este mismo ejercicio (datos y enunciado en el ancla).
      const [nombre, pagina] = A.herramienta;
      let href = `herramientas/${pagina}`, texto = `Verlo paso a paso: ${nombre}`;
      if (ej.pasos) {
        const [pag, modo, datos] = ej.pasos, q = new URLSearchParams(Object.entries(datos).map(([x, y]) => [x, String(y)]));
        if (modo) q.set("texto", textoPlano(ej.html));
        href = `herramientas/${pag}#${modo ? modo + "?" : ""}${q}`;
        texto = "Ver este ejercicio paso a paso";
      }
      $("#salida").insertAdjacentHTML("afterbegin", `<div class="pista" id="pista"><p>${A.pista}</p><p><a href="${href}" target="_blank" rel="noopener">${texto}</a></p></div>`);
    });
    $("#b-otro").addEventListener("click", () => { if (!resuelto) progreso.set(k, 0); ej = A.nuevo(variante); pintar(); });
    entradas()[0].focus({ preventScroll: true });
  }

  function comprobar(e) {
    e.preventDefault();
    if (resuelto) { ej = A.nuevo(variante); pintar(); return; }
    const v = {};
    entradas().forEach(i => { v[i.id.slice(2)] = i.value; i.classList.remove("mal", "bien"); });
    if (Object.values(v).some(x => x.trim() === "")) { $("#salida").innerHTML = `<div class="respuesta mal"><p>Rellena todas las casillas antes de comprobar.</p></div>`; return; }
    const r = ej.comprobar(v);
    entradas().forEach(i => i.classList.add((r.campos || []).includes(i.id.slice(2)) ? "mal" : "bien"));
    if (!r.bien) fallos++;
    if (r.bien) progreso.set(k, progreso.get(k) + 1);
    else if (fallos >= 2) progreso.set(k, 0);
    resuelto = r.bien || fallos >= 2;   // con dos fallos seguidos se enseña la solución
    let html = `<div class="respuesta ${r.bien ? "bien" : "mal"}"><p><strong>${r.texto}</strong></p>${r.explica ? `<p class="explica">${r.explica}</p>` : ""}</div>`;
    if (resuelto) {
      $("#b-comprobar").textContent = "Siguiente";
      if (ej.dibujo) $("#dibujo").innerHTML = ej.dibujo(true);
      if (ej.operaciones) html += `<div class="operaciones"><h3>Las operaciones</h3>${ej.operaciones}</div>`;
      else if (!r.bien) html += `<div class="operaciones"><h3>Solución</h3><p>${ej.solucion}</p></div>`;
    }
    $("#salida").innerHTML = html;
    $("#marcador").innerHTML = puntos();
  }

  pintar();
}

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
