// front/js/carrito.js
console.log("Script carrito.js cargado");

// 1. Verificar Autenticación (ZTA)
if (!AuthService.estaLogueado()) {
    window.location.href = './login.html';
}

// 2. Referencias al DOM
const tbodyDesktop = document.getElementById('b11-tbody');
const containerMobile = document.getElementById('b11-cards');
const emptyState = document.getElementById('b11-empty');
const contenidoPrincipal = document.querySelector('.row.g-4'); // El contenedor de la tabla y resumen
const spanTotal = document.getElementById('b11-total');
const spanTotalMobile = document.getElementById('b11-total-m');
const btnCheckout = document.getElementById('b11-checkout');
const btnCheckoutMobile = document.getElementById('b11-checkout-m');
const btnVaciar = document.getElementById('b11-clear');
const badgeNav = document.getElementById('navCartCount'); // Badge del navbar

// Formateador de moneda
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// ==========================================
// A. CARGAR CARRITO (GET)
// ==========================================
async function cargarCarrito() {
    try {
        const token = AuthService.obtenerToken();
        
        // Fetch al Backend
        const respuesta = await fetch(`${API_URL}/carrito`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error('Error al cargar carrito');

        const data = await respuesta.json(); // { items: [], total: 0, totalItems: 0 }

        // Actualizar Badge del Navbar (Global)
        if(badgeNav) badgeNav.textContent = data.totalItems || 0;

        renderizarVista(data);

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el carrito.");
    }
}

// ==========================================
// B. RENDERIZADO (La lógica "Data -> View")
// ==========================================
function renderizarVista(data) {
    const items = data.items || [];
    const total = data.total || 0;

    // 1. Manejo de Estado Vacío
    if (items.length === 0) {
        emptyState.classList.remove('d-none'); // Mostrar mensaje vacío
        contenidoPrincipal.classList.remove('d-md-flex'); // Hack para ocultar el row flex
        contenidoPrincipal.classList.add('d-none');
        containerMobile.innerHTML = '';
        
        // Deshabilitar botones checkout
        btnCheckoutMobile.classList.add('disabled');
        return;
    }

    // Si hay items, mostramos el contenido
    emptyState.classList.add('d-none');
    contenidoPrincipal.classList.remove('d-none');
    contenidoPrincipal.classList.add('d-md-flex');
    btnCheckout.classList.remove('disabled');
    btnCheckoutMobile.classList.remove('disabled');

    // 2. Render Desktop (Tabla)
    let htmlDesktop = '';
    items.forEach(item => {
        htmlDesktop += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.imagenUrl || './img/logo.png'}" class="rounded me-2" width="40" height="40" style="object-fit:cover">
                        <span class="small fw-semibold">${item.nombre}</span>
                    </div>
                </td>
                <td class="text-end">${formatoCLP.format(item.precio)}</td>
                <td class="text-center">
                    <input type="number" min="1" max="10" class="form-control form-control-sm mx-auto" 
                           style="width: 60px;" value="${item.cantidad}"
                           onchange="actualizarCantidad('${item.producto}', this.value)">
                </td>
                <td class="text-end fw-bold">${formatoCLP.format(item.subtotal)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem('${item.producto}')">
                        &times;
                    </button>
                </td>
            </tr>
        `;
    });
    tbodyDesktop.innerHTML = htmlDesktop;

    // 3. Render Móvil (Cards)
    let htmlMobile = '';
    items.forEach(item => {
        htmlMobile += `
            <div class="card shadow-sm">
                <div class="card-body d-flex gap-3">
                    <img src="${item.imagenUrl || './img/logo.png'}" class="rounded" width="60" height="60" style="object-fit:cover">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-truncate">${item.nombre}</h6>
                        <div class="text-muted small mb-2">${formatoCLP.format(item.precio)}</div>
                        <div class="d-flex justify-content-between align-items-center">
                            <input type="number" min="1" max="10" class="form-control form-control-sm" 
                                   style="width: 60px;" value="${item.cantidad}"
                                   onchange="actualizarCantidad('${item.producto}', this.value)">
                            <button class="btn btn-sm btn-link text-danger text-decoration-none" 
                                    onclick="eliminarItem('${item.producto}')">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    containerMobile.innerHTML = htmlMobile;

    // 4. Actualizar Totales
    const totalFormateado = formatoCLP.format(total);
    spanTotal.textContent = totalFormateado;
    spanTotalMobile.textContent = totalFormateado;
}

// ==========================================
// C. ACCIONES (POST / DELETE)
// ==========================================

// C1. Cambiar Cantidad (POST - Actualiza si existe)
window.actualizarCantidad = async (productoId, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad < 1) return; // Validación básica

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/carrito/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productoId, cantidad })
        });

        if (res.ok) {
            cargarCarrito(); // Recargamos todo para recalcular totales
        }
    } catch (error) {
        console.error(error);
    }
};

// C2. Eliminar Ítem (DELETE)
window.eliminarItem = async (productoId) => {
    if(!confirm("¿Eliminar producto?")) return;

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/carrito/items/${productoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            cargarCarrito();
        }
    } catch (error) {
        console.error(error);
    }
};

// C3. Vaciar Carrito (DELETE ALL)
btnVaciar.addEventListener('click', async () => {
    if(!confirm("¿Estás seguro de vaciar todo el carrito?")) return;

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/carrito`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            cargarCarrito();
        }
    } catch (error) {
        console.error(error);
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', cargarCarrito);