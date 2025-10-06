// B-14 Confirmación 
(() => {
  const $ = (s) => document.querySelector(s);

  const elFlow   = $("#b14-flow");
  const elEmpty  = $("#b14-empty");
  const elOrden  = $("#b14-orden");
  const elFecha  = $("#b14-fecha");
  const elCli    = $("#b14-cliente");
  const elTbody  = $("#b14-tbody");
  const elTotal  = $("#b14-total");
  const btnPrint = $("#b14-print");
  const navCountEl = document.getElementById("navCartCount");

  const fmtCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      .format(Number(n || 0))
      .replace(/\s/g, " ");

  const parseMoneyToInt = (v) => {
    if (typeof v === "number") return Math.round(v);
    const digits = String(v ?? "").replace(/\D+/g, "");
    return Number(digits || 0);
  };

  // 1) Preferir querystring
  const qs = new URLSearchParams(location.search);
  let orderId = qs.get("order") || "";
  let totalQS = parseMoneyToInt(qs.get("total"));

  // 2) Storage
  if (!orderId) orderId = sessionStorage.getItem("order_id") || localStorage.getItem("order_id") || "";
  let totalStored =
    parseMoneyToInt(sessionStorage.getItem("b12_total")) ||
    parseMoneyToInt(localStorage.getItem("b12_total"));

  // 3) Carrito (último recurso)
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("brasero_cart") || "[]"); } catch { cart = []; }
  const totalCart = cart.reduce((acc, it) => acc + (Number(it.precio) || 0) * (Number(it.cant) || 0), 0);

  // 4) Total definitivo (prioriza URL > storage > carrito)
  const totalFinal = totalQS > 0 ? totalQS : (totalStored > 0 ? totalStored : totalCart);

  // 5) Sin total válido => “sin pedido”
  if (!totalFinal || totalFinal <= 0) {
    elEmpty?.classList.remove("d-none");
    if (navCountEl) navCountEl.textContent = String(Number(sessionStorage.getItem("cart_count")) || 0);
    return;
  }

  // Mostrar flujo
  elFlow?.classList.remove("d-none");

  // 6) Persistir si vino por query
  try {
    if (orderId) { sessionStorage.setItem("order_id", orderId); localStorage.setItem("order_id", orderId); }
    if (totalQS > 0) { sessionStorage.setItem("b12_total", String(totalQS)); localStorage.setItem("b12_total", String(totalQS)); }
  } catch {}

  // 7) Cabecera
  const now = new Date();
  const fechaStr = now.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
  const horaStr  = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  const datosCheckout = (() => {
    try { return JSON.parse(sessionStorage.getItem("brasero_checkout") || "{}"); }
    catch { return {}; }
  })();

  elOrden && (elOrden.textContent = orderId || "BR-—");
  elFecha && (elFecha.textContent = `${fechaStr} ${horaStr}`);
  elCli && (elCli.textContent = datosCheckout?.nombre || "Cliente");

  // 8) Tabla
  if (!cart || cart.length === 0) {
    elTbody && (elTbody.innerHTML = `
      <tr>
        <td>Pedido confirmado</td>
        <td class="text-end">—</td>
        <td class="text-center">—</td>
      </tr>`);
  } else {
    elTbody && (elTbody.innerHTML = cart.map(it => {
      const unit = Number(it.precio) || 0;
      const qty  = Number(it.cant)   || 0;
      return `
        <tr>
          <td>${it.nombre ?? "Producto"}</td>
          <td class="text-end">${fmtCLP(unit)}</td>
          <td class="text-center">${qty}</td>
        </tr>`;
    }).join(""));
  }

  // 9) Total mostrado (siempre el definitivo del flujo)
  elTotal && (elTotal.textContent = fmtCLP(totalFinal));

  // 10) Print simulado
  btnPrint?.addEventListener("click", () => window.print());

  // 11) Post: limpiar carrito + badge (opcional)
  // Si prefieres limpiar solo tras imprimir, mueve estas 3 líneas al handler de print.
  try { localStorage.removeItem("brasero_cart"); } catch {}
  sessionStorage.setItem("cart_count", "0");
  if (navCountEl) navCountEl.textContent = "0";
})();

