// B-11 Carrito 
// Clave de almacenamiento
const STORAGE_KEY = "brasero_cart";

// Demo fallback: si llegas sin nada, cargo 1-2 ítems para demo
const DEMO_ITEMS = [
  { id: 1, nombre: "Pollo a las brasas individual", precio: 6990, qty: 1 },
  { id: 3, nombre: "Pollo entero familiar", precio: 14990, qty: 1 },
  // { id: 6, nombre: "Bebida 1.5L", precio: 2200, qty: 2 },
];

// Utils
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const fmtCLP = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

// Estado
function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateNavBadge(items);
}
function seedIfEmpty() {
  const items = readCart();
  if (items.length === 0) {
    writeCart(DEMO_ITEMS);
  } else {
    updateNavBadge(items);
  }
}
function updateNavBadge(items) {
  const count = items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
  const badge = $("#navCartCount");
  if (badge) badge.textContent = count;
}

// Mutaciones
function setQty(id, qty) {
  qty = Math.max(1, Math.min(10, Number(qty) || 1));
  const items = readCart();
  const it = items.find((x) => x.id === id);
  if (it) {
    it.qty = qty;
    writeCart(items);
    render();
  }
}
function incQty(id) {
  const items = readCart();
  const it = items.find((x) => x.id === id);
  if (it && it.qty < 10) {
    it.qty++;
    writeCart(items);
    render();
  }
}
function decQty(id) {
  const items = readCart();
  const it = items.find((x) => x.id === id);
  if (it && it.qty > 1) {
    it.qty--;
    writeCart(items);
    render();
  }
}
function removeItem(id) {
  let items = readCart().filter((x) => x.id !== id);
  writeCart(items);
  render();
}
function clearCart() {
  writeCart([]);
  render();
}

// Render
function calcTotal(items) {
  return items.reduce((acc, it) => acc + it.precio * it.qty, 0);
}

function renderDesktop(items) {
  const tbody = $("#b11-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  items.forEach((it) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="fw-medium">${it.nombre}</div>
        <div class="text-muted small">ID ${it.id}</div>
      </td>
      <td class="text-end">${fmtCLP(it.precio)}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group" aria-label="Cambiar cantidad">
          <button class="btn btn-outline-secondary" data-action="dec" data-id="${it.id}">−</button>
          <input class="form-control form-control-sm text-center" style="width:64px" value="${it.qty}" min="1" max="10" data-action="input" data-id="${it.id}" inputmode="numeric">
          <button class="btn btn-outline-secondary" data-action="inc" data-id="${it.id}">+</button>
        </div>
      </td>
      <td class="text-end fw-semibold">${fmtCLP(it.precio * it.qty)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${it.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Delegación de eventos (tabla)
  tbody.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "inc") incQty(id);
    if (action === "dec") decQty(id);
    if (action === "del") removeItem(id);
  };
  tbody.oninput = (e) => {
    const inp = e.target.closest('input[data-action="input"]');
    if (!inp) return;
    const id = Number(inp.dataset.id);
    const val = Number(inp.value);
    if (!Number.isNaN(val)) setQty(id, val);
  };
}

function renderMobile(items) {
  const wrap = $("#b11-cards");
  if (!wrap) return;
  wrap.innerHTML = "";

  items.forEach((it) => {
    const card = document.createElement("div");
    card.className = "card shadow-sm p-3";
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div class="me-3">
          <div class="fw-medium">${it.nombre}</div>
          <div class="small text-muted">Precio: ${fmtCLP(it.precio)}</div>
        </div>
        <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${it.id}">Eliminar</button>
      </div>
      <div class="d-flex align-items-center justify-content-between mt-2">
        <div class="btn-group" role="group" aria-label="Cambiar cantidad">
          <button class="btn btn-outline-secondary" data-action="dec" data-id="${it.id}">−</button>
          <input class="form-control text-center" style="width:72px" value="${it.qty}" min="1" max="10" data-action="input" data-id="${it.id}" inputmode="numeric">
          <button class="btn btn-outline-secondary" data-action="inc" data-id="${it.id}">+</button>
        </div>
        <div class="fw-semibold">${fmtCLP(it.precio * it.qty)}</div>
      </div>
    `;
    wrap.appendChild(card);
  });

  // Delegación de eventos (cards)
  wrap.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "inc") incQty(id);
    if (action === "dec") decQty(id);
    if (action === "del") removeItem(id);
  };
  wrap.oninput = (e) => {
    const inp = e.target.closest('input[data-action="input"]');
    if (!inp) return;
    const id = Number(inp.dataset.id);
    const val = Number(inp.value);
    if (!Number.isNaN(val)) setQty(id, val);
  };
}

function renderTotals(items) {
  const total = calcTotal(items);
  const totalDesk = $("#b11-total");
  const totalMob  = $("#b11-total-m");
  if (totalDesk) totalDesk.textContent = fmtCLP(total);
  if (totalMob)  totalMob.textContent  = fmtCLP(total);

  const emptyBox = $("#b11-empty");
  const hasItems = items.length > 0;
  if (emptyBox) emptyBox.classList.toggle("d-none", hasItems);

  // Habilitar / deshabilitar checkout
  const chkD = $("#b11-checkout");
  const chkM = $("#b11-checkout-m");
  [chkD, chkM].forEach((btn) => {
    if (!btn) return;
    if (hasItems) {
      btn.classList.remove("disabled");
      btn.removeAttribute("aria-disabled");
    } else {
      btn.classList.add("disabled");
      btn.setAttribute("aria-disabled", "true");
    }
  });
}

function bindActions() {
  const clear = $("#b11-clear");
  if (clear) clear.onclick = () => clearCart();
}

function render() {
  const items = readCart();
  renderDesktop(items);
  renderMobile(items);
  renderTotals(items);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty();
  bindActions();
  render();
});
