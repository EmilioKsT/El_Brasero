// B-12 Checkout
// AC: valida campos, muestra resumen CLP, envío $0, y continúa a B-13. (B-12 DoR)
// Carrito: se toma de localStorage "brasero_cart" si existe; si no, se arma demo. (E3/E2)

(function () {
  const $ = (sel) => document.querySelector(sel);

  // Util CLP
  const toCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      .format(n).replace("CLP", "").trim();

  // Leer carrito (memoria/localStorage); si no hay, usar demo del AC
  // Demo según B-12: Pollo entero familiar x1 (14990), Bebida 1.5L x2 (2200) => 19390 total
  const demoCart = [
    { id: 3, nombre: "Pollo entero familiar", precio: 14990, cant: 1 },
    { id: 6, nombre: "Bebida 1.5L", precio: 2200, cant: 2 },
  ];

  let cart = [];
  try {
    const saved = localStorage.getItem("brasero_cart");
    cart = saved ? JSON.parse(saved) : demoCart;
  } catch { cart = demoCart; }

  // Navbar badge
  const navCount = $("#navCartCount");
  if (navCount) {
    const items = cart.reduce((acc, it) => acc + it.cant, 0);
    navCount.textContent = items;
  }

  // Estados vacio/flujo
  const boxEmpty = $("#b12-empty");
  const flow = $("#b12-flow");

  if (!cart || cart.length === 0) {
    boxEmpty.classList.remove("d-none");
    flow.classList.add("d-none");
    return;
  } else {
    boxEmpty.classList.add("d-none");
    flow.classList.remove("d-none");
  }

  // Pintar resumen
  const itemsBox = $("#b12-items");
  const subtotalEl = $("#b12-subtotal");
  const envioEl = $("#b12-envio");
  const totalEl = $("#b12-total");

  const subtotal = cart.reduce((acc, it) => acc + it.precio * it.cant, 0);
  const envio = 0; // regla B-12
  const total = subtotal + envio;

  // Listado simple de ítems
  itemsBox.innerHTML = cart.map(it =>
    `<div class="d-flex justify-content-between small mb-1">
      <span>${it.nombre} x${it.cant}</span>
      <span>${toCLP(it.precio * it.cant)}</span>
    </div>`
  ).join("");

  subtotalEl.textContent = toCLP(subtotal);
  envioEl.textContent = toCLP(envio);
  totalEl.textContent = toCLP(total);

  // Formulario y validaciones
  const form = $("#b12-form");
  const nombre = $("#b12-nombre");
  const fono = $("#b12-fono");
  const direccion = $("#b12-direccion");
  const comuna = $("#b12-comuna");

  function setInvalid(input, invalid) {
    input.classList.toggle("is-invalid", invalid);
    input.classList.toggle("is-valid", !invalid);
  }

  function validate() {
    let ok = true;

    // Nombre
    setInvalid(nombre, !nombre.value.trim());
    ok = ok && !!nombre.value.trim();

    // Teléfono: 9-11 dígitos
    const phoneOK = /^\d{9,11}$/.test((fono.value || "").trim());
    setInvalid(fono, !phoneOK);
    ok = ok && phoneOK;

    // Dirección
    setInvalid(direccion, !direccion.value.trim());
    ok = ok && !!direccion.value.trim();

    // Comuna
    setInvalid(comuna, !comuna.value.trim());
    ok = ok && !!comuna.value.trim();

    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    const datos = {
      nombre: nombre.value.trim(),
      fono: fono.value.trim(),
      email: ($("#b12-email")?.value || "").trim(),
      direccion: direccion.value.trim(),
      comuna: comuna.value.trim(),
      total,
    };
    try { sessionStorage.setItem("brasero_checkout", JSON.stringify(datos)); } catch {}

    // Navega a B-13 (pago simulado)
    window.location.href = "../confirmacion/index.html";
  });
})();
