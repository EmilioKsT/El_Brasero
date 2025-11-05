// B-12 Checkout 
(function () {
  const $ = (s) => document.querySelector(s);

  const toCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      .format(n).replace("CLP", "").trim();

  // Carrito (localStorage o demo)
  const demoCart = [
    { id: 3, nombre: "Pollo entero familiar", precio: 14990, cant: 1 },
    { id: 6, nombre: "Bebida 1.5L",          precio:  2200, cant: 2 },
  ];
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("brasero_cart") || "[]"); } catch {}
  if (!cart.length) cart = demoCart;

  // Badge
  const navCount = $("#navCartCount");
  if (navCount) navCount.textContent = cart.reduce((a, it) => a + (it.cant || 0), 0);

  // Flujo
  const boxEmpty = $("#b12-empty"), flow = $("#b12-flow");
  if (!cart.length) { boxEmpty.classList.remove("d-none"); flow.classList.add("d-none"); return; }
  boxEmpty.classList.add("d-none"); flow.classList.remove("d-none");

  // Resumen
  const itemsBox = $("#b12-items"), subEl = $("#b12-subtotal"), envEl = $("#b12-envio"), totEl = $("#b12-total");
  const parseCLP = (v) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
  const getQty   = (it) => Number(it.cant ?? it.cantidad ?? it.qty) || 0;
  const getPrice = (it) => parseCLP(it.precio ?? it.price ?? it.unitPrice);

  let subtotal = 0;
  itemsBox.innerHTML = cart.map(it => {
    const qty = getQty(it), price = getPrice(it), line = qty * price; subtotal += line;
    return `<div class="d-flex justify-content-between small mb-1">
      <span>${it.nombre ?? it.name ?? "Producto"} x${qty}</span><span>${toCLP(line)}</span></div>`;
  }).join("");

  const envio = 0, total = subtotal + envio;
  subEl.textContent = toCLP(subtotal);
  envEl.textContent = toCLP(envio);
  totEl.textContent = toCLP(total);

  // Validaciones
  const form = $("#b12-form"), nombre = $("#b12-nombre"), fono = $("#b12-fono"), dir = $("#b12-direccion"), comuna = $("#b12-comuna");
  const setInvalid = (i, bad) => { i.classList.toggle("is-invalid", bad); i.classList.toggle("is-valid", !bad); };
  const validate = () => {
    let ok = true;
    setInvalid(nombre, !nombre.value.trim()); ok &&= !!nombre.value.trim();
    const phoneOK = /^\d{9,11}$/.test((fono.value || "").trim()); setInvalid(fono, !phoneOK); ok &&= phoneOK;
    setInvalid(dir, !dir.value.trim()); ok &&= !!dir.value.trim();
    setInvalid(comuna, !comuna.value.trim()); ok &&= !!comuna.value.trim();
    return ok;
  };

  const makeOrderId = () => `BR-${(Date.now() % 1e6).toString().padStart(6, "0")}`;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Guardar datos para B-13/B-14
    const datos = {
      nombre: nombre.value.trim(),
      fono: fono.value.trim(),
      email: ($("#b12-email")?.value || "").trim(),
      direccion: dir.value.trim(),
      comuna: comuna.value.trim(),
      total
    };

    try {
      sessionStorage.setItem("brasero_checkout", JSON.stringify(datos));
      sessionStorage.setItem("b12_total", String(Math.round(total)));
      localStorage.setItem("b12_total",  String(Math.round(total)));

      const orderId = sessionStorage.getItem("order_id") || localStorage.getItem("order_id") || makeOrderId();
      sessionStorage.setItem("order_id", orderId);
      localStorage.setItem("order_id", orderId);

      const itemsCount = cart.reduce((a, it) => a + (Number(it.cant) || 0), 0);
      sessionStorage.setItem("cart_count", String(itemsCount));
    } catch {}

    // --- Redirección a B-13 (pago) ---
    // --- Redirección a B-13 (pago) ---
    // TOTAL en query (si no lo quieres en la URL, quita "?${q}" y léelo desde storage en pago.html)
    const q = new URLSearchParams({ total: Math.round(total) }).toString();

    // 100% directo al archivo correcto:
    const ABS_URL = `${location.origin}/El_Brasero/front/carrito/pago/pago.html`;
    window.location.assign(`${ABS_URL}?${q}`);

 
  }); // <-- cierra el submit
})();   // <-- cierra la IIFE
