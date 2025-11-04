// B-17 — Pedidos (Admin Front Simulado)
const $ = (s) => document.querySelector(s);
const tbody = $("#tbodyPedidos");
const cards = $("#cardsPedidos");
const msgBox = $("#msgBox");
const toastOk = new bootstrap.Toast($("#toastOk"));

// Datos demo
let pedidos = [
  { id: "BR-2025-000123", fecha: "04/10", cliente: "María López", total: 19390, estado: "Pendiente" },
  { id: "BR-2025-000124", fecha: "04/10", cliente: "Juan Pérez",  total: 12990, estado: "En preparación" },
];

// Flujo de estados
const nextStates = {
  "Pendiente": ["En preparación", "Despachado", "Entregado", "Anulado"],
  "En preparación": ["Despachado", "Entregado"],
  "Despachado": ["Entregado"],
  "Entregado": [],
  "Anulado": []
};

// Util CLP
const fmtCLP = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
    .format(n)
    .replace("CLP", "")
    .trim();

const badgeEstado = (estado) => `<span class="badge st-${estado}">${estado}</span>`;

function selectEstados(actual, id) {
  const opciones = nextStates[actual] || [];
  const fixed = `<option disabled selected>${actual}</option>`;
  const opts = opciones.map((o) => `<option value="${o}">${o}</option>`).join("");
  return `<select class="form-select form-select-sm" aria-label="Cambiar estado" data-id="${id}">
            ${fixed}${opts}
          </select>`;
}

// Render tabla
function renderTabla() {
  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td class="fw-semibold">${p.id}</td>
      <td>${p.fecha}</td>
      <td>${p.cliente}</td>
      <td class="text-end">$ ${fmtCLP(p.total)}</td>
      <td>${badgeEstado(p.estado)}</td>
      <td class="text-center">${selectEstados(p.estado, p.id)}</td>
    </tr>
  `).join("");
  bindSelects();
}

// Render móvil
function renderCards() {
  cards.innerHTML = pedidos.map(p => {
    const sel = selectEstados(p.estado, p.id).replace("form-select-sm", "");
    return `
      <div class="card shadow-sm order-card">
        <div class="card-body">
          <div class="mb-1"><strong>${p.id}</strong></div>
          <div class="small text-muted mb-2">${p.fecha} · ${p.cliente}</div>
          <div class="row g-2 align-items-center">
            <div class="col-6"><span class="label small">Total</span></div>
            <div class="col-6 text-end fw-semibold">$ ${fmtCLP(p.total)}</div>
            <div class="col-6"><span class="label small">Estado</span></div>
            <div class="col-6">${badgeEstado(p.estado)}</div>
            <div class="col-12 mt-2">${sel}</div>
          </div>
        </div>
      </div>`;
  }).join("");
  bindSelects();
}

function bindSelects() {
  document.querySelectorAll("select[data-id]").forEach((sel) => {
    sel.onchange = (e) => {
      const id = e.target.getAttribute("data-id");
      const nuevo = e.target.value;
      cambiarEstado(id, nuevo, e.target);
    };
  });
}

function mostrarMsg(tipo, texto) {
  msgBox.className = `alert alert-${tipo}`;
  msgBox.textContent = texto;
  msgBox.classList.remove("d-none");
  setTimeout(() => msgBox.classList.add("d-none"), 2500);
}

function cambiarEstado(id, nuevo, selectEl) {
  const pedido = pedidos.find((x) => x.id === id);
  if (!pedido) return;

  // “Anulado” solo desde Pendiente
  if (nuevo === "Anulado") {
    if (pedido.estado !== "Pendiente") {
      mostrarMsg("warning", "No se puede anular un pedido en este estado");
      selectEl.selectedIndex = 0;
      return;
    }
    if (!confirm(`¿Anular el pedido ${id}?`)) {
      selectEl.selectedIndex = 0;
      return;
    }
    pedido.estado = "Anulado";
    repaint();
    toastOk.show();
    return;
  }

  // Resto de flujos válidos
  const permitidos = nextStates[pedido.estado] || [];
  if (!permitidos.includes(nuevo)) {
    mostrarMsg("danger", "Cambio de estado no permitido");
    selectEl.selectedIndex = 0;
    return;
  }

  pedido.estado = nuevo;
  repaint();
  toastOk.show();
}

function repaint() {
  renderTabla();
  renderCards();
}

// Init
repaint();
