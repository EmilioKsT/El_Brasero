// B-13 Pago simulado
(() => {
  const $ = (sel) => document.querySelector(sel);

  const elTotal   = $("#b13-total");
  const btnPagar  = $("#b13-pagar");
  const msgProc   = $("#b13-procesando");
  const msgErr    = $("#b13-error");
  const orderEl   = $("#b13-orden");
  const navCountEl = document.getElementById("navCartCount");

  const fmtCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      .format(n)
      .replace(/\s/g, " ");

  // Parseo tolerante
  const parseMoneyToInt = (v) => {
    if (typeof v === "number") return Math.round(v);
    const digits = String(v ?? "").replace(/\D+/g, "");
    return Number(digits || 0);
  };

  // --- OBTENER TOTAL ROBUSTO ---
  // 1) Total desde B-12 (session -> local como respaldo)
  let RAW_TOTAL =
    parseMoneyToInt(sessionStorage.getItem("b12_total")) ||
    parseMoneyToInt(localStorage.getItem("b12_total"));

  // 2) Querystring ?total=...
  if (!RAW_TOTAL) {
    const qsTotal = parseMoneyToInt(new URLSearchParams(location.search).get("total"));
    if (qsTotal) RAW_TOTAL = qsTotal;
  }

  // 3) Fallback: recalcular desde el carrito guardado
  if (!RAW_TOTAL) {
    try {
      const cart = JSON.parse(localStorage.getItem("brasero_cart") || "[]");
      RAW_TOTAL = cart.reduce((acc, it) =>
        acc + (Number(it.precio) || 0) * (Number(it.cant) || 0), 0);
    } catch { /* no-op */ }
  }

  // Badge carrito con respaldo
  const cartCount =
    Number(sessionStorage.getItem("cart_count")) ||
    Number(localStorage.getItem("cart_count")) || 0;
  if (navCountEl) navCountEl.textContent = cartCount;

  // Order ID (generar/persistir si no existe)
  const makeOrderId = () => {
    const y = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
    return `BR-${y}-${seq}`;
  };
  const orderId =
    sessionStorage.getItem("order_id") ||
    localStorage.getItem("order_id") ||
    makeOrderId();

  try {
    sessionStorage.setItem("order_id", orderId);
    localStorage.setItem("order_id", orderId);
  } catch {}
  orderEl.textContent = orderId;

  // Sin total => bloquear
  if (!RAW_TOTAL || RAW_TOTAL <= 0) {
    elTotal.textContent = "$ 0";
    btnPagar.disabled = true;
    btnPagar.classList.add("disabled");
    msgErr.classList.remove("d-none");
    msgErr.textContent = "No se encontró el total del pedido. Vuelve al checkout.";
    return;
  }

  // Pintar total
  elTotal.textContent = fmtCLP(RAW_TOTAL);

  const disablePay = (flag) => {
    btnPagar.disabled = flag;
    btnPagar.classList.toggle("disabled", flag);
  };
  const show = (el) => el.classList.remove("d-none");
  const hide = (el) => el.classList.add("d-none");

  // Simular pago
  btnPagar.addEventListener("click", (e) => {
    e.preventDefault();
    if (btnPagar.disabled) return;

    const exito = document.getElementById("b13-exito")?.checked ?? true;

    hide(msgErr);
    show(msgProc);
    disablePay(true);

    setTimeout(() => {
      hide(msgProc);
      if (exito) {
        const q = new URLSearchParams({ order: orderId, total: RAW_TOTAL }).toString();
        const url = new URL("./confirmacion/confirmacion.html", location.href);
        url.search = q;
        window.location.href = url.toString();
      } else {
        show(msgErr);
        disablePay(false);
      }
    }, 1200);
  });
})();
