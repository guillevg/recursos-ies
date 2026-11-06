// Ventanas modales comunes a todos los juegos:
// un botón con data-abre="id" abre el <dialog id="id">; dentro, data-cierra lo cierra;
// tocar fuera de la ventana también la cierra.
document.querySelectorAll("[data-abre]").forEach(boton =>
  boton.addEventListener("click", () => document.getElementById(boton.dataset.abre).showModal()));

document.querySelectorAll("dialog").forEach(ventana =>
  ventana.addEventListener("click", e => {
    const r = ventana.getBoundingClientRect();
    const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (fuera || e.target.closest("[data-cierra]")) ventana.close();
  }));
