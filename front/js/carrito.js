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
const desktopContainer = document.getElementById('b11-desktop'); 

const spanTotal = document.getElementById('b11-total');
const spanTotalMobile = document.getElementById('b11-total-m');
const btnCheckout = document.getElementById('b11-checkout');
const btnCheckoutMobile = document.getElementById('b11-checkout-m');
const btnVaciar = document.getElementById('b11-clear');
const badgeNav = document.getElementById('navCartCount'); 

// Formateador de moneda
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// ==========================================
// A. CARGAR CARRITO (GET)
// ==========================================
async function cargarCarrito() {
    try {
        const token = AuthService.obtenerToken();
        
        const respuesta = await fetch(`${API_URL}/carrito`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error('Error al cargar carrito');

        const data = await respuesta.json(); 

        // Actualizar badge del navbar
        if (badgeNav) {
            badgeNav.textContent = data.totalItems || 0;
            if (data.totalItems > 0) {
                badgeNav.classList.remove('d-none');
            } else {
                badgeNav.classList.add('d-none');
            }
        }

        renderizarVista(data);

    } catch (error) {
        console.error('Error al cargar carrito:', error);
    }
}
// ==========================================
// B. RENDERIZADO (SOLO TABLA - UNIFICADO)
// ==========================================
function renderizarVista(data) {
    const items = data.items || [];
    const total = data.total || 0;

    // 1. Manejo de Estado Vacío
    if (items.length === 0) {
        emptyState.classList.remove('d-none');
        
        // Ocultar tabla
        if (desktopContainer) desktopContainer.classList.add('d-none');
        
        // Deshabilitar botones
        btnCheckout.classList.add('disabled');
        if (btnCheckoutMobile) btnCheckoutMobile.classList.add('disabled');
        
        // Resetear totales
        const cero = formatoCLP.format(0);
        if (spanTotal) spanTotal.textContent = cero;
        if (spanTotalMobile) spanTotalMobile.textContent = cero;
        
        return;
    }

    // 2. Estado Con Productos
    emptyState.classList.add('d-none');
    
    // FORZAR VISIBILIDAD DE LA TABLA SIEMPRE (Eliminamos restricciones responsive)
    if (desktopContainer) {
        desktopContainer.classList.remove('d-none');
        // Nos aseguramos que no tenga clases que lo oculten en móvil (como d-none d-md-block)
        // Al remover d-none, debería verse, pero por seguridad quitamos d-md-block si existiera
        desktopContainer.classList.remove('d-md-flex', 'd-md-block'); 
        desktopContainer.classList.add('d-block'); // O d-flex según tu diseño original
    }

    // OCULTAR/LIMPIAR EL CONTENEDOR DE CARDS (Por si acaso)
    if (containerMobile) {
        containerMobile.classList.add('d-none');
        containerMobile.innerHTML = '';
    }
    
    // Habilitar botones
    btnCheckout.classList.remove('disabled');
    if (btnCheckoutMobile) btnCheckoutMobile.classList.remove('disabled');

    // 3. Render Tabla (Única vista)
    let htmlTabla = '';
    items.forEach(item => {
        htmlTabla += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.imagenUrl || './img/logo.png'}" class="rounded me-2" width="40" height="40" style="object-fit:cover" alt="${item.nombre}">
                        <div class="d-flex flex-column">
                            <span class="small fw-semibold text-truncate" style="max-width: 150px;">${item.nombre}</span>
                            <span class="d-md-none text-muted small">${formatoCLP.format(item.precio)}</span>
                        </div>
                    </div>
                </td>
                <td class="text-end d-none d-md-table-cell">${formatoCLP.format(item.precio)}</td>
                <td class="text-center">
                    <input type="number" min="1" max="99" class="form-control form-control-sm mx-auto cantidad-input" 
                           style="width: 60px;" value="${item.cantidad}"
                           data-producto-id="${item.producto}">
                </td>
                <td class="text-end fw-bold">${formatoCLP.format(item.subtotal)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn-eliminar" 
                            data-producto-id="${item.producto}"
                            title="Eliminar">
                        &times;
                    </button>
                </td>
            </tr>
        `;
    });
    
    if (tbodyDesktop) tbodyDesktop.innerHTML = htmlTabla;

    // 4. Actualizar Totales
    const totalFormateado = formatoCLP.format(total);
    if (spanTotal) spanTotal.textContent = totalFormateado;
    if (spanTotalMobile) spanTotalMobile.textContent = totalFormateado;
}

// ==========================================
// C. ACCIONES - Event Delegation (MEJORADO)
// ==========================================

// CAMBIAR CANTIDAD - Event delegation
document.addEventListener('change', async (e) => {
    if (e.target.classList.contains('cantidad-input')) {
        const input = e.target;
        const productoId = input.dataset.productoId;
        const nuevaCantidad = parseInt(input.value);
        
        if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
            input.value = 1;
            return;
        }

        await actualizarCantidad(productoId, nuevaCantidad);
    }
});

// ✅ ELIMINAR - Event delegation
document.addEventListener('click', async (e) => {
    if (e.target.closest('.btn-eliminar')) {
        e.preventDefault();
        const btn = e.target.closest('.btn-eliminar');
        const productoId = btn.dataset.productoId;
        
        if (confirm("¿Eliminar este producto del carrito?")) {
            await eliminarItem(productoId);
        }
    }
});

// Función para actualizar cantidad
async function actualizarCantidad(productoId, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad < 1) return; 

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
            console.log('✓ Cantidad actualizada');
            cargarCarrito(); 
        } else {
            alert('Error al actualizar cantidad');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Función para eliminar item
async function eliminarItem(productoId) {
    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/carrito/items/${productoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            console.log('✓ Producto eliminado');
            cargarCarrito();
        } else {
            alert('Error al eliminar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// C3. Vaciar Carrito
if (btnVaciar) {
    btnVaciar.addEventListener('click', async () => {
        if (!confirm("¿Estás seguro de vaciar todo el carrito?")) return;

        try {
            const token = AuthService.obtenerToken();
            const res = await fetch(`${API_URL}/carrito`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                console.log('✓ Carrito vaciado');
                cargarCarrito();
            } else {
                alert('Error al vaciar carrito');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarCarrito);