console.log("Script admin-productos.js cargado");

if (!AuthService.esAdmin()) {
    window.location.href = './login.html';
}

// 2. REFERENCIAS DOM
const tbody = document.getElementById('tbodyProductos');
const modalEl = document.getElementById('modalProducto');
const formProducto = document.getElementById('formProducto');
const msgBox = document.getElementById('msgBox');
const modalTitulo = document.getElementById('modalProductoLabel');

// Instancia Modal Bootstrap 5
const bsModal = new bootstrap.Modal(modalEl);

// Inputs
const inId = document.getElementById('prodId');
const inNombre = document.getElementById('prodNombre');
const inPrecio = document.getElementById('prodPrecio');
const inCat = document.getElementById('prodCat');
const inDesc = document.getElementById('prodDesc');
const inImg = document.getElementById('prodImg');
const inDisp = document.getElementById('prodDisp');

// ==========================================
// A. LISTAR (READ)
// ==========================================
async function cargarProductos() {
    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/admin/productos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar datos');

        const productos = await res.json();
        renderizarTabla(productos);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Error de conexión</td></tr>`;
    }
}

function renderizarTabla(productos) {
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay productos registrados.</td></tr>`;
        return;
    }

    let html = '';
    const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    productos.forEach(p => {
        // Badges de estado con Iconos
        const estado = p.disponible 
            ? '<span class="badge rounded-pill text-bg-success"><i class="fa-solid fa-check"></i></span>'
            : '<span class="badge rounded-pill text-bg-secondary"><i class="fa-solid fa-ban"></i></span>';

        html += `
            <tr>
                <td class="text-muted small align-middle">${p._id.slice(-6)}</td>
                <td class="fw-bold align-middle">${p.nombre}</td>
                <td class="align-middle"><span class="badge border text-dark bg-light">${p.categoria}</span></td>
                <td class="text-end align-middle font-monospace">${formatoCLP.format(p.precio)}</td>
                <td class="text-center align-middle">${estado}</td>
                <td class="text-center align-middle">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="prepararEdicion('${p._id}')" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarProducto('${p._id}')" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// ==========================================
// B. CREAR Y EDITAR (POST / PUT)
// ==========================================

// Abrir Modal "Nuevo"
document.getElementById('btnNuevo').addEventListener('click', () => {
    formProducto.reset();
    inId.value = ''; 
    modalTitulo.innerHTML = '<i class="fa-solid fa-circle-plus me-2"></i>Nuevo Producto';
    bsModal.show();
});

// Abrir Modal "Editar" (llamado desde HTML)
window.prepararEdicion = async (id) => {
    try {
        const res = await fetch(`${API_URL}/productos/${id}`);
        const p = await res.json();

        inId.value = p._id;
        inNombre.value = p.nombre;
        inPrecio.value = p.precio;
        inCat.value = p.categoria;
        inDesc.value = p.descripcion || '';
        inImg.value = p.imagenUrl || '';
        inDisp.checked = p.disponible;

        modalTitulo.innerHTML = '<i class="fa-solid fa-pen-to-square me-2"></i>Editar Producto';
        bsModal.show();
    } catch (e) {
        mostrarAlerta('Error al obtener datos', 'warning');
    }
};

// Guardar
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = inId.value;
    const esEdicion = !!id;

    const payload = {
        nombre: inNombre.value.trim(),
        precio: parseFloat(inPrecio.value),
        categoria: inCat.value,
        descripcion: inDesc.value.trim(),
        imagenUrl: inImg.value.trim(),
        disponible: inDisp.checked
    };

    const url = esEdicion ? `${API_URL}/admin/productos/${id}` : `${API_URL}/admin/productos`;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            bsModal.hide();
            mostrarAlerta(esEdicion ? 'Producto actualizado' : 'Producto creado', 'success');
            cargarProductos();
        } else {
            const err = await res.json();
            alert(err.mensaje || 'Error al guardar');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
});

// ==========================================
// C. ELIMINAR (DELETE) 
// ==========================================
window.eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar producto permanentemente?')) return;

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/admin/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            mostrarAlerta('Producto eliminado', 'success');
            cargarProductos();
        } else {
            mostrarAlerta('No se pudo eliminar', 'danger');
        }
    } catch (e) {
        mostrarAlerta('Error de conexión', 'danger');
    }
};

// Utils
function mostrarAlerta(msg, tipo) {
    msgBox.innerHTML = `<i class="fa-solid fa-circle-info me-2"></i>${msg}`;
    msgBox.className = `alert alert-${tipo} d-block`;
    setTimeout(() => msgBox.className = 'alert d-none', 3000);
}

// Init
document.addEventListener('DOMContentLoaded', cargarProductos);