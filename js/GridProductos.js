(() => {
  "use strict";
  const B09_VERSION = "B09-robusto-1.0";
  window.B09_VERSION = B09_VERSION;
  console.debug("GridProductos.js cargado:", B09_VERSION, location.pathname);

  /* Datos simulados */
  const PRODUCTOS = [
    { id: 1, nombre: "Pollo a las brasas individual", precio: 6990,  categoria: "Pollos",    img: "../img/pollo-1.png" },
    { id: 2, nombre: "1/2 Pollo con papas",            precio: 9990,  categoria: "Pollos",    img: "../img/pollo-2.png" },
    { id: 3, nombre: "Pollo entero familiar",          precio: 14990, categoria: "Pollos",    img: "../img/pollo-3.jpg" },
    { id: 4, nombre: "Combo 2 personas",               precio: 12990, categoria: "Combos",    img: "../img/combo-2.jpg" },
    { id: 5, nombre: "Ensalada clásica",               precio: 3490,  categoria: "Ensaladas", img: "../img/ensalada.jpg" },
    { id: 6, nombre: "Bebida 1.5L",                    precio: 2200,  categoria: "Bebidas",   img: "../img/bebida15.jpg" }
  ];

  /* Helpers */
  const $  = (sel) => document.querySelector(sel);
  const show = (el) => el && el.classList.remove("d-none");
  const hide = (el) => el && el.classList.add("d-none");
  const clp = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

  function cardHTML(p) {
    const imgSrc = p.img || "https://placehold.co/600x400?text=Imagen";
    const imgAlt = p.img ? p.nombre : "Imagen no disponible";
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card h-100 shadow-sm">
          <img src="${imgSrc}" class="card-img-top" alt="${imgAlt}">
          <div class="card-body">
            <h2 class="h6 card-title text-truncate" title="${p.nombre}">${p.nombre}</h2>
            <div class="d-flex align-items-center justify-content-between">
              <span class="badge text-bg-light">${p.categoria}</span>
              <strong>${clp(p.precio)}</strong>
            </div>
          </div>
          <div class="card-footer bg-white">
            <a class="btn btn-outline-primary w-100" href="../catalogo/detalle/detalles.html?id=${p.id}">Ver detalle</a>
          </div>
        </div>
      </div>`;
  }

  /* Estado */
  const state = { q: "", categoria: "Todas", min: null, max: null };

  function filtrar() {
    const q = state.q.trim().toLowerCase();
    const cat = state.categoria;
    const min = state.min !== null && state.min !== "" ? Number(state.min) : null;
    const max = state.max !== null && state.max !== "" ? Number(state.max) : null;

    return PRODUCTOS.filter(p => {
      const matchTexto = q === "" ? true : p.nombre.toLowerCase().includes(q);
      const matchCat   = (cat === "Todas") ? true : p.categoria === cat;
      const precioOK   = (min === null || p.precio >= min) && (max === null || p.precio <= max);
      return matchTexto && matchCat && precioOK;
    });
  }

  /* Garantiza que existan los nodos; si no, los crea */
  function ensureNodes() {
    const wrapper = document.querySelector("main .container") || document.body;

    let grid = document.getElementById("b09-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.id = "b09-grid";
      grid.className = "row g-3 g-md-4";
      wrapper.appendChild(grid);
      console.warn("Se creó #b09-grid porque no existía.");
    }

    let empty = document.getElementById("b09-empty");
    if (!empty) {
      empty = document.createElement("div");
      empty.id = "b09-empty";
      empty.className = "text-center text-muted py-5 d-none";
      empty.innerHTML = `
        <p class="mb-3">No se encontraron productos con los criterios seleccionados.</p>
        <button id="b09-empty-reset" class="btn btn-outline-secondary">Limpiar filtros</button>`;
      wrapper.appendChild(empty);
      empty.querySelector("#b09-empty-reset").addEventListener("click", limpiarFiltros);
      console.warn("Se creó #b09-empty porque no existía.");
    }
    return { grid, empty };
  }

  function render() {
    const { grid, empty } = ensureNodes();
    const list = filtrar();

    if (list.length === 0) {
      grid.innerHTML = "";
      show(empty);
    } else {
      hide(empty);
      grid.innerHTML = list.map(cardHTML).join("");
    }
  }

  function syncMobileToDesktop() {
    const cat = $("#b09-categoria-m")?.value ?? "Todas";
    const min = $("#b09-min-m")?.value ?? "";
    const max = $("#b09-max-m")?.value ?? "";
    $("#b09-categoria") && ($("#b09-categoria").value = cat);
    $("#b09-min") && ($("#b09-min").value = min);
    $("#b09-max") && ($("#b09-max").value = max);
  }
  function syncDesktopToMobile() {
    const cat = $("#b09-categoria")?.value ?? "Todas";
    const min = $("#b09-min")?.value ?? "";
    const max = $("#b09-max")?.value ?? "";
    $("#b09-categoria-m") && ($("#b09-categoria-m").value = cat);
    $("#b09-min-m") && ($("#b09-min-m").value = min);
    $("#b09-max-m") && ($("#b09-max-m").value = max);
  }

  function limpiarFiltros() {
    state.q = "";
    state.categoria = "Todas";
    state.min = null;
    state.max = null;

    $("#b09-buscar") && ($("#b09-buscar").value = "");
    $("#b09-categoria") && ($("#b09-categoria").value = "Todas");
    $("#b09-min") && ($("#b09-min").value = "");
    $("#b09-max") && ($("#b09-max").value = "");
    $("#b09-categoria-m") && ($("#b09-categoria-m").value = "Todas");
    $("#b09-min-m") && ($("#b09-min-m").value = "");
    $("#b09-max-m") && ($("#b09-max-m").value = "");

    render();
  }

  function init() {
    console.debug("B09 init — ¿existe #b09-grid?", !!document.getElementById("b09-grid"));

    $("#b09-buscar")?.addEventListener("input", (e) => {
      state.q = e.target.value || "";
      render();
    });

    $("#b09-aplicar")?.addEventListener("click", () => {
      state.categoria = $("#b09-categoria")?.value ?? "Todas";
      state.min = $("#b09-min")?.value ?? "";
      state.max = $("#b09-max")?.value ?? "";
      syncDesktopToMobile();
      render();
    });
    $("#b09-limpiar")?.addEventListener("click", limpiarFiltros);

    $("#b09-aplicar-m")?.addEventListener("click", () => {
      syncMobileToDesktop();
      state.categoria = $("#b09-categoria")?.value ?? "Todas";
      state.min = $("#b09-min")?.value ?? "";
      state.max = $("#b09-max")?.value ?? "";
      render();
    });
    $("#b09-limpiar-m")?.addEventListener("click", limpiarFiltros);

    $("#b09-empty-reset")?.addEventListener("click", limpiarFiltros);

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
