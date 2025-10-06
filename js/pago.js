// B-13 Pago simulado — Front-end (sin backend)
(() => {
  const $ = (sel) => document.querySelector(sel);

  const elTotal = $("#b13-total");
  const btnPagar = $("#b13-pagar");
  const msgProc = $("#b13-procesando");
  const msgErr  = $("#b13-error");
  const orderEl = $("#b13-orden");
  const navCountEl = document.getElementById("navCartCount");

  const fmtCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      .format(n)
      .replace(/\s/g, " ");

  //parseo tolerante
  const parseMoneyToInt = (v) => {
    if (typeof v === "number") return Math.round(v);
    const digits = String(v ?? "").replace(/\D+/g, "");
    return Number(digits || 0);
  };

  // Leer total desde checkout (B-12) con tolerancia
  let RAW_TOTAL = parseMoneyToInt(sessionStorage.getItem("b12_total"));
  if (!RAW_TOTAL) RAW_TOTAL = parseMoneyToInt(localStorage.getItem("b12_total"));

  // badge carrito con respaldo
  const cartCount =
    Number(sessionStorage.getItem("cart_count")) ||
    Number(localStorage.getItem("cart_count")) || 0;
  if (navCountEl) navCountEl.textContent = cartCount;

  const orderId = sessionStorage.getItem("order_id") || "BR-0001";
  orderEl.textContent = orderId;

  // Si no hay total válido, bloquear pago y avisar
  if (!RAW_TOTAL || RAW_TOTAL <= 0) {
    elTotal.textContent = "$ 0";
    btnPagar.disabled = true;
    btnPagar.classList.add("disabled");
    msgErr.classList.remove("d-none");
    msgErr.textContent = "No se encontró el total del pedido. Vuelve al checkout.";
    return; // <- importante
  }

  // Pintar total correcto
  elTotal.textContent = fmtCLP(RAW_TOTAL);

  const disablePay = (flag) => {
    btnPagar.disabled = flag;
    btnPagar.classList.toggle("disabled", flag);
  };

  const show = (el) => el.classList.remove("d-none");
  const hide = (el) => el.classList.add("d-none");

  btnPagar.addEventListener("click", (e) => {
    e.preventDefault();
    if (btnPagar.disabled) return;

    const exito = document.getElementById("b13-exito").checked;

    hide(msgErr);
    show(msgProc);
    disablePay(true);

    setTimeout(() => {
      hide(msgProc);
      if (exito) {
        const q = new URLSearchParams({ order: orderId, total: RAW_TOTAL }).toString();
        window.location.href = `../../confirmacion/confirmacion.html?${q}`;
      } else {
        show(msgErr);
        disablePay(false);
      }
    }, 1200);
  });
})();
