// B-10 Detalle de producto 
// Datos de prueba coherentes con B-08 (id, nombre, precio, desc, img opcional)
const PRODUCTS = [
  { id: 1, nombre: "Pollo a las brasas individual", precio: 6990,  desc: "Porción individual con ensalada simple.", img: "../../img/prod-1.jpg" },
  { id: 2, nombre: "1/2 Pollo con papas",           precio: 9990,  desc: "Medio pollo con papas fritas para compartir.", img: "../../img/prod-2.jpg" },
  { id: 3, nombre: "Pollo entero familiar",         precio: 14990, desc: "Para 3–4 personas, incluye salsas.",          img: "../../img/prod-3.jpg" },
  { id: 4, nombre: "Combo 2 personas",              precio: 12990, desc: "1/2 pollo + papas + bebida.",                  img: "../../img/prod-4.jpg" },
  { id: 5, nombre: "Ensalada clásica",              precio: 3490,  desc: "Lechuga, tomate, cebolla y aliño.",            img: "" },
  { id: 6, nombre: "Bebida 1.5L",                   precio: 2200,  desc: "Bebida familiar de 1.5 litros.",               img: "../../img/prod-6.jpg" },
];

// Placeholder accesible cuando falta imagen
const PLACEHOLDER_SVG = `data:image/svg+xml;charset=UTF-8,
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' role='img' aria-label='Imagen no disponible'>
  <rect width='100%' height='100%' fill='%23e9ecef'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-size='32' font-family='Arial, sans-serif'>
    Imagen no disponible
  </text>
</svg>`.replace(/\n/g, '');

const $ = (sel) => document.querySelector(sel);

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

// Lee ?id= de la URL; default al #3 (Pollo entero familiar) si viene vacío
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  return Number.isFinite(id) ? id : 3;
}

function render(producto) {
  if (!producto) {
    $("#b10-notfound")?.classList.remove("d-none");
    return;
  }
  // Nombre/desc/precio
  $("#b10-crumb").textContent  = producto.nombre;
  $("#b10-nombre").textContent = producto.nombre;
  $("#b10-desc").textContent   = producto.desc || "Sin descripción.";
  $("#b10-precio").textContent = formatCLP(producto.precio); // $ 14.990 (AC)

  // Imagen con placeholder si no hay URL
  const img = $("#b10-img");
  if (producto.img && producto.img.trim()) {
    img.src = producto.img;
    img.alt = producto.nombre;
  } else {
    img.src = PLACEHOLDER_SVG;
    img.alt = "Imagen no disponible";
  }

  // Selector 1..10
  const sel = $("#b10-cant");
  for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = String(i);
    sel.appendChild(opt);
  }
  sel.value = "1";

  // Botón Agregar (simulado)
  const addBtn = $("#b10-add");
  addBtn.addEventListener("click", () => {
    const cant = parseInt(sel.value, 10);
    if (!Number.isFinite(cant) || cant < 1 || cant > 10) {
      addBtn.disabled = true;
      return;
    }
    addBtn.disabled = false;

    // Toast Bootstrap
    const toastEl = $("#b10-toast");
    const toast   = new bootstrap.Toast(toastEl, { delay: 2000 });
    toast.show();

    // AQUÍ se conectará el flujo real de carrito en B-11
    // e.g., window.Cart?.add(producto.id, cant)
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getProductIdFromURL();
  const prod = PRODUCTS.find(p => p.id === id);
  render(prod);
});
