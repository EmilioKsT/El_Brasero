// B-16 — CRUD básico de productos 
const $ = s => document.querySelector(s);
const msgBox = $("#msgBox");
const tbody = $("#tbodyProductos");
const modalEl = $("#modalProducto");
const modal = new bootstrap.Modal(modalEl);

let productos = [
  { id: "P-001", nombre: "Pollo entero familiar", cat: "Pollos", precio: 14990, disp: true },
  { id: "P-002", nombre: "Bebida 1.5L", cat: "Bebidas", precio: 2200, disp: true },
];

let editId = null;

const fmtCLP = n =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(n).replace("CLP", "").trim();

function render() {
  tbody.innerHTML = "";
  if (!productos.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Sin productos</td></tr>`;
    return;
  }
  for (const p of productos) {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.cat}</td>
        <td class="text-end">${fmtCLP(p.precio)}</td>
        <td>${p.disp ? "Sí" : "No"}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editar('${p.id}')">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminar('${p.id}')">Eliminar</button>
        </td>
      </tr>`;
  }
}

function mostrarMsg(tipo, texto) {
  msgBox.className = `alert alert-${tipo}`;
  msgBox.textContent = texto;
  msgBox.classList.remove("d-none");
  setTimeout(() => msgBox.classList.add("d-none"), 2000);
}

$("#btnNuevo").onclick = () => {
  editId = null;
  $("#formProducto").reset();
  $("#modalProductoLabel").textContent = "Nuevo producto";
  modal.show();
};

window.editar = id => {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  editId = id;
  $("#modalProductoLabel").textContent = "Editar producto";
  $("#prodId").value = p.id;
  $("#prodNombre").value = p.nombre;
  $("#prodPrecio").value = p.precio;
  $("#prodCat").value = p.cat;
  $("#prodDesc").value = p.desc || "";
  $("#prodImg").value = p.img || "";
  $("#prodDisp").checked = p.disp;
  modal.show();
};

window.eliminar = id => {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  if (confirm(`¿Eliminar "${p.nombre}"?`)) {
    productos = productos.filter(x => x.id !== id);
    render();
    mostrarMsg("success", "Producto eliminado");
  }
};

$("#formProducto").onsubmit = e => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const data = {
    nombre: $("#prodNombre").value.trim(),
    precio: parseInt($("#prodPrecio").value),
    cat: $("#prodCat").value,
    desc: $("#prodDesc").value.trim(),
    img: $("#prodImg").value.trim(),
    disp: $("#prodDisp").checked
  };

  if (editId) {
    const idx = productos.findIndex(x => x.id === editId);
    productos[idx] = { ...productos[idx], ...data };
    mostrarMsg("success", "Producto actualizado");
  } else {
    const id = "P-" + String(productos.length + 1).padStart(3, "0");
    productos.push({ id, ...data });
    mostrarMsg("success", "Producto creado");
  }
  modal.hide();
  render();
};

render();
