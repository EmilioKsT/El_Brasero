// B-08 — Grid de productos (100% front simulado)

// Demo data (id, nombre, precio CLP, img opcional)
const B08_PRODUCTOS = [
  { id: 101, nombre: "Pollo a las brasas individual", precio: 6990,  img: "../img/pollo-individual.jpg" },
  { id: 102, nombre: "1/2 Pollo con papas",           precio: 9990,  img: "../img/medio-pollo-papas.jpg" },
  { id: 103, nombre: "Pollo entero familiar",          precio: 14990, img: "../img/pollo-familiar.jpg" },
  { id: 104, nombre: "Combo 2 personas",               precio: 12990, img: "../img/combo-2.jpg" },
  { id: 105, nombre: "Ensalada clásica",               precio: 3490,  img: "" },
  { id: 106, nombre: "Bebida 1.5L",                    precio: 2200,  img: "../img/bebida-15.jpg" },
];

const $b08 = (sel) => document.querySelector(sel);
const grid   = $b08("#b08-grid");
const buscar = $b08("#b08-buscar");
const orden  = $b08("#b08-orden");

// Formateador CLP
const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

function crearCard(p) {
  const col = document.createElement("div");
  // 6-4-3-2-1
  col.className = "col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2";

  const media = p.img
    ? `<img src="${p.img}" alt="${p.nombre}" class="card-img-top b08-img rounded-top">`
    : `<div class="d-flex align-items-center justify-content-center bg-light-subtle text-muted b08-ph rounded-top" aria-label="Imagen no disponible">Imagen no disponible</div>`;

  // Acceso directo a B-10 según árbol: /menu/detalle/index.html
  const hrefB10 = `../menu/detalle/index.html?id=${encodeURIComponent(p.id)}`;

  col.innerHTML = `
    <div class="card h-100 shadow-sm b08-card">
      ${media}
      <div class="card-body d-flex flex-column">
        <h2 class="h6 b08-title mb-2" title="${p.nombre}">${p.nombre}</h2>
        <div class="fw-bold mb-3">${fmtCLP.format(p.precio)}</div>
        <div class="mt-auto">
          <a class="btn btn-primary w-100" href="${hrefB10}">Ver detalle</a>
        </div>
      </div>
    </div>
  `;
  return col;
}

function render(lista) {
  grid.innerHTML = "";
  lista.forEach(p => grid.appendChild(crearCard(p)));
}

function filtrarYOrdenar() {
  const q = (buscar.value || "").toLowerCase().trim();
  let lista = B08_PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q));

  if (orden.value === "asc")  lista.sort((a, b) => a.precio - b.precio);
  if (orden.value === "desc") lista.sort((a, b) => b.precio - a.precio);

  render(lista);
}

buscar?.addEventListener("input", filtrarYOrdenar);
orden?.addEventListener("change", filtrarYOrdenar);

// Init
render(B08_PRODUCTOS);

document.querySelector("#menuPerfilLink")?.addEventListener("click", (e) => {
  e.preventDefault(); // no navegues todavía
  alert("Accediendo a tu perfil (simulado)...\nRedirigiendo...");
  setTimeout(() => {
    window.location.href = "../perfil/perfil.html"; // ruta según tu árbol
  }, 700);
});