console.log("Script checkout.js cargado");

// 1. Verificar sesión (Protección)
if (!AuthService.estaLogueado()) {
    window.location.href = './login.html';
}

// 2. Referencias al DOM
const resumenContainer = document.getElementById('b12-items');
const spanSubtotal = document.getElementById('b12-subtotal');
const spanTotal = document.getElementById('b12-total');
const formCheckout = document.getElementById('b12-form');
const btnConfirmar = document.getElementById('b12-submit');

// Inputs del formulario
const inNombre = document.getElementById('b12-nombre');
const inFono = document.getElementById('b12-fono');
const inDireccion = document.getElementById('b12-direccion');
const inComuna = document.getElementById('b12-comuna');
const inEmail = document.getElementById('b12-email'); // Solo lectura

const flowContainer = document.getElementById('b12-flow'); 
const emptyState = document.getElementById('b12-empty');

// Formateador de dinero
const formatoMoney = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// =========================================================
// FETCH 1: GET /api/carrito (Cargar Resumen) 
// =========================================================
async function cargarResumen() {
    try {
        const token = AuthService.obtenerToken();
        
        // Petición al backend
        const response = await fetch(`${API_URL}/carrito`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al obtener carrito');

        const data = await response.json(); // { items: [...], total: 19390 }

        // [Transformar] Renderizado específico: Lista simple para el resumen
        // A diferencia del carrito (tabla), aquí usamos una lista compacta.
        if (data.items && data.items.length > 0) {
            
            flowContainer.classList.remove('d-none'); // Muestra el contenido
            emptyState.classList.add('d-none');       // Asegura que el mensaje "vacío" esté oculto

            let html = '<ul class="list-group list-group-flush mb-3">';
            
            data.items.forEach(item => {
                html += `
                    <li class="list-group-item d-flex justify-content-between lh-sm px-0">
                        <div>
                            <h6 class="my-0 small">${item.nombre}</h6>
                            <small class="text-muted">Cant: ${item.cantidad}</small>
                        </div>
                        <span class="text-muted">${formatoMoney.format(item.subtotal)}</span>
                    </li>
                `;
            });
            
            html += '</ul>';
            resumenContainer.innerHTML = html;
            
            // Actualizar totales
            spanSubtotal.textContent = formatoMoney.format(data.total);
            spanTotal.textContent = formatoMoney.format(data.total);
        } else {
            // Si el carrito está vacío, volver atrás
            alert("Tu carrito está vacío");
            window.location.href = './GridProductos.html';
        }

        // (Opcional) Pre-llenar email del usuario si está disponible
        cargarUsuario(token);

    } catch (error) {
        console.error("Error:", error);
    }
}

// Helper para traer datos del usuario (Email)
async function cargarUsuario(token) {
    try {
        const res = await fetch(`${API_URL}/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            if(inEmail) inEmail.value = user.email; // Campo de lectura
        }
    } catch(e) {}
}

// =========================================================
// FETCH 2: POST /api/pedidos/confirmar (Crear Pedido) 
// =========================================================
formCheckout.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Captura de datos
    const payload = {
        nombre: inNombre.value.trim(),
        telefono: inFono.value.trim(),
        direccion: inDireccion.value.trim(),
        comuna: inComuna.value.trim()
    };

    // 2. Validaciones (según AC Escenarios 2 y 3) [cite: 8-15]
    if (!payload.nombre || !payload.direccion || !payload.comuna) {
        alert("Completa los campos obligatorios");
        return;
    }
    // Validación teléfono (solo números)
    if (!/^\d+$/.test(payload.telefono)) {
        alert("Ingresa un teléfono válido (solo números)");
        return;
    }

    // 3. Enviar al Backend
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Procesando...";

    try {
        const token = AuthService.obtenerToken();
        
        const response = await fetch(`${API_URL}/pedidos/confirmar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const resultado = await response.json();

        if (response.ok) {
            // [Navegación] Redirigir a Pago (B-13) con el ID de la orden [cite: 7]
            console.log("Pedido creado:", resultado.orderId);
            window.location.href = `./pago.html?orderId=${resultado.orderId}`;
        } else {
            alert(resultado.mensaje || "Error al crear el pedido");
            btnConfirmar.disabled = false;
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
        btnConfirmar.disabled = false;
    }
});

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', cargarResumen);